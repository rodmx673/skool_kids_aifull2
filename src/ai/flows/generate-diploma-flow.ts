
'use server';
/**
 * @fileOverview Flow to generate a custom diploma image.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateDiplomaInputSchema = z.object({
  recipientName: z.string().describe('The name of the person receiving the diploma.'),
  achievement: z.string().describe('The reason for the diploma (e.g., "For Academic Excellence").'),
  imagePrompt: z.string().describe('A short prompt for the AI to generate a background image, e.g., "abstract trophy", "glowing brain".'),
});

export type GenerateDiplomaInput = z.infer<typeof GenerateDiplomaInputSchema>;

const GenerateDiplomaOutputSchema = z.object({
    imageUrl: z.string().describe("The generated diploma image as a data URI."),
});

export type GenerateDiplomaOutput = z.infer<typeof GenerateDiplomaOutputSchema>;

export async function generateDiploma(
  input: GenerateDiplomaInput
): Promise<GenerateDiplomaOutput> {
  const result = await generateDiplomaFlow(input);
  return result;
}

const generateDiplomaFlow = ai.defineFlow(
  {
    name: 'generateDiplomaFlow',
    inputSchema: GenerateDiplomaInputSchema,
    outputSchema: GenerateDiplomaOutputSchema,
  },
  async (input) => {
    const { media, text } = await ai.generate({
        model: 'googleai/gemini-2.5-flash-image-preview',
        prompt: `Generate an artistic, abstract, and elegant background image suitable for a diploma, based on the theme: '${input.imagePrompt}'. The image should be visually appealing but not distracting. After creating the image, overlay the following text in a very elegant, professional, and formal serif font. Ensure the layout is balanced and prestigious.

        Text to overlay:
        - Line 1 (large, centered): "CERTIFICATE OF ACHIEVEMENT"
        - Line 2 (medium, centered): "This certificate is proudly presented to"
        - Line 3 (very large, script font, centered): "${input.recipientName}"
        - Line 4 (medium, centered): "${input.achievement}"
        - Line 5 (small, bottom-left): "Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}"
        - Line 6 (small, bottom-right): "Skool Kits AI"
        
        The final output should be a single, complete image with the text beautifully integrated.
        `,
        config: {
            responseModalities: ['IMAGE'],
            safetySettings: [
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            ]
        },
    });

    if (!media?.url) {
        throw new Error('Image generation failed or returned no media.');
    }

    return { imageUrl: media.url };
  }
);
