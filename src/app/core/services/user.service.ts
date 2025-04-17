import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { User } from '../models/user';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = `${environment.apiUrl}/users`;
  
  constructor(private http: HttpClient) { }
  
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl).pipe(
      map(users => {
        // S'assurer que chaque utilisateur a bien un ID valide
        return users.map(user => {
          if (!user.id) {
            console.warn('Utilisateur sans ID détecté:', user);
          }
          return user;
        });
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        return throwError(() => error);
      })
    );
  }
  
  getUserById(id: string): Observable<User> {
    if (!id) {
      console.error('Tentative de récupération d\'un utilisateur avec un ID undefined');
      return throwError(() => new Error('ID utilisateur invalide'));
    }
    
    return this.http.get<User>(`${this.baseUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Erreur lors de la récupération de l'utilisateur ${id}:`, error);
        return throwError(() => error);
      })
    );
  }
  
  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.baseUrl, user).pipe(
      catchError(error => {
        console.error('Erreur lors de la création de l\'utilisateur:', error);
        return throwError(() => error);
      })
    );
  }
  
  updateUser(id: string, user: User): Observable<User> {
    if (!id) {
      console.error('Tentative de mise à jour d\'un utilisateur avec un ID undefined');
      return throwError(() => new Error('ID utilisateur invalide'));
    }
    
    return this.http.put<User>(`${this.baseUrl}/${id}`, user).pipe(
      catchError(error => {
        console.error(`Erreur lors de la mise à jour de l'utilisateur ${id}:`, error);
        return throwError(() => error);
      })
    );
  }
  
  deleteUser(id: string): Observable<any> {
    if (!id) {
      console.error('Tentative de suppression d\'un utilisateur avec un ID undefined');
      return throwError(() => new Error('ID utilisateur invalide'));
    }
    
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Erreur lors de la suppression de l'utilisateur ${id}:`, error);
        return throwError(() => error);
      })
    );
  }
  
  changeUserRole(id: string, role: string): Observable<User> {
    if (!id) {
      console.error('Tentative de changement de rôle d\'un utilisateur avec un ID undefined');
      return throwError(() => new Error('ID utilisateur invalide'));
    }
    
    return this.http.patch<User>(`${this.baseUrl}/${id}/role`, { role }).pipe(
      catchError(error => {
        console.error(`Erreur lors du changement de rôle de l'utilisateur ${id}:`, error);
        return throwError(() => error);
      })
    );
  }
  
  resetPassword(id: string): Observable<any> {
    if (!id) {
      console.error('Tentative de réinitialisation du mot de passe d\'un utilisateur avec un ID undefined');
      return throwError(() => new Error('ID utilisateur invalide'));
    }
    
    return this.http.post<any>(`${this.baseUrl}/${id}/reset-password`, {}).pipe(
      catchError(error => {
        console.error(`Erreur lors de la réinitialisation du mot de passe de l'utilisateur ${id}:`, error);
        return throwError(() => error);
      })
    );
  }
}