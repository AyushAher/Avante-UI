import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ConfigTypeValue } from '../_models';
import { EnvService } from './env/env.service';

@Injectable({ providedIn: 'root' })
export class ConfigTypeValueService {
  private CurrencySubject: BehaviorSubject<ConfigTypeValue>;
  public currency: Observable<ConfigTypeValue>;

  constructor(
    private router: Router,
    private http: HttpClient,
    private environment: EnvService,
  ) {
  }

  save(config: ConfigTypeValue) {
    return this.http.post(`${this.environment.apiUrl}/ConfigTypeValues`, config);
  }

  getAll() {
    return this.http.get<ConfigTypeValue[]>(`${this.environment.apiUrl}/ConfigTypeValues`);
  }

  getById(id: string) {
    return this.http.get<ConfigTypeValue>(`${this.environment.apiUrl}/ConfigTypeValues/GetConfigValuesByLTItemId/${id}`);
  }

  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/ConfigTypeValues`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/ConfigTypeValues/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }



}
