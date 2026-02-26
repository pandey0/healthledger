import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// This endpoint name ("medicalReport") must exactly match what we call in the frontend
export const ourFileRouter = {
  medicalReport: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .onUploadComplete(async ({ metadata, file }) => {
      // This runs on your server AFTER the file safely reaches AWS
      console.log("Upload complete. Secure URL:", file.url);
      
      return { uploadedBy: "user" }; 
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;