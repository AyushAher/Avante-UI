import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { workTime } from '../_models';
import { EnvService } from './env/env.service';

@Injectable({ providedIn: 'root' })
export class worktimeService {
  private engcommentSubject: BehaviorSubject<workTime>;
  public engcomment: Observable<workTime>;

  constructor(
    private router: Router,
    private http: HttpClient,
    private environment: EnvService,
  ) {
  }



  save(worktime: workTime) {
    return this.http.post(`${this.environment.apiUrl}/SRPEngineerWorkTimes`, worktime);
  }

  getAll() {
    return this.http.get<workTime[]>(`${this.environment.apiUrl}/SRPEngineerWorkTimes`);
  }

  getById(id: string) {
    return this.http.get<workTime>(`${this.environment.apiUrl}/SRPEngineerWorkTimes/${id}`);
  }


  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/SRPEngineerWorkTimes/${id}`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/SRPEngineerWorkTimes/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }

}
