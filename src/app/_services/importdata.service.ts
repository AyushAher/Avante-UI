import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})
export class ImportdataService {

  constructor(
    private http: HttpClient,
    private environment: EnvService,
  ) { }

  importData = (data: any, screen: any) => { return this.http.post(`${this.environment.apiUrl}/ImportData`, data) }

  convertCurrency = (cur: string, amt: number) => {
    return this.http.get(`${this.environment.currencyConvert}/?from=USD&to=${cur}&amount=${amt}`)
  }
}
