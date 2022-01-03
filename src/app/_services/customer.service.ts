import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Customer } from '../_models';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private distrubutorSubject: BehaviorSubject<Customer>;
  public distributor: Observable<Customer>;

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



  save(customer: Customer) {
    return this.http.post(`${environment.apiUrl}/Customer`, customer);
    }

    getAll() {
      return this.http.get<Customer[]>(`${environment.apiUrl}/Customer`);
    }
    getAllByConId(conId) {
      return this.http.get<Customer[]>(`${environment.apiUrl}/Customer/GetByConId/${conId}`);
    }

    getById(id: string) {
      return this.http.get<Customer>(`${environment.apiUrl}/Customer/${id}`);
  }

  getallcontact(id: string) {
    return this.http.get<Customer>(`${environment.apiUrl}/Customer/GetCustomerSiteContacts/${id}`);
  }

    update(id, params) {
      return this.http.put(`${environment.apiUrl}/Customer`, params)
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
      return this.http.delete(`${environment.apiUrl}/Customer/${id}`)
            .pipe(map(x => {
                //// auto logout if the logged in user deleted their own record
                //if (id == this.userValue.id) {
                //    this.logout();
                //}
                return x;
            }));
    }
}
