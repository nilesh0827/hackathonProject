export type UserRole = "hr" | "employee";

export interface BaseUser {
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeProfileFields {
  department?: string;
  joiningDate?: string; // ISO date string
  experienceYears?: number;
  mustChangePassword?: boolean;
  location?: string;
  position?: string;
  skills?: string[];
  education?: string[];
  toolsAndTechnologies?: string[];
  industryExperience?: string[];
  certifications?: string[];
  languages?: string[];
  onboardingPlan?: {
    plan: string;
    approvedAt?: string;
    approvedBy?: string; // HR email
  };
}

export type HRUser = BaseUser & { role: "hr" };
export type EmployeeUser = BaseUser & { role: "employee" } & EmployeeProfileFields;

export type AnyUser = HRUser | EmployeeUser;

export interface ResourceDoc {
  _id?: string;
  title: string;
  description?: string;
  url: string; // public URL under /resources
  mimeType: string;
  size: number;
  createdAt: string;
  createdBy?: string; // HR email
}

export interface TutorialDoc {
  _id?: string;
  title: string;
  description?: string;
  url?: string; // optional external link
  content?: string; // rich text/markdown
  createdAt: string;
  createdBy?: string;
}


