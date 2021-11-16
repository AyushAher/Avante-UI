import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Currency } from '../_models';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private CurrencySubject: BehaviorSubject<Currency>;
  public currency: Observable<Currency>;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
    }

  

  save(currency: Currency) {
    return this.http.post(`${environment.apiUrl}/Currency`, currency);
    }

    getAll() {
      return this.http.get<Currency[]>(`${environment.apiUrl}/Currency`);
    }

    getById(id: string) {
      return this.http.get<Currency>(`${environment.apiUrl}/Currency/${id}`);
    }

    update(id, params) {
      return this.http.put(`${environment.apiUrl}/Currency/${id}`, params)
            .pipe(map(x => {
                return x;
            }));
    }

    delete(id: string) {
      return this.http.delete(`${environment.apiUrl}/Currency/${id}`)
            .pipe(map(x => {
                return x;
            }));
  }



}
