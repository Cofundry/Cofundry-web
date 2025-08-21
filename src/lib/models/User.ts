export interface User {
  _id?: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  skills: string[];
  experience: 'student' | 'junior' | 'mid-level' | 'senior' | 'expert';
  education?: {
    degree: string;
    institution: string;
    graduationYear: number;
  };
  portfolio?: string;
  github?: string;
  linkedin?: string;
  website?: string;
  location?: string;
  timezone?: string;
  availability: 'full-time' | 'part-time' | 'freelance' | 'contract';
  hourlyRate?: {
    amount: number;
    currency: string;
  };
  projects: string[]; // Project IDs
  applications: string[]; // Application IDs
  createdAt: Date;
  updatedAt: Date;
}
