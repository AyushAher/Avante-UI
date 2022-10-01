import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  constructor(
    private http: HttpClient,
    private environment: EnvService
  ) { }

  GetAllCompany = () => {
    return this.http.get(`${this.environment.apiUrl}/Company`)
  }

  Save = (data) => {
    return this.http.post(`${this.environment.apiUrl}/Company`, data)
  }

  GetAllModelData = () => this.http.get(`${this.environment.apiUrl}/company/GetAllModelData`)

  GetCompanyById(id: string) {
    return this.http.get(`${this.environment.apiUrl}/Company/${id}`)
  }

  DeleteCompany(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/Company/${id}`)
  }

}
