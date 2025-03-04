import { useNavigate } from "react-router-dom";
import { Auth as AuthComponent } from "@/components/auth/Auth";

const Auth = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-200px)] lg:min-h-[calc(100vh-160px)] flex items-center justify-center p-4">
      <AuthComponent onSuccess={() => navigate("/projects")} />
    </div>
  );
};

export default Auth;
