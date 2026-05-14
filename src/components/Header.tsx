import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Logo from "./Logo";
import { LogOut, Menu, User as UserIcon, X } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

interface HeaderProps {
  variant?: "light" | "dark";
}

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
}

const Header = ({ variant = "light" }: HeaderProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDark = variant === "dark";

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => fetchProfile(session.user.id), 0);
        } else {
          setProfile(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("user_id", userId)
      .maybeSingle();

    if (data) setProfile(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMobileMenuOpen(false);
    toast({ title: "Logged out", description: "You have been signed out." });
    navigate("/");
  };

  const getInitial = () => {
    if (profile?.display_name) return profile.display_name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Profile", path: "/profile", auth: true },
  ];

  const visibleNav = navItems.filter((item) => !item.auth || user);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur-sm md:px-6 md:py-4",
          isDark ? "border-white/20 bg-foreground/95" : "border-border"
        )}
      >
        <Link to="/">
          <Logo variant={variant} />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {visibleNav.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant={location.pathname === item.path ? "outline" : "ghost"}
                size="sm"
                className="rounded-full px-4"
              >
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden md:block">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="focus:outline-none">
                    <Avatar className="h-9 w-9 cursor-pointer">
                      {profile?.avatar_url && (
                        <AvatarImage src={profile.avatar_url} alt="Profile" />
                      )}
                      <AvatarFallback className="font-medium text-sm">
                        {getInitial()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-background">
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                size="sm"
                className="rounded-full px-4"
                onClick={() => navigate("/auth")}
              >
                Log in
              </Button>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground hover:bg-secondary md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-72 transform bg-background shadow-xl transition-transform duration-300 ease-in-out md:hidden",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <Logo />
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground hover:bg-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col p-4">
          {visibleNav.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "rounded-lg px-4 py-3 text-base font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}

          <div className="my-4 h-px bg-border" />

          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="h-5 w-5" />
              Log out
            </button>
          ) : (
            <Button
              variant="outline"
              className="w-full rounded-lg"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/auth");
              }}
            >
              Log in
            </Button>
          )}
        </nav>
      </div>
    </>
  );
};

export default Header;
