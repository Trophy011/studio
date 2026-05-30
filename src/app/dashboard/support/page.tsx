"use client";

import { useState, useEffect, useRef } from "react";
import { getCurrentUser, getDB, saveDB, type UserProfile, type ChatMessage } from "@/lib/banking";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Image as ImageIcon, CheckCircle2, MoreVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export default function SupportChatPage() {
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
      // In a real app we'd upload to a bucket, here we'll just use a placeholder based on file type
      toast({ title: "Image Selected", description: "Identity document ready to send." });
      sendMessage("https://picsum.photos/seed/doc/400/300");
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col space-y-4">
      <Card className="flex-1 flex flex-col border-none shadow-xl overflow-hidden">
        <CardHeader className="border-b bg-card flex flex-row items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-accent">
              <AvatarImage src="https://picsum.photos/seed/admin/48/48" />
              <AvatarFallback>AS</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">Apex Live Support</CardTitle>
              <CardDescription className="flex items-center gap-1 text-green-500 font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Agents Online
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon"><MoreVertical size={20} /></Button>
        </CardHeader>
        
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            <div className="flex justify-center">
              <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted px-2 py-1 rounded">Today</span>
            </div>
            
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] space-y-1`}>
                  <div className={`p-4 rounded-2xl ${
                    msg.senderId === user.id 
                      ? 'bg-accent text-white rounded-tr-none shadow-lg shadow-accent/20' 
                      : 'bg-muted rounded-tl-none'
                  }`}>
                    {msg.image && (
                      <div className="mb-2 overflow-hidden rounded-lg">
                        <img src={msg.image} alt="shared" className="w-full h-auto object-cover max-h-60" />
                      </div>
                    )}
                    <p className="text-sm">{msg.text}</p>
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
            <input type="file" id="img-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
            <Button variant="ghost" size="icon" className="text-muted-foreground" asChild>
              <label htmlFor="img-upload" className="cursor-pointer">
                <ImageIcon size={20} />
              </label>
            </Button>
          </div>
          <div className="flex-1 relative">
            <Input 
              placeholder="Type your message..." 
              className="pr-12 bg-muted/50 border-none focus-visible:ring-1" 
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button 
              size="icon" 
              className="absolute right-1 top-1 h-8 w-8 rounded-full"
              onClick={() => sendMessage()}
              disabled={!text.trim()}
            >
              <Send size={14} />
            </Button>
          </div>
        </div>
      </Card>
      <p className="text-center text-[10px] text-muted-foreground px-12">
        For your security, never share your password or full CVV with support agents. All chats are recorded for quality and auditing purposes.
      </p>
    </div>
  );
}