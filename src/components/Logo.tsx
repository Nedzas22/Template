import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "light" | "dark";
  size?: "default" | "large";
}

const Logo = ({ variant = "light", size = "default" }: LogoProps) => {
  const textSize = size === "large" ? "text-2xl md:text-3xl" : "text-lg md:text-xl";

  return (
    <span
      className={cn(
        "font-heading font-bold tracking-tight",
        textSize,
        variant === "dark" ? "text-white" : "text-foreground"
      )}
    >
      Template
    </span>
  );
};

export default Logo;
