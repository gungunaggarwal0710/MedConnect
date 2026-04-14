
'use server';
/**
 * @fileOverview This file implements a Genkit flow for AI symptom analysis using Google Gemini.
 *
 * - aiSymptomAnalysisAndRecommendation - Exported function for AI analysis.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiSymptomAnalysisInputSchema = z.object({
  symptoms: z.string().describe('A detailed description of the user\'s symptoms.'),
  photoDataUri: z.string().optional().describe("An optional photo of the condition as a data URI."),
});

export type AiSymptomAnalysisInput = z.infer<typeof AiSymptomAnalysisInputSchema>;

const AiSymptomAnalysisOutputSchema = z.object({
  analysis: z.string().describe('Detailed findings based on provided symptoms.'),
  risks: z.string().describe('Potential red flags or urgent conditions to watch for.'),
  specialistRecommendation: z.enum([
    "Internal Medicine", 
    "Cardiology", 
    "Pediatrics", 
    "Neurology", 
    "Ophthalmology", 
    "Orthopaedics", 
    "Oncology", 
    "Obstetrics & Gynaecology"
  ]).describe('The most appropriate medical specialist type from the predefined list.'),
});

export type AiSymptomAnalysisOutput = z.infer<typeof AiSymptomAnalysisOutputSchema>;

const analysisPrompt = ai.definePrompt({
  name: 'aiSymptomAnalysisPrompt',
  input: { schema: AiSymptomAnalysisInputSchema },
  output: { schema: AiSymptomAnalysisOutputSchema },
  prompt: `You are MedConnect+, an expert medical AI assistant.
  Analyze the following symptoms provided by a patient. 
  If an image is provided, incorporate visual findings into your assessment.
  
  Patient symptoms: {{symptoms}}
  {{#if photoDataUri}}Photo data: {{media url=photoDataUri}}{{/if}}
  
  Provide a detailed analysis, identify potential risks, and recommend the most appropriate medical specialist from the available list:
  ["Internal Medicine", "Cardiology", "Pediatrics", "Neurology", "Ophthalmology", "Orthopaedics", "Oncology", "Obstetrics & Gynaecology"].
  
  CRITICAL: This is a preliminary assessment, not a final diagnosis.`,
});

export async function aiSymptomAnalysisAndRecommendation(
  input: AiSymptomAnalysisInput
): Promise<AiSymptomAnalysisOutput> {
  let attempts = 5;
  let delay = 2000;
  
  while (attempts > 0) {
    try {
      const { output } = await analysisPrompt(input);
      if (!output) {
        throw new Error('The AI was unable to generate a valid medical assessment at this time.');
      }
      return output;
    } catch (error: any) {
      attempts--;
      const errorMessage = error.message || String(error);
      
      // Check if the error is a transient service error
      const isRetryable = 
        errorMessage.includes('503') || 
        errorMessage.includes('high demand') || 
        errorMessage.includes('UNAVAILABLE') ||
        errorMessage.includes('overloaded') ||
        errorMessage.includes('deadline-exceeded') ||
        errorMessage.includes('rate limit');
      
      if (isRetryable && attempts > 0) {
        // Wait with exponential backoff before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Increase delay for next attempt
        continue;
      }
      
      // If not retryable or no attempts left, throw a cleaned-up error
      if (isRetryable) {
        throw new Error('The AI service is currently experiencing high demand. Please try again in a few moments.');
      }
      throw error;
    }
  }
  throw new Error('The AI service is currently experiencing high demand. Please try again in a few moments.');
}

const aiSymptomAnalysisFlow = ai.defineFlow(
  {
    name: 'aiSymptomAnalysisAndRecommendationFlow',
    inputSchema: AiSymptomAnalysisInputSchema,
    outputSchema: AiSymptomAnalysisOutputSchema,
  },
  async (input) => {
    return aiSymptomAnalysisAndRecommendation(input);
  }
);
