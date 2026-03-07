
'use server';
/**
 * @fileOverview This file implements a Genkit flow for reading and analyzing medical prescriptions.
 *
 * - readPrescription - Exported function for AI prescription analysis.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PrescriptionReaderInputSchema = z.object({
  photoDataUri: z.string().describe("A photo of a doctor's prescription as a data URI (base64)."),
});

export type PrescriptionReaderInput = z.infer<typeof PrescriptionReaderInputSchema>;

const PrescriptionReaderOutputSchema = z.object({
  patientName: z.string().optional().describe('Name of the patient if found.'),
  doctorName: z.string().optional().describe('Name of the prescribing doctor if found.'),
  date: z.string().optional().describe('Date of the prescription.'),
  medications: z.array(z.object({
    name: z.string().describe('Name of the medicine.'),
    dosage: z.string().describe('Dosage (e.g., 500mg, 1 tablet).'),
    instructions: z.string().describe('Timing or frequency (e.g., Twice a day after food).'),
  })).describe('List of medicines prescribed.'),
  diagnosis: z.string().optional().describe('Inferred or stated diagnosis/condition.'),
  additionalNotes: z.string().optional().describe('Any other warnings or notes found on the paper.'),
});

export type PrescriptionReaderOutput = z.infer<typeof PrescriptionReaderOutputSchema>;

const readerPrompt = ai.definePrompt({
  name: 'prescriptionReaderPrompt',
  input: { schema: PrescriptionReaderInputSchema },
  output: { schema: PrescriptionReaderOutputSchema },
  prompt: `You are an expert pharmacist and medical data extractor. 
  Your task is to read the provided prescription image and extract structured data.
  
  Image: {{media url=photoDataUri}}
  
  Please identify the patient name, doctor name, date, and every medication listed.
  For medications, extract the name, dosage, and instructions for use.
  If there is a diagnosis mentioned (like 'Hypertension' or 'Acute Fever'), please extract that too.
  
  CRITICAL: If the handwriting is illegible, do not guess dangerously. Mark as 'Unclear' or leave out if not sure.`,
});

export async function readPrescription(
  input: PrescriptionReaderInput
): Promise<PrescriptionReaderOutput> {
  const { output } = await readerPrompt(input);
  if (!output) {
    throw new Error('The AI was unable to read the prescription clearly. Please try a clearer photo.');
  }
  return output;
}

const prescriptionReaderFlow = ai.defineFlow(
  {
    name: 'prescriptionReaderFlow',
    inputSchema: PrescriptionReaderInputSchema,
    outputSchema: PrescriptionReaderOutputSchema,
  },
  async (input) => {
    return readPrescription(input);
  }
);
