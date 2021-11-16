import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { tickersAssignedHistory } from '../_models';

@Injectable({ providedIn: 'root' })
export class SRAssignedHistoryService {
    constructor(
        private router: Router,
        private http: HttpClient
    ) {
    }

  save(ticket: tickersAssignedHistory) {
    return this.http.post(`${environment.apiUrl}/SRAssignedHistories`, ticket);
    }

  getAll() {
    return this.http.get<tickersAssignedHistory[]>(`${environment.apiUrl}/SRAssignedHistories`);
    }

  getById(id: string) {
    return this.http.get<tickersAssignedHistory>(`${environment.apiUrl}/SRAssignedHistories/${id}`);
    }
    update(id, params) {
      return this.http.put(`${environment.apiUrl}/SRAssignedHistories/${id}`, params)
            .pipe(map(x => {
                return x;
            }));
    }

    delete(id: string) {
      return this.http.delete(`${environment.apiUrl}/SRAssignedHistories/${id}`)
            .pipe(map(x => {
                return x;
            }));
    }

}
