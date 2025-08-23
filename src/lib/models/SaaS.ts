export interface SaaS {
  _id?: string;
  name: string;
  description: string;
  url: string;
  logo: string;
  features: string[];
  category: string;
  tags: string[];
  authorId: string;
  authorName: string;
  authorEmail: string;
  authorAvatar: string;
  status: 'pending' | 'approved' | 'rejected';
  votes: number;
  todayVotes: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  approvedAt?: Date | string;
}

export interface SaaSVote {
  _id?: string;
  saasId: string;
  userId: string;
  userName: string;
  userEmail: string;
  createdAt: Date | string;
}

export interface SaaSComment {
  _id?: string;
  saasId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface SaaSSubmission {
  name: string;
  description: string;
  url: string;
  logo: string;
  features: string[];
  category: string;
  tags: string[];
}
