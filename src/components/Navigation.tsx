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
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: ShieldAlert, label: "SOS", href: "/emergency", priority: true },
  { icon: MessageSquare, label: "AI Chat", href: "/ai-chat" },
  { icon: Search, label: "Doctors", href: "/doctors" },
  { icon: Hospital, label: "Hospitals", href: "/hospitals" },
  { icon: Activity, label: "Dashboard", href: "/dashboard" },
  { icon: User, label: "Profile", href: "/profile" },
];

export function Navigation() {
  const pathname = usePathname();

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
      </div>

      <div className="hidden md:flex items-center gap-4">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-5 w-5 text-primary" />
        </div>
      </div>
    </nav>
  );
}