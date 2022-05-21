import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { sparePartsConsume } from '../_models';
import { EnvService } from './env/env.service';

@Injectable({ providedIn: 'root' })
export class SrConsumedService {
  private engcommentSubject: BehaviorSubject<sparePartsConsume>;
  public engcomment: Observable<sparePartsConsume>;

  constructor(
    private router: Router,
    private environment: EnvService,
    private http: HttpClient
  ) {
  }



  save(sprecon: sparePartsConsume) {
    return this.http.post(`${this.environment.apiUrl}/SparePartsConsumed`, sprecon);
  }

  getAll() {
    return this.http.get<sparePartsConsume[]>(`${this.environment.apiUrl}/SparePartsConsumed`);
  }

  getById(id: string) {
    return this.http.get<sparePartsConsume>(`${this.environment.apiUrl}/SparePartsConsumed/${id}`);
  }


  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/SparePartsConsumed/${id}`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/SparePartsConsumed/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }

}
