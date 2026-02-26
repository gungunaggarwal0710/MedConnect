'use server';
/**
 * @fileOverview This file implements a Genkit flow for AI symptom analysis and recommendation.
 * Users can input text symptoms and/or upload a medical image (e.g., rash/wound).
 * The AI will provide a preliminary analysis, potential risks, and recommend a medical specialist.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiSymptomAnalysisInputSchema = z.object({
  symptoms: z
    .string()
    .describe('A detailed description of the user\'s symptoms.'),
  photoDataUri:
    z.string()
      .optional()
      .describe(
        "An optional photo of a medical condition (e.g., rash, wound), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
      ),
});

export type AiSymptomAnalysisInput = z.infer<
  typeof AiSymptomAnalysisInputSchema
>;

const AiSymptomAnalysisOutputSchema = z.object({
  analysis: z.string().describe('A detailed preliminary analysis of the reported symptoms and/or image.'),
  risks: z.string().describe('Potential immediate or long-term health risks associated with the condition.'),
  specialistRecommendation:
    z.string().describe('The specific type of medical specialist the user should consult (e.g., Cardiologist, Dermatologist).'),
});

export type AiSymptomAnalysisOutput = z.infer<
  typeof AiSymptomAnalysisOutputSchema
>;

/**
 * Main entry point for AI Symptom Analysis.
 */
export async function aiSymptomAnalysisAndRecommendation(
  input: AiSymptomAnalysisInput
): Promise<AiSymptomAnalysisOutput> {
  return aiSymptomAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'symptomAnalysisPrompt',
  input: { schema: AiSymptomAnalysisInputSchema },
  output: { schema: AiSymptomAnalysisOutputSchema },
  prompt: `You are MedConnect+, an expert AI medical consultant with advanced diagnostic knowledge. 
Your goal is to analyze user symptoms and medical images to provide a structured, professional preliminary assessment.

CRITICAL MEDICAL DISCLAIMER: Always begin your analysis by explicitly stating that this is an AI-generated preliminary analysis for informational purposes only and NOT a substitute for professional medical advice, diagnosis, or treatment. Emphasize that for emergencies, the user should immediately contact emergency services or go to the nearest emergency room.

INPUT DATA:
- Symptoms Description: {{{symptoms}}}
{{#if photoDataUri}}
- Visual Evidence (Medical Image): {{media url=photoDataUri}}
{{/if}}

Please analyze the provided information carefully and provide:
1. Analysis: A detailed, clear explanation of what the symptoms and/or visual evidence might indicate. Use professional yet accessible language.
2. Risks: Clearly outline any immediate concerns (red flags) and potential long-term risks if the condition is left untreated.
3. Specialist Recommendation: Recommend the specific type of medical specialist (e.g., Gastroenterologist, Orthopedic Surgeon) the user should consult for this specific set of issues.`,
});

const aiSymptomAnalysisFlow = ai.defineFlow(
  {
    name: 'aiSymptomAnalysisAndRecommendationFlow',
    inputSchema: AiSymptomAnalysisInputSchema,
    outputSchema: AiSymptomAnalysisOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (!output) {
        throw new Error('The AI was unable to generate a valid medical assessment. Please provide more detail.');
      }
      return output;
    } catch (error: any) {
      console.error('Genkit Flow Error:', error);
      throw new Error(error.message || 'An unexpected error occurred during medical analysis.');
    }
  }
);