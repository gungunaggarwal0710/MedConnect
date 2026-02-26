
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Search, 
  MessageSquare, 
  Calendar, 
  User, 
  Hospital, 
  ShieldAlert,
  Activity,
  LogIn
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: ShieldAlert, label: "SOS", href: "/emergency", priority: true },
  { icon: MessageSquare, label: "AI Chat", href: "/ai-chat" },
  { icon: Search, label: "Doctors", href: "/doctors" },
  { icon: Hospital, label: "Hospitals", href: "/hospitals" },
  { icon: Activity, label: "Stats", href: "/dashboard" },
];

export function Navigation() {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border flex justify-around items-center py-2 px-4 md:top-0 md:bottom-auto md:justify-between md:px-8 md:py-4 shadow-lg md:shadow-md">
      <div className="hidden md:flex items-center gap-2">
        <Activity className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold text-primary tracking-tight">MedConnect+</span>
      </div>

      <div className="flex justify-around w-full md:w-auto md:gap-8">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              pathname === item.href 
                ? "text-primary" 
                : "text-muted-foreground hover:text-primary",
              item.priority && "text-destructive"
            )}
          >
            <item.icon className={cn("h-6 w-6", item.priority && "animate-pulse")} />
            <span className="text-[10px] md:text-sm font-medium">{item.label}</span>
          </Link>
        ))}
        
        {/* Mobile Profile/Login Link */}
        <Link
          href={user ? "/profile" : "/login"}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors md:hidden",
            pathname === "/profile" || pathname === "/login" ? "text-primary" : "text-muted-foreground"
          )}
        >
          {user ? (
            <Avatar className="h-6 w-6">
              <AvatarImage src={`https://picsum.photos/seed/${user.uid}/50`} />
              <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
            </Avatar>
          ) : (
            <LogIn className="h-6 w-6" />
          )}
          <span className="text-[10px] font-medium">{user ? "Profile" : "Login"}</span>
        </Link>
      </div>

      <div className="hidden md:flex items-center gap-4">
        {!isUserLoading && (
          user ? (
            <Link href="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <span className="text-sm font-bold text-foreground truncate max-w-[100px]">
                {user.displayName || "My Profile"}
              </span>
              <Avatar className="h-10 w-10 border-2 border-primary/20 p-0.5">
                <AvatarImage src={`https://picsum.photos/seed/${user.uid}/100`} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-bold">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-primary font-bold">Register</Button>
              </Link>
            </div>
          )
        )}
      </div>
    </nav>
  );
}

import { Button } from "@/components/ui/button";
