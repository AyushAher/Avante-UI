import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})
export class DistributordashboardService {

  constructor(private http: HttpClient, private environment: EnvService,) { }


  GetInstrumentInstalled() {
    return this.http.get(`${this.environment.apiUrl}/DistributorDashboard/GetInstrumentInstalled`)
  }

  RevenueFromCustomer() {
    return this.http.get(`${this.environment.apiUrl}/DistributorDashboard/RevenueFromCustomer`)
  }

  ServiceContractRevenue() {
    return this.http.get(`${this.environment.apiUrl}/DistributorDashboard/ServiceContractRevenue`)
  }


}
