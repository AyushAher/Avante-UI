import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {map} from "rxjs/operators";
import {Sparequotedet} from "../_models/sparequotedet";

@Injectable({
  providedIn: 'root'
})
export class SparequotedetService {
  constructor(
    private http: HttpClient
  ) {
  }

  save(params) {
    return this.http.post(`${environment.apiUrl}/SpareQuoteDetails`, params);
  }


  getAll(parentid) {
    return this.http.get<Sparequotedet[]>(`${environment.apiUrl}/SpareQuoteDetails/all/${parentid}`);
  }

  getPrev(parentid) {
    return this.http.get(`${environment.apiUrl}/SpareQuoteDetails/prev/${parentid}`);
  }

  getById(id: string) {
    return this.http.get<Sparequotedet>(`${environment.apiUrl}/SpareQuoteDetails/${id}`);
  }

  GetDistContacts(id: string) {
    return this.http.get(`${environment.apiUrl}/SpareQuoteDetails/distcontacts/${id}`);
  }

  update(id, params) {
    return this.http.put(`${environment.apiUrl}/SpareQuoteDetails/${id}`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${environment.apiUrl}/SpareQuoteDetails/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }
}
