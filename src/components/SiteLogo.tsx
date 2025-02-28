import { Link } from "react-router-dom";

interface SiteLogoProps {
  className?: string;
}

export function SiteLogo({ className = "" }: SiteLogoProps) {
  return (
    <Link to="/" className={`flex items-center gap-2 text-xl font-bold text-purple-600 hover:opacity-90 transition-opacity ${className}`}>
      <svg
        className="w-8 h-8"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2L2 7L12 12L22 7L12 2Z"
          className="fill-purple-600"
        />
        <path
          d="M2 17L12 22L22 17"
          className="stroke-purple-600"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2 12L12 17L22 12"
          className="stroke-purple-600"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      App Idea Engine
    </Link>
  );
} 
