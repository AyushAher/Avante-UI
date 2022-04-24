import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TravelExpenseService {

  constructor(private http: HttpClient) { }


  save(model) {
    return this.http.post(`${environment.apiUrl}/TravelExpenses`, model);
  }

  getAll() {
    return this.http.get(`${environment.apiUrl}/TravelExpenses`);
  }

  getById(id: string) {
    return this.http.get(`${environment.apiUrl}/TravelExpenses/${id}`);
  }

  update(id, params) {
    return this.http.put(`${environment.apiUrl}/TravelExpenses`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${environment.apiUrl}/TravelExpenses/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }
}
