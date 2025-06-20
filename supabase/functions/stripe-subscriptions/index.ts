import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@10.17.0?target=deno&no-check";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const key = Deno.env.get("STRIPE_SECRET_KEY")!;

const stripe = new Stripe(key, {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: "2025-04-30.basil",
});

const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    let result;

    switch (action) {
      case "verifyAndSyncSubscription":
        const { sessionId, userEmail, userId } = params;

        let subscription = null;
        let finalUserId = userId;
        let finalUserEmail = userEmail;
        let newUserCreated = false;

        if (sessionId) {
          const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ["subscription"],
          });
          subscription = session.subscription;
          if (!finalUserEmail) {
            finalUserEmail = session.customer_details?.email || session.customer_email;
          }
        } else if (userEmail) {
          const customers = await stripe.customers.list({
            email: userEmail,
            limit: 1,
          });

          if (customers.data.length > 0) {
            const subscriptions = await stripe.subscriptions.list({
              customer: customers.data[0].id,
              limit: 1,
              status: "all",
            });
            subscription = subscriptions.data[0] || null;
          }
        }

        if (!finalUserId && subscription) {
          const customer = await stripe.customers.retrieve(subscription.customer as string);
          if (customer && !customer.deleted && customer.email) {
            finalUserEmail = customer.email;
          }
        }

        if (!finalUserId && finalUserEmail) {
          let existingUser = null;
          let page = 1;
          const perPage = 50;

          while (!existingUser) {
            const { data: authUsers } = await supabase.auth.admin.listUsers({
              page,
              perPage,
            });

            if (!authUsers.users || authUsers.users.length === 0) {
              break;
            }

            existingUser = authUsers.users.find((u) => u.email === finalUserEmail);

            if (!existingUser && authUsers.users.length < perPage) {
              break;
            }

            page++;
          }

          if (existingUser) {
            finalUserId = existingUser.id;
          } else if (subscription) {
            const customer = await stripe.customers.retrieve(subscription.customer as string);
            if (customer && !customer.deleted) {
              const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
                email: customer.email || finalUserEmail,
                email_confirm: true,
                password: "new-user",
                user_metadata: {
                  name: customer.name || "",
                  stripe_customer_id: customer.id,
                },
              });

              if (createUserError) throw createUserError;
              finalUserId = newUser.user.id;
              newUserCreated = true;
            }
          }
        }

        if (!finalUserId) {
          throw new Error("Unable to determine or create user ID");
        }

        if (subscription) {
          console.log("Subscription:", subscription);
          const priceId = subscription.items.data[0]?.price?.id || null;
          const trialEndsAt = subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null;
          const endsAt = subscription.items.data[0]?.current_period_end
            ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
            : null;

          const { data: existingSubscription } = await supabase
            .from("subscriptions")
            .select("id, status, ends_at, trial_ends_at, price_id")
            .eq("stripe_id", subscription.id)
            .single();

          console.log("Existing subscription in database:", existingSubscription);

          if (existingSubscription) {
            const hasChanges =
              existingSubscription.status !== subscription.status ||
              existingSubscription.ends_at !== endsAt ||
              existingSubscription.trial_ends_at !== trialEndsAt ||
              existingSubscription.price_id !== priceId;

            if (hasChanges) {
              const { error: updateError } = await supabase
                .from("subscriptions")
                .update({
                  customer_id: subscription.customer,
                  status: subscription.status,
                  price_id: priceId,
                  ends_at: endsAt,
                  trial_ends_at: trialEndsAt,
                })
                .eq("stripe_id", subscription.id);

              if (updateError) throw updateError;

              console.log("Subscription updated in database:", subscription.id);
            }
          } else {
            const { error: insertError } = await supabase.from("subscriptions").insert({
              user_id: finalUserId,
              stripe_id: subscription.id,
              customer_id: subscription.customer,
              status: subscription.status,
              price_id: priceId,
              ends_at: endsAt,
              trial_ends_at: trialEndsAt,
            });

            if (insertError) throw insertError;

            console.log("New subscription inserted into database:", subscription.id);
          }

          result = { success: true, subscription, userId: finalUserId, userEmail: finalUserEmail, newUserCreated };
        } else {
          result = { success: false, subscription, userId: finalUserId, userEmail: finalUserEmail, newUserCreated };
        }
        break;

      case "checkSubscriptionStatus":
        const { subscriptionId } = params;

        if (!subscriptionId) {
          throw new Error("subscriptionId is required");
        }

        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

        const { data: dbSubscription, error: fetchError } = await supabase
          .from("subscriptions")
          .select("id, status, ends_at, trial_ends_at, price_id")
          .eq("stripe_id", subscriptionId)
          .single();

        if (fetchError) {
          throw new Error(`Subscription not found in database: ${fetchError.message}`);
        }

        const priceId = stripeSubscription.items.data[0]?.price?.id || null;
        const trialEndsAt = stripeSubscription.trial_end
          ? new Date(stripeSubscription.trial_end * 1000).toISOString()
          : null;
        const endsAt = stripeSubscription.items.data[0]?.current_period_end
          ? new Date(stripeSubscription.items.data[0].current_period_end * 1000).toISOString()
          : null;

        const hasChanges =
          dbSubscription.status !== stripeSubscription.status ||
          dbSubscription.ends_at !== endsAt ||
          dbSubscription.trial_ends_at !== trialEndsAt ||
          dbSubscription.price_id !== priceId;

        if (hasChanges) {
          const { error: updateError } = await supabase
            .from("subscriptions")
            .update({
              status: stripeSubscription.status,
              price_id: priceId,
              ends_at: endsAt,
              trial_ends_at: trialEndsAt,
            })
            .eq("stripe_id", subscriptionId);

          if (updateError) throw updateError;

          console.log("Subscription status updated in database:", subscriptionId);

          result = {
            success: true,
            updated: true,
            oldStatus: dbSubscription.status,
            newStatus: stripeSubscription.status,
          };
        } else {
          result = {
            success: true,
            updated: false,
            status: stripeSubscription.status,
          };
        }
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in stripe-subscriptions function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
