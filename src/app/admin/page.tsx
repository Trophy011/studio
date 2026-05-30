"use client";

import { useUser, useDoc, useFirestore, useCollection } from "@/firebase";
import { doc, updateDoc, increment, collection, addDoc, query, orderBy } from "firebase/firestore";
import { type UserProfile, type ChatMessage } from "@/lib/banking";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  ShieldAlert, 
  Search, 
  Lock, 
  Unlock, 
  LogOut,
  Database,
  MessageSquare,
  Send,
  CheckCircle2,
  Terminal
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user: authUser, auth } = useUser();
  const db = useFirestore();
  
  const adminRef = authUser && db ? doc(db, "users", authUser.uid) : null;
  const { data: admin, loading: adminLoading } = useDoc<UserProfile>(adminRef);
  
  const usersRef = db ? collection(db, "users") : null;
  const { data: users } = useCollection<UserProfile>(usersRef);
  
  const messagesRef = db ? collection(db, "messages") : null;
  const messagesQuery = useMemo(() => {
    if (!messagesRef) return null;
    return query(messagesRef, orderBy("timestamp", "asc"));
  }, [messagesRef]);
  const { data: messages } = useCollection<ChatMessage>(messagesQuery);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [replyText, setReplyText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adminLoading && (!admin || !admin.isAdmin)) {
      router.push("/login");
    }
  }, [admin, adminLoading, router]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedUser, messages]);

  const updateUser = (userId: string, updates: Partial<UserProfile>) => {
    if (!db) return;
    const userRef = doc(db, "users", userId);
    updateDoc(userRef, updates);
    toast({ title: "System Updated", description: "User record modified." });
  };

  const handleFund = (amountStr: string) => {
    if (!selectedUser || !amountStr || !db) return;
    const amount = parseFloat(amountStr);
    const userRef = doc(db, "users", selectedUser.id);
    
    updateDoc(userRef, {
      balance: increment(amount),
      transactions: [{
        id: `admin-fund-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        description: "ADMIN DEPOSIT: Liquidity Injection",
        amount: amount,
        category: "Admin",
        status: 'completed',
        type: 'incoming'
      }, ...(selectedUser.transactions || [])]
    });
    
    toast({ title: "Funds Disbursed", description: `$${amount.toLocaleString()} added.` });
  };

  const sendReply = () => {
    if (!admin || !selectedUser || !replyText.trim() || !db) return;

    addDoc(collection(db, "messages"), {
      senderId: admin.id,
      receiverId: selectedUser.id,
      participants: [admin.id, selectedUser.id],
      text: replyText,
      timestamp: new Date().toISOString()
    });

    setReplyText("");
    toast({ title: "Response Sent", description: "Message delivered." });
  };

  const filteredUsers = (users || []).filter(u => 
    !u.isAdmin && (
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.accountNumber.includes(searchTerm)
    )
  );

  const getChatHistory = (userId: string) => {
    return (messages || []).filter(m => m.participants?.includes(userId));
  };

  if (adminLoading) return <Skeleton className="h-screen w-full" />;
  if (!admin) return null;

  return (
    <div className="min-h-screen bg-muted/30 font-body">
      <nav className="h-16 bg-primary text-white flex items-center justify-between px-8 sticky top-0 z-50 shadow-lg border-b border-accent/20">
        <div className="flex items-center gap-4">
          <ShieldAlert className="text-accent h-6 w-6" />
          <div className="flex flex-col">
            <h1 className="text-lg font-headline font-bold tracking-tight">APEX OVERSIGHT TERMINAL</h1>
            <span className="text-[10px] font-mono opacity-50 uppercase tracking-widest">Secure Admin Node: {admin.email}</span>
          </div>
          <Badge className="bg-destructive hover:bg-destructive text-white border-none ml-2">MASTER ADMIN</Badge>
        </div>
        <div className="flex items-center gap-6">
          <Button variant="outline" size="sm" className="bg-transparent text-white border-white/20 hover:bg-white/10" onClick={() => { auth?.signOut(); router.push('/login'); }}>
            <LogOut size={16} className="mr-2" /> EXIT
          </Button>
        </div>
      </nav>

      <div className="p-8">
        <Tabs defaultValue="users" className="space-y-8">
          <TabsList className="bg-white/50 border h-12 p-1 rounded-xl w-fit">
            <TabsTrigger value="users" className="gap-2 px-6"><Users size={16} /> User Management</TabsTrigger>
            <TabsTrigger value="comms" className="gap-2 px-6"><MessageSquare size={16} /> Communications</TabsTrigger>
            <TabsTrigger value="logs" className="gap-2 px-6"><Terminal size={16} /> System Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              <div className="xl:col-span-3 space-y-8">
                <Card className="border-none shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Global Ledger</CardTitle>
                      <CardDescription>Real-time oversight of all managed account nodes.</CardDescription>
                    </div>
                    <div className="relative w-72">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search profiles..." 
                        className="pl-10 h-10 rounded-lg bg-muted/30 border-none" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Identity</TableHead>
                          <TableHead>Account</TableHead>
                          <TableHead>Equity</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((u) => (
                          <TableRow key={u.id} className={cn("cursor-pointer", selectedUser?.id === u.id && "bg-accent/5")} onClick={() => setSelectedUser(u)}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={`https://picsum.photos/seed/${u.id}/32/32`} />
                                  <AvatarFallback>{u.fullName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className="font-bold text-primary">{u.fullName}</span>
                                  <span className="text-[10px] text-muted-foreground">{u.email}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs">{u.accountNumber}</TableCell>
                            <TableCell className="font-bold text-sm">${u.balance.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge variant={u.isLocked ? "destructive" : "secondary"}>{u.isLocked ? "LOCKED" : "ACTIVE"}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">Control</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              <div className="xl:col-span-1">
                <Card className="sticky top-24 border-none shadow-sm">
                  <CardHeader className="bg-muted/30 border-b">
                    <CardTitle className="text-lg">Control Panel</CardTitle>
                  </CardHeader>
                  {selectedUser ? (
                    <CardContent className="p-6 space-y-6">
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant={selectedUser.isLocked ? "default" : "destructive"} 
                          onClick={() => updateUser(selectedUser.id, { isLocked: !selectedUser.isLocked })}
                        >
                          {selectedUser.isLocked ? <Unlock size={16} /> : <Lock size={16} />}
                          {selectedUser.isLocked ? "Unlock" : "Lock"}
                        </Button>
                        <Button variant="outline" onClick={() => updateUser(selectedUser.id, { restrictedTransfers: !selectedUser.restrictedTransfers })}>
                          Restrict
                        </Button>
                      </div>
                      <div className="space-y-2 pt-4 border-t">
                        <Label>Deposit Funds</Label>
                        <div className="flex gap-2">
                          <Input type="number" id="fund-input" placeholder="0.00" />
                          <Button onClick={() => {
                            const input = document.getElementById('fund-input') as HTMLInputElement;
                            handleFund(input.value);
                            input.value = "";
                          }}>Apply</Button>
                        </div>
                      </div>
                    </CardContent>
                  ) : <CardContent className="py-20 text-center opacity-40">Select a node.</CardContent>}
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comms">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-1 h-[600px] flex flex-col border-none shadow-sm">
                <ScrollArea className="flex-1">
                  <div className="p-2 space-y-1">
                    {filteredUsers.map(u => (
                      <div 
                        key={u.id} 
                        className={cn("flex items-center gap-4 p-4 rounded-xl cursor-pointer", selectedUser?.id === u.id ? "bg-accent text-white" : "hover:bg-muted/50")}
                        onClick={() => setSelectedUser(u)}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={`https://picsum.photos/seed/${u.id}/40/40`} />
                        </Avatar>
                        <p className="font-bold text-sm truncate">{u.fullName}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>

              <Card className="lg:col-span-2 h-[600px] flex flex-col border-none shadow-xl overflow-hidden rounded-2xl">
                {selectedUser ? (
                  <>
                    <CardHeader className="border-b bg-card p-6">
                      <CardTitle className="text-lg font-bold">{selectedUser.fullName}</CardTitle>
                    </CardHeader>
                    <ScrollArea className="flex-1 p-6 bg-muted/5">
                      <div className="space-y-6">
                        {getChatHistory(selectedUser.id).map((msg) => (
                          <div key={msg.id} className={`flex ${msg.senderId === admin.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={cn("p-4 rounded-2xl max-w-[75%]", msg.senderId === admin.id ? 'bg-primary text-white' : 'bg-white border')}>
                              <p className="text-sm">{msg.text}</p>
                            </div>
                          </div>
                        ))}
                        <div ref={scrollRef} />
                      </div>
                    </ScrollArea>
                    <div className="p-4 bg-card border-t flex gap-4">
                      <Input 
                        placeholder="Response..." 
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendReply()}
                      />
                      <Button onClick={sendReply}><Send size={16} /></Button>
                    </div>
                  </>
                ) : <CardContent className="flex-1 flex items-center justify-center">Select user.</CardContent>}
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
