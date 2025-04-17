import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subject } from '../models/subject';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private apiUrl = `${environment.apiUrl}/subjects`;

  constructor(private http: HttpClient) { }

  getSubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(this.apiUrl);
  }

  getSubject(id: string): Observable<Subject> {
    return this.http.get<Subject>(`${this.apiUrl}/${id}`);
  }

  addSubject(subject: Subject): Observable<Subject> {
    return this.http.post<Subject>(this.apiUrl, subject);
  }

  updateSubject(subject: Subject): Observable<Subject> {
    return this.http.put<Subject>(`${this.apiUrl}/${subject.id}`, subject);
  }

  deleteSubject(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  createSubject(subject: Subject): Observable<Subject> {
    return this.http.post<Subject>(this.apiUrl, subject);
  }


}
