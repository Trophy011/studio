"use client";

import { useUser, useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { type UserProfile } from "@/lib/banking";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Lock, 
  Bell, 
  ShieldCheck, 
  Globe, 
  Smartphone,
  History,
  Trash2,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const { toast } = useToast();
  const { user: authUser } = useUser();
  const db = useFirestore();
  const userRef = authUser && db ? doc(db, "users", authUser.uid) : null;
  const { data: user, loading } = useDoc<UserProfile>(userRef);

  if (loading) return <Skeleton className="h-96 w-full" />;
  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-headline font-bold">Account Settings</h1>
        <p className="text-muted-foreground">Manage your identity, security protocols, and global preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-12 bg-muted/50 p-1 mb-8">
          <TabsTrigger value="profile" className="gap-2"><User size={16} /> Profile</TabsTrigger>
          <TabsTrigger value="security" className="gap-2"><ShieldCheck size={16} /> Security</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell size={16} /> Alerts</TabsTrigger>
          <TabsTrigger value="history" className="gap-2"><History size={16} /> Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Identity</CardTitle>
              <CardDescription>Your verified legal information used for international settlements.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Legal Name</Label>
                  <Input defaultValue={user.fullName} readOnly className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Registered Email</Label>
                  <Input defaultValue={user.email} readOnly className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input defaultValue={user.accountNumber} readOnly className="bg-muted font-mono" />
                </div>
                <div className="space-y-2">
                  <Label>Global IBAN</Label>
                  <Input defaultValue={user.iban} readOnly className="bg-muted font-mono" />
                </div>
              </div>
              <div className="pt-4 border-t">
                 <Button variant="outline" onClick={() => toast({ title: "Verification Required", description: "Contact your account manager to update verified details." })}>
                   Request Info Change
                 </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Regional Preferences</CardTitle>
              <CardDescription>Set your default currency and localization settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                 <div className="flex items-center gap-3">
                   <Globe className="text-accent" />
                   <div>
                     <p className="text-sm font-bold">Base Currency</p>
                     <p className="text-xs text-muted-foreground">All portfolios will be denominated in this value.</p>
                   </div>
                 </div>
                 <Button variant="ghost">USD <ChevronRight size={14} /></Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="text-accent" /> Advanced Vault Security
              </CardTitle>
              <CardDescription>Configure encryption and multi-factor authentication protocols.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="flex items-center justify-between">
                 <div className="space-y-1">
                   <p className="text-sm font-bold">Two-Factor Authentication (2FA)</p>
                   <p className="text-xs text-muted-foreground">Require a secure token for all outgoing transfers.</p>
                 </div>
                 <Switch defaultChecked />
               </div>
               <div className="flex items-center justify-between">
                 <div className="space-y-1">
                   <p className="text-sm font-bold">Biometric Face ID</p>
                   <p className="text-xs text-muted-foreground">Login using biometric facial recognition.</p>
                 </div>
                 <Switch defaultChecked />
               </div>
               <div className="flex items-center justify-between">
                 <div className="space-y-1">
                   <p className="text-sm font-bold">Transfer Authorization Delay</p>
                   <p className="text-xs text-muted-foreground">Apply a 30-minute cooling period for new beneficiaries.</p>
                 </div>
                 <Switch />
               </div>
               <div className="pt-4 border-t flex gap-3">
                  <Button className="gap-2"><Lock size={16} /> Update Security Key</Button>
                  <Button variant="outline">Reset Password</Button>
               </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alert Management</CardTitle>
              <CardDescription>Control how and when you receive real-time financial alerts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="flex items-center justify-between">
                 <div className="space-y-1">
                   <p className="text-sm font-bold">Transaction Push Notifications</p>
                   <p className="text-xs text-muted-foreground">Alerts for all incoming and outgoing funds.</p>
                 </div>
                 <Switch defaultChecked />
               </div>
               <div className="flex items-center justify-between">
                 <div className="space-y-1">
                   <p className="text-sm font-bold">Wealth Performance Weekly</p>
                   <p className="text-xs text-muted-foreground">Receive a summary of your portfolio performance.</p>
                 </div>
                 <Switch defaultChecked />
               </div>
               <div className="flex items-center justify-between">
                 <div className="space-y-1">
                   <p className="text-sm font-bold">Security Anomaly Alerts</p>
                   <p className="text-xs text-muted-foreground">Immediate SMS alerts for suspicious login attempts.</p>
                 </div>
                 <Switch defaultChecked />
               </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Session Audit Log</CardTitle>
              <CardDescription>Review recent access and authorization events.</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                 {[
                   { event: 'Authorized Login', device: 'iPhone 15 Pro', location: 'London, UK', time: '2h ago' },
                   { event: 'Global Transfer Authorization', device: 'Web Terminal', location: 'Zurich, CH', time: 'Yesterday' },
                   { event: 'Card Issued (Virtual)', device: 'Web Terminal', location: 'London, UK', time: '3 days ago' },
                 ].map((log, i) => (
                   <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-muted/10">
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                         <Smartphone size={14} />
                       </div>
                       <div>
                         <p className="text-sm font-bold">{log.event}</p>
                         <p className="text-[10px] text-muted-foreground">{log.device} • {log.location}</p>
                       </div>
                     </div>
                     <span className="text-[10px] text-muted-foreground font-medium">{log.time}</span>
                   </div>
                 ))}
               </div>
               <Button variant="ghost" className="w-full mt-6 text-destructive gap-2">
                 <Trash2 size={16} /> Revoke All Other Sessions
               </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
