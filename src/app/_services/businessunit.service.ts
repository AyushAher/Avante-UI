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

    GetById(id: string) {
        return this.http.get(`${this.environment.apiUrl}/BusinessUnits/${id}`)
    }

    Delete(id: string) {
        return this.http.delete(`${this.environment.apiUrl}/BusinessUnits/${id}`)
    }
}
