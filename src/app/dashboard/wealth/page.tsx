"use client";

import { useUser, useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { type UserProfile, type Asset } from "@/lib/banking";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
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
import { Skeleton } from "@/components/ui/skeleton";

export default function WealthPage() {
  const { user: authUser } = useUser();
  const db = useFirestore();
  const userRef = authUser && db ? doc(db, "users", authUser.uid) : null;
  const { data: user, loading } = useDoc<UserProfile>(userRef);

  if (loading) return <Skeleton className="h-96 w-full" />;
  if (!user) return null;

  const assets: Asset[] = (user.assets && user.assets.length > 0) ? user.assets : [
    { id: 'a1', name: 'S&P 500 Index', value: 45200.50, change: 12.4, type: 'stock' },
    { id: 'a2', name: 'Bitcoin (BTC)', value: 28400.00, change: -2.1, type: 'crypto' },
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
    </div>
  );
}
