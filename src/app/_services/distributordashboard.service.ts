import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})
export class DistributordashboardService {

  constructor(private http: HttpClient, private environment: EnvService,) { }


  GetInstrumentInstalled(date: string) {
    return this.http.get(`${this.environment.apiUrl}/DistributorDashboard/GetInstrumentInstalled/${date}`)
  }

  RevenueFromCustomer(date: string) {
    return this.http.get(`${this.environment.apiUrl}/DistributorDashboard/RevenueFromCustomer/${date}`)
  }

  ServiceContractRevenue(date: string) {
    return this.http.get(`${this.environment.apiUrl}/DistributorDashboard/ServiceContractRevenue/${date}`)
  }


}
