import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Offerrequest } from '../_models/Offerrequest.model';
import { AccountService } from './account.service';
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root',
})
export class OfferrequestService {

  constructor(
    private http: HttpClient,
    private environment: EnvService
  ) {
  }

  save(offerrequest: Offerrequest) {
    return this.http.post(`${this.environment.apiUrl}/offerrequest`, offerrequest);
  }

  getAll() {
    return this.http.get<Offerrequest[]>(`${this.environment.apiUrl}/offerrequest`);
  }

  searchByKeyword(partno: string) {
    return this.http.get(`${this.environment.apiUrl}/Offerrequest/partno/${partno}`);
  }

  getById(id: string) {
    return this.http.get<Offerrequest>(
      `${this.environment.apiUrl}/offerrequest/${id}`
    );
  }

  GetSpareQuoteDetailsByParentId(id: string) {
    return this.http.get(
      `${this.environment.apiUrl}/offerrequest/GetSpareQuoteDetailsByParentId/${id}`
    );
  }

  update(id, params) {
    let tokn = JSON.parse(localStorage.getItem('zohotoken'));

    return this.http
      .put(`${this.environment.apiUrl}/offerrequest/${id}/${tokn}`, params)
      .pipe(
        map((x) => {
          return x;
        })
      );
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/offerrequest/${id}`).pipe(
      map((x) => {
        return x;
      })
    );
  }

}
