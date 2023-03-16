import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})
export class BrandService {

  constructor(
    private http: HttpClient,
    private environment: EnvService
  ) { }

  GetAll() {
    return this.http.get(`${this.environment.apiUrl}/Brands`)
  }

  GetById(id: string) {
    return this.http.get(`${this.environment.apiUrl}/Brands/${id}`)
  }

  GetByCompanyId() {
    return this.http.get(`${this.environment.apiUrl}/Brands/GetByCompanyId`)
  }

  Delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/Brands/${id}`)
  }

  Update(id: string, data: any) {
    return this.http.put(`${this.environment.apiUrl}/Brands/${id}`, data)
  }

  Save = (brand) => this.http.post(`${this.environment.apiUrl}/Brands`, brand)

}
