// models/Project.ts
import mongoose, { Document, Model } from 'mongoose';

// Add the new types to the Column interface
export interface Column {
  id: string;
  width?: number;
  type: 'text' | 'image' | 'points' | 'equation' | 'blank' | 'paragraphs'; 
  content: string | string[]; // Can be empty string for 'blank'
}
// SubSection interface
export interface SubSection {
  id: string;
  heading?: string;
  content?: string[];
  points?: string[];
  equation?: string;
  image?: string; // data URL
  columns?: Column[];
}

// Add showInToc to Section
export interface Section {
  id: string;
  heading: string;
  showInToc?: boolean; // <-- NEW
  content: string[];
  image?: string; 
  subSections?: SubSection[];
  columns?: Column[];
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
  image?: string; // data URL
  githubLink?: string;
  liveLink?: string;
  duration?: string;
  teamSize?: string;
  role?: string;
  sections: Section[];
  createdAt: Date;
  updatedAt: Date;
}

// Column schema
const ColumnSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    width: { type: Number, required: false },
    type: { type: String, enum: ['text', 'image', 'points', 'equation'], required: true },
    content: { type: mongoose.Schema.Types.Mixed, required: true }, // string or array
  },
  { _id: false }
);

// SubSection schema
const SubSectionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    heading: String,
    content: [String],
    points: [String],
    equation: String,
    image: String,
    columns: [ColumnSchema], // new dynamic columns
  },
  { _id: false }
);

// Section schema
const SectionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    heading: { type: String, required: true },
    content: [String],
    image: String,
    subSections: [SubSectionSchema],
    columns: [ColumnSchema],
  },
  { _id: false }
);

// Project schema
const ProjectSchema = new mongoose.Schema(
  {
    visibility: Boolean,
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
    sections: [SectionSchema],
  },
  { timestamps: true }
);

// Create or reuse model
let ProjectModel: Model<ProjectDoc>;
try {
  ProjectModel = mongoose.model<ProjectDoc>('Project');
} catch {
  ProjectModel = mongoose.model<ProjectDoc>('Project', ProjectSchema);
}

export default ProjectModel;
