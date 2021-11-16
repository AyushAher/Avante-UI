import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Visadetails } from '../_models/visadetails';

@Injectable({
  providedIn: 'root'
})
export class VisadetailsService {

  public travelDetails: Observable<Visadetails>;
  constructor(private router: Router, private http: HttpClient) {}

  save(traveldetail: Visadetails) {
    return this.http.post(`${environment.apiUrl}/VisaDetails`, traveldetail);
  }

  getAll() {
    return this.http.get<Visadetails[]>(
      `${environment.apiUrl}/VisaDetails`
    );
  }

  getById(id: string) {
    return this.http.get<Visadetails>(
      `${environment.apiUrl}/VisaDetails/${id}`
    );
  }


  update(id, params) {
    return this.http
      .put(`${environment.apiUrl}/VisaDetails/${id}`, params)
      .pipe(
        map((x) => {
          return x;
        })
      );
  }

  delete(id: string) {
    return this.http.delete(`${environment.apiUrl}/VisaDetails/${id}`).pipe(
      map((x) => {
        return x;
      })
    );
  }
}