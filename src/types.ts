export interface Course {
  id: string;
  name: string;
  year: 1 | 2 | 3 | 4;
  status: 'locked' | 'completed' | 'reviewed';
  rating: number | null;
  review: string | null;
  url: string | null;
}
