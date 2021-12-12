import {Injectable} from '@angular/core';
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {ConfigTypeValue} from "../_models";
import {environment} from "../../environments/environment";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class PreventivemaintenancesService {
  constructor(
    private router: Router,
    private http: HttpClient
  ) {
  }

  save(config: any) {
    return this.http.post(`${environment.apiUrl}/PreventiveMaintenances`, config);
  }

  getById(id: string) {
    return this.http.get<any>(`${environment.apiUrl}/PreventiveMaintenances/${id}`);
  }

  update(id, params) {
    return this.http.put(`${environment.apiUrl}/PreventiveMaintenances/${id}`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${environment.apiUrl}/PreventiveMaintenances/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }


}

