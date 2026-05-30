"use client";

import { useState, useEffect } from "react";
import { getCurrentUser, type UserProfile, type Asset } from "@/lib/banking";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  LineChart, 
  Globe, 
  Coins, 
  Briefcase,
  ChevronRight,
  ArrowUpRight,
  Plus
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { cn } from "@/lib/utils";

export default function WealthPage() {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  if (!user) return null;

  // Initial mock assets if none exist
  const assets: Asset[] = (user.assets && user.assets.length > 0) ? user.assets : [
    { id: 'a1', name: 'S&P 500 Index', value: 45200.50, change: 12.4, type: 'stock' },
    { id: 'a2', name: 'Bitcoin (BTC)', value: 28400.00, change: -2.1, type: 'crypto' },
    { id: 'a3', name: 'London Real Estate', value: 1250000.00, change: 4.8, type: 'real_estate' },
    { id: 'a4', name: 'Gold Bullion', value: 12500.25, change: 0.5, type: 'commodity' },
  ];

  const totalWealth = assets.reduce((acc, curr) => acc + curr.value, 0) + user.balance;

  const chartData = assets.map(a => ({
    name: a.name,
    value: a.value
  }));

  const COLORS = ['#0091FF', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">Wealth Management</h1>
          <p className="text-muted-foreground">Comprehensive tracking of your global asset portfolio.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2"><PieChart size={18} /> Allocations</Button>
          <Button className="gap-2"><Plus size={18} /> Add Asset</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 bg-primary text-white overflow-hidden relative border-none shadow-2xl">
          <CardHeader>
            <CardDescription className="text-white/60">Total Net Worth (USD)</CardDescription>
            <CardTitle className="text-4xl md:text-5xl font-headline font-bold">
              ${totalWealth.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mt-4">
              <Badge className="bg-green-500/20 text-green-400 border-none hover:bg-green-500/30">
                <ArrowUpRight size={14} className="mr-1" /> +$12,402.10 (Today)
              </Badge>
              <Badge className="bg-white/10 text-white border-none">
                <Globe size={14} className="mr-1" /> 4 Jurisdictions
              </Badge>
            </div>
          </CardContent>
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
            <LineChart size={200} />
          </div>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Liquidity Ratio</CardTitle>
            <CardDescription>Cash vs Fixed Assets</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="text-3xl font-bold text-accent">
              {((user.balance / totalWealth) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">Your portfolio is highly liquid.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
            <CardDescription>Value distribution across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
               {assets.map((a, i) => (
                 <div key={a.id} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    <span className="text-xs font-medium truncate">{a.name}</span>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Global Positions</CardTitle>
              <CardDescription>Live market performance</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-accent">View All</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {assets.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-accent/20 hover:bg-accent/5 transition-all group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-primary">
                    {asset.type === 'stock' && <Briefcase size={20} />}
                    {asset.type === 'crypto' && <Coins size={20} />}
                    {asset.type === 'real_estate' && <Globe size={20} />}
                    {asset.type === 'commodity' && <TrendingUp size={20} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{asset.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{asset.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">${asset.value.toLocaleString()}</p>
                  <p className={cn(
                    "text-xs flex items-center justify-end gap-1",
                    asset.change >= 0 ? "text-green-500" : "text-red-500"
                  )}>
                    {asset.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {Math.abs(asset.change)}%
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
               <TrendingUp size={24} />
            </div>
            <h3 className="font-bold">Growth Portfolio</h3>
            <p className="text-xs text-muted-foreground">Aggressive strategies for capital appreciation.</p>
            <Button variant="link" className="p-0 h-auto text-xs text-accent">Explore Strategy <ChevronRight size={14} /></Button>
          </CardContent>
        </Card>
        <Card className="bg-card hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
               <ShieldCheck size={24} />
            </div>
            <h3 className="font-bold">Wealth Preservation</h3>
            <p className="text-xs text-muted-foreground">Low-risk fixed income and global bonds.</p>
            <Button variant="link" className="p-0 h-auto text-xs text-accent">Explore Strategy <ChevronRight size={14} /></Button>
          </CardContent>
        </Card>
        <Card className="bg-card hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
               <Coins size={24} />
            </div>
            <h3 className="font-bold">Digital Assets</h3>
            <p className="text-xs text-muted-foreground">Staking and liquidity provision for DeFi.</p>
            <Button variant="link" className="p-0 h-auto text-xs text-accent">Explore Strategy <ChevronRight size={14} /></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
