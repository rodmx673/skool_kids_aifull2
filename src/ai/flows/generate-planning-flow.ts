
'use server';
/**
 * @fileOverview Flow to generate a didactic plan from a subject and context.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const WeeklyPlanSchema = z.object({
    week: z.number().describe("The week number."),
    topic: z.string().describe("The main topic or theme for the week."),
    learningObjectives: z.string().describe("A brief list of what students should be able to do by the end of the week."),
    teachingStrategies: z.string().describe("Detailed description of the teacher's actions, methods, and resources to be used (e.g., 'Expository lecture on topic X, followed by a group debate. Use of multimedia projector')."),
    studentActivities: z.string().describe("Specific tasks and activities for the students during the week (e.g., 'Read pages 20-25, complete exercise sheet 3, prepare for a quick quiz')."),
    evaluationMethods: z.string().describe("Proposed evaluation methods or criteria for the week's topic (e.g., 'Weekly quiz on Friday, review of class notes, participation in debate')."),
});

const GeneratePlanningInputSchema = z.object({
  subject: z.string().describe('The main subject for the plan. e.g., "Lengua y Comunicación II".'),
  weeks: z.number().describe('The number of weeks the plan should cover.'),
  instructions: z.string().optional().describe('Optional specific instructions for the AI, e.g., "Focus on practical applications.", "Include three partial evaluations."'),
  fileContent: z.string().optional().describe("Optional content from a provided document (e.g., a PDF) as a data URI ('data:mime/type;base64,...') to be used as the main source of truth."),
  existingPlan: z.array(WeeklyPlanSchema).optional().describe("An optional existing plan to be refined or modified based on new instructions.")
});

export type GeneratePlanningInput = z.infer<typeof GeneratePlanningInputSchema>;

const GeneratePlanningOutputSchema = z.object({
    plan: z.array(WeeklyPlanSchema).describe("An array of weekly plans, one for each week requested."),
});

export type GeneratePlanningOutput = z.infer<typeof GeneratePlanningOutputSchema>;

export async function generatePlanning(
  input: GeneratePlanningInput
): Promise<GeneratePlanningOutput> {
  const result = await generatePlanningFlow(input);
  return result;
}

const generatePlanningFlow = ai.defineFlow(
  {
    name: 'generatePlanningFlow',
    inputSchema: GeneratePlanningInputSchema,
    outputSchema: GeneratePlanningOutputSchema,
  },
  async (input) => {
    
    // Construct the prompt conditionally.
    const promptParts: (string | { media: { url: string } } | { text: string })[] = [];
    
    if (input.existingPlan) {
        promptParts.push(
            `You are an expert in curriculum design. You have previously generated a didactic plan. Now, your task is to refine it based on a new instruction.
            Take the following existing plan and apply this instruction: "${input.instructions || 'No specific instruction provided, review for clarity.'}"`
        );
        promptParts.push(`\n\nEXISTING PLAN:\n${JSON.stringify(input.existingPlan, null, 2)}\n\n`);
        promptParts.push("Your output MUST be the complete, modified plan in the same JSON format. Do not just output the changed part. Return the full plan with the refinement applied.");

    } else {
         promptParts.push(
            `You are an expert in curriculum design for high school education in Mexico.
            Your task is to create a detailed, week-by-week didactic plan for the subject: "${input.subject}".
            The plan must cover exactly ${input.weeks} weeks.`
        );

        if (input.fileContent) {
            promptParts.push({ text: `Use the following official document as the primary source of truth for creating the curriculum. Extract progressions, learning goals, and topics from it:` });
            promptParts.push({ media: { url: input.fileContent } });
        } else {
            promptParts.push({ text: "You have not been provided with a specific document. Use your general knowledge for the subject to create a comprehensive and logical plan." });
        }
        
        promptParts.push({ text: `
            Follow these specific instructions if provided:
            ---
            ADDITIONAL INSTRUCTIONS:
            ${input.instructions || "No additional instructions."}
            ---

            For each week, you must provide a professional and complete plan with the following structure:
            1.  'topic': A clear and concise main topic for the week.
            2.  'learningObjectives': A brief list of what students should be able to do by the end of the week.
            3.  'teachingStrategies': Detailed description of the teacher's actions, methods, and resources (e.g., 'Expository lecture, group debate, use of multimedia').
            4.  'studentActivities': Specific tasks for the students (e.g., 'Read pages, complete exercises, prepare presentation').
            5.  'evaluationMethods': Proposed evaluation methods for the week (e.g., 'Weekly quiz, project submission, class participation').

            Your output MUST be a JSON object containing a 'plan' array, where each element is an object with 'week', 'topic', 'learningObjectives', 'teachingStrategies', 'studentActivities', and 'evaluationMethods' keys.
        `});
    }


    const llmResponse = await ai.generate({
        prompt: promptParts,
        model: 'googleai/gemini-2.5-flash',
        output: {
            schema: GeneratePlanningOutputSchema,
        }
    });

    const output = llmResponse.output;
    if (!output?.plan) {
        throw new Error("The AI did not generate a valid plan.");
    }
    
    // Ensure the plan has the correct number of weeks, truncate or pad if necessary.
    if (output.plan.length > input.weeks) {
        output.plan = output.plan.slice(0, input.weeks);
    } else if (output.plan.length < input.weeks) {
        const existingWeeks = output.plan.length;
        for (let i = existingWeeks + 1; i <= input.weeks; i++) {
            output.plan.push({
                week: i,
                topic: `Contenido pendiente para la semana ${i}`,
                learningObjectives: 'Objetivos por definir.',
                teachingStrategies: 'Estrategias por definir.',
                studentActivities: 'Actividades por definir.',
                evaluationMethods: 'Evaluación por definir.'
            });
        }
    }

    return output;
  }
);
