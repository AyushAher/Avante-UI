import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})
export class AnalyticalTechniqueService {
  constructor(private router: Router, private http: HttpClient, private environment: EnvService) {
  }

  getAll() {
    return this.http.get(`${this.environment.apiUrl}/AnalyticalTechniques`);
  }

  getById(id: string) {
    return this.http.get(`${this.environment.apiUrl}/AnalyticalTechniques/${id}`);
  }

}
