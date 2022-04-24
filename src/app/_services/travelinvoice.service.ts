import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TravelinvoiceService {

  constructor(private http: HttpClient) { }


  save(model) {
    return this.http.post(`${environment.apiUrl}/TravelInvoice`, model);
  }

  getAll() {
    return this.http.get(`${environment.apiUrl}/TravelInvoice`);
  }

  getById(id: string) {
    return this.http.get(`${environment.apiUrl}/TravelInvoice/${id}`);
  }

  update(id, params) {
    return this.http.put(`${environment.apiUrl}/TravelInvoice`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${environment.apiUrl}/TravelInvoice/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }
}

