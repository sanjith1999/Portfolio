export type BlockType =
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'bullet_list'
  | 'numbered_list'
  | 'image'
  | 'equation'
  | 'columns'
  | 'code'
  | 'divider'
  | 'spacer';

export interface ColumnData {
  id: string;
  width: number;
  blocks: Block[];
}

export interface Block {
  id: string;
  type: BlockType;
  content?: string | string[];
  props?: {
    align?: 'left' | 'center' | 'right';
    caption?: string;
  };
  columns?: ColumnData[];
}

export interface Project {
  _id?: string;
  visibility: boolean;
  title: string;
  description: string;
  longDescription: string;
  technologies: string[];
  features: string[];
  challenges: string[];
  solutions: string[];
  image?: string;
  githubLink: string;
  liveLink: string;
  duration: string;
  teamSize: string;
  role: string;
  blocks: Block[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type ProjectInput = Omit<Project, '_id' | 'createdAt' | 'updatedAt'>;
