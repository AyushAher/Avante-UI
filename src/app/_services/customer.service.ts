import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Customer } from '../_models';
import { EnvService } from './env/env.service';
import { NotificationService } from './notification.service';
import { ContactService } from './contact.service';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private distrubutorSubject: BehaviorSubject<Customer>;
  public distributor: Observable<Customer>;

  constructor(
    private router: Router,
    private http: HttpClient,
    private environment: EnvService,
    private notificationService: NotificationService,
    private contactService: ContactService
  ) {
    //this.distrubutorSubject = new BehaviorSubject<Distributor>();
    //this.user = this.distrubutorSubject.asObservable();
  }

  //public get userValue(): User {
  //    return this.userSubject.value;
  //}



  save(customer: Customer) {
    return this.http.post(`${this.environment.apiUrl}/Customer`, customer);
  }

  CheckCustomer(customer: Customer) {
    return this.http.post(`${this.environment.apiUrl}/Customer/CheckCustomer`, customer);
  }

  getAll() {
    return this.http.get<Customer[]>(`${this.environment.apiUrl}/Customer`);
  }
  getAllByConId(conId) {
    return this.http.get<Customer[]>(`${this.environment.apiUrl}/Customer/GetByConId/${conId}`);
  }

  getById(id: string) {
    return this.http.get<Customer>(`${this.environment.apiUrl}/Customer/${id}`);
  }

  getallcontact(id: string) {
    return this.http.get<Customer>(`${this.environment.apiUrl}/Customer/GetCustomerSiteContacts/${id}`);
  }


  importData(data: any) {
    return this.http.post(`${this.environment.apiUrl}/Customer/importdata/`, data);
  }

  SaveCustomer() {
    var customerdata = JSON.parse(sessionStorage.getItem('customer'));
    var customerContactdata = JSON.parse(sessionStorage.getItem('customerContact'));

    this.save(customerdata).subscribe((data: any) => {
      if (data.result) {
        this.contactService.save(customerContactdata)
          .subscribe((data: any) => {
            if (data.result) this.notificationService.showSuccess(data.resultMessage, "Success");
            else this.notificationService.showInfo(data.resultMessage, "Info");
          })

        this.notificationService.showSuccess(data.resultMessage, "Success");
      }
      else
        this.notificationService.showInfo(data.resultMessage, "info");

    });
  }

  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/Customer`, params)
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
    return this.http.delete(`${this.environment.apiUrl}/Customer/${id}`)
      .pipe(map(x => {
        //// auto logout if the logged in user deleted their own record
        //if (id == this.userValue.id) {
        //    this.logout();
        //}
        return x;
      }));
  }
}
