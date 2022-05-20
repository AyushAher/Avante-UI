import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Amc } from '../_models';
import { VW_Contacts } from '../_models/customerdashboard';

@Injectable({
  providedIn: 'root'
})
export class CustomerdashboardService {

  private vW_ContactsSubject: BehaviorSubject<Amc>;
  public vW_Contacts: Observable<Amc>;

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }

  getCustomerByContactId(id: string) {
    return this.http.get<VW_Contacts>(`${environment.apiUrl}/CustomerDashboard/GetCustomerByContactId/${id}`);
  }

  GetCostData() {
    return this.http.get(`${environment.apiUrl}/CustomerDashboard/GetCostData`);
  }

  GetCostOfOwnerShip() {
    return this.http.get(`${environment.apiUrl}/CustomerDashboard/GetCostOfOwnerShip`);
  }

}
