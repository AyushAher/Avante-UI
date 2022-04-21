import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {environment} from '../../environments/environment';
import {Instrument, instrumentConfig} from '../_models';

@Injectable({providedIn: 'root'})
export class InstrumentService {
  private distrubutorSubject: BehaviorSubject<Instrument>;
  public distributor: Observable<Instrument>;

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


  save(instrument: Instrument) {
    return this.http.post(`${environment.apiUrl}/Instrument`, instrument);
  }

  getAll(userId: string) {
    return this.http.get<Instrument[]>(`${environment.apiUrl}/Instrument/GetByAssignedRegions/${userId}`);
  }


  getInstrumentConfif(insId: string) {
    return this.http.get(`${environment.apiUrl}/Instrumentconfig/GetByInstrument/${insId}`);
  }

  getById(id: string) {
    return this.http.get<Instrument>(`${environment.apiUrl}/Instrument/${id}`);
  }

  getSerReqInstrument(id: string) {
    return this.http.get<Instrument>(`${environment.apiUrl}/Instrument/GetSerReqInstrument/${id}`);
  }

  getinstubysiteIds(id: string) {
    return this.http.get<Instrument>(`${environment.apiUrl}/Instrument/GetSiteInstruments/${id}`);
  }

  searchByKeyword(param: string, custSiteId: string) {
    param = param == "" ? "undefined" : param;
    return this.http.get<Instrument[]>(`${environment.apiUrl}/Instrument/GetInstrumentBySerialNo/${param}/${custSiteId}`);
  }

    update(id, params) {
      return this.http.put(`${environment.apiUrl}/Instrument`, params)
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
      return this.http.delete(`${environment.apiUrl}/Instrument/${id}`)
            .pipe(map(x => {
                //// auto logout if the logged in user deleted their own record
                //if (id == this.userValue.id) {
                //    this.logout();
                //}
                return x;
            }));
    }

  deleteConfig(deleteConfig: instrumentConfig) {
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
