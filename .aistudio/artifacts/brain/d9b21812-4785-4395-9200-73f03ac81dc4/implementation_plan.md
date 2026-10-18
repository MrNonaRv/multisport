# Implementation Plan: Supabase Storage Integration for Athlete Images

This plan outlines integrating Supabase Storage for athlete images (player photos and team logos) to alleviate Firestore document size constraints while keeping Firebase for the application's database.

## 1. Overview & Core Concept

- **What It Does**: Offloads athlete and team image storage from Firestore to Supabase Storage. The database (Firebase) will store the resulting public URL from Supabase, rather than the raw Base64 data.
- **Key Value**: Drastically reduces Firestore document sizes, improving performance and reliability, while maintaining image support.

## 2. User Experience & Visual Design

- **Flow**: When a user selects an image, the app will upload it to Supabase. Upon successful upload, Supabase will return a public URL. This URL is then saved into the existing Firebase player/team records.
- **Feedback**: The UI will show loading states during upload and error messages if the upload fails.

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Hybrid Architecture**
    - *Chosen Approach*: Firebase for Data/Auth, Supabase for Blob Storage.
    - *Why*: User request.
    - *Alternatives Considered*: Firebase Storage (rejected by user), Cloudinary (not requested).
- **Decision 2: Migration/Fallback**
    - *Chosen Approach*: Maintain existing Base64 handling for legacy records, switch to URL-based storage for new uploads.

## 4. Technical Architecture & Data Strategy

### Component Hierarchy
```
┌─────────────────────┐      ┌─────────────────────────┐
│  React Components   │ ───▶ │  Supabase Storage SDK   │ (Uploads)
└──────────┬──────────┘      └────────────┬────────────┘
           │                              │
           │                          (Returns URL)
           ▼                              ▼
┌─────────────────────┐      ┌─────────────────────────┐
│  DatabaseContext    │ ◀────┘    Firebase Firestore   │ (Saves URL)
└─────────────────────┘
```

### Steps:
1.  **Project Setup**: Install Supabase client.
2.  **Configuration**: Add Supabase credentials to `.env.example` and the app config.
3.  **Utility Update**: Create a new storage utility for Supabase.
4.  **UI Integration**: Update image upload handlers (`handleTeamLogoUpload`, `handlePlayerPhotoUpload`) in `Dashboard.tsx` to upload to Supabase and save the URL.
5.  **Context Update**: Update `DatabaseContext` if necessary to handle the shift from Base64 string to URL.
