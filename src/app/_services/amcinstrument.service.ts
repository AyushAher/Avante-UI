import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { AmcInstrument } from '../_models/Amcinstrument';
import { EnvService } from './env/env.service';


@Injectable({
  providedIn: 'root'
})
export class AmcinstrumentService {

  constructor(
    private http: HttpClient,
    private environment: EnvService,
  ) { }

  SaveAmcInstruments = (params: AmcInstrument[]) => {
    return this.http.post(`${this.environment.apiUrl}/AmcInstruments`, params);
  }


  getAmcInstrumentsByAmcId = (id: string) => {
    return this.http.get<AmcInstrument[]>(`${this.environment.apiUrl}/AmcInstruments/${id}`);
  }

  
  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/AmcInstruments/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }

}
