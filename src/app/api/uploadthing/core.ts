import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';

const f = createUploadthing();

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];

export const ourFileRouter = {
  resumeUploader: f({
    pdf: { maxFileSize: '4MB', maxFileCount: 1 },
    blob: { maxFileSize: '4MB', maxFileCount: 1 },
  })
    .middleware(async () => {
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        throw new UploadThingError('Only PDF, DOC, and DOCX files are allowed');
      }
      return { url: file.url, key: file.key, name: file.name };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
