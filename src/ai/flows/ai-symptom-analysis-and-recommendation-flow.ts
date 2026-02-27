'use server';
/**
 * @fileOverview This file implements a Genkit flow for AI symptom analysis using SambaNova.
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
  analysis: z.string().describe('Detailed findings.'),
  risks: z.string().describe('Potential red flags.'),
  specialistRecommendation: z.string().describe('Recommended specialist type.'),
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
    const systemPrompt = `You are MedConnect+, an expert medical AI.
CRITICAL: You MUST return ONLY a raw JSON object.

Structure:
{
  "analysis": "Findings here...",
  "risks": "Risks here...",
  "specialistRecommendation": "Specialist here..."
}`;

    const userPrompt = `Symptoms: ${input.symptoms} ${input.photoDataUri ? "(Image provided)" : ""}`;

    try {
      const rawResponse = await sambanovaChat(userPrompt, systemPrompt);
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : rawResponse;
      const parsed = JSON.parse(jsonStr);
      return AiSymptomAnalysisOutputSchema.parse(parsed);
    } catch (error: any) {
      console.error('SambaNova Flow Error:', error);
      throw new Error(error.message || 'AI analysis failed.');
    }
  }
);
