export type CvUploadResponse = {
  cvId: string;
  fileUrl: string;
};

export type CvActiveResponse = {
  cvId: string | null;
  fileUrl: string | null;
  uploadedAt: string | null; // ISO string from backend
};
