import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DistributordashboardService {

  constructor(private http: HttpClient) { }


  GetInstrumentInstalled() {
    return this.http.get(`${environment.apiUrl}/DistributorDashboard/GetInstrumentInstalled`)
  }

  RevenueFromCustomer() {
    return this.http.get(`${environment.apiUrl}/DistributorDashboard/RevenueFromCustomer`)
  }

  ServiceContractRevenue() {
    return this.http.get(`${environment.apiUrl}/DistributorDashboard/ServiceContractRevenue`)
  }


}
