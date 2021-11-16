import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { ConfigTypeValue } from '../_models';

@Injectable({ providedIn: 'root' })
export class ConfigTypeValueService {
  private CurrencySubject: BehaviorSubject<ConfigTypeValue>;
  public currency: Observable<ConfigTypeValue>;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
    }

  save(config: ConfigTypeValue) {
    return this.http.post(`${environment.apiUrl}/ConfigTypeValues`, config);
    }

  getAll() {
    return this.http.get<ConfigTypeValue[]>(`${environment.apiUrl}/ConfigTypeValues`);
    }

  getById(id: string) {
    return this.http.get<ConfigTypeValue>(`${environment.apiUrl}/ConfigTypeValues/GetConfigValuesByLTItemId/${id}`);
    }

    update(id, params) {
      return this.http.put(`${environment.apiUrl}/ConfigTypeValues`, params)
            .pipe(map(x => {
                return x;
            }));
    }

    delete(id: string) {
      return this.http.delete(`${environment.apiUrl}/ConfigTypeValues/${id}`)
            .pipe(map(x => {
                return x;
            }));
  }



}
