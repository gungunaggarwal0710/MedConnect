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
  prompt: `You are MedConnect+, an AI medical assistant. Your task is to provide a preliminary analysis of a user's symptoms and/or medical image, assess potential risks, and recommend the most appropriate medical specialist.

Always preface your response by stating that this is a preliminary AI analysis and not a substitute for professional medical advice. Emphasize that the user should consult a qualified healthcare professional for an accurate diagnosis and treatment plan.

User's Symptoms: {{{symptoms}}}

{{#if photoDataUri}}User Provided Image: {{media url=photoDataUri}}{{/if}}

Please provide your analysis in the following structured format:

Analysis: <preliminary analysis of symptoms and/or image>
Risks: <potential health risks>
Specialist Recommendation: <recommended medical specialist (e.g., General Practitioner, Dermatologist, Cardiologist)>
`,
});

const aiSymptomAnalysisFlow = ai.defineFlow(
  {
    name: 'aiSymptomAnalysisAndRecommendationFlow',
    inputSchema: AiSymptomAnalysisInputSchema,
    outputSchema: AiSymptomAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI did not provide an output.');
    }
    return output;
  }
);
