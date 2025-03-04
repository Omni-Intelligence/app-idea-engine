import { SiteLogo } from "@/components/SiteLogo";

export function Footer() {
  return (
    <footer className="border-t ">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <SiteLogo className="text-lg" />
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} App Idea Engine. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
} 
