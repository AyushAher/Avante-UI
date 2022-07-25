import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})
export class EngdashboardService {

  constructor(
    private http: HttpClient,
    private environment: EnvService
  ) { }


  GetCompSerReq(date: string) {
    return this.http.get(`${this.environment.apiUrl}/EngDashboard/GetSerReq/${date}`)
  }

  GetSPCon(date: string) {
    return this.http.get(`${this.environment.apiUrl}/EngDashboard/GetSPCon/${date}`)
  }

  GetSPRecomm(date: string) {
    return this.http.get(`${this.environment.apiUrl}/EngDashboard/GetSPRecomm/${date}`)
  }
  
  GetTravelExpenses(date: string) {
    return this.http.get(`${this.environment.apiUrl}/EngDashboard/GetTravelExpenses/${date}`)
  }
}
