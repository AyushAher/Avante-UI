import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { requestPO } from '../_models';
import { EnvService } from './env/env.service';

@Injectable({ providedIn: 'root' })
export class requestpoService {
  private requestpoSubject: BehaviorSubject<requestPO>;
  public requestpo: Observable<requestPO>;

  constructor(
    private router: Router,
    private http: HttpClient,
    private environment: EnvService,
  ) {
    //this.distrubutorSubject = new BehaviorSubject<Distributor>();
    //this.user = this.distrubutorSubject.asObservable();
  }

  //public get userValue(): User {
  //    return this.userSubject.value;
  //}



  save(requestpo: requestPO) {
    return this.http.post(`${this.environment.apiUrl}/requestpo`, requestpo);
  }

  getAll() {
    return this.http.get<requestPO[]>(`${this.environment.apiUrl}/requestpo`);
  }

  getById(id: string) {
    return this.http.get<requestPO>(`${this.environment.apiUrl}/requestpo/${id}`);
  }

  searchByKeyword(param: string, custSiteId: string) {
    param = param == "" ? "undefined" : param;
    return this.http.get<requestPO[]>(`${this.environment.apiUrl}/requestpo/GetInstrumentBySerialNo/${param}/${custSiteId}`);
  }

  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/requestpo`, params)
      .pipe(map(x => {
        // update stored user if the logged in user updated their own record
        //if (id == this.distributor.id) {
        //      // update local storage
        //      const user = { ...this.userValue, ...params };
        //      sessionStorage.setItem('user', JSON.stringify(user));

        //      // publish updated user to subscribers
        //      this.userSubject.next(user);
        //  }
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/requestpo/${id}`)
      .pipe(map(x => {
        //// auto logout if the logged in user deleted their own record
        //if (id == this.userValue.id) {
        //    this.logout();
        //}
        return x;
      }));
  }

}
