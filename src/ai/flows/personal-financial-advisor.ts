'use server';
/**
 * @fileOverview A personal financial advisor AI agent.
 *
 * - getPersonalFinancialAdvice - A function that handles generating personalized financial advice.
 * - GetPersonalFinancialAdviceInput - The input type for the getPersonalFinancialAdvice function.
 * - GetPersonalFinancialAdviceOutput - The return type for the getPersonalFinancialAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetPersonalFinancialAdviceInputSchema = z.object({
  transactionHistory: z
    .array(
      z.object({
        date: z.string().describe('The date of the transaction (e.g., YYYY-MM-DD).'),
        description: z.string().describe('A brief description of the transaction.'),
        amount: z.number().describe('The amount of the transaction. Positive for income, negative for expenses.'),
        category: z.string().describe('The category of the transaction (e.g., "Groceries", "Salary", "Rent", "Utilities").'),
      })
    )
    .describe('A list of recent financial transactions for the user.'),
  currentBalance: z.number().describe('The user\'s current account balance.'),
  financialGoals: z.string().optional().describe('Optional: User\'s specific financial goals or concerns.'),
});
export type GetPersonalFinancialAdviceInput = z.infer<typeof GetPersonalFinancialAdviceInputSchema>;

const GetPersonalFinancialAdviceOutputSchema = z.object({
  summary: z.string().describe('A brief summary of the financial analysis.'),
  budgetingTips: z.array(z.string()).describe('A list of personalized budgeting tips.'),
  savingsStrategies: z.array(z.string()).describe('A list of personalized savings strategies.'),
  actionableSteps: z.array(z.string()).describe('A list of actionable steps the user can take.'),
});
export type GetPersonalFinancialAdviceOutput = z.infer<typeof GetPersonalFinancialAdviceOutputSchema>;

export async function getPersonalFinancialAdvice(input: GetPersonalFinancialAdviceInput): Promise<GetPersonalFinancialAdviceOutput> {
  return personalFinancialAdvisorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalFinancialAdvisorPrompt',
  input: {schema: GetPersonalFinancialAdviceInputSchema},
  output: {schema: GetPersonalFinancialAdviceOutputSchema},
  prompt: `You are an experienced and empathetic personal financial advisor named Apex Advisor. Your goal is to help users make informed decisions about their money by providing personalized budgeting tips and savings strategies.

Analyze the provided transaction history and current balance to identify spending patterns, areas for potential savings, and opportunities for better financial management. Consider the user's financial goals if provided.

Present your advice in a clear, concise, and actionable manner, broken down into a summary, specific budgeting tips, savings strategies, and actionable steps.

User's Current Balance: {{{currentBalance}}}

Transaction History:
{{#each transactionHistory}}
- Date: {{{date}}}, Description: {{{description}}}, Amount: {{{amount}}}, Category: {{{category}}}
{{/each}}

{{#if financialGoals}}
User's Financial Goals/Concerns: {{{financialGoals}}}
{{/if}}

Based on this information, provide personalized financial advice in the following JSON format. Make sure the arrays are not empty if advice is applicable.
`,
});

const personalFinancialAdvisorFlow = ai.defineFlow(
  {
    name: 'personalFinancialAdvisorFlow',
    inputSchema: GetPersonalFinancialAdviceInputSchema,
    outputSchema: GetPersonalFinancialAdviceOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
