"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Globe, Zap, ArrowRight } from "lucide-react";
import { useUser } from "@/firebase";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20 rotate-3">
            <ShieldCheck size={32} />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-headline font-bold text-primary">
          Apex <span className="text-accent">Ledger</span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
          The most secure internal banking ledger for the digital age. Manage global transfers, virtual cards, and AI-powered insights all in one place.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
          <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
            <Globe className="text-accent mb-4 mx-auto" size={28} />
            <h3 className="font-headline font-semibold text-lg mb-2">Global SWIFT</h3>
            <p className="text-sm text-muted-foreground">Seamless transfers to Europe and beyond with IBAN validation.</p>
          </div>
          <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
            <Zap className="text-accent mb-4 mx-auto" size={28} />
            <h3 className="font-headline font-semibold text-lg mb-2">Instant Transfers</h3>
            <p className="text-sm text-muted-foreground">Real-time internal transfers between valid account numbers.</p>
          </div>
          <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
            <ShieldCheck className="text-accent mb-4 mx-auto" size={28} />
            <h3 className="font-headline font-semibold text-lg mb-2">Secure Vault</h3>
            <p className="text-sm text-muted-foreground">Advanced security features to keep your assets protected.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="rounded-full px-8 h-14 text-lg gap-2" onClick={() => router.push('/register')}>
            Open Account <ArrowRight size={20} />
          </Button>
          <Button variant="outline" size="lg" className="rounded-full px-8 h-14 text-lg" onClick={() => router.push('/login')}>
            Sign In
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground pt-12">
          Authorized and Regulated by the Global Apex Financial Authority.
        </p>
      </div>
    </div>
  );
}
