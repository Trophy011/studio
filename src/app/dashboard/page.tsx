"use client";

import { useUser, useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { type UserProfile } from "@/lib/banking";
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
  Plus,
  ArrowRightLeft,
  FileText,
  Lock,
  ExternalLink,
  Briefcase,
  Send
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
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardOverview() {
  const { user: authUser } = useUser();
  const db = useFirestore();
  const userRef = authUser && db ? doc(db, "users", authUser.uid) : null;
  const { data: user, loading } = useDoc<UserProfile>(userRef);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  if (!user) return null;

  const chartData = [
    { name: '01 May', value: 2400 },
    { name: '03 May', value: 1398 },
    { name: '05 May', value: 9800 },
    { name: '07 May', value: 3908 },
    { name: '09 May', value: 4800 },
    { name: '11 May', value: 3800 },
    { name: 'Today', value: user.balance },
  ];

  const assetTotal = (user.assets || []).reduce((a, b) => a + b.value, 0);
  const totalBalance = user.balance;
  const savingsMock = user.balance * 0.45;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Good morning, {user.fullName.split(' ')[0]}</h1>
          <p className="text-muted-foreground">Your financial ecosystem is secure and performing optimally.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button className="rounded-full shadow-lg shadow-primary/10 gap-2" asChild>
            <Link href="/dashboard/transfers"><Send size={16} /> Send Money</Link>
          </Button>
          <Button variant="outline" className="rounded-full gap-2" asChild>
            <Link href="/dashboard/transfers"><ArrowRightLeft size={16} /> Internal Transfer</Link>
          </Button>
          <Button variant="outline" className="rounded-full gap-2" asChild>
            <Link href="/dashboard/cards"><Lock size={16} /> Freeze Card</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-primary text-white border-none shadow-xl relative overflow-hidden group">
          <CardHeader className="pb-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Apex Checking ••{user.accountNumber.slice(-4)}</p>
            <CardTitle className="text-3xl font-headline font-bold">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs opacity-60">Available Balance</p>
            <div className="absolute right-4 bottom-4 opacity-10 group-hover:scale-110 transition-transform">
              <Wallet size={64} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-accent text-white border-none shadow-xl relative overflow-hidden group">
          <CardHeader className="pb-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Vault Savings ••8842</p>
            <CardTitle className="text-3xl font-headline font-bold">${savingsMock.toLocaleString('en-US', { minimumFractionDigits: 2 })}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs opacity-60">3.2% APY Accruing</p>
            <div className="absolute right-4 bottom-4 opacity-10 group-hover:scale-110 transition-transform">
              <ShieldCheck size={64} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-border shadow-sm relative overflow-hidden group">
          <CardHeader className="pb-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Asset Exposure</p>
            <CardTitle className="text-3xl font-headline font-bold text-primary">${assetTotal.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-green-600 text-xs font-bold">
              <TrendingUp size={14} /> +4.2% this month
            </div>
            <div className="absolute right-4 bottom-4 opacity-10 group-hover:scale-110 transition-transform text-primary">
              <Briefcase size={64} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-border shadow-sm relative overflow-hidden group">
          <CardHeader className="pb-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Active Cards</p>
            <CardTitle className="text-3xl font-headline font-bold text-primary">{(user.cards || []).length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{(user.cards || []).filter(c => c.status === 'active').length} Operational</p>
            <div className="absolute right-4 bottom-4 opacity-10 group-hover:scale-110 transition-transform text-primary">
              <CreditCard size={64} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-sm border-none bg-card overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 px-6 py-4">
            <div>
              <CardTitle className="text-lg">Aggregate Performance</CardTitle>
              <CardDescription>Real-time liquidity tracking across all nodes</CardDescription>
            </div>
            <div className="flex items-center gap-2">
               <Badge variant="outline" className="bg-white shadow-sm">Daily</Badge>
               <Button variant="ghost" size="icon" className="h-8 w-8"><ExternalLink size={16} /></Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: '1px solid hsl(var(--border))', 
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                  />
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--accent))" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="shadow-sm border-none bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Recent Settlements</CardTitle>
              <Button variant="link" size="sm" className="h-auto p-0 text-accent font-bold" asChild>
                <Link href="/dashboard/transfers">View Statement</Link>
              </Button>
            </CardHeader>
            <CardContent className="px-0">
              <div className="space-y-1">
                {(user.transactions || []).slice(0, 5).map((tr) => (
                  <div key={tr.id} className="flex items-center justify-between px-6 py-3 hover:bg-muted/50 transition-colors border-l-4 border-transparent hover:border-accent">
                    <div className="flex items-center space-x-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        tr.type === 'incoming' ? "bg-green-100 text-green-600" : "bg-primary/10 text-primary"
                      )}>
                        {tr.type === 'incoming' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary truncate max-w-[140px]">{tr.description}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-medium">{tr.date} • {tr.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "text-sm font-bold",
                        tr.type === 'incoming' ? "text-green-600" : "text-primary"
                      )}>
                        {tr.type === 'incoming' ? '+' : '-'}${Math.abs(tr.amount).toLocaleString()}
                      </p>
                      <Badge variant="outline" className={cn(
                        "text-[8px] py-0 px-1.5 uppercase font-bold",
                        tr.status === 'completed' ? "text-green-600 border-green-200" : "text-amber-600 border-amber-200"
                      )}>{tr.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 mt-4">
                <Button variant="outline" className="w-full text-xs h-9 rounded-xl border-dashed" asChild>
                  <Link href="/dashboard/support"><FileText size={14} className="mr-2" /> Download Proof of Payment</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-none bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="text-accent h-5 w-5" /> Reserve Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {(user.goals || []).map(goal => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-primary">{goal.name}</span>
                    <span className="text-muted-foreground">${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}</span>
                  </div>
                  <Progress value={(goal.currentAmount / goal.targetAmount) * 100} className="h-1.5 bg-muted" />
                </div>
              ))}
              <Button variant="secondary" className="w-full text-xs h-10 rounded-xl" size="sm">
                Create New Goal <Plus size={14} className="ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
