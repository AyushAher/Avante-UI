import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from './env/env.service';

@Injectable({
    providedIn: 'root'
})
export class CIMService {

    constructor(
        private http: HttpClient,
        private environment: EnvService
    ) { }

    GetAll() {
        return this.http.get(`${this.environment.apiUrl}/CIMs`)
    }

    GetById(id: string) {
        return this.http.get(`${this.environment.apiUrl}/CIMs/${id}`)
    }

    Save(cim) {
        return this.http.post(`${this.environment.apiUrl}/CIMs`, cim)
    }

    Delete(id: string) {
        return this.http.delete(`${this.environment.apiUrl}/CIMs/${id}`)
    }
}
