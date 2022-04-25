import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImportdataService {

  constructor(private http: HttpClient) { }

  importData = (data: any, screen: any) => { return this.http.post(`${environment.apiUrl}/ImportData`, data) }


}
