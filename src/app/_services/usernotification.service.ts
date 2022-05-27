import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})
export class UsernotificationService {
  constructor(
    private router: Router,
    private http: HttpClient,
    private environment: EnvService,
  ) { }

  getAll() {
    return this.http.get(`${this.environment.apiUrl}/Notifications`);
  }

  delete(id) {
    return this.http.delete(`${this.environment.apiUrl}/Notifications/${id}`);
  }

  clearAll() {
    return this.http.delete(`${this.environment.apiUrl}/Notifications`);
  }

}
