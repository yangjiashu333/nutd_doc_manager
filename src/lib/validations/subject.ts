import { z } from 'zod';

export const subjectFormSchema = z.object({
  title: z.string().min(1, '课题标题不能为空').max(200, '课题标题不能超过200个字符'),
  owner_id: z.string(),
  status: z.enum(['preparing', 'launched', 'finished']),
  kickoff_date: z.string().optional(),
  deadline_date: z.string().optional(),
});

export type SubjectFormData = z.infer<typeof subjectFormSchema>;
