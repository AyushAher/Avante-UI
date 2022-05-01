import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BankdetailsService {

  constructor(private http: HttpClient) { }


  save(model) {
    return this.http.post(`${environment.apiUrl}/BankDetails`, model);
  }

  getAll() {
    return this.http.get(`${environment.apiUrl}/BankDetails`);
  }

  getById(id: string) {
    return this.http.get(`${environment.apiUrl}/BankDetails/${id}`);
  }

  getByContactId(id: string) {
    return this.http.get(`${environment.apiUrl}/BankDetails/getbycontactid/${id}`);
  }

  update(id, params) {
    return this.http.put(`${environment.apiUrl}/BankDetails/${id}`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${environment.apiUrl}/BankDetails/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }
}
