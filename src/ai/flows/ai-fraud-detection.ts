'use server';
/**
 * @fileOverview A Genkit flow for detecting suspicious transactions and providing an explanation.
 *
 * - detectFraud - A function that handles the AI fraud detection process.
 * - AiFraudDetectionInput - The input type for the detectFraud function.
 * - AiFraudDetectionOutput - The return type for the detectFraud function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiFraudDetectionInputSchema = z.object({
  transactionId: z.string().describe('Unique identifier for the transaction.'),
  userId: z.string().describe('The ID of the user performing the transaction.'),
  amount: z.number().describe('The transaction amount.'),
  currency: z.string().describe('The currency of the transaction (e.g., USD, EUR).'),
  description: z.string().describe('A brief description of the transaction (e.g., "Online purchase", "ATM withdrawal").'),
  merchantName: z.string().optional().describe('The name of the merchant involved in the transaction, if applicable.'),
  location: z.string().describe('The city and country where the transaction occurred.'),
  timestamp: z.string().describe('The timestamp of the transaction in ISO 8601 format.'),
  userRecentLocations: z.array(z.string()).describe('A list of recent locations where the user has made transactions, for context.'),
});
export type AiFraudDetectionInput = z.infer<typeof AiFraudDetectionInputSchema>;

const AiFraudDetectionOutputSchema = z.object({
  isSuspicious: z.boolean().describe('True if the transaction is flagged as suspicious, false otherwise.'),
  explanation: z.string().describe('A clear explanation for why the transaction is considered suspicious or not.'),
  riskScore: z.number().min(0).max(100).describe('A numerical score indicating the risk level of the transaction (0-100, higher is riskier).'),
});
export type AiFraudDetectionOutput = z.infer<typeof AiFraudDetectionOutputSchema>;

export async function detectFraud(input: AiFraudDetectionInput): Promise<AiFraudDetectionOutput> {
  return aiFraudDetectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiFraudDetectionPrompt',
  input: {schema: AiFraudDetectionInputSchema},
  output: {schema: AiFraudDetectionOutputSchema},
  prompt: `You are an advanced AI fraud detection system for a bank. Your task is to analyze transaction details and determine if a transaction is suspicious.

Consider the following transaction details:
Transaction ID: {{{transactionId}}}
User ID: {{{userId}}}
Amount: {{{amount}}} {{{currency}}}
Description: {{{description}}}
{{#if merchantName}}Merchant: {{{merchantName}}}{{/if}}
Location: {{{location}}}
Timestamp: {{{timestamp}}}

Recent transaction locations for this user: {{{userRecentLocations}}}

Analyze the transaction considering typical fraud patterns, inconsistencies with the user's recent activity (e.g., sudden change in location, unusually high amount for their typical spending, unusual merchant), and provide a determination:

1.  **isSuspicious**: True if suspicious, false otherwise.
2.  **explanation**: A concise and clear explanation for your determination. If suspicious, detail why. If not suspicious, briefly state why it appears legitimate.
3.  **riskScore**: A score from 0 (very low risk) to 100 (very high risk) indicating the likelihood of fraud.
`,
});

const aiFraudDetectionFlow = ai.defineFlow(
  {
    name: 'aiFraudDetectionFlow',
    inputSchema: AiFraudDetectionInputSchema,
    outputSchema: AiFraudDetectionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
