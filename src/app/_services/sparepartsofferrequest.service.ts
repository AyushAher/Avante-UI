import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})
export class SparePartsOfferRequestService {

  constructor(
    private http: HttpClient,
    private environment: EnvService,
  ) { }

  SaveSpareParts = (params) => {
    return this.http.post(`${this.environment.apiUrl}/SparePartsOfferRequests`, params);
  }


  getSparePartsByOfferRequestId = (id: string) => {
    return this.http.get(`${this.environment.apiUrl}/SparePartsOfferRequests/${id}`);
  }


  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/SparePartsOfferRequests/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }

}
