import { Teacher } from "./teacher";

export interface Subject {
    id: string;
    name: string;
    imageUrl: string;
    firstName: string;
    lastName : string;
    teacher: Teacher; 
    color: string; 
    description: string;
    createdAt: Date;
    updatedAt: Date;
  }