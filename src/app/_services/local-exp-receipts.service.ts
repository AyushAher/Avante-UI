import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})
export class LocalExpReceiptsService {
  constructor(
    private router: Router,
    private environment: EnvService,
    private http: HttpClient
  ) { }

  save(traveldetail: any) {
    return this.http.post(`${this.environment.apiUrl}/LocalExpRecipts`, traveldetail);
  }

  getAll(lid) {
    return this.http.get<any>(`${this.environment.apiUrl}/LocalExpRecipts/getByLId/${lid}`);
  }

  getById(id: string) {
    return this.http.get<any>(
      `${this.environment.apiUrl}/LocalExpRecipts/${id}`
    );
  }

  update(id, params) {
    return this.http
      .put(`${this.environment.apiUrl}/LocalExpRecipts/${id}`, params)
      .pipe(
        map((x) => {
          return x;
        })
      );
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/LocalExpRecipts/${id}`).pipe(
      map((x) => {
        return x;
      })
    );
  }
}
