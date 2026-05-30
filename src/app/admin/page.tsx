"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDB, saveDB, getCurrentUser, type UserProfile, logout } from "@/lib/banking";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  ShieldAlert, 
  Search, 
  Ban, 
  Lock, 
  Unlock, 
  ArrowLeftRight, 
  LogOut,
  Settings,
  Database,
  History,
  MessageSquare
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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [admin, setAdmin] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [actionDialog, setActionDialog] = useState(false);
  const [fundAmount, setFundAmount] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    const u = getCurrentUser();
    if (!u || !u.isAdmin) {
      router.push("/login");
    } else {
      setAdmin(u);
      setUsers(getDB().users);
    }
  }, [router]);

  const updateUser = (userId: string, updates: Partial<UserProfile>) => {
    const db = getDB();
    const idx = db.users.findIndex(u => u.id === userId);
    if (idx > -1) {
      db.users[idx] = { ...db.users[idx], ...updates };
      saveDB(db);
      setUsers(db.users);
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...db.users[idx] });
      }
      toast({ title: "System Updated", description: "User record successfully modified." });
    }
  };

  const handleFund = () => {
    if (!selectedUser || !fundAmount) return;
    const amount = parseFloat(fundAmount);
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
    setUsers(db.users);
    setSelectedUser({...db.users[idx]});
    setFundAmount("");
    toast({ title: "Funds Disbursed", description: `$${amount.toLocaleString()} added to account.` });
  };

  const handleReverse = (txId: string) => {
    if (!selectedUser) return;
    const db = getDB();
    const uIdx = db.users.findIndex(u => u.id === selectedUser.id);
    const txIdx = db.users[uIdx].transactions.findIndex(t => t.id === txId);
    
    if (txIdx > -1) {
      const tx = db.users[uIdx].transactions[txIdx];
      // Reverse balance
      db.users[uIdx].balance += tx.type === 'outgoing' ? tx.amount : -tx.amount;
      db.users[uIdx].transactions[txIdx].status = 'reversed';
      
      saveDB(db);
      setUsers(db.users);
      setSelectedUser({...db.users[uIdx]});
      toast({ title: "Payment Reversed", description: "Balance adjustment completed." });
    }
  };

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.accountNumber.includes(searchTerm)
  );

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-muted/30">
      <nav className="h-16 bg-primary text-white flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <ShieldAlert className="text-accent" />
          <h1 className="text-xl font-headline font-bold">APEX CENTRAL OVERSIGHT</h1>
          <Badge className="bg-destructive hover:bg-destructive text-white border-none">SYSTEM ADMIN</Badge>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium opacity-70">Treasury: ${admin.balance.toLocaleString()}</span>
          <Button variant="ghost" className="text-white" onClick={() => { logout(); router.push('/login'); }}>
            <LogOut size={18} className="mr-2" /> Exit Terminal
          </Button>
        </div>
      </nav>

      <div className="p-8 grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Managed Users</CardDescription>
                <CardTitle className="text-3xl font-headline">{users.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <Users className="text-accent h-4 w-4" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>System Liquidity</CardDescription>
                <CardTitle className="text-3xl font-headline">${users.reduce((a,b)=>a+b.balance, 0).toLocaleString()}</CardTitle>
              </CardHeader>
              <CardContent>
                <Database className="text-green-500 h-4 w-4" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Active Alerts</CardDescription>
                <CardTitle className="text-3xl font-headline">0</CardTitle>
              </CardHeader>
              <CardContent>
                <Ban className="text-destructive h-4 w-4" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Global Ledger Search</CardTitle>
                <CardDescription>Access and modify any user profile in the database.</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Name, Email or Account..." 
                  className="pl-10" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Account #</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedUser(u)}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold">{u.fullName}</span>
                          <span className="text-xs text-muted-foreground">{u.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{u.accountNumber}</TableCell>
                      <TableCell className="font-bold">${u.balance.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={u.isLocked ? "destructive" : "secondary"}>
                          {u.isLocked ? "LOCKED" : "ACTIVE"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">Manage Profile</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-1 space-y-6">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>User Control Terminal</CardTitle>
              <CardDescription>
                {selectedUser ? `Modifying: ${selectedUser.fullName}` : "Select a user to begin control."}
              </CardDescription>
            </CardHeader>
            {selectedUser && (
              <CardContent className="space-y-6">
                <div className="space-y-4">
                   <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant={selectedUser.isLocked ? "default" : "destructive"} 
                        className="w-full gap-2"
                        onClick={() => updateUser(selectedUser.id, { isLocked: !selectedUser.isLocked })}
                      >
                        {selectedUser.isLocked ? <Unlock size={16} /> : <Lock size={16} />}
                        {selectedUser.isLocked ? "Unlock" : "Lock"}
                      </Button>
                      <Button 
                        variant="outline" 
                        className={selectedUser.restrictedTransfers ? "bg-red-50" : ""}
                        onClick={() => updateUser(selectedUser.id, { restrictedTransfers: !selectedUser.restrictedTransfers })}
                      >
                        {selectedUser.restrictedTransfers ? "Unrestrict" : "Restrict Trans."}
                      </Button>
                   </div>
                   
                   <div className="space-y-2 pt-4 border-t">
                     <Label>Liquidate/Fund Account</Label>
                     <div className="flex gap-2">
                       <Input 
                         type="number" 
                         placeholder="Amount..." 
                         value={fundAmount} 
                         onChange={(e) => setFundAmount(e.target.value)}
                       />
                       <Button onClick={handleFund}>Execute</Button>
                     </div>
                   </div>

                   <div className="space-y-2 pt-4 border-t">
                     <Label>Administrative Notes</Label>
                     <Textarea 
                       placeholder="Annotate profile..." 
                       value={note}
                       onChange={(e) => setNote(e.target.value)}
                     />
                     <Button variant="secondary" className="w-full" onClick={() => {
                        updateUser(selectedUser.id, { notes: [...selectedUser.notes, note] });
                        setNote("");
                     }}>Save Note</Button>
                   </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <Label>System Logs</Label>
                  <ScrollArea className="h-48 rounded-md border p-4 bg-muted/50">
                    <div className="space-y-4">
                      {selectedUser.transactions.map(t => (
                        <div key={t.id} className="text-[10px] space-y-1 pb-2 border-b last:border-0">
                          <div className="flex justify-between font-bold">
                            <span>{t.date} - {t.description}</span>
                            <span className={t.status === 'reversed' ? "line-through text-muted-foreground" : ""}>
                              ${t.amount.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="opacity-60">{t.id}</span>
                            {t.status === 'completed' && (
                              <button 
                                className="text-accent hover:underline font-bold"
                                onClick={() => handleReverse(t.id)}
                              >
                                REVERSE
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            )}
            {!selectedUser && (
              <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center">
                <Settings className="mb-4 h-12 w-12 opacity-20" />
                <p>No profile selected.</p>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}