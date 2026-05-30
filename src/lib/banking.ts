
'use client';

/**
 * @fileOverview Centralized banking library for Apex Ledger.
 * Provides data types and helper functions for financial operations.
 * Now primarily handles types and data generation, as persistence is managed by Firebase hooks.
 */

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
