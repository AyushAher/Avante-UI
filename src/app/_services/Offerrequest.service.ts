import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { Offerrequest } from "../_models/Offerrequest.model";

@Injectable({
  providedIn: "root",
})
export class OfferrequestService {
  private corsheaders: HttpHeaders;
  private root: string;

  constructor(private router: Router, private http: HttpClient) { }
  save(offerrequest: Offerrequest) {
    return this.http.post(`${environment.apiUrl}/offerrequest`, offerrequest);
  }

  getAll() {
    return this.http.get<Offerrequest[]>(`${environment.apiUrl}/offerrequest`);
  }

  searchByKeyword(partno: string) {
    return this.http.get(`${environment.apiUrl}/Offerrequest/partno/${partno}`);
  }

  getById(id: string) {
    return this.http.get<Offerrequest>(
      `${environment.apiUrl}/offerrequest/${id}`
    );
  }

  update(id, params) {
    return this.http
      .put(`${environment.apiUrl}/offerrequest/${id}`, params)
      .pipe(
        map((x) => {
          return x;
        })
      );
  }

  delete(id: string) {
    return this.http.delete(`${environment.apiUrl}/offerrequest/${id}`).pipe(
      map((x) => {
        return x;
      })
    );
  }

}
