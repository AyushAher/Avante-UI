import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Country } from '../_models';
import { EnvService } from './env/env.service';

@Injectable({ providedIn: 'root' })
export class CountryService {
  private ContactSubject: BehaviorSubject<Country>;
  public contact: Observable<Country>;

    constructor(
        private router: Router,
        private http: HttpClient,
        private environment: EnvService,

    ) {
    }

  save(contact: Country) {
    return this.http.post(`${this.environment.apiUrl}/Country`, contact);
    }

    getAll() {
      return this.http.get<Country[]>(`${this.environment.apiUrl}/Country`);
    }

    getById(id: string) {
      return this.http.get<Country>(`${this.environment.apiUrl}/Country/${id}`);
    }

    update(id, params) {
      return this.http.put(`${this.environment.apiUrl}/Country/${id}`, params)
            .pipe(map(x => {
                return x;
            }));
    }

    delete(id: string) {
      return this.http.delete(`${this.environment.apiUrl}/Country/${id}`)
            .pipe(map(x => {
                return x;
            }));
    }
}
