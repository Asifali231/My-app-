import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { 
  Menu, 
  Home, 
  BarChart3, 
  Gift, 
  TrendingUp, 
  ArrowUpCircle, 
  Users, 
  Shield,
  LogOut
} from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const navigationItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/tasks", label: "Daily Tasks", icon: Gift },
    { href: "/invest", label: "Invest", icon: TrendingUp },
    { href: "/withdraw", label: "Withdraw", icon: ArrowUpCircle },
    { href: "/referrals", label: "Referrals", icon: Users },
    ...(user?.isAdmin ? [{ href: "/admin", label: "Admin", icon: Shield }] : []),
  ];

  const isActive = (href: string) => {
    return location === href || (href !== "/" && location.startsWith(href));
  };

  const NavLink = ({ href, label, icon: Icon, mobile = false }: any) => (
    <Link href={href}>
      <Button
        variant={isActive(href) ? "default" : "ghost"}
        className={`${mobile ? "w-full justify-start" : ""} ${
          isActive(href)
            ? "bg-crypto-gold text-white hover:bg-crypto-gold/80"
            : "text-crypto-light hover:text-white hover:bg-crypto-light/20"
        } transition-colors`}
        onClick={() => setIsOpen(false)}
      >
        <Icon className={`w-4 h-4 ${mobile ? "mr-3" : "mr-2"}`} />
        {label}
      </Button>
    </Link>
  );

  return (
    <nav className="bg-crypto-blue border-b border-crypto-light/20 sticky top-0 z-50 backdrop-blur-sm bg-crypto-blue/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-8 h-8 bg-crypto-gradient rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <h1 className="text-2xl font-bold text-crypto-gold">CryptoPay</h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </div>

          {/* User Info & Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* User Balance */}
            {user && (
              <div className="hidden sm:flex items-center space-x-3">
                <Badge className="bg-crypto-green/20 text-crypto-green border-crypto-green/20 px-3 py-1">
                  ${user.totalBalance || "0.00"}
                </Badge>
                {user.isTrialActive && (
                  <Badge className="bg-crypto-gold/20 text-crypto-gold border-crypto-gold/20 px-2 py-1">
                    Trial: {user.daysLeft}d
                  </Badge>
                )}
              </div>
            )}

            {/* User Avatar & Logout */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-8 h-8 bg-crypto-accent rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {user?.firstName ? user.firstName.charAt(0).toUpperCase() : "U"}
                </span>
              </div>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-crypto-light hover:text-crypto-red hover:bg-crypto-red/20"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-crypto-light hover:text-white">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 bg-crypto-blue border-crypto-light/20">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center space-x-2 mb-6">
                      <div className="w-8 h-8 bg-crypto-gradient rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">C</span>
                      </div>
                      <h2 className="text-xl font-bold text-crypto-gold">CryptoPay</h2>
                    </div>

                    {/* User Info Mobile */}
                    {user && (
                      <div className="bg-crypto-dark rounded-lg p-4 mb-6">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-crypto-accent rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-white">
                              {user?.firstName ? user.firstName.charAt(0).toUpperCase() : "U"}
                            </span>
                          </div>
                          <div>
                            <div className="text-white font-medium">
                              {user?.firstName || "User"}
                            </div>
                            <div className="text-crypto-light text-sm">
                              {user?.email}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Badge className="bg-crypto-green/20 text-crypto-green border-crypto-green/20">
                            ${user.totalBalance || "0.00"}
                          </Badge>
                          {user.isTrialActive && (
                            <Badge className="bg-crypto-gold/20 text-crypto-gold border-crypto-gold/20">
                              Trial: {user.daysLeft}d
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Navigation Links */}
                    <div className="flex flex-col space-y-2 flex-1">
                      {navigationItems.map((item) => (
                        <NavLink key={item.href} {...item} mobile />
                      ))}
                    </div>

                    {/* Logout Button Mobile */}
                    <div className="mt-6 pt-6 border-t border-crypto-light/20">
                      <Button
                        onClick={() => {
                          setIsOpen(false);
                          handleLogout();
                        }}
                        variant="ghost"
                        className="w-full justify-start text-crypto-red hover:text-crypto-red hover:bg-crypto-red/20"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
