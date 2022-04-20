import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocalExpReceiptsService {
  constructor(private router: Router, private http: HttpClient) { }

  save(traveldetail: any) {
    return this.http.post(`${environment.apiUrl}/LocalExpRecipts`, traveldetail);
  }

  getAll(lid) {
    return this.http.get<any>(`${environment.apiUrl}/LocalExpRecipts/getByLId/${lid}`);
  }

  getById(id: string) {
    return this.http.get<any>(
      `${environment.apiUrl}/LocalExpRecipts/${id}`
    );
  }

  update(id, params) {
    return this.http
      .put(`${environment.apiUrl}/LocalExpRecipts/${id}`, params)
      .pipe(
        map((x) => {
          return x;
        })
      );
  }

  delete(id: string) {
    return this.http.delete(`${environment.apiUrl}/LocalExpRecipts/${id}`).pipe(
      map((x) => {
        return x;
      })
    );
  }
}
