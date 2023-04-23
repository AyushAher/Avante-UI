import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Amc } from '../_models';
import { EnvService } from './env/env.service';
import { StringMap } from '@angular/compiler/src/compiler_facade_interface';

@Injectable({ providedIn: 'root' })
export class AmcService {
  constructor(
    private http: HttpClient,
    private environment: EnvService,
  ) { }

  save(params) {
    return this.http.post(`${this.environment.apiUrl}/amc`, params);
  }


  getAll() {
    return this.http.get<Amc[]>(`${this.environment.apiUrl}/Amc`);
  }

  getById(id: string) {
    return this.http.get<Amc>(`${this.environment.apiUrl}/amc/${id}`);
  }


  searchByKeyword(SerialNo: StringMap, siteId: string) {
    return this.http.get(`${this.environment.apiUrl}/amc/SerialNo/${SerialNo}/${siteId}`);
  }

  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/amc/${id}`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/Amc/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }

  InsInAMCExists(amc) {
    return this.http.post(`${this.environment.apiUrl}/Amc/InsInAMCExists`, amc);
  }
}
