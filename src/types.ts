export interface Resource {
  id: string;
  url: string;
  title: string;
  type: 'video' | 'article' | 'other';
}

export interface Course {
  id: string;
  name: string;
  year: 1 | 2 | 3 | 4;
  status: 'locked' | 'completed' | 'reviewed';
  rating: number | null;
  review: string | null;
  resources: Resource[];
  prof_review: string | null;
}

export interface TreeData {
  courses: Course[];
  title: string;
  likes: number;
  contact_info: string | null;
  author_name?: string; // Optional for backward compatibility
}
