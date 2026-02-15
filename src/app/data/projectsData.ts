import { Types } from 'mongoose';

// ==========================================
// BLOCK-BASED EDITOR TYPES (Notion Style)
// ==========================================

export type BlockType = 
  | 'paragraph' 
  | 'heading1' 
  | 'heading2' 
  | 'bullet_list' 
  | 'numbered_list' 
  | 'image' 
  | 'equation' 
  | 'columns'
  | 'code'       // <-- NEW
  | 'divider'    // <-- NEW
  | 'spacer';

export interface ColumnData {
  id: string;
  width: number; // Percentage (e.g., 50 for 50%)
  blocks: Block[]; // Columns contain nested blocks
}

export interface Block {
  id: string;
  type: BlockType;
  content?: string | string[]; // Text, array of list items, or image URL
  props?: {
    align?: 'left' | 'center' | 'right';
    caption?: string;
  };
  columns?: ColumnData[]; // Used exclusively when type === 'columns'
}

// ==========================================
// MAIN PROJECT TYPE
// ==========================================

export interface Project {
  _id?: Types.ObjectId | string; 
  visibility: boolean;
  title: string;
  description: string;
  longDescription: string;
  technologies: string[];
  features: string[];
  challenges: string[];
  solutions: string[];
  image?: string; // Main project cover image
  githubLink: string;
  liveLink: string;
  duration: string;
  teamSize: string;
  role: string;
  
  // 🔥 Replaced old 'sections' with 'blocks'
  blocks: Block[]; 
  
  createdAt?: Date;
  updatedAt?: Date;
}