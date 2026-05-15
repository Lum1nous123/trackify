export type KanbanStageKey = "SAVED" | "APPLIED" | "INTERVIEW" | "OFFER";

export type KanbanStage = {
  key: KanbanStageKey;
  label: string;
  count: number;
  tint: "indigo" | "violet" | "cyan" | "amber";
};

export type KanbanCard = {
  id: string;
  stage: KanbanStageKey;

  initials: string;
  company: string;
  title: string;
  updatedAtText: string;

  scorePercent: number;
  matchLabel: string;
  matchSubLabel: string;

  missingSkills: string[];
  suggestedKeywords: string[];

  activity: Array<{
    id: string;
    text: string;
  }>;
};

const STAGES: KanbanStage[] = [
  { key: "SAVED", label: "SAVED", count: 3, tint: "indigo" },
  { key: "APPLIED", label: "APPLIED", count: 2, tint: "violet" },
  { key: "INTERVIEW", label: "INTERVIEW", count: 2, tint: "cyan" },
  { key: "OFFER", label: "OFFER", count: 1, tint: "amber" },
];

export const mockKanban = {
  stages: STAGES,
  cards: [
    {
      id: "c1",
      stage: "INTERVIEW",
      initials: "Z",
      company: "Zalo Group",
      title: "Senior Golang",
      updatedAtText: "Oct 11, 2024 • 10:30 AM",

      scorePercent: 88,
      matchLabel: "Excellent Match",
      matchSubLabel: "You are in the top 5% of applicants",

      missingSkills: ["Kafka", "Kubernetes", "gRPC"],
      suggestedKeywords: ["Concurrency Patterns", "Microservices Architecture"],

      activity: [
        {
          id: "a1",
          text: "Interview Scheduled • Oct 11, 2024 • 10:30 AM via Zoom",
        },
        { id: "a2", text: "CV Reviewed by Recruiter • Oct 10, 2024 • 2:15 PM" },
        { id: "a3", text: "Application Updated • Oct 9, 2024 • 9:05 AM" },
      ],
    },
    {
      id: "c2",
      stage: "INTERVIEW",
      initials: "T",
      company: "Tiki",
      title: "Backend Engineer",
      updatedAtText: "Oct 09, 2024 • 3:00 PM",

      scorePercent: 74,
      matchLabel: "Strong Fit",
      matchSubLabel: "Solid alignment with required skills",

      missingSkills: ["Redis", "Kafka"],
      suggestedKeywords: ["Distributed Systems", "Event-Driven Architecture"],

      activity: [
        { id: "a1", text: "Interview Scheduled • Oct 18, 2024 • 1:00 PM" },
        { id: "a2", text: "Applied • Oct 01, 2024" },
      ],
    },
    {
      id: "c3",
      stage: "OFFER",
      initials: "S",
      company: "Shopee",
      title: "Senior Software Engineer",
      updatedAtText: "Oct 03, 2024 • 5:40 PM",

      scorePercent: 91,
      matchLabel: "Near Perfect",
      matchSubLabel: "Your profile matches the role very closely",

      missingSkills: ["Kubernetes"],
      suggestedKeywords: ["Service Mesh", "Observability"],

      activity: [
        { id: "a1", text: "Offer Received • Oct 03, 2024 • 5:40 PM" },
        { id: "a2", text: "Final Interview • Sep 27, 2024 • 4:30 PM" },
      ],
    },
    {
      id: "c4",
      stage: "APPLIED",
      initials: "M",
      company: "Meta",
      title: "Security Researcher",
      updatedAtText: "Oct 08, 2024 • 11:20 AM",

      scorePercent: 68,
      matchLabel: "Good Potential",
      matchSubLabel: "You’re on the right track",

      missingSkills: ["Threat Modeling", "gRPC"],
      suggestedKeywords: ["Security Engineering", "Systems Thinking"],

      activity: [
        { id: "a1", text: "Applied • Oct 08, 2024 • 11:20 AM" },
        { id: "a2", text: "CV Sent to Hiring Team • Oct 08, 2024" },
      ],
    },
    {
      id: "c5",
      stage: "APPLIED",
      initials: "G",
      company: "Google",
      title: "Full Stack Engineer",
      updatedAtText: "Oct 06, 2024 • 9:45 AM",

      scorePercent: 82,
      matchLabel: "Great Match",
      matchSubLabel: "Strong overlap with the job requirements",

      missingSkills: ["Kafka"],
      suggestedKeywords: ["Scalability", "Performance Tuning"],

      activity: [
        { id: "a1", text: "Applied • Oct 06, 2024 • 9:45 AM" },
        { id: "a2", text: "CV Reviewed • Oct 06, 2024 • 2:05 PM" },
      ],
    },
    {
      id: "c6",
      stage: "SAVED",
      initials: "A",
      company: "Apple",
      title: "iOS Developer",
      updatedAtText: "Oct 05, 2024 • 6:10 PM",

      scorePercent: 61,
      matchLabel: "Some Gaps",
      matchSubLabel: "Update a few areas to improve fit",

      missingSkills: ["Kubernetes", "gRPC"],
      suggestedKeywords: ["Mobile Performance", "Testing Strategy"],

      activity: [{ id: "a1", text: "Saved • Oct 05, 2024 • 6:10 PM" }],
    },
    {
      id: "c7",
      stage: "SAVED",
      initials: "N",
      company: "Netflix",
      title: "Backend Engineer",
      updatedAtText: "Oct 04, 2024 • 4:30 PM",

      scorePercent: 77,
      matchLabel: "Promising Fit",
      matchSubLabel: "Good alignment with core backend needs",

      missingSkills: ["Redis"],
      suggestedKeywords: ["Resilience Patterns", "Data Modeling"],

      activity: [{ id: "a1", text: "Saved • Oct 04, 2024 • 4:30 PM" }],
    },
    {
      id: "c8",
      stage: "SAVED",
      initials: "V",
      company: "VNG Corporation",
      title: "Senior Frontend Developer",
      updatedAtText: "Oct 02, 2024 • 1:12 PM",

      scorePercent: 79,
      matchLabel: "Good Match",
      matchSubLabel: "Solid fit with the required frontend skillset",

      missingSkills: ["Kafka"],
      suggestedKeywords: ["State Management", "Performance Optimization"],

      activity: [{ id: "a1", text: "Saved • Oct 02, 2024 • 1:12 PM" }],
    },
  ] as KanbanCard[],
};
