import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})
export class AmcItemsService {

  constructor(private http: HttpClient, private envService: EnvService) { }

  SaveItem(model) {
    return this.http.post(`${this.envService.apiUrl}/AmcItem`, model);
  }

  GetByAmcId(amcId) {
    return this.http.get(`${this.envService.apiUrl}/AmcItem/GetByAmcId/${amcId}`);
  }

  DeleteItem(id) {
    return this.http.delete(`${this.envService.apiUrl}/AmcItem/${id}`);
  }

}
