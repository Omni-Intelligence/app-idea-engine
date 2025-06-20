import { Link } from "react-router-dom";

interface SiteLogoProps {
  className?: string;
}

export function SiteLogo({ className = "" }: SiteLogoProps) {
  return (
    <Link to="/" className={`flex items-center gap-2  text-white hover:opacity-90 transition-opacity ${className}`}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="10" fill="url(#paint0_linear_534_251)" />
        <path
          d="M15.5016 15.8889C14.935 23.7878 14.476 24.2589 6.75969 24.8378C14.476 25.4178 14.935 25.8889 15.5016 33.7878C16.0681 25.8889 16.5271 25.4178 24.2434 24.8378C16.5271 24.2589 16.0681 23.7878 15.5016 15.8889Z"
          fill="white"
        />
        <path
          d="M13 6C12.5464 12.3254 12.1788 12.7027 6 13.1662C12.1788 13.6307 12.5464 14.0079 13 20.3333C13.4536 14.0079 13.8212 13.6307 20 13.1662C13.8212 12.7027 13.4536 12.3254 13 6Z"
          fill="white"
        />
        <path
          d="M27 20.6667C26.5464 26.9921 26.1788 27.3693 20 27.8329C26.1788 28.2973 26.5464 28.6746 27 35C27.4536 28.6746 27.8212 28.2973 34 27.8329C27.8212 27.3693 27.4536 26.9921 27 20.6667Z"
          fill="white"
        />
        <path
          d="M23.8527 9.22222C23.3991 15.5476 23.0315 15.9249 16.8527 16.3884C23.0315 16.8529 23.3991 17.2302 23.8527 23.5556C24.3063 17.2302 24.6739 16.8529 30.8527 16.3884C24.6739 15.9249 24.3063 15.5476 23.8527 9.22222Z"
          fill="white"
        />
        <defs>
          <linearGradient id="paint0_linear_534_251" x1="3" y1="4.5" x2="36" y2="36.5" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F2B347" />
            <stop offset="0.52" stopColor="#B84D8F" />
            <stop offset="1" stopColor="#6654F5" />
          </linearGradient>
        </defs>
      </svg>

      <div className="">
        <p className="text-xl font-bold ">
          App Idea <span className="font-normal">Engine</span>
        </p>
        <p className="text-[10px] font-medium text-white ">by Enterprise DNA</p>
      </div>
    </Link>
  );
}
