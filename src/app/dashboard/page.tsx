"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, type UserProfile } from "@/lib/banking";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  Wallet, 
  TrendingUp,
  ShieldCheck,
  Target,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import Link from "next/link";

export default function DashboardOverview() {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  if (!user) return null;

  const chartData = [
    { name: 'Mon', value: 2400 },
    { name: 'Tue', value: 1398 },
    { name: 'Wed', value: 9800 },
    { name: 'Thu', value: 3908 },
    { name: 'Fri', value: 4800 },
    { name: 'Sat', value: 3800 },
    { name: 'Sun', value: user.balance },
  ];

  const assetTotal = (user.assets || []).reduce((a, b) => a + b.value, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-primary text-white lg:col-span-2 relative overflow-hidden border-none shadow-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-bold opacity-60 uppercase tracking-widest">Global Liquid Position</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl md:text-6xl font-headline font-bold">
                  ${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <Badge variant="secondary" className="bg-accent text-white border-none text-[10px]">
                  <TrendingUp size={12} className="mr-1" /> +2.5%
                </Badge>
              </div>
              <div className="hidden md:flex gap-2">
                <Badge className="bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-sm">
                  <ShieldCheck size={14} className="mr-1" /> Verified
                </Badge>
              </div>
            </div>
            
            <div className="flex space-x-12 pt-6 border-t border-white/10">
              <div className="flex flex-col">
                <span className="text-[10px] opacity-60 uppercase font-bold tracking-widest mb-1">Account Number</span>
                <span className="font-mono text-sm tracking-wider">{user.accountNumber}</span>
              </div>
              <div className="flex flex-col pl-12 border-l border-white/20">
                <span className="text-[10px] opacity-60 uppercase font-bold tracking-widest mb-1">Apex IBAN</span>
                <span className="font-mono text-sm tracking-wider">{user.iban}</span>
              </div>
            </div>
          </CardContent>
          <div className="absolute right-[-40px] bottom-[-40px] opacity-10">
            <ShieldCheck size={200} />
          </div>
        </Card>

        <Card className="border-accent/20 bg-accent/5 shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              Asset Exposure
              <Briefcase className="text-accent h-5 w-5" />
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center space-y-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Non-Liquid Assets</p>
              <p className="text-2xl font-headline font-bold text-primary">${assetTotal.toLocaleString()}</p>
            </div>
            <div className="space-y-2">
               <div className="flex justify-between text-[10px] font-bold">
                  <span>RISK LEVEL</span>
                  <span className="text-accent">MODERATE</span>
               </div>
               <Progress value={45} className="h-1" />
            </div>
            <Button variant="outline" size="sm" className="w-full mt-2" asChild>
               <Link href="/dashboard/wealth">Manage Portfolio <ArrowRight size={14} className="ml-2" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border-none bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Financial Trajectory</CardTitle>
              <CardDescription>Aggregated account performance over 7 days</CardDescription>
            </div>
            <div className="flex items-center gap-2">
               <Badge variant="outline" className="rounded-md">USD</Badge>
               <Badge variant="outline" className="rounded-md">Real-time</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0091FF" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#0091FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                  />
                  <Area type="monotone" dataKey="value" stroke="#0091FF" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-sm border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="text-accent h-5 w-5" /> Reserve Goals
              </Target>
            </CardHeader>
            <CardContent className="space-y-4">
              {(user.goals || []).map(goal => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span>{goal.name}</span>
                    <span className="text-muted-foreground">${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}</span>
                  </div>
                  <Progress value={(goal.currentAmount / goal.targetAmount) * 100} className="h-1.5" />
                </div>
              ))}
              <Button variant="ghost" className="w-full text-accent text-xs h-8 hover:bg-accent/5" size="sm">
                Define New Goal <ChevronRight size={14} className="ml-1" />
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Settlement Log</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(user.transactions || []).slice(0, 5).map((tr) => (
                <div key={tr.id} className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-xl transition-all border-b last:border-0 border-muted/20">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center",
                      tr.type === 'incoming' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    )}>
                      {tr.type === 'incoming' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <div>
                      <p className="text-xs font-bold truncate w-28">{tr.description}</p>
                      <p className="text-[10px] text-muted-foreground">{tr.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-xs font-bold",
                      tr.type === 'incoming' ? "text-green-600" : "text-foreground"
                    )}>
                      {tr.type === 'incoming' ? '+' : '-'}${Math.abs(tr.amount).toLocaleString()}
                    </p>
                    <Badge variant="outline" className="text-[8px] py-0 px-1 border-muted text-muted-foreground uppercase">{tr.status}</Badge>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full h-9 text-xs rounded-lg mt-2" size="sm">Full Statement Analysis</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
