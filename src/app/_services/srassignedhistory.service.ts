import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { tickersAssignedHistory } from '../_models';
import { EnvService } from './env/env.service';

@Injectable({ providedIn: 'root' })
export class SRAssignedHistoryService {
  constructor(
    private router: Router,
    private environment: EnvService,
    private http: HttpClient
  ) {
  }

  save(ticket: tickersAssignedHistory) {
    return this.http.post(`${this.environment.apiUrl}/SRAssignedHistories`, ticket);
  }

  getAll() {
    return this.http.get<tickersAssignedHistory[]>(`${this.environment.apiUrl}/SRAssignedHistories`);
  }

  getById(id: string) {
    return this.http.get<tickersAssignedHistory>(`${this.environment.apiUrl}/SRAssignedHistories/${id}`);
  }
  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/SRAssignedHistories/${id}`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/SRAssignedHistories/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }

}
