import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { workDone } from '../_models';
import { EnvService } from './env/env.service';

@Injectable({ providedIn: 'root' })
export class workdoneService {
  private engcommentSubject: BehaviorSubject<workDone>;
  public engcomment: Observable<workDone>;

  constructor(
    private router: Router,
    private http: HttpClient,
    private environment: EnvService,
  ) {
  }



  save(workdone: workDone) {
    return this.http.post(`${this.environment.apiUrl}/SRPEngineerWorkDone`, workdone);
  }

  getAll() {
    return this.http.get<workDone[]>(`${this.environment.apiUrl}/SRPEngineerWorkDone`);
  }

  getById(id: string) {
    return this.http.get<workDone>(`${this.environment.apiUrl}/SRPEngineerWorkDone/${id}`);
  }


  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/SRPEngineerWorkDone/${id}`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/SRPEngineerWorkDone/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }

}
