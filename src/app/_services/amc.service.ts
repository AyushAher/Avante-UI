import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Amc } from '../_models';

@Injectable({ providedIn: 'root' })
export class AmcService {
  constructor(
    private http: HttpClient
  ) { }

  save(params) {
    return this.http.post(`${environment.apiUrl}/amc`, params);
  }


  getAll() {
    return this.http.get<Amc[]>(`${environment.apiUrl}/Amc`);
  }

  getById(id: string) {
    return this.http.get<Amc>(`${environment.apiUrl}/amc/${id}`);
  }


  searchByKeyword(SerialNo: string) {
    return this.http.get(`${environment.apiUrl}/amc/SerialNo/${SerialNo}`);
  }

  update(id, params) {
    return this.http.put(`${environment.apiUrl}/amc/${id}`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${environment.apiUrl}/Amc/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }
}
