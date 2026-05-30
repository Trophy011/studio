"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUser, logout, type UserProfile } from "@/lib/banking";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  CreditCard, 
  MessageSquare, 
  BrainCircuit, 
  LogOut, 
  Menu,
  ShieldCheck,
  Bell,
  TrendingUp,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: ArrowLeftRight, label: "Transfers", href: "/dashboard/transfers" },
  { icon: TrendingUp, label: "Wealth", href: "/dashboard/wealth" },
  { icon: CreditCard, label: "Cards", href: "/dashboard/cards" },
  { icon: BrainCircuit, label: "AI Advisor", href: "/dashboard/advisor" },
  { icon: MessageSquare, label: "Support", href: "/dashboard/support" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      router.push("/login");
    } else {
      setUser(u);
    }
  }, [router]);

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-primary text-white transition-transform duration-300 transform md:translate-x-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <span className="text-xl font-headline font-bold">Apex Ledger</span>
          </div>
          
          <nav className="flex-1 px-4 space-y-1 mt-6">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm",
                  pathname === item.href ? "bg-accent text-white" : "hover:bg-white/10 text-white/70"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-white/10">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => {
                logout();
                router.push("/login");
              }}
            >
              <LogOut size={18} className="mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="h-16 border-b bg-card px-4 md:px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu size={24} />
            </Button>
            <h1 className="text-lg font-headline font-bold md:text-xl">
              {navItems.find(i => pathname === i.href)?.label || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-white"></span>
            </Button>
            <div className="flex items-center space-x-3 pl-4 border-l">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold leading-none">{user.fullName}</p>
                <p className="text-xs text-muted-foreground mt-1">Acc: {user.accountNumber}</p>
              </div>
              <Avatar>
                <AvatarImage src={`https://picsum.photos/seed/${user.id}/40/40`} />
                <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 flex-1 bg-muted/20">
          {children}
        </div>
      </main>
    </div>
  );
}
