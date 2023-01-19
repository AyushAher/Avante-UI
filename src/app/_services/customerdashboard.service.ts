import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Amc } from '../_models';
import { VW_Contacts } from '../_models/customerdashboard';
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerdashboardService {

  private vW_ContactsSubject: BehaviorSubject<Amc>;
  public vW_Contacts: Observable<Amc>;

  constructor(
    private router: Router,
    private http: HttpClient,
    private environment: EnvService,

  ) { }

  GetCostData({ sdate, edate }) {
    return this.http.post(`${this.environment.apiUrl}/CustomerDashboard/GetCostData`, { sdate, edate });
  }

  GetCostOfOwnerShip(insId: string) {
    return this.http.get(`${this.environment.apiUrl}/CustomerDashboard/GetCostOfOwnerShip/${insId}`);
  }

}
