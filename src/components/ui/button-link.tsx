import * as React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { buttonVariants, ButtonProps } from "./button";

interface ButtonLinkProps extends ButtonProps {
  href: string; // Use href for links
}



const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  ({ className, variant, size, href, ...props }, ref) => {
    return (
      <Link
        to={href}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

ButtonLink.displayName = "button-link";

export { ButtonLink }; 
