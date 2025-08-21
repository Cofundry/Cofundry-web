export interface Project {
  _id?: string;
  title: string;
  description: string;
  requirements?: string;
  teamSize?: number;
  techStack?: string[];
  tags?: string[];
  deadline?: Date | string;
  budget?: {
    min: number;
    max: number;
    currency: string;
  };
  location?: string; // e.g., 'remote' | 'onsite' | 'hybrid' or city names like 'Casablanca'
  category?: string; // flexible strings: 'Software', 'Mobile', 'Web Design', etc.
  difficulty?: string; // flexible strings: 'beginner' | 'intermediate' | 'advanced' | 'Beginner' etc.
  authorId?: string;
  authorName?: string;
  authorEmail?: string;
  authorAvatar?: string;
  status?: 'open' | 'in-progress' | 'completed' | 'cancelled' | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  tagsLegacy?: string[]; // keep a legacy field if needed for compatibility
  attachments?: string[];
  contactInfo?: {
    email?: string;
    phone?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface ProjectApplication {
  _id?: string;
  projectId: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  coverLetter: string;
  portfolio?: string;
  github?: string;
  linkedin?: string;
  experience: string;
  availability: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ProjectComment {
  _id?: string;
  projectId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}
