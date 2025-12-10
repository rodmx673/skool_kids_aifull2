
'use server';
/**
 * @fileOverview Flow to generate a presentation slide image from a topic.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GeneratePresentationInputSchema = z.object({
  topic: z.string().describe('The main topic for the presentation slide. e.g., "The Water Cycle", "Newton\'s Laws of Motion".'),
  audience: z.string().describe('The target audience for the presentation. e.g., "High School Students", "University Students", "General Public".'),
  instructions: z.string().optional().describe('Optional specific instructions for the AI, e.g., "Focus on the practical applications.", "Include a fun fact."'),
});

export type GeneratePresentationInput = z.infer<typeof GeneratePresentationInputSchema>;

const GeneratePresentationOutputSchema = z.object({
    imageUrl: z.string().describe("The generated presentation slide as a data URI."),
    imageGenerationPrompt: z.string().describe("The prompt used by the model to generate the background image."),
});

export type GeneratePresentationOutput = z.infer<typeof GeneratePresentationOutputSchema>;

export async function generatePresentation(
  input: GeneratePresentationInput
): Promise<GeneratePresentationOutput> {
  const result = await generatePresentationFlow(input);
  return result;
}

const generatePresentationFlow = ai.defineFlow(
  {
    name: 'generatePresentationFlow',
    inputSchema: GeneratePresentationInputSchema,
    outputSchema: GeneratePresentationOutputSchema,
  },
  async (input) => {
    
    // Primero, pedimos a un LLM que estructure el contenido y sugiera un prompt de imagen.
    const contentStructure = await ai.generate({
        prompt: `
            Based on the topic "${input.topic}" for an audience of "${input.audience}", generate the content for a single, educational presentation slide.
            Also, create a simple, effective prompt for an image generation model to create a relevant and visually appealing background. The image should be artistic and thematic, not a complex diagram.
            ${input.instructions ? `Follow these specific instructions: ${input.instructions}`: ''}

            Your output MUST be a JSON object with the following structure:
            {
              "slideTitle": "A clear, concise title for the slide.",
              "bulletPoints": [
                "A key point or concept, summarized in a short phrase.",
                "Another key point.",
                "A third key point, if necessary (max 5 points)."
              ],
              "summary": "A one-sentence summary or concluding thought.",
              "imageGenerationPrompt": "A short, descriptive prompt for a background image (e.g., 'abstract geometric patterns', 'ancient greek philosophy scroll', 'dynamic flowing water molecules')."
            }
        `,
        model: 'googleai/gemini-2.5-flash',
        output: {
            format: 'json',
            schema: z.object({
                slideTitle: z.string(),
                bulletPoints: z.array(z.string()),
                summary: z.string(),
                imageGenerationPrompt: z.string(),
            })
        }
    });
    
    const structuredContent = contentStructure.output;
    if (!structuredContent) {
        throw new Error('Failed to structure content for the slide.');
    }
    
    // Construimos la lista de puntos para el prompt de la imagen
    const pointsList = structuredContent.bulletPoints.map(point => `- ${point}`).join('\n        ');

    // Ahora, usamos el modelo de imagen para generar la diapositiva final
    const { media } = await ai.generate({
        model: 'googleai/gemini-2.5-flash-image-preview',
        prompt: `
            Generate an artistic, abstract, and professional background image suitable for an educational presentation slide, based on the theme: '${structuredContent.imageGenerationPrompt}'.
            
            After creating the image, overlay the following text in a clear, modern, and highly-readable sans-serif font. The layout must be clean, professional, and well-balanced, like a modern presentation slide.

            Text to overlay:
            - Slide Title (very large, top-center): "${structuredContent.slideTitle}"
            - Bullet Points (medium, left-aligned below title):
            ${pointsList}
            - Summary (small, bottom-center): "${structuredContent.summary}"

            The final output must be a single, complete image with the text perfectly integrated. Ensure high contrast between the text and the background for readability.
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

    return { 
        imageUrl: media.url,
        imageGenerationPrompt: structuredContent.imageGenerationPrompt,
    };
  }
);
