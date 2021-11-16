import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { workDone } from '../_models';

@Injectable({ providedIn: 'root' })
export class workdoneService {
  private engcommentSubject: BehaviorSubject<workDone>;
  public engcomment: Observable<workDone>;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
    }

  

  save(workdone: workDone) {
    return this.http.post(`${environment.apiUrl}/SRPEngineerWorkDone`, workdone);
    }

  getAll() {
    return this.http.get<workDone[]>(`${environment.apiUrl}/SRPEngineerWorkDone`);
    }

  getById(id: string) {
    return this.http.get<workDone>(`${environment.apiUrl}/SRPEngineerWorkDone/${id}`);
    }

 
    update(id, params) {
      return this.http.put(`${environment.apiUrl}/SRPEngineerWorkDone/${id}`, params)
            .pipe(map(x => {
                return x;
            }));
    }

    delete(id: string) {
      return this.http.delete(`${environment.apiUrl}/SRPEngineerWorkDone/${id}`)
            .pipe(map(x => {
                return x;
            }));
    }

}
