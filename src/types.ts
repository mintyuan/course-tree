export interface Resource {
  title: string;
  url: string;
  type: 'video' | 'article';
}

export interface Course {
  id: string;
  name: string;
  year: 1 | 2 | 3 | 4;
  category: 'Math' | 'Software' | 'Hardware' | 'General';
  status: 'locked' | 'completed' | 'reviewed';
  rating: number | null;
  review: string | null;
  resources: Resource[];
}
