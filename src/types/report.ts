import { z } from "zod";

export const PatientSchema = z.object({
  name: z.string().nullable().optional().transform(val => val ?? undefined),
  mrn: z.string().nullable().optional().transform(val => val ?? undefined),
  age: z.number().nullable().optional().transform(val => val ?? undefined),
  dob: z.string().nullable().optional().transform(val => val ?? undefined),
  sex: z.string().nullable().optional().transform(val => val ?? undefined),
  history: z.string().nullable().optional().transform(val => val ?? undefined),
});

export type Patient = z.infer<typeof PatientSchema>;

export const SignatureSchema = z.object({
  name: z.string().nullable().optional().transform(val => val ?? undefined),
  date: z.string().nullable().optional().transform(val => val ?? undefined),
});

export type Signature = z.infer<typeof SignatureSchema>;

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
  signature: SignatureSchema.optional(),
});

export type JobResult = z.infer<typeof JobResultSchema>;
