"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getDB, saveDB, getCurrentUser, logout, type UserProfile, type ChatMessage } from "@/lib/banking";
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

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [admin, setAdmin] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [replyText, setReplyText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u || !u.isAdmin) {
      router.push("/login");
    } else {
      setAdmin(u);
      const db = getDB();
      setUsers(db.users);
      setMessages(db.messages);
    }
  }, [router]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedUser, messages]);

  const updateUser = (userId: string, updates: Partial<UserProfile>) => {
    const db = getDB();
    const idx = db.users.findIndex(u => u.id === userId);
    if (idx > -1) {
      db.users[idx] = { ...db.users[idx], ...updates };
      saveDB(db);
      setUsers([...db.users]);
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...db.users[idx] });
      }
      toast({ title: "System Updated", description: "User record modified." });
    }
  };

  const handleFund = (amountStr: string) => {
    if (!selectedUser || !amountStr) return;
    const amount = parseFloat(amountStr);
    const db = getDB();
    const idx = db.users.findIndex(u => u.id === selectedUser.id);
    
    db.users[idx].balance += amount;
    db.users[idx].transactions.unshift({
      id: `admin-fund-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      description: "ADMIN DEPOSIT: Liquidity Injection",
      amount: amount,
      category: "Admin",
      status: 'completed',
      type: 'incoming'
    });
    
    saveDB(db);
    setUsers([...db.users]);
    setSelectedUser({...db.users[idx]});
    toast({ title: "Funds Disbursed", description: `$${amount.toLocaleString()} added to ${selectedUser.fullName}.` });
  };

  const sendReply = () => {
    if (!admin || !selectedUser || !replyText.trim()) return;

    const db = getDB();
    const newMessage: ChatMessage = {
      id: `admin-msg-${Date.now()}`,
      senderId: admin.id,
      receiverId: selectedUser.id,
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    db.messages.push(newMessage);
    saveDB(db);
    setMessages([...db.messages]);
    setReplyText("");
    toast({ title: "Response Sent", description: "Message delivered to user's terminal." });
  };

  const filteredUsers = users.filter(u => 
    !u.isAdmin && (
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.accountNumber.includes(searchTerm)
    )
  );

  const getChatHistory = (userId: string) => {
    return messages.filter(m => m.senderId === userId || m.receiverId === userId);
  };

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
          <div className="hidden md:flex flex-col text-right">
             <span className="text-[10px] opacity-60 font-bold uppercase">System Liquidity</span>
             <span className="text-sm font-mono font-bold">${users.reduce((a,b)=>a+b.balance, 0).toLocaleString()}</span>
          </div>
          <Button variant="outline" size="sm" className="bg-transparent text-white border-white/20 hover:bg-white/10" onClick={() => { logout(); router.push('/login'); }}>
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

          <TabsContent value="users" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
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
                        <TableRow className="hover:bg-transparent border-muted/50">
                          <TableHead className="font-bold">Identity</TableHead>
                          <TableHead className="font-bold">Account</TableHead>
                          <TableHead className="font-bold">Equity</TableHead>
                          <TableHead className="font-bold">Status</TableHead>
                          <TableHead className="text-right font-bold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((u) => (
                          <TableRow key={u.id} className={cn("cursor-pointer group hover:bg-accent/5 transition-colors border-muted/50", selectedUser?.id === u.id && "bg-accent/5")} onClick={() => setSelectedUser(u)}>
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
                              <Badge variant={u.isLocked ? "destructive" : "secondary"} className="text-[10px] h-5">
                                {u.isLocked ? "LOCKED" : "ACTIVE"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" className="group-hover:text-accent font-bold text-[10px] uppercase">Control</Button>
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
                    <CardTitle className="text-lg">Node Control Panel</CardTitle>
                    <CardDescription>
                      {selectedUser ? `Configuring: ${selectedUser.fullName}` : "Select a node to begin override."}
                    </CardDescription>
                  </CardHeader>
                  {selectedUser ? (
                    <CardContent className="p-6 space-y-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            variant={selectedUser.isLocked ? "default" : "destructive"} 
                            className="w-full h-12 gap-2 font-bold"
                            onClick={() => updateUser(selectedUser.id, { isLocked: !selectedUser.isLocked })}
                          >
                            {selectedUser.isLocked ? <Unlock size={16} /> : <Lock size={16} />}
                            {selectedUser.isLocked ? "Restore Access" : "Revoke Access"}
                          </Button>
                          <Button 
                            variant="outline" 
                            className={cn("h-12 font-bold", selectedUser.restrictedTransfers ? "bg-destructive/10 text-destructive border-destructive/20" : "")}
                            onClick={() => updateUser(selectedUser.id, { restrictedTransfers: !selectedUser.restrictedTransfers })}
                          >
                            {selectedUser.restrictedTransfers ? "Unrestrict" : "Restrict Trans."}
                          </Button>
                        </div>
                        
                        <div className="space-y-2 pt-4 border-t border-muted/50">
                          <Label className="text-[10px] font-bold uppercase opacity-60">Balance Adjustment</Label>
                          <div className="flex gap-2">
                            <Input 
                              type="number" 
                              placeholder="Amount..." 
                              className="h-10 bg-muted/50 border-none"
                              id="fund-input"
                            />
                            <Button className="h-10 px-6 font-bold" onClick={() => {
                              const input = document.getElementById('fund-input') as HTMLInputElement;
                              handleFund(input.value);
                              input.value = "";
                            }}>Apply</Button>
                          </div>
                        </div>

                        <div className="space-y-2 pt-4 border-t border-muted/50">
                          <Label className="text-[10px] font-bold uppercase opacity-60">Admin Audit Trail</Label>
                          <ScrollArea className="h-48 rounded-lg border bg-muted/20 p-4">
                            <div className="space-y-4">
                              {selectedUser.transactions.slice(0, 10).map(t => (
                                <div key={t.id} className="text-[10px] pb-3 border-b border-muted/50 last:border-0">
                                  <div className="flex justify-between font-bold text-primary">
                                    <span className="truncate max-w-[120px]">{t.description}</span>
                                    <span className={t.status === 'reversed' ? "line-through opacity-40" : ""}>
                                      ${t.amount.toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="flex justify-between mt-1 text-muted-foreground">
                                    <span>{t.date}</span>
                                    <span className="uppercase tracking-tighter">{t.status}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      </div>
                    </CardContent>
                  ) : (
                    <CardContent className="flex flex-col items-center justify-center py-32 text-muted-foreground text-center opacity-40">
                      <Database size={48} className="mb-4" />
                      <p className="text-sm font-medium">Global database synced.<br/>Awaiting node selection.</p>
                    </CardContent>
                  )}
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comms" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-1 h-[700px] flex flex-col border-none shadow-sm">
                <CardHeader className="bg-muted/30 border-b">
                  <CardTitle className="text-lg">Active Inquiries</CardTitle>
                  <CardDescription>Communications from client nodes.</CardDescription>
                </CardHeader>
                <ScrollArea className="flex-1">
                  <div className="p-2 space-y-1">
                    {users.filter(u => !u.isAdmin).map(u => {
                      const userMessages = getChatHistory(u.id);
                      const lastMsg = userMessages[userMessages.length - 1];
                      return (
                        <div 
                          key={u.id} 
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all",
                            selectedUser?.id === u.id ? "bg-accent text-white" : "hover:bg-muted/50"
                          )}
                          onClick={() => setSelectedUser(u)}
                        >
                          <Avatar className="h-10 w-10 border-2 border-white/20">
                            <AvatarImage src={`https://picsum.photos/seed/${u.id}/40/40`} />
                            <AvatarFallback>{u.fullName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <p className="font-bold text-sm truncate">{u.fullName}</p>
                              <span className={cn("text-[9px] font-medium", selectedUser?.id === u.id ? "text-white/70" : "text-muted-foreground")}>
                                {lastMsg ? lastMsg.timestamp : 'No history'}
                              </span>
                            </div>
                            <p className={cn("text-xs truncate opacity-80", selectedUser?.id === u.id ? "text-white/80" : "text-muted-foreground")}>
                              {lastMsg ? lastMsg.text : 'Start a conversation'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </Card>

              <Card className="lg:col-span-2 h-[700px] flex flex-col border-none shadow-xl overflow-hidden rounded-2xl">
                {selectedUser ? (
                  <>
                    <CardHeader className="border-b bg-card flex flex-row items-center justify-between p-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-accent/20">
                          <AvatarImage src={`https://picsum.photos/seed/${selectedUser.id}/48/48`} />
                          <AvatarFallback>{selectedUser.fullName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg font-bold">{selectedUser.fullName}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[9px] uppercase font-bold py-0">{selectedUser.accountNumber}</Badge>
                            <span className="text-[10px] text-green-500 font-bold uppercase">Node Verified</span>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <ScrollArea className="flex-1 p-6 bg-muted/5">
                      <div className="space-y-6">
                        {getChatHistory(selectedUser.id).map((msg) => (
                          <div key={msg.id} className={`flex ${msg.senderId === admin.id ? 'justify-end' : 'justify-start'}`}>
                            <div className="max-w-[75%] space-y-1">
                              <div className={cn(
                                "p-4 rounded-2xl shadow-sm",
                                msg.senderId === admin.id 
                                  ? 'bg-primary text-white rounded-tr-none' 
                                  : 'bg-white rounded-tl-none border border-muted'
                              )}>
                                <p className="text-sm leading-relaxed">{msg.text}</p>
                              </div>
                              <div className={cn(
                                "flex items-center gap-1 text-[9px] font-bold uppercase text-muted-foreground px-1",
                                msg.senderId === admin.id ? 'justify-end' : 'justify-start'
                              )}>
                                {msg.timestamp}
                                {msg.senderId === admin.id && <CheckCircle2 size={10} className="text-accent" />}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={scrollRef} />
                      </div>
                    </ScrollArea>

                    <div className="p-4 bg-card border-t flex items-center gap-4">
                      <div className="flex-1 relative">
                        <Input 
                          placeholder={`Authorized response to ${selectedUser.fullName}...`} 
                          className="pr-12 bg-muted/30 border-none focus-visible:ring-1 h-12 rounded-xl" 
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendReply()}
                        />
                        <Button 
                          size="icon" 
                          className="absolute right-1.5 top-1.5 h-9 w-9 rounded-lg bg-accent shadow-lg shadow-accent/20"
                          onClick={sendReply}
                          disabled={!replyText.trim()}
                        >
                          <Send size={16} />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <CardContent className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-30">
                    <MessageSquare size={64} className="mb-4" />
                    <p className="font-bold">Select a user to view secure comms.</p>
                  </CardContent>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logs">
             <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Global Audit Logs</CardTitle>
                  <CardDescription>Unfiltered terminal activity across all system nodes.</CardDescription>
                </CardHeader>
                <CardContent>
                   <ScrollArea className="h-[500px] bg-primary rounded-xl p-6 border-4 border-muted font-mono">
                      <div className="space-y-2 text-[11px]">
                        {users.flatMap(u => u.transactions).sort((a,b) => b.id.localeCompare(a.id)).slice(0, 50).map((log, i) => (
                          <div key={i} className="flex gap-4 text-white/70">
                            <span className="text-accent shrink-0">[{log.date} {new Date().toLocaleTimeString()}]</span>
                            <span className="text-green-500 shrink-0">AUTH_SUCCESS</span>
                            <span className="truncate">TRANS_{log.type.toUpperCase()}: {log.description} | ${log.amount.toLocaleString()}</span>
                            <span className="ml-auto opacity-30">{log.id}</span>
                          </div>
                        ))}
                        <div className="flex gap-4 text-accent animate-pulse">
                           <span>{new Date().toISOString()}</span>
                           <span>LISTENER_ACTIVE</span>
                           <span>Waiting for next system event...</span>
                        </div>
                      </div>
                   </ScrollArea>
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
