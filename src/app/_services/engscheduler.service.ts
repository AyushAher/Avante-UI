import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})
export class EngschedulerService {

  constructor(private router: Router, private http: HttpClient, private environment: EnvService,) {
  }

  save(EngSchedulers: any) {
    return this.http.post(`${this.environment.apiUrl}/EngSchedulers`, EngSchedulers);
  }

  getAll() {
    return this.http.get(`${this.environment.apiUrl}/EngSchedulers`);
  }

  getById(id: string) {
    return this.http.get(
      `${this.environment.apiUrl}/EngSchedulers/${id}`
    );
  }

  getByEngId(id: string) {
    return this.http.get(
      `${this.environment.apiUrl}/EngSchedulers/engid/${id}`
    );
  }

  update(id, params) {
    return this.http
      .put(`${this.environment.apiUrl}/EngSchedulers/${id}`, params)
      .pipe(
        map((x) => {
          return x;
        })
      );
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/EngSchedulers/${id}`).pipe(
      map((x) => {
        return x;
      })
    );
  }

}
