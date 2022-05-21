import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})
export class AudittrailService {

  constructor(private router: Router, private http: HttpClient, private environment: EnvService,) {
  }

  getAll() {
    return this.http.get(`${this.environment.apiUrl}/AuditTrails`);
  }

  getById(id: string) {
    return this.http.get(`${this.environment.apiUrl}/AuditTrails/${id}`);
  }

}
