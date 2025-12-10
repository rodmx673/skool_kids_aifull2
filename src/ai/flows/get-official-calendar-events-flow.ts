
'use server';
/**
 * @fileOverview Flow to get official calendar events from the Mexican Secretariat of Public Education (SEP).
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { format } from 'date-fns';

const OfficialEventSchema = z.object({
  id: z.string().describe("A unique identifier for the event, e.g., 'sep-inicio-ciclo'."),
  title: z.string().describe("The title of the event, e.g., 'Inicio de Ciclo Escolar'."),
  date: z.string().describe("The date of the event in YYYY-MM-DD format."),
  isOfficial: z.literal(true).describe("Indicates that this is an official event."),
  description: z.string().describe("A brief description of the event."),
});

const GetOfficialCalendarEventsOutputSchema = z.object({
    events: z.array(OfficialEventSchema).describe("A list of official calendar events."),
});

export type OfficialEvent = z.infer<typeof OfficialEventSchema>;
export type GetOfficialCalendarEventsOutput = z.infer<typeof GetOfficialCalendarEventsOutputSchema>;


export async function getOfficialCalendarEvents(): Promise<GetOfficialCalendarEventsOutput> {
  const result = await getOfficialCalendarEventsFlow();
  return result;
}

const getOfficialCalendarEventsFlow = ai.defineFlow(
  {
    name: 'getOfficialCalendarEventsFlow',
    outputSchema: GetOfficialCalendarEventsOutputSchema,
  },
  async () => {
    const currentDate = format(new Date(), 'yyyy-MM-dd');
    const llmResponse = await ai.generate({
      prompt: `
        You are an expert research assistant. Your task is to find the official school calendar from the Mexican Secretariat of Public Education (Secretaría de Educación Pública - SEP) for the most recent school year relative to the current date, which is ${currentDate}.

        Please perform the following actions:
        1. Search for the official SEP calendar for the current or upcoming school cycle (e.g., 2024-2025, 2025-2026).
        2. Extract the key dates, including:
           - Start of the school year.
           - End of the school year.
           - Winter vacation period (start and end).
           - Holy Week (Semana Santa) vacation period (start and end).
           - Official holidays (suspensión de labores docentes), such as Independence Day, Revolution Day, etc.
           - School Council meetings (Consejo Técnico Escolar).
        3. Format these dates into a structured JSON object according to the provided schema. Ensure all dates are in YYYY-MM-DD format. The 'isOfficial' flag must always be true. The 'id' should be a unique, descriptive, kebab-case string (e.g., 'sep-dia-independencia').

        Only return the final JSON object. Do not include any introductory text, comments, or explanations.
      `,
      model: 'googleai/gemini-2.5-flash',
      output: {
        schema: GetOfficialCalendarEventsOutputSchema,
      }
    });

    return llmResponse.output!;
  }
);
