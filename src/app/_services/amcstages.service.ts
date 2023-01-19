import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})
export class AmcstagesService {

  constructor(private http: HttpClient, private environment: EnvService,) { }

  save(AMCStages) {
    return this.http.post(`${this.environment.apiUrl}/AMCStages`, AMCStages);
  }

  getAll(id) {
    return this.http.get(`${this.environment.apiUrl}/AMCStages/${id}`);
  }

  getById(id: string) {
    return this.http.get(
      `${this.environment.apiUrl}/AMCStages/getprocess/${id}`
    );
  }

  update(params) {
    return this.http
      .put(`${this.environment.apiUrl}/AMCStages/${params.id}`, params)
      .pipe(
        map((x) => {
          return x;
        })
      );
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/AMCStages/${id}`).pipe(
      map((x) => {
        return x;
      })
    );
  }

}
