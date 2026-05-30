"use client";

import { useState, useEffect, useRef } from "react";
import { getCurrentUser, getDB, saveDB, type UserProfile, type ChatMessage } from "@/lib/banking";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Send, 
  Image as ImageIcon, 
  CheckCircle2, 
  MoreVertical, 
  HelpCircle, 
  Phone, 
  Mail, 
  Search,
  ChevronRight,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  {
    q: "How do I reverse a SWIFT transfer?",
    a: "International transfers can only be reversed within 30 minutes of initiation. Please use the Admin Oversight panel or contact your relationship manager immediately."
  },
  {
    q: "Can I increase my virtual card limit?",
    a: "Yes, head to the Cards tab, select your card, and click 'Manage Limit'. Changes are subject to automated credit scoring."
  },
  {
    q: "Is Apex Ledger regulated?",
    a: "Apex Ledger is fully authorized and regulated by the Global Apex Financial Authority (GAFA), adhering to all international anti-money laundering protocols."
  },
  {
    q: "How long do internal transfers take?",
    a: "Internal transfers between valid Apex account numbers are processed instantly, 24/7/365."
  }
];

export default function SupportCenterPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
    if (u) {
      const db = getDB();
      const userMessages = db.messages.filter(m => m.senderId === u.id || m.receiverId === u.id);
      setMessages(userMessages);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = (image?: string) => {
    if (!user || (!text.trim() && !image)) return;

    const db = getDB();
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      receiverId: 'admin-001',
      text: text,
      image: image,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    db.messages.push(newMessage);
    saveDB(db);
    setMessages(prev => [...prev, newMessage]);
    setText("");
    
    // Fake automated response
    if (!image) {
      setTimeout(() => {
        const reply: ChatMessage = {
          id: `rep-${Date.now()}`,
          senderId: 'admin-001',
          receiverId: user.id,
          text: "Thank you for contacting Apex Ledger Support. A human agent will review your inquiry shortly. Your reference ID is " + Math.random().toString(36).substr(2, 9).toUpperCase(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        db.messages.push(reply);
        saveDB(db);
        setMessages(prev => [...prev, reply]);
      }, 2000);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast({ title: "Document Uploaded", description: "Identity document ready to send." });
      sendMessage("https://picsum.photos/seed/doc/400/300");
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-headline font-bold">Support Center</h1>
        <p className="text-muted-foreground">Expert financial assistance, available 24/7.</p>
      </div>

      <Tabs defaultValue="help" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px] h-12 bg-muted/50 p-1 mb-8">
          <TabsTrigger value="help" className="gap-2">
            <HelpCircle size={18} /> Help Center
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-2">
            <MessageSquare size={18} /> Live Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="help" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                   <Phone size={24} />
                </div>
                <h3 className="font-bold">Phone Support</h3>
                <p className="text-xs text-muted-foreground">Global Priority Line for Premium members.</p>
                <span className="font-mono text-sm">+1 (800) APEX-HELP</span>
              </CardContent>
            </Card>
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                   <Mail size={24} />
                </div>
                <h3 className="font-bold">Email Inquiries</h3>
                <p className="text-xs text-muted-foreground">Detailed ticket resolution within 4 hours.</p>
                <span className="font-mono text-sm">concierge@apexledger.com</span>
              </CardContent>
            </Card>
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                   <FileText size={24} />
                </div>
                <h3 className="font-bold">Knowledge Base</h3>
                <p className="text-xs text-muted-foreground">Search our extensive financial guides.</p>
                <Button variant="outline" size="sm" className="w-full">Browse Articles</Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold font-headline">Frequently Asked Questions</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-muted-foreground h-4 w-4" />
                  <Input placeholder="Search FAQs..." className="pl-10 h-10" />
                </div>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {FAQS.map((faq, i) => (
                  <AccordionItem key={i} value={`item-${i}`} className="border-muted/50">
                    <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="text-lg">Recent Tickets</CardTitle>
                <CardDescription>Track the status of your open inquiries.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border border-dashed hover:bg-muted/30 transition-colors group cursor-pointer">
                  <div className="space-y-1">
                    <p className="text-sm font-bold">Address Verification Request</p>
                    <p className="text-[10px] text-muted-foreground">#TKT-99283 • Opened 2h ago</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none">Pending</Badge>
                    <ChevronRight size={14} className="text-muted-foreground group-hover:text-accent transition-colors" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-dashed hover:bg-muted/30 transition-colors group cursor-pointer opacity-60">
                  <div className="space-y-1">
                    <p className="text-sm font-bold">Virtual Card Replacement</p>
                    <p className="text-[10px] text-muted-foreground">#TKT-99102 • Resolved Yesterday</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Resolved</Badge>
                    <ChevronRight size={14} className="text-muted-foreground group-hover:text-accent transition-colors" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="chat">
          <Card className="h-[600px] flex flex-col border-none shadow-2xl overflow-hidden rounded-2xl">
            <CardHeader className="border-b bg-card flex flex-row items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-accent">
                    <AvatarImage src="https://picsum.photos/seed/admin/48/48" />
                    <AvatarFallback>AS</AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <CardTitle className="text-lg">Apex Live Concierge</CardTitle>
                  <CardDescription className="flex items-center gap-1 text-green-500 font-medium">
                    Agents Online • Instant Response
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="rounded-full"><Phone size={18} /></Button>
                <Button variant="ghost" size="icon" className="rounded-full"><MoreVertical size={18} /></Button>
              </div>
            </CardHeader>
            
            <ScrollArea className="flex-1 p-6 bg-muted/5">
              <div className="space-y-6">
                <div className="flex justify-center">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">Secure Session Established</span>
                </div>
                
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] space-y-1`}>
                      <div className={`p-4 rounded-2xl ${
                        msg.senderId === user.id 
                          ? 'bg-accent text-white rounded-tr-none shadow-lg shadow-accent/20' 
                          : 'bg-muted/80 rounded-tl-none border shadow-sm'
                      }`}>
                        {msg.image && (
                          <div className="mb-2 overflow-hidden rounded-lg">
                            <img src={msg.image} alt="shared" className="w-full h-auto object-cover max-h-60" />
                          </div>
                        )}
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                      </div>
                      <div className={`flex items-center gap-1 text-[10px] text-muted-foreground ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                        {msg.timestamp}
                        {msg.senderId === user.id && <CheckCircle2 size={10} className="text-accent" />}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <div className="p-4 bg-card border-t flex items-center gap-4">
              <div className="relative">
                <input type="file" id="img-upload-chat" className="hidden" accept="image/*" onChange={handleImageUpload} />
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-accent/10 hover:text-accent" asChild>
                  <label htmlFor="img-upload-chat" className="cursor-pointer">
                    <ImageIcon size={20} />
                  </label>
                </Button>
              </div>
              <div className="flex-1 relative">
                <Input 
                  placeholder="Ask our financial agents anything..." 
                  className="pr-12 bg-muted/50 border-none focus-visible:ring-1 h-12 rounded-full" 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button 
                  size="icon" 
                  className="absolute right-1.5 top-1.5 h-9 w-9 rounded-full shadow-lg"
                  onClick={() => sendMessage()}
                  disabled={!text.trim()}
                >
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </Card>
          <p className="text-center text-[10px] text-muted-foreground mt-4 px-12">
            All administrative communications are encrypted with E2EE protocols. Your financial safety is our primary objective.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
