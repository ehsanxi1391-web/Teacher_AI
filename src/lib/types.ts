export interface SettingsDTO {
  id: number;
  apiKey: string;
  apiBase: string;
  model: string;
  language: string;
  grade: string;
  onboarded: boolean;
}

export interface BookDTO {
  id: number;
  title: string;
  subject: string;
  grade: string;
  status: string;
  error?: string | null;
  pagesCount?: number;
  lessonsCount?: number;
  createdAt?: string;
}

export interface LessonDTO {
  id: number;
  index: number;
  title: string;
  pages: string;
  topics: string[];
  summary: string;
}

export interface PageMeta {
  number: number;
  preview: string;
}

export interface BookDetailDTO extends BookDTO {
  lessons: LessonDTO[];
  pages: PageMeta[];
}

export interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

export interface TestQuestion {
  type: "mcq" | "short";
  question: string;
  options?: string[];
  answer?: number | string;
  hint?: string;
  explanation?: string;
}

export interface TestDTO {
  id: string;
  title: string;
  grade: string;
  subject: string;
  topic: string;
  mode: string;
  createdAt: string;
  data: TestQuestion[];
}
