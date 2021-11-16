import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { Staydetails } from "../_models/staydetails";

@Injectable({
  providedIn: "root",
})
export class StaydetailsService {
  public Staydetails: Observable<Staydetails>;
  private corsheaders: HttpHeaders;
  private root: string;
  constructor(private router: Router, private http: HttpClient) {}

  save(traveldetail: Staydetails) {
    return this.http.post(`${environment.apiUrl}/StayDetails`, traveldetail);
  }

  getAll() {
    return this.http.get<Staydetails[]>(`${environment.apiUrl}/StayDetails`);
  }

  getById(id: string) {
    return this.http.get<Staydetails>(
      `${environment.apiUrl}/StayDetails/${id}`
    );
  }

  update(id, params) {
    return this.http
      .put(`${environment.apiUrl}/StayDetails/${id}`, params)
      .pipe(
        map((x) => {
          return x;
        })
      );
  }

  delete(id: string) {
    return this.http.delete(`${environment.apiUrl}/StayDetails/${id}`).pipe(
      map((x) => {
        return x;
      })
    );
  }
}
