import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { po } from '../_models';

@Injectable({ providedIn: 'root' })
export class POService {
  private poSubject: BehaviorSubject<po>;
  public po: Observable<po>;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
      //this.distrubutorSubject = new BehaviorSubject<Distributor>();
      //this.user = this.distrubutorSubject.asObservable();
    }

    //public get userValue(): User {
    //    return this.userSubject.value;
    //}

  

  save(po: po) {
    return this.http.post(`${environment.apiUrl}/po`, po);
    }

    getAll() {
      return this.http.get<po[]>(`${environment.apiUrl}/po`);
    }

    getById(id: string) {
      return this.http.get<po>(`${environment.apiUrl}/po/${id}`);
    }

  searchByKeyword(param: string, custSiteId: string) {
    param = param == "" ? "undefined" : param;
    return this.http.get<po[]>(`${environment.apiUrl}/po/GetInstrumentBySerialNo/${param}/${custSiteId}`);
  }

    update(id, params) {
      return this.http.put(`${environment.apiUrl}/po`, params)
            .pipe(map(x => {
              // update stored user if the logged in user updated their own record
              //if (id == this.distributor.id) {
              //      // update local storage
              //      const user = { ...this.userValue, ...params };
              //      localStorage.setItem('user', JSON.stringify(user));

              //      // publish updated user to subscribers
              //      this.userSubject.next(user);
              //  }
                return x;
            }));
    }

    delete(id: string) {
      return this.http.delete(`${environment.apiUrl}/po/${id}`)
            .pipe(map(x => {
                //// auto logout if the logged in user deleted their own record
                //if (id == this.userValue.id) {
                //    this.logout();
                //}
                return x;
            }));
    }

  deleteConfig(deleteConfig: po) {
    return this.http.post(`${environment.apiUrl}/Instrumentconfig/RemoveInsConfigType`, deleteConfig)
      //.pipe(map(x => {
      //  //// auto logout if the logged in user deleted their own record
      //  //if (id == this.userValue.id) {
      //  //    this.logout();
      //  //}
      //  return x;
      //}));
  }

}
