import { cn } from "@/lib/utils";

interface FooterProps {
  variant?: "light" | "dark";
}

const Footer = ({ variant = "light" }: FooterProps) => {
  const links = [
    { label: "Privacy policy", href: "/privacy-policy" },
    { label: "Terms of service", href: "/terms-of-service" },
    { label: "Refund policy", href: "/refund-policy" },
  ];

  const isDark = variant === "dark";

  return (
    <footer className="mt-auto w-full px-6 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-6">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={cn(
                "text-sm transition-colors",
                isDark ? "text-white/80 hover:text-white" : "text-foreground hover:text-muted-foreground"
              )}
            >
              {link.label}
            </a>
          ))}
        </div>

        <p
          className={cn(
            "text-sm",
            isDark ? "text-white/80" : "text-muted-foreground"
          )}
        >
          © {new Date().getFullYear()} All rights reserved
        </p>
      </div>
    </footer>
  );
};

export default Footer;
