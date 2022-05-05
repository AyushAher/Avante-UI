import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { ChangePasswordModel, User } from '../_models';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private userSubject: BehaviorSubject<User>;
  private zohoSubject: BehaviorSubject<string>;
  public user: Observable<User>;


  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.userSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('user')));
    this.zohoSubject = new BehaviorSubject<string>(JSON.parse(localStorage.getItem('zohotoken')));
    this.user = this.userSubject.asObservable();
  }

  public get userValue(): User {
    return this.userSubject.value;
  }

  public get zohoauthValue(): string {
    return this.zohoSubject.value;
  }

  public GetUserRegions() {
    return this.http.get(`${environment.apiUrl}/user/GetUserRegions`)
  }

  zohoauthSet(v: string) {
    this.zohoSubject.next(v);
  }


  clear() {
    localStorage.removeItem('zohotoken');
    this.zohoSubject.next(null);
  }


  login(username, password) {

    password = window.btoa(password);
    return this.http.post<User>(`${environment.apiUrl}/user/authenticate`, { username, password })
      .pipe(map(user => {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        localStorage.setItem('user', JSON.stringify(user));
        this.userSubject.next(user);
        this.clear();
        return user;
      }));
  }



  logout() {
    // remove user from local storage and set current user to null
    localStorage.clear();
    this.clear();
    this.userSubject.next(null);
    this.router.navigate(['/account/login']);
  }

  register(user: User) {
    return this.http.post(`${environment.apiUrl}/user`, user);
  }

  ChangePassword(changePassword: ChangePasswordModel) {
    return this.http.post(`${environment.apiUrl}/user/changepassword`, changePassword);
  }

  ForgotPassword(email: string) {
    return this.http.post(`${environment.apiUrl}/user/forgotpassword/` + email, null);
  }

  getAll() {
    return this.http.get<User[]>(`${environment.apiUrl}/users`);
  }

  getById(id: string) {
    return this.http.get<User>(`${environment.apiUrl}/user/GetUserByContactId/${id}`);
  }

  update(id, params) {
    return this.http.put(`${environment.apiUrl}/users/${id}`, params)
      .pipe(map(x => {
        // update stored user if the logged in user updated their own record
        if (id == this.userValue.id) {
          // update local storage
          const user = { ...this.userValue, ...params };
          localStorage.setItem('user', JSON.stringify(user));

          // publish updated user to subscribers
          this.userSubject.next(user);
        }
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${environment.apiUrl}/users/${id}`)
      .pipe(map(x => {
        // auto logout if the logged in user deleted their own record
        if (id == this.userValue.id) {
          this.logout();
        }
        return x;
      }));
  }
}
