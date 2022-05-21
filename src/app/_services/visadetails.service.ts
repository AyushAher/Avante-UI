import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Visadetails } from '../_models/visadetails';
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})
export class VisadetailsService {

  public travelDetails: Observable<Visadetails>;
  constructor(
    private router: Router,
    private http: HttpClient,
    private environment: EnvService,
  ) { }

  save(traveldetail: Visadetails) {
    return this.http.post(`${this.environment.apiUrl}/VisaDetails`, traveldetail);
  }

  getAll() {
    return this.http.get<Visadetails[]>(
      `${this.environment.apiUrl}/VisaDetails`
    );
  }

  getById(id: string) {
    return this.http.get<Visadetails>(
      `${this.environment.apiUrl}/VisaDetails/${id}`
    );
  }


  update(id, params) {
    return this.http
      .put(`${this.environment.apiUrl}/VisaDetails/${id}`, params)
      .pipe(
        map((x) => {
          return x;
        })
      );
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/VisaDetails/${id}`).pipe(
      map((x) => {
        return x;
      })
    );
  }
}