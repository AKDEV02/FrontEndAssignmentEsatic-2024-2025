// Modifications à ajouter dans src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { User } from '../models/user';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromLocalStorage();
  }

  login(credentials: { username: string; password: string }): Observable<User> {
    return this.http.post<{ token: string; user: User }>(`${this.apiUrl}/login`, credentials).pipe(
      map(response => {
        // Stocker le token et l'utilisateur
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('current_user', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
        return response.user;
      }),
      catchError(error => {
        console.error('Error during login:', error);
        throw error;
      })
    );
  }

  register(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, user);
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user !== null && user.role === 'ADMIN';
  }

  isTeacher(): boolean {
    const user = this.getCurrentUser();
    return user !== null && user.role === 'TEACHER';
  }
  
  isStudent(): boolean {
    const user = this.getCurrentUser();
    return user !== null && user.role === 'STUDENT';
  }
  
  // Mise à jour du profil avec upload d'image
  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, userData).pipe(
      tap(updatedUser => {
        // Mettre à jour l'utilisateur en mémoire et dans le localStorage
        const currentUser = this.getCurrentUser();
        if (currentUser) {
          const newUser = { ...currentUser, ...updatedUser };
          localStorage.setItem('current_user', JSON.stringify(newUser));
          this.currentUserSubject.next(newUser);
        }
      })
    );
  }
  
  // Création d'un utilisateur (pour les admins)
  createUser(userData: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, userData);
  }
  
  // Récupérer tous les utilisateurs (pour les admins)
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }
  
  // Changer le rôle d'un utilisateur (pour les admins)
  changeUserRole(userId: string, role: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${userId}/role`, { role });
  }


  

  private loadUserFromLocalStorage(): void {
    const userStr = localStorage.getItem('current_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (e) {
        console.error('Error parsing user from localStorage', e);
        this.currentUserSubject.next(null);
      }
    }
  }
}