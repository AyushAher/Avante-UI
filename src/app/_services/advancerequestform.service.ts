import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdvancerequestformService {

  constructor(private http: HttpClient) { }


  save(model) {
    return this.http.post(`${environment.apiUrl}/AdvanceRequests`, model);
  }

  getAll() {
    return this.http.get(`${environment.apiUrl}/AdvanceRequests`);
  }

  getById(id: string) {
    return this.http.get(`${environment.apiUrl}/AdvanceRequests/${id}`);
  }

  update(id, params) {
    return this.http.put(`${environment.apiUrl}/AdvanceRequests/${id}`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${environment.apiUrl}/AdvanceRequests/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }
}
