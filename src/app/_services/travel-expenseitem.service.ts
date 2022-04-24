import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TravelExpenseitemService {

  constructor(private http: HttpClient) { }


  save(model) {
    return this.http.post(`${environment.apiUrl}/TravelExpensesItems`, model);
  }

  getAll() {
    return this.http.get(`${environment.apiUrl}/TravelExpensesItems`);
  }

  getById(id: string) {
    return this.http.get(`${environment.apiUrl}/TravelExpensesItems/${id}`);
  }

  update(id, params) {
    return this.http.put(`${environment.apiUrl}/TravelExpensesItems`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${environment.apiUrl}/TravelExpensesItems/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }
}
