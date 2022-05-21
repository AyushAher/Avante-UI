import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Contact } from '../_models';
import { EnvService } from './env/env.service';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private ContactSubject: BehaviorSubject<Contact>;
  public contact: Observable<Contact>;

    constructor(
        private router: Router,
        private environment: EnvService,
        private http: HttpClient
    ) {
      //this.distrubutorSubject = new BehaviorSubject<Distributor>();
      //this.user = this.distrubutorSubject.asObservable();
    }

    //public get userValue(): User {
    //    return this.userSubject.value;
    //}

  

  save(contact: Contact) {
    return this.http.post(`${this.environment.apiUrl}/Contacts`, contact);
  }

  getAll() {
      return this.http.get<Contact[]>(`${this.environment.apiUrl}/Contacts`);
  }

  
  getCustomerSiteByContact(id: string) {
    return this.http.get<Contact[]>(`${this.environment.apiUrl}/Contacts/GetCustomerSiteByContact/${id}`);
  }
  getDistByContact(id: string) {
    return this.http.get<Contact[]>(`${this.environment.apiUrl}/Contacts/GetDistributorByContact/${id}`);
  }

  getById(id: string) {
    return this.http.get<Contact>(`${this.environment.apiUrl}/Contacts/${id}`);
  }

    update(id, params) {
      return this.http.put(`${this.environment.apiUrl}/Contacts/`, params)
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
      return this.http.delete(`${this.environment.apiUrl}/Contacts/${id}`)
            .pipe(map(x => {
                //// auto logout if the logged in user deleted their own record
                //if (id == this.userValue.id) {
                //    this.logout();
                //}
                return x;
            }));
    }
}
