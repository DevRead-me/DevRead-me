// Documentation Package Types
export interface DocumentationFile {
  name: string;
  content: string;
  path: string;
}

export interface DocumentationPackage {
  projectName: string;
  description: string;
  files: DocumentationFile[];
  metadata: {
    generatedAt: string;
    version: "1.0.0";
  };
}

// Generation Request Types
export interface GenerationRequest {
  projectName: string;
  projectDescription: string;
  codeInput: string;
  readmeContent?: string;
  selectedSidebar: boolean;
  accentColor: string;
}

// Groq API Response Types
export interface GroqAnalysis {
  structure: string[];
  summary: string;
  keyFeatures: string[];
}

export interface GroqGenerationResult {
  files: {
    [key: string]: string; // filename: content
  };
  analysis: GroqAnalysis;
}

export interface GroqResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Template Configuration Types
export interface TemplateConfig {
  projectName: string;
  repoUrl: string;
  themeColor: string;
  includeSidebar: boolean;
}

export interface TemplateProcessResult {
  htmlContent: string;
  cssContent: string;
}

// Export Bundle Types
export interface ExportBundle {
  indexHtml: string;
  themeCss: string;
  markdownFiles: DocumentationFile[];
}

// Frontend Component Types
export interface FormData {
  projectName: string;
  description: string;
  codeInput: string;
  accentColor: string;
  includeSidebar: boolean;
  useDesignV2: boolean;
}

export interface GenerationStatus {
  isLoading: boolean;
  error: string | null;
  progress: number; // 0-100
  step: "idle" | "analyzing" | "generating" | "exporting" | "complete";
}

// API Response Types
export interface GenerateApiRequest {
  projectName: string;
  description: string;
  codeInput: string;
  accentColor: string;
  includeSidebar: boolean;
  generateFullDocs: boolean; // true = full docs package, false = simple README only
}

export interface GenerateApiResponse {
  success: boolean;
  data?: {
    bundle: ExportBundle;
  };
  error?: string;
}
