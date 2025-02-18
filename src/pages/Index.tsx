
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-purple-900 sm:text-5xl md:text-6xl">
            App Idea Engine
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-purple-600 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Transform your app ideas into reality with our AI-powered development assistant.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Button
                asChild
                className="w-full flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 md:py-4 md:text-lg md:px-10"
              >
                <Link to="/ideation">
                  Start Your Project
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
