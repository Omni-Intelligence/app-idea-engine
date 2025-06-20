import { ButtonLink } from "@/components/ui/button-link";

export const AccessDetails = () => {
  return (
    <div className="container mx-auto px-4 py-4 lg:py-8 space-y-16">
      <section className="text-center space-y-4 mb-16">
        <h1 className="text-4xl font-bold">Access to App Idea Engine</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          App Idea Engine is available for free to all Enterprise DNA users with a Pro plan. For everyone else, access
          is available for a single, predictable price of $15 per month.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <div className="p-6 rounded-lg border border-gray-200 hover:border-[#6D42EF] transition-colors">
          <h2 className="text-xl font-semibold mb-3">Included with Enterprise DNA Pro</h2>
          <p className="text-gray-600 leading-relaxed">
            If you have an active Enterprise DNA Pro subscription, you can use App Idea Engine at no additional cost.
            Enjoy seamless access as part of your membership benefits.
          </p>
        </div>
        <div className="p-6 rounded-lg border border-gray-200 hover:border-[#6D42EF] transition-colors">
          <h2 className="text-xl font-semibold mb-3">Simple Pricing for Everyone Else</h2>
          <p className="text-gray-600 leading-relaxed">
            Not an Enterprise DNA Pro user? You can still access all features of App Idea Engine for just $15 per month.
            No hidden fees, no surprises—just one predictable price.
          </p>
        </div>
        <div className="p-6 rounded-lg border border-gray-200 hover:border-[#6D42EF] transition-colors">
          <h2 className="text-xl font-semibold mb-3">Empowering Innovation</h2>
          <p className="text-gray-600 leading-relaxed">
            Our mission is to empower creators, developers, and businesses to innovate with AI-driven application ideas.
            Whether you’re part of our community or joining independently, you get full access to our technology.
          </p>
        </div>
        <div className="p-6 rounded-lg border border-gray-200 hover:border-[#6D42EF] transition-colors">
          <h2 className="text-xl font-semibold mb-3">Powered by Enterprise DNA</h2>
          <p className="text-gray-600 leading-relaxed">
            App Idea Engine is part of the Enterprise DNA ecosystem, showcasing our commitment to accessible,
            enterprise-grade AI solutions for all.
          </p>
        </div>
      </div>

      <section className="text-center space-y-6 bg-[#1A1A1A] text-white p-12 rounded-2xl">
        <h2 className="text-2xl font-semibold">Explore Our Resources</h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Discover our extensive collection of learning content, community resources, and technology insights. Learn how
          to build and innovate with modern tools and AI.
        </p>
        <ButtonLink href="https://enterprisedna.co/" target="_blank">
          Access Learning Resources
        </ButtonLink>
      </section>
    </div>
  );
};

export default AccessDetails;
