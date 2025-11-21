/**
 * Shared types for Projects plugin
 * Used by both client and server
 */

export interface Project {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDTO {
  name: string;
  description: string;
  status?: 'active' | 'completed' | 'archived';
}

export interface UpdateProjectDTO {
  name?: string;
  description?: string;
  status?: 'active' | 'completed' | 'archived';
}

export interface ProjectsAPI {
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | null>;
  createProject(data: CreateProjectDTO): Promise<Project>;
  updateProject(id: number, data: UpdateProjectDTO): Promise<Project | null>;
  deleteProject(id: number): Promise<boolean>;
}
