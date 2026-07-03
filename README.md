# MedConnect+ | AI-Enabled unified Healthcare Platform for all

This is a NextJS healthcare platform featuring emergency SOS, AI symptom analysis, and doctor booking.

## Adding First-Aid Videos

To enable the First-Aid Instructions feature on the Emergency page, you need to add video assets to the project:

1. Create a directory: `public/videos/`
2. Add the following MP4 files to that directory:
   - `cpr.mp4` - Step-by-step CPR guide.
   - `choking.mp4` - Heimlich maneuver instructions.
   - `bleeding.mp4` - Pressure and tourniquet techniques.
   - `burns.mp4` - Thermal burn immediate care.
   - `heart_attack.mp4` - Recognizing symptoms and immediate response.
   - `snake_bite.mp4` - Correct first aid for venomous bites.
   - `sprain.mp4` - RICE method for joints and ligaments.
   - `allergy.mp4` - Using an EpiPen and monitoring shock.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **AI**: Genkit with Google Gemini 2.5 Flash
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **UI**: Tailwind CSS + ShadCN UI
- **Icons**: Lucide React
