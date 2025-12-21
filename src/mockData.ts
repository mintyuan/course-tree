import { Course } from './types';

export const courses: Course[] = [
  {
    id: 'cs101',
    name: 'Introduction to Programming',
    year: 1,
    category: 'Software',
    status: 'reviewed',
    rating: 5,
    review: 'Excellent introduction to CS. Professor was engaging and the projects were practical.',
    resources: [
      { title: 'Python Basics Tutorial', url: 'https://example.com/python', type: 'video' },
      { title: 'First Program Guide', url: 'https://example.com/guide', type: 'article' }
    ]
  },
  {
    id: 'math141',
    name: 'Calculus I',
    year: 1,
    category: 'Math',
    status: 'reviewed',
    rating: 4,
    review: 'Challenging but rewarding. Office hours were very helpful.',
    resources: [
      { title: 'Khan Academy Calculus', url: 'https://example.com/calc', type: 'video' }
    ]
  },
  {
    id: 'cs102',
    name: 'Object-Oriented Programming',
    year: 1,
    category: 'Software',
    status: 'completed',
    rating: null,
    review: null,
    resources: [
      { title: 'Java OOP Concepts', url: 'https://example.com/oop', type: 'video' }
    ]
  },
  {
    id: 'gen101',
    name: 'English Composition',
    year: 1,
    category: 'General',
    status: 'completed',
    rating: null,
    review: null,
    resources: []
  },
  {
    id: 'cs201',
    name: 'Data Structures',
    year: 2,
    category: 'Software',
    status: 'reviewed',
    rating: 5,
    review: 'Core CS course. Really helps understand how software works under the hood.',
    resources: [
      { title: 'Data Structures Visualization', url: 'https://example.com/ds', type: 'video' },
      { title: 'Big O Notation Guide', url: 'https://example.com/bigo', type: 'article' }
    ]
  },
  {
    id: 'cs202',
    name: 'Computer Architecture',
    year: 2,
    category: 'Hardware',
    status: 'completed',
    rating: null,
    review: null,
    resources: [
      { title: 'CPU Design Basics', url: 'https://example.com/cpu', type: 'video' }
    ]
  },
  {
    id: 'math240',
    name: 'Discrete Mathematics',
    year: 2,
    category: 'Math',
    status: 'reviewed',
    rating: 4,
    review: 'Essential for algorithms. Proofs were tough but satisfying.',
    resources: [
      { title: 'Discrete Math for CS', url: 'https://example.com/discrete', type: 'article' }
    ]
  },
  {
    id: 'cs203',
    name: 'Algorithms',
    year: 2,
    category: 'Software',
    status: 'completed',
    rating: null,
    review: null,
    resources: [
      { title: 'Algorithm Design Patterns', url: 'https://example.com/algo', type: 'video' }
    ]
  },
  {
    id: 'cs301',
    name: 'Operating Systems',
    year: 3,
    category: 'Software',
    status: 'completed',
    rating: null,
    review: null,
    resources: [
      { title: 'OS Concepts Explained', url: 'https://example.com/os', type: 'video' }
    ]
  },
  {
    id: 'cs302',
    name: 'Database Systems',
    year: 3,
    category: 'Software',
    status: 'completed',
    rating: null,
    review: null,
    resources: [
      { title: 'SQL Tutorial', url: 'https://example.com/sql', type: 'video' },
      { title: 'Database Design Principles', url: 'https://example.com/db', type: 'article' }
    ]
  },
  {
    id: 'cs303',
    name: 'Computer Networks',
    year: 3,
    category: 'Hardware',
    status: 'locked',
    rating: null,
    review: null,
    resources: []
  },
  {
    id: 'cs304',
    name: 'Software Engineering',
    year: 3,
    category: 'Software',
    status: 'locked',
    rating: null,
    review: null,
    resources: []
  },
  {
    id: 'math341',
    name: 'Linear Algebra',
    year: 3,
    category: 'Math',
    status: 'locked',
    rating: null,
    review: null,
    resources: []
  },
  {
    id: 'cs401',
    name: 'Machine Learning',
    year: 4,
    category: 'Software',
    status: 'locked',
    rating: null,
    review: null,
    resources: []
  },
  {
    id: 'cs402',
    name: 'Computer Graphics',
    year: 4,
    category: 'Hardware',
    status: 'locked',
    rating: null,
    review: null,
    resources: []
  },
  {
    id: 'cs403',
    name: 'Artificial Intelligence',
    year: 4,
    category: 'Software',
    status: 'locked',
    rating: null,
    review: null,
    resources: []
  },
  {
    id: 'cs404',
    name: 'Cybersecurity',
    year: 4,
    category: 'Software',
    status: 'locked',
    rating: null,
    review: null,
    resources: []
  },
  {
    id: 'cs405',
    name: 'Senior Capstone Project',
    year: 4,
    category: 'General',
    status: 'locked',
    rating: null,
    review: null,
    resources: []
  }
];
