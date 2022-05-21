import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { actionList } from '../_models';
import { EnvService } from './env/env.service';

@Injectable({ providedIn: 'root' })
export class EngActionService {
  constructor(
    private router: Router,
    private http: HttpClient,
    private environment: EnvService,
  ) {
  }

  save(action: actionList) {
    return this.http.post(`${this.environment.apiUrl}/SREngineerActions`, action);
  }

  getAll() {
    return this.http.get<actionList[]>(`${this.environment.apiUrl}/SREngineerActions`);
  }

  getById(id: string) {
    return this.http.get<actionList>(`${this.environment.apiUrl}/SREngineerActions/${id}`);
  }
  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/SREngineerActions/${id}`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/SREngineerActions/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }

}
