export type BlockType = 'heading' | 'text' | 'list' | 'quiz' | 'highlight' | 'image' | 'video';

export interface SlideBlock {
  id: string;
  type: BlockType;
  content: string;
  // Extras depending on block type
  listItems?: string[];
  options?: string[]; // For quiz: option choices
  correctAnswer?: string; // For quiz: selected correct choice
  imagePrompt?: string; // Prompt for display
  caption?: string; // Image caption
  imageUrl?: string; // Real image URL or base64 upload
  videoUrl?: string; // YouTube video URL or identifier
}

export interface Slide {
  id: string;
  title: string;
  blocks: SlideBlock[];
  duration: number; // in seconds, 0 = manual advance
  autoAdvance: boolean;
  backgroundStyle: 'slate' | 'editorial' | 'ocean' | 'terminal';
  logos?: string[]; // Slide-specific logos override sequence
  logoAlignment?: 'left' | 'center' | 'right'; // Slide-specific logo alignment override
}

export interface Student {
  id: string;
  name: string;
  recitationCount: number;
  lastSelectedAt?: string;
  absent: boolean;
}

export interface ClassRoster {
  id: string;
  name: string;
  students: Student[];
}

export type ViewMode = 'split' | 'dashboard' | 'public';

export interface Presentation {
  id: string;
  title: string;
  slides: Slide[];
  lastSavedAt: string;
  isDraft?: boolean;
  logoUrl?: string; // Optional custom logo URL or Base64 uploaded image
  logos?: string[]; // Multiple logos
  logoAlignment?: 'left' | 'center' | 'right'; // Logo alignment: left, center, right
}

