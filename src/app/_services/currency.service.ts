import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Currency } from '../_models';
import { EnvService } from './env/env.service';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private CurrencySubject: BehaviorSubject<Currency>;
  public currency: Observable<Currency>;

    constructor(
        private router: Router,
        private http: HttpClient,
        private environment: EnvService,
    ) {
    }

  

  save(currency: Currency) {
    return this.http.post(`${this.environment.apiUrl}/Currency`, currency);
    }

    getAll() {
      return this.http.get<Currency[]>(`${this.environment.apiUrl}/Currency`);
    }

    getById(id: string) {
      return this.http.get<Currency>(`${this.environment.apiUrl}/Currency/${id}`);
    }

    update(id, params) {
      return this.http.put(`${this.environment.apiUrl}/Currency/${id}`, params)
            .pipe(map(x => {
                return x;
            }));
    }

    delete(id: string) {
      return this.http.delete(`${this.environment.apiUrl}/Currency/${id}`)
            .pipe(map(x => {
                return x;
            }));
  }



}
