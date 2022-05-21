import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/internal/Observable";
import { map } from "rxjs/operators";

import { LocalExpenses } from "../_models/localexpenses";
import { EnvService } from "./env/env.service";

@Injectable({
  providedIn: "root",
})
export class LocalExpensesService {
  public localexpenses: Observable<LocalExpenses>;

  constructor(
    private http: HttpClient,
    private environment: EnvService,
  ) { }

  save(localexpenses: LocalExpenses) {
    return this.http.post(`${this.environment.apiUrl}/LocalExpenses`, localexpenses);
  }

  getAll() {
    return this.http.get<LocalExpenses[]>(`${this.environment.apiUrl}/LocalExpenses`);
  }

  getById(id: string) {
    return this.http.get<LocalExpenses>(
      `${this.environment.apiUrl}/LocalExpenses/${id}`
    );
  }

  update(id, params) {
    return this.http
      .put(`${this.environment.apiUrl}/LocalExpenses/${id}`, params)
      .pipe(
        map((x) => {
          return x;
        })
      );
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/LocalExpenses/${id}`).pipe(
      map((x) => {
        return x;
      })
    );
  }
}
