"use client";

import { useUser, useDoc, useFirestore } from "@/firebase";
import { doc, updateDoc, arrayUnion, increment, collection, query, where, getDocs } from "firebase/firestore";
import { type UserProfile, type Bill } from "@/lib/banking";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowRightLeft, 
  Globe, 
  User, 
  Hash, 
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  CalendarDays,
  CreditCard
} from "lucide-react";
import { detectFraud } from "@/ai/flows/ai-fraud-detection";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TransfersPage() {
  const { toast } = useToast();
  const { user: authUser } = useUser();
  const db = useFirestore();
  const userRef = authUser && db ? doc(db, "users", authUser.uid) : null;
  const { data: user, loading: userLoading } = useDoc<UserProfile>(userRef);

  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [fraudAlert, setFraudAlert] = useState<any>(null);

  const [formData, setFormData] = useState({
    type: 'internal' as 'internal' | 'global' | 'billpay',
    recipient: '',
    amount: '',
    description: '',
    swift: '',
    iban: '',
    country: ''
  });

  const handleTransfer = async () => {
    if (!user || !userRef || !db) return;
    const amountNum = parseFloat(formData.amount);
    
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({ variant: "destructive", title: "Invalid amount" });
      return;
    }

    if (amountNum > user.balance) {
      toast({ variant: "destructive", title: "Insufficient funds" });
      return;
    }

    if (user.restrictedTransfers) {
      toast({ variant: "destructive", title: "Transfer Restricted", description: "Administration has restricted outgoing transfers for this account." });
      return;
    }

    setLoading(true);
    
    try {
      const fraudCheck = await detectFraud({
        transactionId: `tx-${Date.now()}`,
        userId: user.id,
        amount: amountNum,
        currency: 'USD',
        description: formData.description || 'Transfer',
        location: formData.type === 'internal' ? 'Internal' : (formData.type === 'global' ? formData.country : 'Automated Bill Pay'),
        timestamp: new Date().toISOString(),
        userRecentLocations: ['United States', 'Internal', 'Global Terminal']
      });

      if (fraudCheck.isSuspicious && fraudCheck.riskScore > 70) {
        setFraudAlert(fraudCheck);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.error("AI Fraud check error", e);
    }

    const trId = `tr-${Date.now()}`;
    const date = new Date().toISOString().split('T')[0];

    if (formData.type === 'internal') {
      const q = query(collection(db, "users"), where("accountNumber", "==", formData.recipient));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        toast({ variant: "destructive", title: "Recipient account not found" });
        setLoading(false);
        return;
      }

      const recipientDoc = querySnapshot.docs[0];
      const recipientData = recipientDoc.data() as UserProfile;
      const recipientRef = doc(db, "users", recipientDoc.id);

      // Sender Write
      updateDoc(userRef, {
        balance: increment(-amountNum),
        transactions: arrayUnion({
          id: trId,
          date,
          description: formData.description || 'Internal Transfer',
          amount: amountNum,
          category: 'Transfer',
          status: 'completed',
          type: 'outgoing',
          to: recipientData.fullName
        })
      });

      // Recipient Write
      updateDoc(recipientRef, {
        balance: increment(amountNum),
        transactions: arrayUnion({
          id: `rec-${trId}`,
          date,
          description: formData.description || 'Internal Transfer',
          amount: amountNum,
          category: 'Transfer',
          status: 'completed',
          type: 'incoming',
          from: user.fullName
        })
      });
    } else {
      updateDoc(userRef, {
        balance: increment(-amountNum),
        transactions: arrayUnion({
          id: `${formData.type === 'global' ? 'sw' : 'bp'}-${Date.now()}`,
          date,
          description: formData.type === 'global' ? `SWIFT: ${formData.recipient}` : `Bill Pay: ${formData.recipient}`,
          amount: amountNum,
          category: formData.type === 'global' ? 'Global Transfer' : 'Bill Payment',
          status: formData.type === 'global' ? 'pending' : 'completed',
          type: 'outgoing'
        })
      });
    }

    setLoading(false);
    setConfirmDialog(false);
    setFormData({ type: 'internal', recipient: '', amount: '', description: '', swift: '', iban: '', country: '' });
    
    toast({
      title: "Transaction Initiated",
      description: `$${amountNum.toLocaleString()} successfully processed.`,
    });
  };

  if (userLoading) return <Skeleton className="h-96 w-full" />;
  if (!user) return null;

  const bills: Bill[] = (user.bills && user.bills.length > 0) ? user.bills : [
    { id: 'b1', name: 'Apex Insurance Group', amount: 450.00, dueDate: '2024-05-15', status: 'upcoming', category: 'Insurance' },
    { id: 'b2', name: 'Global Properties LLC', amount: 2800.00, dueDate: '2024-05-01', status: 'upcoming', category: 'Rent' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card className="border-none shadow-xl bg-primary text-white overflow-hidden relative">
        <CardContent className="p-8 flex justify-between items-center">
          <div>
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Total Liquid Balance</p>
            <h2 className="text-4xl md:text-5xl font-headline font-bold">
              ${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h2>
          </div>
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
            <ArrowRightLeft size={28} />
          </div>
        </CardContent>
        <div className="absolute right-[-20px] top-[-20px] opacity-10">
          <Globe size={150} />
        </div>
      </Card>

      <Tabs defaultValue="internal" className="w-full" onValueChange={(val) => setFormData({...formData, type: val as any})}>
        <TabsList className="grid w-full grid-cols-3 h-14 bg-muted/50 p-1">
          <TabsTrigger value="internal" className="gap-2"><User size={16} /> Internal</TabsTrigger>
          <TabsTrigger value="global" className="gap-2"><Globe size={16} /> Global</TabsTrigger>
          <TabsTrigger value="billpay" className="gap-2"><Clock size={16} /> Bill Pay</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          <Card className="lg:col-span-2 border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">
                {formData.type === 'internal' && "Instant Transfer"}
                {formData.type === 'global' && "International Wire"}
                {formData.type === 'billpay' && "Managed Bill Payment"}
              </CardTitle>
              <CardDescription>
                {formData.type === 'internal' && "Secure, real-time transfers within the Apex Ledger network."}
                {formData.type === 'global' && "High-priority SWIFT and IBAN transfers with global coverage."}
                {formData.type === 'billpay' && "Schedule and automate your recurring financial obligations."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.type === 'internal' && (
                <div className="space-y-2">
                  <Label>Recipient Account</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="10-digit Account Number" 
                      className="pl-10" 
                      value={formData.recipient}
                      onChange={(e) => setFormData({...formData, recipient: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {formData.type === 'global' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Beneficiary Name</Label>
                    <Input placeholder="Full Legal Name" value={formData.recipient} onChange={(e) => setFormData({...formData, recipient: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input placeholder="e.g. Switzerland" value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>SWIFT / BIC</Label>
                    <Input placeholder="BANKCODE" value={formData.swift} onChange={(e) => setFormData({...formData, swift: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>IBAN</Label>
                    <Input placeholder="CH93 0000..." value={formData.iban} onChange={(e) => setFormData({...formData, iban: e.target.value})} />
                  </div>
                </div>
              )}

              {formData.type === 'billpay' && (
                <div className="space-y-4">
                  <Label>Select Payee</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {bills.filter(b => b.status !== 'paid').map(bill => (
                      <div 
                        key={bill.id} 
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all",
                          formData.recipient === bill.name ? "border-accent bg-accent/5" : "border-muted hover:border-muted-foreground/20"
                        )}
                        onClick={() => {
                          setFormData({
                            ...formData, 
                            recipient: bill.name,
                            amount: bill.amount.toString(),
                            description: `Settlement: ${bill.name}`
                          });
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-primary">
                            <CalendarDays size={14} />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{bill.name}</p>
                            <p className="text-[10px] text-muted-foreground">Due: {bill.dueDate}</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold">${bill.amount.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2 pt-2">
                <Label>Amount (USD)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 font-bold text-muted-foreground">$</span>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    className="pl-8 text-2xl h-14 font-semibold" 
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Transaction Memo</Label>
                <Input placeholder="Optional reference note" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full h-12 text-lg font-bold" onClick={() => setConfirmDialog(true)}>
                Authorize Transaction <ChevronRight size={20} className="ml-1" />
              </Button>
            </CardFooter>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Security Protocol</CardTitle>
                <CardDescription>Verified connection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <CheckCircle2 size={20} className="text-green-500" />
                  <div className="text-[11px]">
                    <p className="font-bold">Encrypted Node</p>
                    <p className="text-muted-foreground">End-to-end ledger validation</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Clock size={20} className="text-accent" />
                  <div className="text-[11px]">
                    <p className="font-bold">Instant Settlement</p>
                    <p className="text-muted-foreground">Available for all internal routes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-accent/5 border-accent/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard size={18} className="text-accent" /> Limits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Daily Limit</span>
                  <span className="font-bold">$500,000.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className="font-bold text-green-600">$482,100.00</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>

      <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Authorization</DialogTitle>
            <DialogDescription>Your digital signature is required to finalize this payment.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-primary/5 p-6 rounded-2xl flex flex-col items-center gap-2">
              <span className="text-sm text-muted-foreground">Transfer Amount</span>
              <span className="text-4xl font-headline font-bold text-primary">${parseFloat(formData.amount || "0").toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
               <div>
                 <p className="text-muted-foreground text-[10px] uppercase font-bold">To</p>
                 <p className="font-semibold">{formData.recipient || "Unnamed Beneficiary"}</p>
               </div>
               <div>
                 <p className="text-muted-foreground text-[10px] uppercase font-bold">Protocol</p>
                 <p className="font-semibold capitalize">{formData.type}</p>
               </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(false)}>Cancel</Button>
            <Button onClick={handleTransfer} disabled={loading} className="px-8">
              {loading ? "Decrypting..." : "Finalize Authorization"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!fraudAlert} onOpenChange={() => setFraudAlert(null)}>
        <DialogContent className="sm:max-w-md border-destructive">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle /> High-Risk Anomaly
            </DialogTitle>
            <DialogDescription>Apex Oversight has blocked this request for security validation.</DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-destructive/5 rounded-xl border border-destructive/20 space-y-3">
            <p className="text-xs font-bold uppercase text-destructive">System Analysis:</p>
            <p className="text-sm italic font-medium">"{fraudAlert?.explanation}"</p>
            <div className="flex items-center justify-between border-t pt-2 mt-2">
              <span className="text-xs font-bold text-muted-foreground">RISK INDEX</span>
              <Badge variant="destructive">{fraudAlert?.riskScore}%</Badge>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="w-full" onClick={() => setFraudAlert(null)}>Cancel and Revoke</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
