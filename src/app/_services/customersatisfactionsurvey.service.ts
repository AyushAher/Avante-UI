import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { Customersatisfactionsurvey } from "../_models/customersatisfactionsurvey";

@Injectable({
  providedIn: "root",
})
export class CustomersatisfactionsurveyService {
  public CustomerSatisfactionSurvey: Observable<CustomersatisfactionsurveyService>;

  constructor(private http: HttpClient) {}

  save(CustomerSatisfactionSurvey: CustomersatisfactionsurveyService) {
    return this.http.post(
      `${environment.apiUrl}/CustomerSatisfactionSurvey`,
      CustomerSatisfactionSurvey
    );
  }

  getAll() {
    return this.http.get<Customersatisfactionsurvey[]>(
      `${environment.apiUrl}/CustomerSatisfactionSurvey`
    );
  }

  getById(id: string) {
    return this.http.get<CustomersatisfactionsurveyService>(
      `${environment.apiUrl}/CustomerSatisfactionSurvey/${id}`
    );
  }

  update(id, params) {
    return this.http
      .put(`${environment.apiUrl}/CustomerSatisfactionSurvey/${id}`, params)
      .pipe(
        map((x) => {
          return x;
        })
      );
  }

  delete(id: string) {
    return this.http
      .delete(`${environment.apiUrl}/CustomerSatisfactionSurvey/${id}`)
      .pipe(
        map((x) => {
          return x;
        })
      );
  }
}
