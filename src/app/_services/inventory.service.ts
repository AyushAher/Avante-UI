import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { custSPInventory } from '../_models';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private engcommentSubject: BehaviorSubject<custSPInventory>;
  public engcomment: Observable<custSPInventory>;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
    }

  

  save(workdone: custSPInventory) {
    return this.http.post(`${environment.apiUrl}/CustSPInventory`, workdone);
    }

  getAll() {
    return this.http.get<custSPInventory[]>(`${environment.apiUrl}/CustSPInventory`);
    }

  getById(id: string) {
    return this.http.get<custSPInventory>(`${environment.apiUrl}/CustSPInventory/${id}`);
    }

 
    update(id, params) {
      return this.http.put(`${environment.apiUrl}/CustSPInventory/${id}`, params)
            .pipe(map(x => {
                return x;
            }));
    }

    delete(id: string) {
      return this.http.delete(`${environment.apiUrl}/CustSPInventory/${id}`)
            .pipe(map(x => {
                return x;
            }));
    }

}
