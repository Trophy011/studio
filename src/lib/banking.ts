import { type TransactionHistory } from "@/ai/flows/personal-financial-advisor";

export type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  status: 'completed' | 'pending' | 'reversed';
  to?: string;
  from?: string;
  type: 'incoming' | 'outgoing';
};

export type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  category: 'travel' | 'emergency' | 'investment' | 'large_purchase';
};

export type Asset = {
  id: string;
  name: string;
  value: number;
  change: number;
  type: 'stock' | 'crypto' | 'commodity' | 'real_estate';
};

export type Bill = {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  status: 'upcoming' | 'paid' | 'overdue';
  category: string;
};

export type UserProfile = {
  id: string;
  email: string;
  password?: string;
  fullName: string;
  accountNumber: string;
  iban: string;
  balance: number;
  isAdmin: boolean;
  isLocked: boolean;
  restrictedTransfers: boolean;
  notes: string[];
  cards: {
    id: string;
    number: string;
    expiry: string;
    cvv: string;
    type: 'virtual' | 'physical';
    status: 'active' | 'blocked';
  }[];
  transactions: Transaction[];
  goals: SavingsGoal[];
  assets: Asset[];
  bills: Bill[];
};

export type ChatMessage = {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  image?: string;
  timestamp: string;
};

const STORAGE_KEY = 'apex_ledger_db';
const SESSION_KEY = 'apex_ledger_session';

export function getDB(): { users: UserProfile[], messages: ChatMessage[] } {
  if (typeof window === 'undefined') return { users: [], messages: [] };
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    const adminAccount: UserProfile = {
      id: 'admin-001',
      email: 'managementofficails001@gmail.com',
      password: 'smart446688',
      fullName: 'Apex Administration',
      accountNumber: '0000000001',
      iban: 'APEX0000000001',
      balance: 10000000000,
      isAdmin: true,
      isLocked: false,
      restrictedTransfers: false,
      notes: ['Master Admin Account Created'],
      cards: [],
      transactions: [],
      goals: [],
      assets: [],
      bills: []
    };
    const initialDB = { users: [adminAccount], messages: [] };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDB));
    return initialDB;
  }
  return JSON.parse(data);
}

export function saveDB(db: { users: UserProfile[], messages: ChatMessage[] }) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function getCurrentUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) return null;
  const db = getDB();
  return db.users.find(u => u.id === session) || null;
}

export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}

export function generateAccountNumber() {
  return Math.floor(Math.random() * 9000000000 + 1000000000).toString();
}

export function generateIBAN(acc: string) {
  return `APEX${acc}${Math.floor(Math.random() * 90 + 10)}`;
}

export function generateCard() {
  const number = Array.from({length: 4}, () => Math.floor(Math.random() * 9000 + 1000).toString()).join(' ');
  const expiry = "12/28";
  const cvv = Math.floor(Math.random() * 900 + 100).toString();
  return { number, expiry, cvv };
}
