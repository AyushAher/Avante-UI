import {Injectable} from '@angular/core';
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class CustdashboardsettingsService {


  constructor(
    private router: Router,
    private http: HttpClient
  ) {
  }


  save(settings) {
    return this.http.post(`${environment.apiUrl}/CustDashboardSettings`, settings);
  }

  getAll() {
    return this.http.get(`${environment.apiUrl}/CustDashboardSettings`);
  }

  getById(id: string) {
    return this.http.get(`${environment.apiUrl}/CustDashboardSettings/${id}`);
  }

  update(id, params) {
    return this.http.put(`${environment.apiUrl}/CustDashboardSettings/${id}`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${environment.apiUrl}/CustDashboardSettings/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }

}
