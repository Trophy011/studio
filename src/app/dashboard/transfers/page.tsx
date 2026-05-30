"use client";

import { useState, useEffect } from "react";
import { getCurrentUser, getDB, saveDB, type UserProfile, type Transaction } from "@/lib/banking";
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
  ChevronRight
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

export default function TransfersPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [fraudAlert, setFraudAlert] = useState<any>(null);

  const [formData, setFormData] = useState({
    type: 'internal' as 'internal' | 'global',
    recipient: '',
    amount: '',
    description: '',
    swift: '',
    iban: '',
    country: ''
  });

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const handleTransfer = async () => {
    if (!user) return;
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
    
    // AI Fraud Detection Check
    try {
      const fraudCheck = await detectFraud({
        transactionId: `tx-${Date.now()}`,
        userId: user.id,
        amount: amountNum,
        currency: 'USD',
        description: formData.description || 'Transfer',
        location: formData.type === 'internal' ? 'Internal' : formData.country,
        timestamp: new Date().toISOString(),
        userRecentLocations: ['United States', 'Internal']
      });

      if (fraudCheck.isSuspicious && fraudCheck.riskScore > 70) {
        setFraudAlert(fraudCheck);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.error("AI Fraud check failed, proceeding manually", e);
    }

    // Execution Logic
    const db = getDB();
    const currentUserIdx = db.users.findIndex(u => u.id === user.id);
    
    if (formData.type === 'internal') {
      const recipientIdx = db.users.findIndex(u => u.accountNumber === formData.recipient);
      if (recipientIdx === -1) {
        toast({ variant: "destructive", title: "Recipient account not found" });
        setLoading(false);
        return;
      }

      // Add transaction to both
      const trId = `tr-${Date.now()}`;
      const trCommon = {
        date: new Date().toISOString().split('T')[0],
        description: formData.description || 'Internal Transfer',
        amount: amountNum,
        category: 'Transfer',
        status: 'completed' as const,
      };

      db.users[currentUserIdx].balance -= amountNum;
      db.users[currentUserIdx].transactions.unshift({
        ...trCommon,
        id: trId,
        type: 'outgoing',
        to: db.users[recipientIdx].fullName
      });

      db.users[recipientIdx].balance += amountNum;
      db.users[recipientIdx].transactions.unshift({
        ...trCommon,
        id: `rec-${trId}`,
        type: 'incoming',
        from: db.users[currentUserIdx].fullName
      });
    } else {
      // Global SWIFT
      db.users[currentUserIdx].balance -= amountNum;
      db.users[currentUserIdx].transactions.unshift({
        id: `sw-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        description: `SWIFT: ${formData.recipient} (${formData.country})`,
        amount: amountNum,
        category: 'Global Transfer',
        status: 'pending',
        type: 'outgoing'
      });
    }

    saveDB(db);
    setUser(db.users[currentUserIdx]);
    setLoading(false);
    setConfirmDialog(false);
    setFormData({ type: 'internal', recipient: '', amount: '', description: '', swift: '', iban: '', country: '' });
    
    toast({
      title: "Transfer Initiated",
      description: `$${amountNum.toLocaleString()} successfully processed.`,
    });
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-none shadow-xl bg-gradient-to-br from-primary to-primary/90 text-white overflow-hidden">
        <CardContent className="p-8 flex justify-between items-center">
          <div>
            <p className="text-white/70 text-sm font-medium uppercase tracking-wider mb-1">Available Balance</p>
            <h2 className="text-4xl font-headline font-bold">
              ${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h2>
          </div>
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
            <ArrowRightLeft size={32} />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="internal" className="w-full" onValueChange={(val) => setFormData({...formData, type: val as any})}>
        <TabsList className="grid w-full grid-cols-2 h-14 bg-muted/50 p-1">
          <TabsTrigger value="internal" className="rounded-md gap-2">
            <User size={18} /> Internal Transfer
          </TabsTrigger>
          <TabsTrigger value="global" className="rounded-md gap-2">
            <Globe size={18} /> Global SWIFT/IBAN
          </TabsTrigger>
        </TabsList>

        <Card className="mt-6 border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Transfer Details</CardTitle>
            <CardDescription>
              {formData.type === 'internal' 
                ? "Send money instantly to any Apex Ledger account holder." 
                : "Wire funds worldwide using SWIFT/BIC and IBAN standards."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TabsContent value="internal" className="space-y-4 m-0">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Account Number</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="recipient" 
                    placeholder="Enter 10-digit number" 
                    className="pl-10" 
                    value={formData.recipient}
                    onChange={(e) => setFormData({...formData, recipient: e.target.value})}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="global" className="space-y-4 m-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="globalRecipient">Recipient Name</Label>
                  <Input 
                    id="globalRecipient" 
                    placeholder="Full Name" 
                    value={formData.recipient}
                    onChange={(e) => setFormData({...formData, recipient: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Recipient Country</Label>
                  <Input 
                    id="country" 
                    placeholder="e.g. United Kingdom" 
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="swift">SWIFT / BIC Code</Label>
                  <Input 
                    id="swift" 
                    placeholder="ABCDUS33" 
                    value={formData.swift}
                    onChange={(e) => setFormData({...formData, swift: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="iban">IBAN (Europe Required)</Label>
                  <Input 
                    id="iban" 
                    placeholder="GB00 1234..." 
                    value={formData.iban}
                    onChange={(e) => setFormData({...formData, iban: e.target.value})}
                  />
                </div>
              </div>
            </TabsContent>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input 
                id="amount" 
                type="number" 
                placeholder="0.00" 
                className="text-2xl h-14 font-semibold" 
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Memo (Optional)</Label>
              <Input 
                id="desc" 
                placeholder="What is this for?" 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full h-12 text-lg font-bold" onClick={() => setConfirmDialog(true)}>
              Review Transaction <ChevronRight size={20} className="ml-1" />
            </Button>
          </CardFooter>
        </Card>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Transfer</DialogTitle>
            <DialogDescription>Please review the details below before authorizing the payment.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted p-4 rounded-lg flex justify-between items-center">
              <span className="text-sm font-medium">Sending Amount</span>
              <span className="text-xl font-bold text-accent">${parseFloat(formData.amount || "0").toLocaleString()}</span>
            </div>
            <div className="space-y-2 px-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">To</span>
                <span className="font-semibold">{formData.recipient || "N/A"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Type</span>
                <span className="font-semibold capitalize">{formData.type}</span>
              </div>
              {formData.type === 'global' && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">SWIFT/IBAN</span>
                  <span className="font-semibold">{formData.swift || formData.iban || "N/A"}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-800 rounded-lg text-xs">
              <CheckCircle2 size={16} />
              <span>Funds will be deducted from your account balance instantly.</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(false)}>Cancel</Button>
            <Button onClick={handleTransfer} disabled={loading}>
              {loading ? "Processing..." : "Authorize Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fraud Alert Dialog */}
      <Dialog open={!!fraudAlert} onOpenChange={() => setFraudAlert(null)}>
        <DialogContent className="sm:max-w-md border-destructive">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle /> High Risk Transaction Detected
            </DialogTitle>
            <DialogDescription>Our AI monitoring system has flagged this transaction for review.</DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/20">
            <p className="text-sm font-semibold mb-2">Security Analysis:</p>
            <p className="text-sm italic">"{fraudAlert?.explanation}"</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase">Risk Score</span>
              <span className="text-lg font-bold text-destructive">{fraudAlert?.riskScore}%</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="w-full" onClick={() => setFraudAlert(null)}>I Understand, Cancel Transfer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}