import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";
import { EnvService } from "./env/env.service";

@Injectable({ providedIn: 'root' })
export class InstrumentAccessoryService {
    constructor(
        private http: HttpClient,
        private environment: EnvService
    ) { }

    save(obj) {
        return this.http.post(`${this.environment.apiUrl}/InstrumentAccessory`, obj);
    }

    getAll() {
        return this.http.get(`${this.environment.apiUrl}/InstrumentAccessory`);
    }

    GetByInsId(id) {
        return this.http.get(`${this.environment.apiUrl}/InstrumentAccessory/GetByInsId/${id}`);
    }

    getById(id: string) {
        return this.http.get(`${this.environment.apiUrl}/InstrumentAccessory/${id}`);
    }


    update(id, params) {
        return this.http.put(`${this.environment.apiUrl}/InstrumentAccessory/${id}`, params)
    }

    delete(id: string) {
        return this.http.delete(`${this.environment.apiUrl}/InstrumentAccessory/${id}`)
    }
}