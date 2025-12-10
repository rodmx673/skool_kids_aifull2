'use server';
/**
 * @fileOverview Flow to rewrite a document body using AI.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const RewriteDocumentInputSchema = z.object({
  documentBody: z.string().describe('The body of the document to be rewritten.'),
});

export type RewriteDocumentInput = z.infer<typeof RewriteDocumentInputSchema>;

const RewriteDocumentOutputSchema = z.string();

export async function rewriteDocument(
  input: RewriteDocumentInput
): Promise<string> {
  const result = await rewriteDocumentFlow(input);
  return result;
}

const rewriteDocumentFlow = ai.defineFlow(
  {
    name: 'rewriteDocumentFlow',
    inputSchema: RewriteDocumentInputSchema,
    outputSchema: RewriteDocumentOutputSchema,
  },
  async (input) => {
    const llmResponse = await ai.generate({
      prompt: `
        You are an expert administrative assistant specializing in formal document drafting.
        Your task is to rewrite the following document body to be more professional, clear, and concise.
        Correct any grammatical errors, improve sentence structure, and ensure a formal tone suitable for an official letter.
        Only return the rewritten text of the document body, without any additional comments or introductions.

        Original Text:
        ---
        ${input.documentBody}
        ---
      `,
      model: 'googleai/gemini-2.5-flash',
      output: {
        format: 'text',
      },
    });

    return llmResponse.text;
  }
);
