import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { actionList } from '../_models';

@Injectable({ providedIn: 'root' })
export class EngActionService {
    constructor(
        private router: Router,
        private http: HttpClient
    ) {
    }

  save(action: actionList) {
    return this.http.post(`${environment.apiUrl}/SREngineerActions`, action);
    }

  getAll() {
    return this.http.get<actionList[]>(`${environment.apiUrl}/SREngineerActions`);
    }

  getById(id: string) {
    return this.http.get<actionList>(`${environment.apiUrl}/SREngineerActions/${id}`);
    }
    update(id, params) {
      return this.http.put(`${environment.apiUrl}/SREngineerActions/${id}`, params)
            .pipe(map(x => {
                return x;
            }));
    }

    delete(id: string) {
      return this.http.delete(`${environment.apiUrl}/SREngineerActions/${id}`)
            .pipe(map(x => {
                return x;
            }));
    }

}
