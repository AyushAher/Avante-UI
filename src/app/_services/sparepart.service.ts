import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { SparePart, ConfigPartCombo } from '../_models';

@Injectable({ providedIn: 'root' })
export class SparePartService {
  private distrubutorSubject: BehaviorSubject<SparePart>;
  public distributor: Observable<SparePart>;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    //this.distrubutorSubject = new BehaviorSubject<Distributor>();
    //this.user = this.distrubutorSubject.asObservable();
  }

  //public get userValue(): User {
  //    return this.userSubject.value;
  //}



  save(sparepart: SparePart) {
    return this.http.post(`${environment.apiUrl}/SpareParts`, sparepart);
  }

  getAll() {
    return this.http.get<SparePart[]>(`${environment.apiUrl}/SpareParts`);
  }

  getById(id: string) {
    return this.http.get<SparePart>(`${environment.apiUrl}/SpareParts/${id}`);
  }

  getByPartNo(configPartCombo: ConfigPartCombo) {
    return this.http.post<SparePart>(`${environment.apiUrl}/SpareParts/GetByPartNo`, configPartCombo);
  }

  getByConfignValueId(configid: string, configval: string) {
    return this.http.get<SparePart>(`${environment.apiUrl}/SpareParts/GetConfigSparepart/${configid}/${configval}`);
  }

  getByConfigId(id: string) {
    return this.http.get<SparePart[]>(`${environment.apiUrl}/SpareParts/GetConfigSparepart/${id}`);
  }

  update(id, params) {
    return this.http.put(`${environment.apiUrl}/SpareParts/`, params)
      .pipe(map(x => {
        return x;
      }));
  }

    delete(id: string) {
      return this.http.delete(`${environment.apiUrl}/SpareParts/${id}`)
            .pipe(map(x => {
                return x;
            }));
  }

  uploadSparePart(file: File) {
    const formData: FormData = new FormData();

    formData.append('file', file);
    return this.http.post(`${environment.apiUrl}/SpareParts/UploadFile`, formData);
  }


}
