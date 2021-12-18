import {Injectable} from '@angular/core';
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class EngschedulerService {

  constructor(private router: Router, private http: HttpClient) {
  }

  save(EngSchedulers: any) {
    return this.http.post(`${environment.apiUrl}/EngSchedulers`, EngSchedulers);
  }

  getAll() {
    return this.http.get(`${environment.apiUrl}/EngSchedulers`);
  }

  getById(id: string) {
    return this.http.get(
      `${environment.apiUrl}/EngSchedulers/${id}`
    );
  }

  getByEngId(id: string) {
    return this.http.get(
      `${environment.apiUrl}/EngSchedulers/engid/${id}`
    );
  }

  update(id, params) {
    return this.http
      .put(`${environment.apiUrl}/EngSchedulers/${id}`, params)
      .pipe(
        map((x) => {
          return x;
        })
      );
  }

  delete(id: string) {
    return this.http.delete(`${environment.apiUrl}/EngSchedulers/${id}`).pipe(
      map((x) => {
        return x;
      })
    );
  }

}
