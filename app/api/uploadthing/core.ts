import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  medicalReport: f({
    image: { maxFileSize: "16MB", maxFileCount: 5 },
    pdf:   { maxFileSize: "16MB", maxFileCount: 5 },
  })
    .onUploadComplete(async ({ file }) => {
      console.log("Upload complete. Secure URL:", file.url);
      return { uploadedBy: "user" };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
