'use server';
/**
 * @fileOverview This file implements a Genkit flow for AI symptom analysis and recommendation.
 * Migrated to use SambaNova Cloud API for high-accuracy Llama 3.1 405B analysis.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { sambanovaChat } from '@/ai/sambanova';

const AiSymptomAnalysisInputSchema = z.object({
  symptoms: z
    .string()
    .describe('A detailed description of the user\'s symptoms.'),
  photoDataUri:
    z.string()
      .optional()
      .describe(
        "An optional photo of a medical condition (e.g., rash, wound), as a data URI."
      ),
});

export type AiSymptomAnalysisInput = z.infer<
  typeof AiSymptomAnalysisInputSchema
>;

const AiSymptomAnalysisOutputSchema = z.object({
  analysis: z.string().describe('A detailed preliminary analysis.'),
  risks: z.string().describe('Potential health risks.'),
  specialistRecommendation:
    z.string().describe('The specific type of medical specialist recommended.'),
});

export type AiSymptomAnalysisOutput = z.infer<
  typeof AiSymptomAnalysisOutputSchema
>;

/**
 * Main entry point for AI Symptom Analysis using SambaNova.
 */
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
    const systemPrompt = `You are MedConnect+, an expert AI medical consultant. 
Analyze the user's symptoms and provide a structured preliminary assessment.

CRITICAL MEDICAL DISCLAIMER: Always state that this is an AI-generated preliminary analysis and NOT a substitute for professional medical advice.

RESPONSE FORMAT: You MUST return ONLY a JSON object with this exact structure:
{
  "analysis": "A detailed explanation of findings.",
  "risks": "Potential red flags and concerns.",
  "specialistRecommendation": "The type of specialist to consult (e.g., Cardiologist)."
}`;

    const userPrompt = `Symptoms Description: ${input.symptoms}
${input.photoDataUri ? "Note: A medical image was provided with this request." : ""}`;

    try {
      const rawResponse = await sambanovaChat(userPrompt, systemPrompt);
      
      // Clean potential markdown formatting from LLM
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : rawResponse;
      const parsed = JSON.parse(jsonStr);
      
      return AiSymptomAnalysisOutputSchema.parse(parsed);
    } catch (error: any) {
      console.error('SambaNova Flow Error:', error);
      // Surface more specific errors if it's a configuration issue
      if (error.message?.includes('SAMBANOVA_API_KEY')) {
        throw new Error('SambaNova API Key is missing. Please check your environment variables.');
      }
      throw new Error(error.message || 'The AI was unable to generate a valid medical assessment at this time.');
    }
  }
);
