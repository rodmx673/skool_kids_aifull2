
'use server';
/**
 * @fileOverview Flow to analyze a student's academic and behavioral data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const StudentAnalysisInputSchema = z.object({
  studentName: z.string().describe("The student's name."),
  grades: z.array(z.object({
      subject: z.string(),
      grade: z.number(),
  })).describe("List of grades for different subjects."),
  attendance: z.object({
      total: z.number(),
      present: z.number(),
      absent: z.number(),
      late: z.number(),
  }).describe("Attendance statistics."),
  conduct: z.array(z.object({
      type: z.string(),
      report: z.string(),
  })).describe("List of behavioral reports."),
});

export type StudentAnalysisInput = z.infer<typeof StudentAnalysisInputSchema>;

const StudentAnalysisOutputSchema = z.object({
  overallAssessment: z.string().describe("A brief, overall summary (2-3 sentences) of the student's current academic and behavioral standing."),
  strengths: z.array(z.string()).describe("A list of key strengths identified from the data (e.g., 'Excellent performance in Mathematics', 'Good attendance record')."),
  areasForImprovement: z.array(z.string()).describe("A list of specific areas where the student could improve (e.g., 'Low grades in History', 'Frequent tardiness')."),
  actionableRecommendations: z.array(z.object({
      recommendation: z.string().describe("A concrete, actionable recommendation for the parent or student."),
      reason: z.string().describe("The reason behind the recommendation, linked to specific data points."),
  })).describe("A list of suggested actions to help the student."),
});

export type StudentAnalysisOutput = z.infer<typeof StudentAnalysisOutputSchema>;

export async function generateStudentAnalysis(
  input: StudentAnalysisInput
): Promise<StudentAnalysisOutput> {
  const result = await generateStudentAnalysisFlow(input);
  return result;
}

const generateStudentAnalysisFlow = ai.defineFlow(
  {
    name: 'generateStudentAnalysisFlow',
    inputSchema: StudentAnalysisInputSchema,
    outputSchema: StudentAnalysisOutputSchema,
  },
  async (input) => {
    
    const prompt = `
        You are "REACTIVO", an expert academic advisor AI. Your task is to analyze the provided data for a student named ${input.studentName} and create a concise, helpful report for their parent.

        DATA:
        - Grades: ${JSON.stringify(input.grades)}
        - Attendance: ${JSON.stringify(input.attendance)}
        - Conduct Reports: ${JSON.stringify(input.conduct)}

        Based on this data, generate a structured analysis. Your output MUST be a JSON object with the following fields:

        1.  "overallAssessment": A brief, overall summary (2-3 sentences) of the student's current academic and behavioral standing.
        2.  "strengths": An array of key strengths identified from the data (e.g., "Excellent performance in Mathematics", "Good attendance record").
        3.  "areasForImprovement": An array of specific areas where the student could improve (e.g., "Low grades in History", "Frequent tardiness").
        4.  "actionableRecommendations": An array of objects, where each object has a "recommendation" (a concrete, actionable step) and a "reason" (linking the recommendation to data).

        Be objective, constructive, and base all your points directly on the data provided.
    `;

    const llmResponse = await ai.generate({
      prompt: prompt,
      model: 'googleai/gemini-2.5-flash',
      output: {
        schema: StudentAnalysisOutputSchema,
      },
    });

    const output = llmResponse.output;
    if (!output) {
        throw new Error("The AI failed to generate a valid analysis.");
    }
    
    return output;
  }
);
