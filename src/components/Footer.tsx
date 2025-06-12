import { SiteLogo } from "@/components/SiteLogo";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 pb-1">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-6">
            <SiteLogo />

          </div>
          <Link to="/why-free" className="text-sm text-white hover:text-gray-300">
            Why Free?
          </Link>
        </div>
        <div className="text-xs text-gray-500 text-center">
          © {new Date().getFullYear()} App Idea Engine. All rights reserved.
        </div>
      </div>
    </footer>
  );
} 
