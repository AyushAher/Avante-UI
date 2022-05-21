import {Injectable} from '@angular/core';
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {ConfigTypeValue} from "../_models";
import {map} from "rxjs/operators";
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})

export class PrevchklocpartelementService {

  constructor(
    private router: Router,
    private environment: EnvService,
    private http: HttpClient
  ) {
  }

  save(config: ConfigTypeValue) {
    return this.http.post(`${this.environment.apiUrl}/PrevChkLocPartElements`, config);
  }

  getAll() {
    return this.http.get<ConfigTypeValue[]>(`${this.environment.apiUrl}/PrevChkLocPartElements`);
  }

  getListById(id: string) {
    return this.http.get<ConfigTypeValue>(`${this.environment.apiUrl}/PrevChkLocPartElements/PrevChkLocPartElementByLTItemId/${id}`);
  }

  getById(id: string) {
    return this.http.get<ConfigTypeValue>(`${this.environment.apiUrl}/PrevChkLocPartElements/${id}`);
  }

  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/PrevChkLocPartElements`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/PrevChkLocPartElements/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }


}
