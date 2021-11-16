import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AmcInstrument } from '../_models/Amcinstrument';


@Injectable({
  providedIn: 'root'
})
export class AmcinstrumentService {

  constructor(
    private http: HttpClient
  ) { }

  SaveAmcInstruments = (params: AmcInstrument[]) => {
    return this.http.post(`${environment.apiUrl}/AmcInstruments`, params);
  }


  getAmcInstrumentsByAmcId = (id: string) => {
    return this.http.get<AmcInstrument[]>(`${environment.apiUrl}/AmcInstruments/${id}`);
  }

  
  delete(id: string) {
    return this.http.delete(`${environment.apiUrl}/AmcInstruments/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }

}
