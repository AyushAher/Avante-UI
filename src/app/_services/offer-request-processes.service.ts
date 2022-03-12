import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Offerrequest } from '../_models/Offerrequest.model';

@Injectable({
  providedIn: 'root'
})
export class OfferRequestProcessesService {

  constructor(private http: HttpClient) { }
  save(OfferRequestProcesses) {
    return this.http.post(`${environment.apiUrl}/OfferRequestProcesses`, OfferRequestProcesses);
  }

  getAll(id) {
    return this.http.get(`${environment.apiUrl}/OfferRequestProcesses/${id}`);
  }

  getById(id: string) {
    return this.http.get(
      `${environment.apiUrl}/OfferRequestProcesses/getprocess/${id}`
    );
  }

  update(params) {
    return this.http
      .put(`${environment.apiUrl}/OfferRequestProcesses`, params)
      .pipe(
        map((x) => {
          return x;
        })
      );
  }

  delete(id: string) {
    return this.http.delete(`${environment.apiUrl}/OfferRequestProcesses/${id}`).pipe(
      map((x) => {
        return x;
      })
    );
  }

}
