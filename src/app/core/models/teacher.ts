export interface Teacher {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    photoUrl: string;
    subjects: string[]; // IDs des matières
    createdAt: Date;
    updatedAt: Date;
  }