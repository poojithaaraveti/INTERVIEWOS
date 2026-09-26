import { z } from "zod";

export const ResumeSkillSchema = z.object({
  name: z.string().describe("Standardized technology or skill name (e.g., 'React', 'PostgreSQL')"),
  category: z.enum([
    "frontend",
    "backend",
    "database",
    "devops",
    "ai_ml",
    "architecture",
    "soft_skill",
    "other",
  ]),
  importance: z.enum(["low", "medium", "high", "critical"]),
  claimedLevel: z.enum(["awareness", "foundational", "proficient", "advanced", "expert"]),
  verifiedLevel: z.number().nullable().default(null),
  coverage: z.boolean().default(false),
  coverageStatus: z.enum(["NOT_VERIFIED", "PARTIALLY_VERIFIED", "VERIFIED", "CONTRADICTED"]).default("NOT_VERIFIED"),
  evidenceQuotes: z.array(z.string()).default([]),
});

export const ResumeProjectSchema = z.object({
  title: z.string(),
  role: z.string().optional().default("Contributor"),
  claimedTechnologies: z.array(z.string()),
  keyAchievements: z.array(z.string()),
  technicalClaims: z.array(z.string()).describe("Specific architectural or quantitative claims made"),
  coverage: z.boolean().default(false),
});

export const ResumeExperienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  duration: z.string().optional(),
  responsibilities: z.array(z.string()),
  claimedOutcomes: z.array(z.string()),
});

export const ResumeCertificationSchema = z.object({
  name: z.string(),
  issuer: z.string().optional(),
  year: z.string().optional(),
  coverage: z.boolean().default(false),
});

export const ResumeKnowledgeMapSchema = z.object({
  candidateName: z.string().default("Candidate"),
  headline: z.string().optional(),
  yearsOfExperience: z.number().nullable().default(null),
  skills: z.array(ResumeSkillSchema),
  projects: z.array(ResumeProjectSchema).default([]),
  experience: z.array(ResumeExperienceSchema).default([]),
  certifications: z.array(ResumeCertificationSchema).default([]),
  prioritizedInvestigationOrder: z
    .array(z.string())
    .describe("Ordered list of top 3-5 critical technical skills/claims to verify first"),
});

export type ResumeKnowledgeMapData = z.infer<typeof ResumeKnowledgeMapSchema>;
