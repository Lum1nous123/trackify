export type CreateJobRequestBody = {
  companyName: string;
  position: string;

  jobDescriptionUrl?: string;
  jobDescriptionText?: string;

  applicationDeadline?: string; // yyyy-mm-dd
  companyLogoUrl?: string;

  personalNotes?: string;
};

export type UpdateJobRequestBody = {
  companyName?: string;
  position?: string;

  jobDescriptionUrl?: string;
  jobDescriptionText?: string;

  applicationDeadline?: string; // yyyy-mm-dd
  companyLogoUrl?: string;

  personalNotes?: string;
};

export type CreateJobResponse = {
  id: string;

  companyName: string;
  position: string;

  jdUrl?: string;
  jdText?: string;

  status: string;
  deadline?: string; // yyyy-mm-dd

  companyLogoUrl?: string;
  notes?: string;

  aiAnalysis?: {
    id: string;
    jobId: string;
    cvId: string;
    matchScore: number;

    missingSkills: string[];
    suggestedKeywords: string[];

    summary: string;
    createdAt: string; // ISO
  };
};

export type UpdateJobResponse = string; // "OK"
