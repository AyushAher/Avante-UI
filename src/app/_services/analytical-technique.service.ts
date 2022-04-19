import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnalyticalTechniqueService {
  constructor(private router: Router, private http: HttpClient) {
  }

  getAll() {
    return this.http.get(`${environment.apiUrl}/AnalyticalTechniques`);
  }

  getById(id: string) {
    return this.http.get(`${environment.apiUrl}/AnalyticalTechniques/${id}`);
  }

}
