'use server';
/**
 * @fileOverview Flow to transcribe and analyze an audio recording.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TranscribeAudioInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "An audio recording, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type TranscribeAudioInput = z.infer<typeof TranscribeAudioInputSchema>;

const TranscribeAudioOutputSchema = z.object({
  transcription: z.string().describe('The full transcription of the audio.'),
  analysis: z.string().describe('A summary and analysis of the key points, decisions, and action items from the transcription.'),
});

export type TranscribeAudioOutput = z.infer<typeof TranscribeAudioOutputSchema>;


export async function transcribeAndAnalyzeAudio(
  input: TranscribeAudioInput
): Promise<TranscribeAudioOutput> {
  const result = await transcribeAudioFlow(input);
  return result;
}

const transcribeAudioFlow = ai.defineFlow(
  {
    name: 'transcribeAudioFlow',
    inputSchema: TranscribeAudioInputSchema,
    outputSchema: TranscribeAudioOutputSchema,
  },
  async (input) => {
    
    const llmResponse = await ai.generate({
      prompt: `
        You are a highly skilled administrative assistant who specializes in creating meeting minutes.
        Your task is to perform two actions based on the provided audio:
        1.  Transcribe the entire audio recording verbatim.
        2.  Analyze the transcription to create a concise summary. This summary should include key discussion points, decisions made, and any action items assigned.

        Audio to process:
        ---
        {{media url=audioDataUri}}
        ---
      `,
      model: 'googleai/gemini-2.5-flash',
      output: {
        schema: TranscribeAudioOutputSchema,
      }
    });

    return llmResponse.output!;
  }
);
