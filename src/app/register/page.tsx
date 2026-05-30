"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getDB, saveDB, generateAccountNumber, generateIBAN, type UserProfile } from "@/lib/banking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ShieldCheck, UserPlus, Mail, Lock, User } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({ variant: "destructive", title: "Passwords do not match" });
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const db = getDB();
      if (db.users.some(u => u.email === formData.email)) {
        toast({ variant: "destructive", title: "Email already registered" });
        setLoading(false);
        return;
      }

      const accountNumber = generateAccountNumber();
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        accountNumber,
        iban: generateIBAN(accountNumber),
        balance: 1000.00, // Starting bonus
        isAdmin: false,
        isLocked: false,
        restrictedTransfers: false,
        notes: ['Account created'],
        cards: [],
        assets: [],
        bills: [],
        goals: [
          { id: 'goal-1', name: 'Emergency Fund', targetAmount: 5000, currentAmount: 500, category: 'emergency' },
          { id: 'goal-2', name: 'Summer Trip', targetAmount: 3000, currentAmount: 200, category: 'travel' }
        ],
        transactions: [
          {
            id: `tr-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            description: "Welcome Bonus",
            amount: 1000.00,
            category: "Salary",
            status: 'completed',
            type: 'incoming'
          }
        ]
      };

      db.users.push(newUser);
      saveDB(db);

      toast({ title: "Account Created!", description: "You have been awarded a $1,000 welcome bonus." });
      router.push("/login");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-lg shadow-2xl border-border/50">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center text-white shadow-lg">
              <UserPlus size={28} />
            </div>
          </div>
          <CardTitle className="text-3xl font-headline font-bold">Join Apex Ledger</CardTitle>
          <CardDescription>Experience borderless banking today</CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Legal Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-muted-foreground h-4 w-4" />
                <Input 
                  id="fullName" 
                  placeholder="John Doe" 
                  className="pl-10" 
                  required 
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-muted-foreground h-4 w-4" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  className="pl-10" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-muted-foreground h-4 w-4" />
                  <Input 
                    id="password" 
                    type="password" 
                    className="pl-10" 
                    required 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-muted-foreground h-4 w-4" />
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    className="pl-10" 
                    required 
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground pt-2">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <p>Your data is encrypted with 256-bit AES protocols in our internal systems.</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full font-semibold h-11" disabled={loading}>
              {loading ? "Generating Account..." : "Create Account"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-accent hover:underline font-semibold">
                Log in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
