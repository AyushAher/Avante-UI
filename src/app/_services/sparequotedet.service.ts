import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map} from "rxjs/operators";
import {Sparequotedet} from "../_models/sparequotedet";
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})
export class SparequotedetService {
  constructor(
    private http: HttpClient,
    private environment: EnvService,
  ) {
  }

  save(params) {
    return this.http.post(`${this.environment.apiUrl}/SpareQuoteDetails`, params);
  }


  getAll(parentid) {
    return this.http.get<Sparequotedet[]>(`${this.environment.apiUrl}/SpareQuoteDetails/all/${parentid}`);
  }

  getPrev(parentid) {
    return this.http.get(`${this.environment.apiUrl}/SpareQuoteDetails/prev/${parentid}`);
  }

  getById(id: string) {
    return this.http.get<Sparequotedet>(`${this.environment.apiUrl}/SpareQuoteDetails/${id}`);
  }

  GetDistContacts(id: string) {
    return this.http.get(`${this.environment.apiUrl}/SpareQuoteDetails/distcontacts/${id}`);
  }

  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/SpareQuoteDetails/${id}`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/SpareQuoteDetails/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }
}
