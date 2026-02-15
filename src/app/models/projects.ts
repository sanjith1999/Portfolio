// models/Project.ts
import mongoose, { Document, Model } from 'mongoose';

// ==========================================
// TYPESCRIPT INTERFACES
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

export interface Block {
  id: string;
  type: BlockType;
  content?: string | string[]; // Text, array of list items, or image URL. Optional because 'columns' type might not have content.
  props?: {
    align?: 'left' | 'center' | 'right';
    caption?: string;
  };
  columns?: ColumnData[]; // Used only if type === 'columns'
}

export interface ColumnData {
  id: string;
  width: number; // Percentage (e.g., 50)
  blocks: Block[]; // Nested blocks inside this column
}

// Project document interface
export interface ProjectDoc extends Document {
  visibility: boolean;
  title: string;
  description: string;
  longDescription: string;
  technologies: string[];
  features: string[];
  challenges: string[];
  solutions: string[];
  image?: string; // Main project cover image URL
  githubLink?: string;
  liveLink?: string;
  duration?: string;
  teamSize?: string;
  role?: string;
  blocks: Block[]; // Replaces old 'sections'
  createdAt: Date;
  updatedAt: Date;
}


// ==========================================
// MONGOOSE SCHEMAS
// ==========================================

// 1. Define BlockSchema without columns first to avoid circular dependency errors
const BlockSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
type: { 
      type: String, 
      enum: ['paragraph', 'heading1', 'heading2', 'bullet_list', 'numbered_list', 'image', 'equation', 'columns', 'code', 'divider', 'spacer'], 
      required: true 
    },
    content: { type: mongoose.Schema.Types.Mixed }, // String or String Array
    props: {
      align: { type: String, enum: ['left', 'center', 'right'] },
      caption: { type: String }
    }
  },
  { _id: false } // Prevent mongoose from creating automatic ObjectIds for every block
);

// 2. Define ColumnDataSchema which relies on BlockSchema
const ColumnDataSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    width: { type: Number, required: true },
    blocks: [BlockSchema] // Recursive!
  },
  { _id: false }
);

// 3. Resolve the circular dependency (Blocks can have Columns, Columns can have Blocks)
BlockSchema.add({
  columns: [ColumnDataSchema]
});

// 4. Main Project Schema
const ProjectSchema = new mongoose.Schema(
  {
    visibility: { type: Boolean, default: false },
    title: { type: String, required: true },
    description: String,
    longDescription: String,
    technologies: [String],
    features: [String],
    challenges: [String],
    solutions: [String],
    image: String,
    githubLink: String,
    liveLink: String,
    duration: String,
    teamSize: String,
    role: String,
    blocks: [BlockSchema], // Replaces sections
  },
  { timestamps: true }
);

// ==========================================
// EXPORTS
// ==========================================

// Create or reuse model (to prevent hot-reload compilation errors in Next.js)
let ProjectModel: Model<ProjectDoc>;
try {
  ProjectModel = mongoose.model<ProjectDoc>('Project');
} catch {
  ProjectModel = mongoose.model<ProjectDoc>('Project', ProjectSchema);
}

export default ProjectModel;