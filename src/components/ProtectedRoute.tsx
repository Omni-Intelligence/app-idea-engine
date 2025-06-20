import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Loader2 } from "lucide-react";

const LoadingScreen = () => (
  <div className="flex justify-center items-center h-screen">
    <Loader2 className="h-8 w-8 animate-spin" />
    <span>Loading...</span>
  </div>
);

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: isUserLoading } = useUser();
  const { isSubscribed, isLoading: isSubscriptionLoading } = useSubscription();

  const isLoading = isUserLoading || isSubscriptionLoading;

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isSubscribed && !user.user_metadata?.isEdnaMember) {
    return <Navigate to="/pricing" replace />;
  }

  return <>{children}</>;
}
