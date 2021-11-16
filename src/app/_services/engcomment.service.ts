import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { EngineerCommentList } from '../_models';

@Injectable({ providedIn: 'root' })
export class EngCommentService {
  private engcommentSubject: BehaviorSubject<EngineerCommentList>;
  public engcomment: Observable<EngineerCommentList>;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
    }

  

  save(engcomment: EngineerCommentList) {
    return this.http.post(`${environment.apiUrl}/SREngComments`, engcomment);
    }

  getAll() {
    return this.http.get<EngineerCommentList[]>(`${environment.apiUrl}/SREngComments`);
    }

  getById(id: string) {
    return this.http.get<EngineerCommentList>(`${environment.apiUrl}/SREngComments/${id}`);
    }

  searchByKeyword(param: string, custSiteId: string) {
    param = param == "" ? "undefined" : param;
    return this.http.get<EngineerCommentList[]>(`${environment.apiUrl}/SREngComments/GetInstrumentBySerialNo/${param}/${custSiteId}`);
  }

    update(id, params) {
      return this.http.put(`${environment.apiUrl}/SREngComments/${id}`, params)
            .pipe(map(x => {
                return x;
            }));
    }

    delete(id: string) {
      return this.http.delete(`${environment.apiUrl}/SREngComments/${id}`)
            .pipe(map(x => {
                return x;
            }));
    }

}
