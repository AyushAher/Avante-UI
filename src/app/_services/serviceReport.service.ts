import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {environment} from '../../environments/environment';
import {ServiceReport} from '../_models';

@Injectable({providedIn: 'root'})
export class ServiceReportService {
  private ServiceReportSubject: BehaviorSubject<ServiceReport>;
  public ServiceReport: Observable<ServiceReport>;

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


  save(ServiceReport: ServiceReport) {
    return this.http.post(`${environment.apiUrl}/ServiceReports`, ServiceReport);
  }

  GenerateServciesReport(ServiceReport) {
    return this.http.post(`${environment.apiUrl}/ServiceReports/GenerateServiceReport`, ServiceReport);
  }

  getAll() {
    return this.http.get<ServiceReport[]>(`${environment.apiUrl}/ServiceReports`);
  }

  GetServiceReportByContId(id: string) {
    return this.http.get(`${environment.apiUrl}/ServiceReports/GetServiceReportByContId/${id}`);
  }

  getbycust(cust: string) {
    return this.http.get<ServiceReport[]>(`${environment.apiUrl}/ServiceReports/GetServiceReportByCustomer/${cust}`);
  }

  getById(id: string) {
    return this.http.get<ServiceReport>(`${environment.apiUrl}/ServiceReports/${id}`);
  }

  getView(id: string) {
    return this.http.get<ServiceReport>(`${environment.apiUrl}/VW_ServiceReport/${id}`);
  }

  searchByKeyword(param: string, custSiteId: string) {
    param = param == "" ? "undefined" : param;
    return this.http.get<ServiceReport[]>(`${environment.apiUrl}/ServiceReports/GetInstrumentBySerialNo/${param}/${custSiteId}`);
  }

    update(id, params) {
      return this.http.put(`${environment.apiUrl}/ServiceReports/${id}`, params)
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
      return this.http.delete(`${environment.apiUrl}/ServiceReports/${id}`)
            .pipe(map(x => {
                //// auto logout if the logged in user deleted their own record
                //if (id == this.userValue.id) {
                //    this.logout();
                //}
                return x;
            }));
    }

  deleteConfig(deleteConfig: ServiceReport) {
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
