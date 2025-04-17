import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Teacher } from '../models/teacher';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/teachers`;

  getAllTeachers(): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(this.apiUrl);
  }

  getTeacher(id: string): Observable<Teacher> {
    return this.http.get<Teacher>(`${this.apiUrl}/${id}`);
  }

  createTeacher(teacher: Teacher): Observable<Teacher> {
    return this.http.post<Teacher>(this.apiUrl, teacher);
  }

  updateTeacher(teacher: Teacher): Observable<Teacher> {
    return this.http.put<Teacher>(`${this.apiUrl}/${teacher.id}`, teacher);
  }

  deleteTeacher(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}