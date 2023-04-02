import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Distributor } from '../_models';
import { DistributorRegionContacts } from "../_models/distributorregioncontacts";
import { EnvService } from './env/env.service';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class DistributorService {
  private distrubutorSubject: BehaviorSubject<Distributor>;
  public distributor: Observable<Distributor>;

  constructor(
    private router: Router,
    private environment: EnvService,
    private notificationService: NotificationService,
    private http: HttpClient
  ) {
    //this.distrubutorSubject = new BehaviorSubject<Distributor>();
    //this.user = this.distrubutorSubject.asObservable();
  }

  //public get userValue(): User {
  //    return this.userSubject.value;
  //}


  SaveDistributor() {
    var value = JSON.parse(sessionStorage.getItem('distributor'));
    this.save(value).subscribe((data: any) => {
      if (data.result) {
        this.notificationService.showSuccess(data.resultMessage, "Success");
      }
      else {
        this.notificationService.showInfo(data.resultMessage, "Info");
      }
    });
  }

  save(distributor: Distributor) {
    return this.http.post(`${this.environment.apiUrl}/Distributors`, distributor);
  }

  getengineername(id: string) {
    return this.http.get<DistributorRegionContacts>(
      ` ${this.environment.apiUrl}/distributors/GetDistributorRegionContacts/${id}`
    );
  }

  getAll() {
    return this.http.get<Distributor[]>(`${this.environment.apiUrl}/Distributors`);
  }

  getById(id: string) {
    return this.http.get<Distributor>(`${this.environment.apiUrl}/Distributors/${id}`);
  }

  getByConId(id: string) {
    return this.http.get<Distributor>(`${this.environment.apiUrl}/Distributors/getbyconid/${id}`);
  }

  //GetDistributorRegionContacts
  getDistributorRegionContacts(id: string) {
    return this.http.get<Distributor>(`${this.environment.apiUrl}/Distributors/GetDistributorRegionContacts/${id}`);
  }

  GetDistributorRegionContactsByContactId(id: string) {
    return this.http.get<Distributor>(`${this.environment.apiUrl}/Distributors/GetDistributorRegionContactsByContactId/${id}`);
  }

  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/Distributors/${id}`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  ImportData(data: any) {
    return this.http.post(`${this.environment.apiUrl}/Distributors/importdata`, data)
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/Distributors/${id}`)
      .pipe(map(x => {
        //// auto logout if the logged in user deleted their own record
        //if (id == this.userValue.id) {
        //    this.logout();
        //}
        return x;
      }));
  }
}
