import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { ListTypeItem } from '../_models';

@Injectable({ providedIn: 'root' })
export class ListTypeService {
  private CurrencySubject: BehaviorSubject<ListTypeItem>;
  public currency: Observable<ListTypeItem>;

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



  save(listType: ListTypeItem) {
    return this.http.post(`${environment.apiUrl}/ListItems`, listType);
  }

  getAll() {
    return this.http.get<ListTypeItem[]>(`${environment.apiUrl}/ListItems`);
  }

  getById(code: string) {
    return this.http.get<ListTypeItem[]>(`${environment.apiUrl}/ListItems/${code}`);
  }

  getByListId(listid: string) {
    return this.http.get<ListTypeItem[]>(`${environment.apiUrl}/ListItems/GetItemsByListId/${listid}`);
  }

  update(id, params) {
    return this.http.put(`${environment.apiUrl}/ListItems/${id}`, params)
      .pipe(map(x => {
        // update stored user if the logged in user updated their own record
        //if (id == this.distributor.id) {
        //      // update local storage
        //      const user = { ...this.userValue, ...params };
        //      localStorage.setItem('user', JSON.stringify(user));

        //      // publish updated user to subscribers
        //      this.userSubject.next(user);
        //  }
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${environment.apiUrl}/ListItems/${id}`)
      .pipe(map(x => {
        //// auto logout if the logged in user deleted their own record
        //if (id == this.userValue.id) {
        //    this.logout();
        //}
        return x;
      }));
  }
}