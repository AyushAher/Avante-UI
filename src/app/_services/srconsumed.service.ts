import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { sparePartsConsume } from '../_models';

@Injectable({ providedIn: 'root' })
export class SrConsumedService {
  private engcommentSubject: BehaviorSubject<sparePartsConsume>;
  public engcomment: Observable<sparePartsConsume>;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
    }

  

  save(sprecon: sparePartsConsume) {
    return this.http.post(`${environment.apiUrl}/SparePartsConsumed`, sprecon);
    }

  getAll() {
    return this.http.get<sparePartsConsume[]>(`${environment.apiUrl}/SparePartsConsumed`);
    }

  getById(id: string) {
    return this.http.get<sparePartsConsume>(`${environment.apiUrl}/SparePartsConsumed/${id}`);
    }

 
    update(id, params) {
      return this.http.put(`${environment.apiUrl}/SparePartsConsumed/${id}`, params)
            .pipe(map(x => {
                return x;
            }));
    }

    delete(id: string) {
      return this.http.delete(`${environment.apiUrl}/SparePartsConsumed/${id}`)
            .pipe(map(x => {
                return x;
            }));
    }

}
