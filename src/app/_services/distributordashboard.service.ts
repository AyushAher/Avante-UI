import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})
export class DistributordashboardService {

  constructor(private http: HttpClient, private environment: EnvService,) { }


  GetInstrumentInstalled({ distId, sdate, edate }) {
    return this.http.post(`${this.environment.apiUrl}/DistributorDashboard/GetInstrumentInstalled`, { distId, sdate, edate })
  }

  RevenueFromCustomer({ distId, sdate, edate }) {
    return this.http.post(`${this.environment.apiUrl}/DistributorDashboard/RevenueFromCustomer`, { distId, sdate, edate })
  }

  ServiceContractRevenue({ distId, sdate, edate }) {
    return this.http.post(`${this.environment.apiUrl}/DistributorDashboard/ServiceContractRevenue`, { distId, sdate, edate })
  }

  GetDistDashboardData({ distId, sdate, edate }) {
    return this.http.post(`${this.environment.apiUrl}/DistributorDashboard/GetDistDashboardData`, { sdate, edate, distId })
  }


}
