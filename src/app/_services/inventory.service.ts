import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { custSPInventory } from '../_models';
import { EnvService } from './env/env.service';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private engcommentSubject: BehaviorSubject<custSPInventory>;
  public engcomment: Observable<custSPInventory>;

  constructor(
    private router: Router,
    private http: HttpClient,
    private environment: EnvService,
  ) {
  }



  save(workdone: custSPInventory) {
    return this.http.post(`${this.environment.apiUrl}/CustSPInventory`, workdone);
  }

  getAll() {
    return this.http.get<custSPInventory[]>(`${this.environment.apiUrl}/CustSPInventory`);
  }

  getById(id: string) {
    return this.http.get<custSPInventory>(`${this.environment.apiUrl}/CustSPInventory/${id}`);
  }


  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/CustSPInventory/${id}`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/CustSPInventory/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }

}
