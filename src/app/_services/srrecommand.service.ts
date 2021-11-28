import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {environment} from '../../environments/environment';
import {sparePartRecomanded} from '../_models';

@Injectable({providedIn: 'root'})
export class SrRecomandService {
  private engcommentSubject: BehaviorSubject<sparePartRecomanded>;
  public engcomment: Observable<sparePartRecomanded>;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    }



  save(sprecon: sparePartRecomanded) {
    return this.http.post(`${environment.apiUrl}/SparePartsRecommended`, sprecon);
  }

  getAll() {
    return this.http.get<sparePartRecomanded[]>(`${environment.apiUrl}/SparePartsRecommended`);
  }

  getById(id: string) {
    return this.http.get<sparePartRecomanded>(`${environment.apiUrl}/SparePartsRecommended/${id}`);
  }

  getByGrid(userId: string) {
    return this.http.get<sparePartRecomanded>(`${environment.apiUrl}/SparePartsRecommended/Grid/${userId}`);
  }


  update(id, params) {
    return this.http.put(`${environment.apiUrl}/SparePartsRecommended/${id}`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
      return this.http.delete(`${environment.apiUrl}/SparePartsRecommended/${id}`)
            .pipe(map(x => {
                return x;
            }));
    }

}
