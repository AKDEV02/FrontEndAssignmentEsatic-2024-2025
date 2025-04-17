import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Assignment } from '../models/assignment';
import { environment } from '../../../environment/environment';
import { PaginationResponse } from '../models/pagination';

@Injectable({
  providedIn: 'root'
})
export class AssignmentsService {
  private apiUrl = `${environment.apiUrl}/assignments`;

  constructor(private http: HttpClient) { }

  getAssignments(page: number, limit: number): Observable<PaginationResponse<Assignment>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PaginationResponse<Assignment>>(this.apiUrl, { params });
  }

  getAssignment(id: string): Observable<Assignment> {
    return this.http.get<Assignment>(`${this.apiUrl}/${id}`);
  }

  addAssignment(assignment: Assignment): Observable<Assignment> {
    // Utiliser la déstructuration pour créer un nouvel objet sans la propriété 'id'
    const { id, ...assignmentWithoutId } = assignment;
    
    console.log('Envoi au serveur sans id:', JSON.stringify(assignmentWithoutId));
    return this.http.post<Assignment>(this.apiUrl, assignmentWithoutId);
  }

  updateAssignment(assignment: Assignment): Observable<Assignment> {
    return this.http.put<Assignment>(`${this.apiUrl}/${assignment.id}`, assignment);
  }

  deleteAssignment(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Nouvelles méthodes pour récupérer les données enrichies
  getSubmittedAssignments(): Observable<PaginationResponse<Assignment>> {
    return this.http.get<PaginationResponse<Assignment>>(`${this.apiUrl}/submitted`);
  }

  getPendingAssignments(): Observable<PaginationResponse<Assignment>> {
    return this.http.get<PaginationResponse<Assignment>>(`${this.apiUrl}/pending`);
  }

  getAssignmentsBySubject(subjectId: string): Observable<PaginationResponse<Assignment>> {
    return this.http.get<PaginationResponse<Assignment>>(`${this.apiUrl}/subject/${subjectId}`);
  }

  getAssignmentsByStudent(studentId: string): Observable<PaginationResponse<Assignment>> {
    return this.http.get<PaginationResponse<Assignment>>(`${this.apiUrl}/student/${studentId}`);
  }
}