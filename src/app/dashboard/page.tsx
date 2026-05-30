"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, type UserProfile } from "@/lib/banking";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  Wallet, 
  TrendingUp,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary text-white col-span-1 md:col-span-2 relative overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-medium opacity-80">Current Total Balance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl md:text-5xl font-headline font-bold">
                ${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <Badge variant="secondary" className="bg-accent text-white border-none">
                <TrendingUp size={14} className="mr-1" /> +2.5%
              </Badge>
            </div>
            
            <div className="flex space-x-4">
              <div className="flex flex-col">
                <span className="text-xs opacity-60 uppercase font-bold tracking-wider">Account Number</span>
                <span className="font-mono text-lg">{user.accountNumber}</span>
              </div>
              <div className="flex flex-col pl-4 border-l border-white/20">
                <span className="text-xs opacity-60 uppercase font-bold tracking-wider">IBAN</span>
                <span className="font-mono text-lg">{user.iban}</span>
              </div>
            </div>
          </CardContent>
          <div className="absolute right-[-40px] bottom-[-40px] opacity-10">
            <ShieldCheck size={200} />
          </div>
        </Card>

        <Card className="col-span-1 border-accent/20 bg-accent/5">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common banking tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="flex flex-col h-20 items-center justify-center gap-1">
              <ArrowUpRight size={20} className="text-accent" />
              <span>Transfer</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-20 items-center justify-center gap-1">
              <CreditCard size={20} className="text-accent" />
              <span>Card Pay</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-20 items-center justify-center gap-1">
              <Wallet size={20} className="text-accent" />
              <span>Bill Pay</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-20 items-center justify-center gap-1">
              <ExternalLink size={20} className="text-accent" />
              <span>Global</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Spending Overview</CardTitle>
              <CardDescription>Activity from the last 7 days</CardDescription>
            </div>
            <Badge variant="outline">Weekly</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
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

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest financial transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user.transactions.slice(0, 5).map((tr) => (
                <div key={tr.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      tr.type === 'incoming' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    )}>
                      {tr.type === 'incoming' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold truncate w-32">{tr.description}</p>
                      <p className="text-xs text-muted-foreground">{tr.date}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-sm font-bold",
                    tr.type === 'incoming' ? "text-green-600" : "text-foreground"
                  )}>
                    {tr.type === 'incoming' ? '+' : '-'}${Math.abs(tr.amount).toLocaleString()}
                  </span>
                </div>
              ))}
              {user.transactions.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No transactions yet.</p>
              )}
            </div>
            {user.transactions.length > 5 && (
              <Button variant="ghost" className="w-full mt-4 text-accent">View All Activity</Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}