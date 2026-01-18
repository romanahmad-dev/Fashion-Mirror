import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LogOut, 
  LayoutDashboard, 
  PlusCircle, 
  Shirt, 
  Menu,
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [location] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/new", label: "New Try-On", icon: PlusCircle },
  ];

  if (!isAuthenticated && location === "/") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 group">
            <div className="p-1.5 bg-primary text-primary-foreground rounded-lg group-hover:rotate-6 transition-transform">
              <Shirt className="w-5 h-5" />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight">MIRROR</span>
          </Link>

          {/* Desktop Nav */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                    location === item.href ? "text-primary" : "text-muted-foreground"
                  )}>
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </a>
                </Link>
              ))}
              <div className="w-px h-6 bg-border mx-2" />
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-foreground">
                  {user?.firstName || user?.email}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => logout()}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </nav>
          )}

          {/* Auth Buttons for logged out */}
          {!isAuthenticated && (
            <div className="flex items-center gap-4">
              <Link href="/api/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/api/login">
                <Button className="font-medium">Get Started</Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu */}
          {isAuthenticated && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-6 mt-8">
                  {navItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <a className={cn(
                        "flex items-center gap-3 text-lg font-medium transition-colors",
                        location === item.href ? "text-primary" : "text-muted-foreground"
                      )}>
                        <item.icon className="w-5 h-5" />
                        {item.label}
                      </a>
                    </Link>
                  ))}
                  <div className="h-px bg-border my-2" />
                  <Button 
                    variant="ghost" 
                    onClick={() => logout()}
                    className="justify-start text-muted-foreground hover:text-destructive px-0"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t py-8 bg-secondary/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} MIRROR Virtual Try-On. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
