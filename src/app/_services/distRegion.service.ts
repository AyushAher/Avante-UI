import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { DistributorRegion } from '../_models';

@Injectable({ providedIn: 'root' })
export class DistributorRegionService {
  private distrubutorSubject: BehaviorSubject<DistributorRegion>;
  public distributor: Observable<DistributorRegion>;

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

  

  save(distributor: DistributorRegion) {
    return this.http.post(`${environment.apiUrl}/DistRegions`, distributor);
    }

    getAll() {
      return this.http.get<DistributorRegion[]>(`${environment.apiUrl}/DistRegions`);
    }

    getById(id: string) {
      return this.http.get<DistributorRegion>(`${environment.apiUrl}/DistRegions/${id}`);
    }

  getDistByCustomerId(id: string) {
    return this.http.get<DistributorRegion[]>(`${environment.apiUrl}/Site/GetDistRegionsByCustomer/${id}`);
  }

    update(id, params) {
      return this.http.put(`${environment.apiUrl}/DistRegions/${id}`, params)
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
      return this.http.delete(`${environment.apiUrl}/DistRegions/${id}`)
            .pipe(map(x => {
                //// auto logout if the logged in user deleted their own record
                //if (id == this.userValue.id) {
                //    this.logout();
                //}
                return x;
            }));
    }
}
