import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Instrument, instrumentConfig } from '../_models';
import { EnvService } from './env/env.service';

@Injectable({ providedIn: 'root' })
export class InstrumentService {
  private distrubutorSubject: BehaviorSubject<Instrument>;
  public distributor: Observable<Instrument>;

  constructor(
    private router: Router,
    private environment: EnvService,
    private http: HttpClient
  ) {
  }


  save(instrument: Instrument) {
    return this.http.post(`${this.environment.apiUrl}/Instrument`, instrument);
  }

  getAll(userId: string,) {
    return this.http.get<Instrument[]>(`${this.environment.apiUrl}/Instrument/GetByAssignedRegions/${userId}`);
  }

  getFilteredAll(dataModel, controller) {
    return this.http.post(`${this.environment.apiUrl}/${controller}/FilterData`, dataModel);
  }


  getInstrumentConfif(insId: string) {
    return this.http.get(`${this.environment.apiUrl}/Instrumentconfig/GetByInstrument/${insId}`);
  }

  getById(id: string) {
    return this.http.get<Instrument>(`${this.environment.apiUrl}/Instrument/${id}`);
  }

  getSerReqInstrument(id: string) {
    return this.http.get<Instrument>(`${this.environment.apiUrl}/Instrument/GetSerReqInstrument/${id}`);
  }

  getinstubysiteIds(id: string) {
    return this.http.get<Instrument>(`${this.environment.apiUrl}/Instrument/GetSiteInstruments/${id}`);
  }

  searchByKeyword(param: string, custSiteId: string) {
    param = param == "" ? "undefined" : param;
    return this.http.get<Instrument[]>(`${this.environment.apiUrl}/Instrument/GetInstrumentBySerialNo/${param}/${custSiteId}`);
  }

  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/Instrument`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/Instrument/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }

  deleteConfig(deleteConfig: instrumentConfig) {
    return this.http.post(`${this.environment.apiUrl}/Instrumentconfig/RemoveInsConfigType`, deleteConfig)
  }

}
