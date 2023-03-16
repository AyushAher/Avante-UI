import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from './env/env.service';

@Injectable({
    providedIn: 'root'
})
export class BusinessUnitService {

    constructor(
        private http: HttpClient,
        private environment: EnvService
    ) { }

    GetAll() {
        return this.http.get(`${this.environment.apiUrl}/BusinessUnits`)
    }

    Save = (data) => {
        return this.http.post(`${this.environment.apiUrl}/BusinessUnits`, data)
    }

    GetById(id: string) {
        return this.http.get(`${this.environment.apiUrl}/BusinessUnits/${id}`)
    }

    GetByCompanyId() {
        return this.http.get(`${this.environment.apiUrl}/BusinessUnits/GetByCompanyId`)
    }

    Delete(id: string) {
        return this.http.delete(`${this.environment.apiUrl}/BusinessUnits/${id}`)
    }

    Update(id: string, data: any) {
        return this.http.put(`${this.environment.apiUrl}/BusinessUnits/${id}`, data)
    }
}
