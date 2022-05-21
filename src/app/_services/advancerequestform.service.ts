import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})
export class AdvancerequestformService {

  constructor(
    private http: HttpClient,
    private environment: EnvService,
  ) { }


  save(model) {
    return this.http.post(`${this.environment.apiUrl}/AdvanceRequests`, model);
  }

  getAll() {
    return this.http.get(`${this.environment.apiUrl}/AdvanceRequests`);
  }

  getById(id: string) {
    return this.http.get(`${this.environment.apiUrl}/AdvanceRequests/${id}`);
  }

  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/AdvanceRequests/${id}`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/AdvanceRequests/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }
}
