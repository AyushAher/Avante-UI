import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { Staydetails } from "../_models/staydetails";
import { EnvService } from "./env/env.service";

@Injectable({
  providedIn: "root",
})
export class StaydetailsService {
  public Staydetails: Observable<Staydetails>;
  private corsheaders: HttpHeaders;
  private root: string;
  constructor(
    private router: Router,
    private http: HttpClient,
    private environment: EnvService,
  ) { }

  save(traveldetail: Staydetails) {
    return this.http.post(`${this.environment.apiUrl}/StayDetails`, traveldetail);
  }

  getAll() {
    return this.http.get<Staydetails[]>(`${this.environment.apiUrl}/StayDetails`);
  }

  getById(id: string) {
    return this.http.get<Staydetails>(
      `${this.environment.apiUrl}/StayDetails/${id}`
    );
  }

  update(id, params) {
    return this.http
      .put(`${this.environment.apiUrl}/StayDetails/${id}`, params)
      .pipe(
        map((x) => {
          return x;
        })
      );
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/StayDetails/${id}`).pipe(
      map((x) => {
        return x;
      })
    );
  }
}
