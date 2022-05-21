import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Offerrequest } from '../_models/Offerrequest.model';
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})
export class OfferRequestProcessesService {

  constructor(
    private http: HttpClient,
    private environment: EnvService,
  ) { }
  
  save(OfferRequestProcesses) {
    return this.http.post(`${this.environment.apiUrl}/OfferRequestProcesses`, OfferRequestProcesses);
  }

  getAll(id) {
    return this.http.get(`${this.environment.apiUrl}/OfferRequestProcesses/${id}`);
  }

  getById(id: string) {
    return this.http.get(
      `${this.environment.apiUrl}/OfferRequestProcesses/getprocess/${id}`
    );
  }

  update(params) {
    return this.http
      .put(`${this.environment.apiUrl}/OfferRequestProcesses`, params)
      .pipe(
        map((x) => {
          return x;
        })
      );
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/OfferRequestProcesses/${id}`).pipe(
      map((x) => {
        return x;
      })
    );
  }

}
