export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateDTO {
  name: string;
  description: string;
  category: string;
  icon?: string;
  complexity?: Template['complexity'];
  tags?: string[];
}

export interface UpdateTemplateDTO {
  name?: string;
  description?: string;
  category?: string;
  icon?: string;
  complexity?: Template['complexity'];
  tags?: string[];
}

export interface TemplateStats {
  total: number;
  byCategory: Record<string, number>;
  byComplexity: Record<string, number>;
  totalUsage: number;
}
