'use server';
/**
 * @fileOverview This file implements a Genkit flow for AI symptom analysis and recommendation.
 * Users can input text symptoms and/or upload a medical image (e.g., rash/wound).
 * The AI will provide a preliminary analysis, potential risks, and recommend a medical specialist.
 *
 * - aiSymptomAnalysisAndRecommendation - The main function to call the AI symptom analysis flow.
 * - AiSymptomAnalysisInput - The input type for the aiSymptomAnalysisAndRecommendation function.
 * - AiSymptomAnalysisOutput - The return type for the aiSymptomAnalysisAndRecommendation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const maxDuration = 60; // Increase server action timeout to 60 seconds

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
  analysis: z.string().describe('A preliminary analysis of the reported symptoms and/or image.'),
  risks: z.string().describe('Potential health risks associated with the condition.'),
  specialistRecommendation:
    z.string().describe('Recommendation for an appropriate medical specialist to consult.'),
});
export type AiSymptomAnalysisOutput = z.infer<
  typeof AiSymptomAnalysisOutputSchema
>;

export async function aiSymptomAnalysisAndRecommendation(
  input: AiSymptomAnalysisInput
): Promise<AiSymptomAnalysisOutput> {
  return aiSymptomAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'symptomAnalysisPrompt',
  input: { schema: AiSymptomAnalysisInputSchema },
  output: { schema: AiSymptomAnalysisOutputSchema },
  prompt: `You are MedConnect+, an expert AI medical consultant. Your goal is to analyze user symptoms and medical images to provide a structured preliminary assessment.

CRITICAL: Always start by stating that this is an AI analysis and not professional medical advice. If you cannot determine anything clearly, provide general health guidance and emphasize seeing a doctor.

User Symptoms: {{{symptoms}}}

{{#if photoDataUri}}
Visual Evidence: {{media url=photoDataUri}}
{{/if}}

Please analyze the input and provide:
1. Analysis: A detailed explanation of what the symptoms/images might indicate.
2. Risks: Any immediate or long-term health concerns.
3. Specialist Recommendation: The exact type of doctor the user should see.`,
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
        throw new Error('The AI was unable to generate a valid medical assessment.');
      }
      return output;
    } catch (error: any) {
      console.error("Genkit Flow Error:", error);
      throw new Error(error.message || 'An error occurred during AI analysis.');
    }
  }
);
