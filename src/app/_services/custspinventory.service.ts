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

  getAll() {
    return this.http.get<Custspinventory[]>(`${environment.apiUrl}/CustSPInventory`);
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

  delete(id: string) {
    return this.http.delete(`${environment.apiUrl}/CustSPInventory/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }

}
