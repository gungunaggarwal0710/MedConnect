
'use server';
/**
 * @fileOverview This file implements a Genkit flow for AI symptom analysis using SambaNova Cloud.
 *
 * - aiSymptomAnalysisAndRecommendation - Exported function for AI analysis.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { sambanovaChat } from '@/ai/sambanova';

const AiSymptomAnalysisInputSchema = z.object({
  symptoms: z.string().describe('A detailed description of the user\'s symptoms.'),
  photoDataUri: z.string().optional().describe("An optional photo as a data URI."),
});

export type AiSymptomAnalysisInput = z.infer<typeof AiSymptomAnalysisInputSchema>;

const AiSymptomAnalysisOutputSchema = z.object({
  analysis: z.string().describe('Detailed findings based on provided symptoms.'),
  risks: z.string().describe('Potential red flags or urgent conditions to watch for.'),
  specialistRecommendation: z.string().describe('Recommended specialist type (e.g. Cardiologist, Neurologist).'),
});

export type AiSymptomAnalysisOutput = z.infer<typeof AiSymptomAnalysisOutputSchema>;

export async function aiSymptomAnalysisAndRecommendation(
  input: AiSymptomAnalysisInput
): Promise<AiSymptomAnalysisOutput> {
  return aiSymptomAnalysisFlow(input);
}

const aiSymptomAnalysisFlow = ai.defineFlow(
  {
    name: 'aiSymptomAnalysisAndRecommendationFlow',
    inputSchema: AiSymptomAnalysisInputSchema,
    outputSchema: AiSymptomAnalysisOutputSchema,
  },
  async (input) => {
    const systemPrompt = `You are MedConnect+, an expert medical AI specializing in symptom analysis.
Your goal is to provide a preliminary assessment based on user input.
CRITICAL: You MUST return ONLY a raw JSON object with exactly these fields: "analysis", "risks", "specialistRecommendation".
Do not include any Markdown formatting like \`\`\`json.

Structure:
{
  "analysis": "Findings here...",
  "risks": "Risks here...",
  "specialistRecommendation": "Specialist here..."
}`;

    const userPrompt = `Patient symptoms: ${input.symptoms} ${input.photoDataUri ? "(Image attached)" : ""}`;

    try {
      const imageBase64 = input.photoDataUri?.split(',')[1];
      const rawResponse = await sambanovaChat(userPrompt, systemPrompt, imageBase64);
      
      // Attempt to find and parse JSON in the response
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : rawResponse;
      const parsed = JSON.parse(jsonStr);
      
      return AiSymptomAnalysisOutputSchema.parse(parsed);
    } catch (error: any) {
      console.error('SambaNova Analysis Error:', error);
      // Surface more context if possible while keeping it user-friendly
      const message = error.message?.includes('401') 
        ? 'Authentication error. Please check the AI provider settings.' 
        : 'An unexpected response was received from the server. Please check your symptom description and try again.';
      throw new Error(message);
    }
  }
);
