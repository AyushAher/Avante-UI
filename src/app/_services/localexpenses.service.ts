import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/internal/Observable";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { LocalExpenses } from "../_models/localexpenses";

@Injectable({
  providedIn: "root",
})
export class LocalExpensesService {
  public localexpenses: Observable<LocalExpenses>;

  constructor(private http: HttpClient) {}

  save(localexpenses: LocalExpenses) {
    return this.http.post(`${environment.apiUrl}/LocalExpenses`, localexpenses);
  }

  getAll() {
    return this.http.get<LocalExpenses[]>(`${environment.apiUrl}/LocalExpenses`);
  }

  getById(id: string) {
    return this.http.get<LocalExpenses>(
      `${environment.apiUrl}/LocalExpenses/${id}`
    );
  }

  update(id, params) {
    return this.http
      .put(`${environment.apiUrl}/LocalExpenses/${id}`, params)
      .pipe(
        map((x) => {
          return x;
        })
      );
  }

  delete(id: string) {
    return this.http.delete(`${environment.apiUrl}/LocalExpenses/${id}`).pipe(
      map((x) => {
        return x;
      })
    );
  }
}
