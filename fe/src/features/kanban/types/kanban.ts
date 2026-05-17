export type JobStatusKey =
  | "SAVED"
  | "APPLIED"
  | "INTERVIEW"
  | "OFFER"
  | "REJECT";

export type JobStatusActivity = {
  id: string;
  text: string;
  changedAt: string; // ISO
};

export type JobKanbanCard = {
  id: string;

  companyName: string;
  position: string;

  jdUrl?: string;

  // Editable job fields (used by modal)
  jdText?: string;
  notes?: string;

  status: JobStatusKey;
  deadline?: string; // yyyy-mm-dd (LocalDate serialized)

  companyLogoUrl?: string;

  createdAt?: string; // ISO
  updatedAt?: string; // ISO

  matchScore?: number | null;
  missingSkills: string[];
  suggestedKeywords: string[];

  activity: JobStatusActivity[];
};

export type JobKanbanResponse = {
  cards: JobKanbanCard[];
};
