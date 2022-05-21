import {Injectable} from '@angular/core';
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {map} from "rxjs/operators";
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})
export class CustdashboardsettingsService {


  constructor(
    private router: Router,
    private http: HttpClient,
    private environment: EnvService,
  ) {
  }


  save(settings) {
    return this.http.post(`${this.environment.apiUrl}/CustDashboardSettings`, settings);
  }

  reset(id, code) {
    return this.http.get(`${this.environment.apiUrl}/CustDashboardSettings/reset/${code}/${id}`);
  }

  getAll() {
    return this.http.get(`${this.environment.apiUrl}/CustDashboardSettings`);
  }

  getById(id: string) {
    return this.http.get(`${this.environment.apiUrl}/CustDashboardSettings/${id}`);
  }

  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/CustDashboardSettings/${id}`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/CustDashboardSettings/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }

}
