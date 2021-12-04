import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { ServiceRequest } from '../_models';

@Injectable({ providedIn: 'root' })
export class ServiceRequestService {
  private serviceRequestSubject: BehaviorSubject<ServiceRequest>;
  public serviceRequest: Observable<ServiceRequest>;

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



  save(serviceRequest: ServiceRequest) {
    return this.http.post(`${environment.apiUrl}/serviceRequest`, serviceRequest);
    }

    getAll() {
      return this.http.get<ServiceRequest[]>(`${environment.apiUrl}/serviceRequest`);
    }

    getById(id: string) {
      return this.http.get<ServiceRequest>(`${environment.apiUrl}/serviceRequest/${id}`);
    }
  //GetSerReqNo
  getSerReqNo() {
    return this.http.get<ServiceRequest>(`${environment.apiUrl}/serviceRequest/GetSerReqNo`);
  }
  GetServiceRequestByDist(id: string) {
    return this.http.get<ServiceRequest>(`${environment.apiUrl}/ServiceRequest/GetServiceRequestByDist/${id}`);
  }


  searchByKeyword(param: string, custSiteId: string) {
    param = param == "" ? "undefined" : param;
    return this.http.get<ServiceRequest[]>(`${environment.apiUrl}/serviceRequest/GetInstrumentBySerialNo/${param}/${custSiteId}`);
  }

    update(id, params) {
      return this.http.put(`${environment.apiUrl}/serviceRequest`, params)
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
    updateIsAccepted(id, params) {
      return this.http.put(`${environment.apiUrl}/serviceRequest/accepted`, params)
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
      return this.http.delete(`${environment.apiUrl}/serviceRequest/${id}`)
            .pipe(map(x => {
                //// auto logout if the logged in user deleted their own record
                //if (id == this.userValue.id) {
                //    this.logout();
                //}
                return x;
            }));
    }

  deleteConfig(deleteConfig: ServiceRequest) {
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
