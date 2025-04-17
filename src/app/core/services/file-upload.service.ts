import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private apiUrl = `${environment.apiUrl}/uploads`;

  constructor(private http: HttpClient) { }

  uploadFile(file: File, type: 'profile' | 'assignment'): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const req = new HttpRequest('POST', this.apiUrl, formData, {
      reportProgress: true,
      responseType: 'json'
    });
    
    return this.http.request(req);
  }

  getAssignmentFiles(assignmentId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/assignments/${assignmentId}`);
  }

  deleteFile(fileUrl: string): Observable<any> {
    // L'URL doit être encodée car elle contient des caractères spéciaux
    const encodedUrl = encodeURIComponent(fileUrl);
    return this.http.delete(`${this.apiUrl}?url=${encodedUrl}`);
  }
}