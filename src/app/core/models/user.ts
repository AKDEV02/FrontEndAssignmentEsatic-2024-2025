export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  role: string | 'ADMIN' | 'STUDENT' | 'TEACHER';
  photoUrl?: string;
  firstName: string;
  lastName: string;
  createdAt?: Date;
  updatedAt?: Date;
  classId?: string; 
  teachingSubjects?: string[]; 
}