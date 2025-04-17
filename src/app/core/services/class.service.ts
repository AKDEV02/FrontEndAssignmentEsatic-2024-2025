import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Class } from '../models/class';
import { environment } from '../../../environment/environment';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class ClassService {
  private apiUrl = `${environment.apiUrl}/classes`;

  constructor(private http: HttpClient) { }

  getAllClasses(): Observable<Class[]> {
    return this.http.get<Class[]>(this.apiUrl);
  }

  getClassById(id: string): Observable<Class> {
    return this.http.get<Class>(`${this.apiUrl}/${id}`);
  }

  createClass(classData: Class): Observable<Class> {
    return this.http.post<Class>(this.apiUrl, classData);
  }

  updateClass(classData: Class): Observable<Class> {
    return this.http.put<Class>(`${this.apiUrl}/${classData.id}`, classData);
  }

  deleteClass(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getStudentsByClass(classId: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/${classId}/students`);
  }

  addStudentToClass(classId: string, studentId: string): Observable<Class> {
    return this.http.post<Class>(`${this.apiUrl}/${classId}/students/${studentId}`, {});
  }

  removeStudentFromClass(classId: string, studentId: string): Observable<Class> {
    return this.http.delete<Class>(`${this.apiUrl}/${classId}/students/${studentId}`);
  }
}