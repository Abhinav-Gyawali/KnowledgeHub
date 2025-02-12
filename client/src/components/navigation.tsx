import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Home, MessageSquare, User, LogOut, Menu } from "lucide-react";
import { useState } from "react";

export default function Navigation() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/questions", icon: MessageSquare, label: "Questions" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-4 mx-auto">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">DevQ&A</span>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-1 items-center justify-between ml-6">
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {navItems.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`transition-colors hover:text-foreground/80 flex items-center gap-2 ${
                    location === href ? "text-foreground" : "text-foreground/60"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <span className="text-sm text-muted-foreground">
                    Welcome, {user.username}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-foreground/60 hover:text-foreground/80"
                    onClick={() => logoutMutation.mutate()}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`${
            isOpen ? "block" : "hidden"
          } md:hidden py-2 space-y-2`}
        >
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`block px-3 py-2 rounded-md transition-colors hover:bg-gray-100 ${
                location === href ? "text-foreground" : "text-foreground/60"
              }`}
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                {label}
              </div>
            </Link>
          ))}
          {user && (
            <div className="border-t pt-2 mt-2">
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Welcome, {user.username}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start px-3 text-foreground/60 hover:text-foreground/80"
                onClick={() => {
                  logoutMutation.mutate();
                  setIsOpen(false);
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}