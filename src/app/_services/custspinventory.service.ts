import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import { Custspinventory } from "../_models/custspinventory";
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})
export class CustspinventoryService {
  constructor(
    private router: Router,
    private http: HttpClient,
    private environment: EnvService,
  ) {
  }

  save(action: Custspinventory) {
    return this.http.post(`${this.environment.apiUrl}/CustSPInventory`, action);
  }

  getAll(contactId, custid?) {
    return this.http.get<Custspinventory[]>(`${this.environment.apiUrl}/CustSPInventory/all/${contactId}/${custid}`);
  }

  GetSPInvenrotyForServiceReport(id: string) {
    return this.http.get(`${this.environment.apiUrl}/CustSPInventory/GetSPInvenrotyForServiceReport/${id}`);
  }

  getHistory(contactId, custSPInventoryId) {
    return this.http.get<Custspinventory[]>(`${this.environment.apiUrl}/CustSPInventory/history/${contactId}/${custSPInventoryId}`);
  }

  getById(id: string) {
    return this.http.get<Custspinventory>(`${this.environment.apiUrl}/CustSPInventory/${id}`);
  }

  GetSparePartByNo(id: string) {
    return this.http.get(`${this.environment.apiUrl}/CustSPInventory/GetSparePartByNo/${id}`);
  }

  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/CustSPInventory/${id}`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  updateqty(id, params) {
    return this.http.put(`${this.environment.apiUrl}/CustSPInventory/qty/${id}/${params}`, params)
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/CustSPInventory/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }

}
