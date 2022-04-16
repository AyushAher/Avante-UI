import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AmcstagesService {

  constructor(private http: HttpClient) { }
  
  save(AMCStages) {
    return this.http.post(`${environment.apiUrl}/AMCStages`, AMCStages);
  }

  getAll(id) {
    return this.http.get(`${environment.apiUrl}/AMCStages/${id}`);
  }

  getById(id: string) {
    return this.http.get(
      `${environment.apiUrl}/AMCStages/getprocess/${id}`
    );
  }

  update(params) {
    return this.http
      .put(`${environment.apiUrl}/AMCStages`, params)
      .pipe(
        map((x) => {
          return x;
        })
      );
  }

  delete(id: string) {
    return this.http.delete(`${environment.apiUrl}/AMCStages/${id}`).pipe(
      map((x) => {
        return x;
      })
    );
  }

}
