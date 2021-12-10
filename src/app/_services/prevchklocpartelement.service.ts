import {Injectable} from '@angular/core';
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {ConfigTypeValue} from "../_models";
import {environment} from "../../environments/environment";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})

export class PrevchklocpartelementService {

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
  }

  save(config: ConfigTypeValue) {
    return this.http.post(`${environment.apiUrl}/PrevChkLocPartElements`, config);
  }

  getAll() {
    return this.http.get<ConfigTypeValue[]>(`${environment.apiUrl}/PrevChkLocPartElements`);
  }

  getById(id: string) {
    return this.http.get<ConfigTypeValue>(`${environment.apiUrl}/PrevChkLocPartElements/GetConfigValuesByLTItemId/${id}`);
  }

  update(id, params) {
    return this.http.put(`${environment.apiUrl}/PrevChkLocPartElements`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${environment.apiUrl}/PrevChkLocPartElements/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }


}
