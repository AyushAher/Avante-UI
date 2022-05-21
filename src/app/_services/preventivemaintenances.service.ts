import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { ConfigTypeValue } from "../_models";
import { map } from "rxjs/operators";
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})
export class PreventivemaintenancesService {
  constructor(
    private router: Router,
    private http: HttpClient,
    private environment: EnvService,
  ) {
  }

  save(config: any) {
    return this.http.post(`${this.environment.apiUrl}/PreventiveMaintenances`, config);
  }

  getById(id: string) {
    return this.http.get<any>(`${this.environment.apiUrl}/PreventiveMaintenances/${id}`);
  }

  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/PreventiveMaintenances/${id}`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/PreventiveMaintenances/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }


}

