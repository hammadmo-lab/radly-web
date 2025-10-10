import { z } from "zod";

export const PatientSchema = z.object({
  name: z.string().optional(),
  mrn: z.string().optional(),
  age: z.number().optional(),
  dob: z.string().optional(),
  sex: z.string().optional(),
  history: z.string().optional(),
});

export type Patient = z.infer<typeof PatientSchema>;

export const ReportSchema = z.object({
  title: z.string().optional(),
  technique: z.string().optional(),
  findings: z.string().optional(),
  impression: z.string().optional(),
  recommendations: z.string().optional(),
});

export type StrictReport = z.infer<typeof ReportSchema>;

export const JobResultSchema = z.object({
  report: ReportSchema,
  patient: PatientSchema.optional().default({}),
});

export type JobResult = z.infer<typeof JobResultSchema>;
