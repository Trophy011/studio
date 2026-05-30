"use client";

import { useUser, useDoc, useFirestore } from "@/firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { type UserProfile, generateCard } from "@/lib/banking";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, ShieldCheck, Eye, EyeOff, Lock, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CardsPage() {
  const { toast } = useToast();
  const { user: authUser } = useUser();
  const db = useFirestore();
  const userRef = authUser && db ? doc(db, "users", authUser.uid) : null;
  const { data: user, loading } = useDoc<UserProfile>(userRef);

  const [showNumbers, setShowNumbers] = useState<Record<string, boolean>>({});
  const [applyDialog, setApplyDialog] = useState(false);
  const [cardType, setCardType] = useState<'virtual' | 'physical'>('virtual');

  const handleApply = () => {
    if (!user || !userRef) return;
    const { number, expiry, cvv } = generateCard();
    
    const newCard = {
      id: `card-${Date.now()}`,
      number,
      expiry,
      cvv,
      type: cardType,
      status: 'active' as const
    };

    updateDoc(userRef, {
      cards: arrayUnion(newCard)
    });

    setApplyDialog(false);
    toast({ title: "Card Issued", description: `Your ${cardType} card is ready for use.` });
  };

  const toggleShow = (id: string) => {
    setShowNumbers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) return <Skeleton className="h-96 w-full" />;
  if (!user) return null;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold">Your Cards</h1>
          <p className="text-muted-foreground">Manage your physical and digital spending power.</p>
        </div>
        <Button onClick={() => setApplyDialog(true)} className="gap-2">
          <Plus size={18} /> Apply for Card
        </Button>
      </div>

      {(!user.cards || user.cards.length === 0) ? (
        <Card className="bg-muted/10 border-dashed border-2 py-20 flex flex-col items-center">
          <CreditCard size={64} className="text-muted mb-4" />
          <h3 className="text-xl font-bold">No Cards Active</h3>
          <p className="text-muted-foreground mb-6">Apply for your first Apex Virtual Card today.</p>
          <Button onClick={() => setApplyDialog(true)}>Get Started</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user.cards.map((card) => (
            <div key={card.id} className="group perspective-1000 h-[220px]">
              <div className="relative w-full h-full transition-all duration-500 bg-gradient-to-br from-[#1e293b] to-primary rounded-2xl p-6 shadow-2xl text-white overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                  <ShieldCheck size={100} />
                </div>
                
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="h-8 w-12 bg-yellow-500/80 rounded-md"></div>
                    <Badge variant="outline" className="text-white border-white/20 bg-white/5 uppercase text-[10px]">
                      {card.type}
                    </Badge>
                  </div>
                  <span className="font-headline font-bold text-lg italic tracking-tighter">APEX LEDGER</span>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <span className="text-xl md:text-2xl font-mono tracking-[0.2em]">
                    {showNumbers[card.id] ? card.number : `•••• •••• •••• ${card.number.slice(-4)}`}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-white/10"
                    onClick={() => toggleShow(card.id)}
                  >
                    {showNumbers[card.id] ? <EyeOff size={18} /> : <Eye size={18} />}
                  </Button>
                </div>

                <div className="mt-4 flex space-x-8">
                  <div className="flex flex-col">
                    <span className="text-[10px] opacity-60 uppercase font-bold">Expiry</span>
                    <span className="text-sm font-semibold">{card.expiry}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] opacity-60 uppercase font-bold">CVV</span>
                    <span className="text-sm font-semibold">{showNumbers[card.id] ? card.cvv : '•••'}</span>
                  </div>
                </div>

                <div className="mt-auto pt-4 flex justify-between items-center">
                  <span className="text-xs opacity-80 uppercase tracking-widest">{user.fullName}</span>
                  <Globe size={24} className="opacity-40" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock size={20} className="text-accent" /> Freeze Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Instantly block any of your cards if you suspect fraudulent activity or misplacement.</p>
            <div className="flex flex-wrap gap-2">
              {(user.cards || []).map(c => (
                <Button key={c.id} variant="outline" size="sm">Freeze {c.type} ••{c.number.slice(-4)}</Button>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe size={20} className="text-accent" /> Worldwide Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Apex cards are accepted at millions of merchants globally. No international transaction fees on digital payments.</p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={applyDialog} onOpenChange={setApplyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for New Card</DialogTitle>
            <DialogDescription>Choose your preferred card type. Cards are issued instantly upon approval.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button 
              variant={cardType === 'virtual' ? 'default' : 'outline'} 
              className="h-32 flex flex-col gap-2"
              onClick={() => setCardType('virtual')}
            >
              <Lock size={32} />
              <div className="text-center">
                <p className="font-bold">Virtual Card</p>
                <p className="text-[10px] opacity-70">For Online Shopping</p>
              </div>
            </Button>
            <Button 
              variant={cardType === 'physical' ? 'default' : 'outline'} 
              className="h-32 flex flex-col gap-2"
              onClick={() => setCardType('physical')}
            >
              <CreditCard size={32} />
              <div className="text-center">
                <p className="font-bold">Physical Card</p>
                <p className="text-[10px] opacity-70">Contactless Worldwide</p>
              </div>
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyDialog(false)}>Cancel</Button>
            <Button onClick={handleApply}>Issue Card</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
