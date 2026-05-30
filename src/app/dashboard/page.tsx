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
  ExternalLink,
  ShieldCheck,
  Target,
  ChevronRight,
  ShieldAlert
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-primary text-white lg:col-span-2 relative overflow-hidden border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-medium opacity-80">Total Liquidity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl md:text-5xl font-headline font-bold">
                  ${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <Badge variant="secondary" className="bg-accent text-white border-none">
                  <TrendingUp size={14} className="mr-1" /> +2.5%
                </Badge>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-sm">
                  <ShieldCheck size={14} className="mr-1" /> Verified
                </Badge>
              </div>
            </div>
            
            <div className="flex space-x-8 pt-4">
              <div className="flex flex-col">
                <span className="text-xs opacity-60 uppercase font-bold tracking-wider">Account Number</span>
                <span className="font-mono text-lg">{user.accountNumber}</span>
              </div>
              <div className="flex flex-col pl-8 border-l border-white/20">
                <span className="text-xs opacity-60 uppercase font-bold tracking-wider">Apex IBAN</span>
                <span className="font-mono text-lg">{user.iban}</span>
              </div>
            </div>
          </CardContent>
          <div className="absolute right-[-40px] bottom-[-40px] opacity-10">
            <ShieldCheck size={200} />
          </div>
        </Card>

        <Card className="border-accent/20 bg-accent/5 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              Security Health
              <ShieldAlert className="text-accent h-5 w-5" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vault Protection</span>
                <span className="font-bold text-accent">High</span>
              </div>
              <Progress value={85} className="h-1.5" />
            </div>
            <div className="grid grid-cols-1 gap-2 pt-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-background border text-xs">
                <span className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500"></div> 2FA Active
                </span>
                <Badge variant="outline" className="text-[9px]">Manage</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-background border text-xs">
                <span className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500"></div> Encrypted
                </span>
                <Badge variant="outline" className="text-[9px]">Keys</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Global Ledger Activity</CardTitle>
              <CardDescription>7-day transaction frequency</CardDescription>
            </div>
            <div className="flex items-center gap-2">
               <Badge variant="outline">USD</Badge>
               <Badge variant="outline">Daily</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0091FF" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0091FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#0091FF" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="text-accent h-5 w-5" /> Savings Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.goals?.map(goal => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span>{goal.name}</span>
                    <span className="text-muted-foreground">${goal.currentAmount} / ${goal.targetAmount}</span>
                  </div>
                  <Progress value={(goal.currentAmount / goal.targetAmount) * 100} className="h-2" />
                </div>
              ))}
              <Button variant="ghost" className="w-full text-accent text-xs h-8" size="sm">
                Add New Goal <ChevronRight size={14} />
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Ledger</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {user.transactions.slice(0, 4).map((tr) => (
                <div key={tr.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors border-b last:border-0 border-muted/30">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      tr.type === 'incoming' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    )}>
                      {tr.type === 'incoming' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold truncate w-24">{tr.description}</p>
                      <p className="text-[9px] text-muted-foreground">{tr.date}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-xs font-bold",
                    tr.type === 'incoming' ? "text-green-600" : "text-foreground"
                  )}>
                    {tr.type === 'incoming' ? '+' : '-'}${Math.abs(tr.amount).toLocaleString()}
                  </span>
                </div>
              ))}
              <Button variant="outline" className="w-full h-8 text-[11px]" size="sm">Full Statement History</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
