import {Injectable} from '@angular/core';
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {map} from "rxjs/operators";
import {Custspinventory} from "../_models/custspinventory";

@Injectable({
  providedIn: 'root'
})
export class CustspinventoryService {
  constructor(
    private router: Router,
    private http: HttpClient
  ) {
  }

  save(action: Custspinventory) {
    return this.http.post(`${environment.apiUrl}/CustSPInventory`, action);
  }

  getAll(contactId, custid = null) {
    return this.http.get<Custspinventory[]>(`${environment.apiUrl}/CustSPInventory/all/${contactId}/${custid}`);
  }

  getHistory(contactId, custSPInventoryId) {
    return this.http.get<Custspinventory[]>(`${environment.apiUrl}/CustSPInventory/history/${contactId}/${custSPInventoryId}`);
  }

  getById(id: string) {
    return this.http.get<Custspinventory>(`${environment.apiUrl}/CustSPInventory/${id}`);
  }

  update(id, params) {
    return this.http.put(`${environment.apiUrl}/CustSPInventory/${id}`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  updateqty(id, params) {
    return this.http.put(`${environment.apiUrl}/CustSPInventory/qty/${id}/${params}`, params)
  }

  delete(id: string) {
    return this.http.delete(`${environment.apiUrl}/CustSPInventory/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }

}
