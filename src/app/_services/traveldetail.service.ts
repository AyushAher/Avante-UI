import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";

import { environment } from "../../environments/environment";
import { travelDetails } from "../_models/traveldetails";
@Injectable({
  providedIn: "root",
})
export class TravelDetailService {
  public travelDetails: Observable<travelDetails>;
  constructor(private router: Router, private http: HttpClient) {}

  save(traveldetail: travelDetails) {
    return this.http.post(`${environment.apiUrl}/Traveldetails`, traveldetail);
  }

  getAll() {
    return this.http.get<travelDetails[]>(
      `${environment.apiUrl}/Traveldetails`
    );
  }

  getById(id: string) {
    return this.http.get<travelDetails>(
      `${environment.apiUrl}/Traveldetails/${id}`
    );
  }


  update(id, params) {
    return this.http
      .put(`${environment.apiUrl}/Traveldetails/${id}`, params)
      .pipe(
        map((x) => {
          return x;
        })
      );
  }

  delete(id: string) {
    return this.http.delete(`${environment.apiUrl}/Traveldetails/${id}`).pipe(
      map((x) => {
        return x;
      })
    );
  }
}