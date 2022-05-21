import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Flightdetails } from '../_models/flightdetails';
import { travelDetails } from '../_models/traveldetails';
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})
export class FlightdetailsService {
  public travelDetails: Observable<Flightdetails>;
  constructor(
    private router: Router,
    private environment: EnvService,
    private http: HttpClient
  ) { }

  save(traveldetail: travelDetails) {
    return this.http.post(`${this.environment.apiUrl}/Flightdetails`, traveldetail);
  }

  getAll() {
    return this.http.get<travelDetails[]>(
      `${this.environment.apiUrl}/Flightdetaails`
    );
  }

  getById(id: string) {
    return this.http.get<travelDetails>(
      `${this.environment.apiUrl}/Flightdetaails/${id}`
    );
  }


  update(id, params) {
    return this.http
      .put(`${this.environment.apiUrl}/Flightdetaails/${id}`, params)
      .pipe(
        map((x) => {
          return x;
        })
      );
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/Flightdetaails/${id}`).pipe(
      map((x) => {
        return x;
      })
    );
  }
}