
'use server';
/**
 * @fileOverview Flow to generate a multiple-choice quiz on a given topic.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const QuizQuestionSchema = z.object({
  question: z.string().describe('The question text.'),
  options: z.array(z.string()).length(4).describe('An array of exactly 4 possible answers.'),
  answer: z.string().describe('The correct answer, which must be one of the strings from the `options` array.'),
});

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

const GenerateQuizInputSchema = z.object({
  topic: z.string().describe('The academic topic for the quiz. Should be specific, e.g., "La célula eucariota y sus organelos".'),
  numQuestions: z.number().min(1).max(20).describe('The number of questions to generate for the quiz.'),
});

export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const GenerateQuizOutputSchema = z.object({
  questions: z.array(QuizQuestionSchema).describe('An array of quiz questions.'),
});

export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(
  input: GenerateQuizInput
): Promise<GenerateQuizOutput> {
  const result = await generateQuizFlow(input);
  return result;
}

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async (input) => {
    
    const llmResponse = await ai.generate({
      prompt: `
        You are an expert educator responsible for creating study materials.
        Your task is to generate a multiple-choice quiz based on a specific academic topic.

        Topic:
        ---
        ${input.topic}
        ---

        Please generate exactly ${input.numQuestions} unique questions.
        For each question, provide 4 distinct options and clearly identify the correct answer.
        Ensure the questions are relevant to the provided topic and suitable for a high school level.

        The output must be a JSON object that strictly follows the provided schema.
      `,
      model: 'googleai/gemini-2.5-flash',
      output: {
        schema: GenerateQuizOutputSchema,
      },
    });
    
    const output = llmResponse.output;
    if (!output?.questions || output.questions.length === 0) {
      throw new Error("La IA no pudo generar las preguntas del cuestionario.");
    }
    
    // Validate that the answer is one of the options for each question
    for (const q of output.questions) {
        if (!q.options.includes(q.answer)) {
            // Simple fallback: if the answer is invalid, pick the first option as correct.
            // A more advanced implementation could retry a single question.
            console.warn(`Invalid answer generated for question: "${q.question}". Falling back to a default.`);
            q.answer = q.options[0];
        }
    }

    return output;
  }
);
