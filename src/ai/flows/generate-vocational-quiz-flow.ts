
'use server';
/**
 * @fileOverview Flow to generate a vocational guidance quiz and analyze the results.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// --- Esquema para la Generación de Preguntas ---

export const VocationalQuizQuestionSchema = z.object({
  question: z.string().describe("The fun, engaging question for a 15-year-old."),
  options: z.array(z.object({
    text: z.string().describe("The playful option text."),
    trait: z.string().describe("The underlying personality trait this option represents (e.g., 'creative', 'analytical', 'social', 'organized', 'practical')."),
  })).length(4).describe('An array of exactly 4 possible answers, each with text and a corresponding trait.'),
});
export type VocationalQuizQuestion = z.infer<typeof VocationalQuizQuestionSchema>;

const GenerateVocationalQuizOutputSchema = z.object({
  questions: z.array(VocationalQuizQuestionSchema).length(10).describe('An array of exactly 10 quiz questions.'),
});
export type GenerateVocationalQuizOutput = z.infer<typeof GenerateVocationalQuizOutputSchema>;

// --- Esquema para el Análisis de Respuestas ---

export const AnalyzeAnswersInputSchema = z.object({
    answers: z.array(z.object({
        question: z.string(),
        selectedOption: z.string(),
        trait: z.string(),
    })).describe("The user's answers to the quiz questions."),
    careers: z.array(z.object({
        id: z.string(),
        name: z.string(),
    })).describe("The list of available careers at the institution."),
});
export type AnalyzeAnswersInput = z.infer<typeof AnalyzeAnswersInputSchema>;

export const AnalyzeAnswersOutputSchema = z.object({
  recommendedCareer: z.string().describe("The name of the single best-fit career."),
  reasoning: z.string().describe("A persuasive and friendly explanation of why this career is a great match, referencing the user's answers and traits. Keep it concise and encouraging."),
  closingArgument: z.string().describe("A final, compelling sentence to convince the student to enroll in the recommended career at the institution."),
});
export type AnalyzeAnswersOutput = z.infer<typeof AnalyzeAnswersOutputSchema>;


/**
 * Generates a 10-question vocational quiz.
 */
export async function generateVocationalQuiz(): Promise<GenerateVocationalQuizOutput> {
  const llmResponse = await ai.generate({
    prompt: `
        You are a cool and fun guidance counselor for a 15-year-old.
        Create a vocational quiz with exactly 10 fun, multiple-choice questions.
        The questions should be about hobbies, preferences, and personality, not academic subjects.
        For each question, provide 4 playful options. Each option must map to one of these traits: 'creative', 'analytical', 'social', 'organized', 'practical'.
        The goal is to discreetly figure out what the student enjoys.

        Example Question:
        Question: "It's Saturday, what's the plan?"
        Options:
        - { text: "🎨 Starting a new digital art piece or writing a story.", trait: "creative" }
        - { text: "🎮 Mastering the logic of a complex strategy video game.", trait: "analytical" }
        - { text: "🎉 Organizing a get-together with my friends.", trait: "social" }
        - { text: "🔧 Helping my dad fix the car or building something cool.", trait: "practical" }

        Make the questions varied and engaging. Ensure the output is a valid JSON object following the provided schema.
    `,
    model: 'googleai/gemini-2.5-flash',
    output: {
      schema: GenerateVocationalQuizOutputSchema,
    },
  });

  const output = llmResponse.output;
  if (!output?.questions || output.questions.length !== 10) {
    throw new Error("AI failed to generate exactly 10 quiz questions.");
  }
  return output;
}


/**
 * Analyzes the user's quiz answers and recommends a career.
 */
export async function analyzeQuizAnswers(input: AnalyzeAnswersInput): Promise<AnalyzeAnswersOutput> {
  const { answers, careers } = input;
  
  // Create a summary of the user's traits based on their answers.
  const traitCounts = answers.reduce((acc, answer) => {
    acc[answer.trait] = (acc[answer.trait] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const dominantTraits = Object.entries(traitCounts).sort((a, b) => b[1] - a[1]).slice(0, 2);
  const traitSummary = `The student shows dominant traits in: ${dominantTraits.map(t => t[0]).join(' and ')}.`;
  
  const llmResponse = await ai.generate({
    prompt: `
        You are an expert, friendly, and persuasive guidance counselor for a 15-year-old student who just finished a vocational quiz.
        Your task is to analyze their results and recommend the best career for them from a given list, then convince them to enroll.

        Student's Profile:
        - ${traitSummary}
        - They chose answers like: "${answers.map(a => a.selectedOption).slice(0, 3).join('", "')}"...

        Available Careers at our institution:
        - ${careers.map(c => c.name).join('\n- ')}

        Based on this, perform the following steps:
        1.  Determine the single BEST career match from the available list. Match the student's traits to the careers. For example:
            - 'analytical' and 'creative' -> Programación
            - 'organized' and 'analytical' -> Contabilidad
            - 'practical' and 'creative' -> Ofimática o Mecánica
            - 'social' and 'organized' -> Contabilidad
        2.  Write a friendly, persuasive "reasoning" explaining *why* it's a great match. Connect their quiz answers to the career. For example: "Vi que te encanta resolver puzzles en videojuegos... ¡eso es justo lo que haces en Programación, pero creando tus propias reglas!".
        3.  Write a powerful "closingArgument" to seal the deal and get them excited to enroll at our school.

        Your output MUST be a JSON object following the provided schema. Be very convincing and positive!
    `,
    model: 'googleai/gemini-2.5-flash',
    output: {
      schema: AnalyzeAnswersOutputSchema,
    },
  });

  const output = llmResponse.output;
  if (!output?.recommendedCareer) {
    throw new Error("AI failed to generate a career recommendation.");
  }
  return output;
}
