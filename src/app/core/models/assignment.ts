import { Subject } from "./subject";
import { User } from "./user";

export interface Assignment {
  id: string;
  nom: string;
  dateDeRendu: Date;
  rendu: boolean;
  auteur: string | User; 
  matiere: Subject | string; 
  note: number; 
  remarques: string;
  createdAt?: Date;
  updatedAt?: Date;
  classId: string; 
  attachments?: string[]; 
}