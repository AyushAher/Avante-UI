import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {environment} from '../../environments/environment';
import {ListTypeItem} from '../_models';

@Injectable({providedIn: 'root'})
export class ListTypeService {
  private roleSubject: BehaviorSubject<ListTypeItem>;
  public role: Observable<ListTypeItem>;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.roleSubject = new BehaviorSubject<ListTypeItem>(JSON.parse(localStorage.getItem('roles')));
    this.role = this.roleSubject.asObservable();
  }

  save(listType: ListTypeItem) {
    return this.http.post(`${environment.apiUrl}/ListItems`, listType);
  }

  getAll() {
    return this.http.get<ListTypeItem[]>(`${environment.apiUrl}/ListItems`);
  }

  getById(code: string) {
    return this.http.get<ListTypeItem[]>(`${environment.apiUrl}/ListItems/${code}`);
  }

  public get roleValue(): ListTypeItem {
    return this.roleSubject.value;
  }

  getItemById(id: string) {
    return this.http.get<ListTypeItem[]>(`${environment.apiUrl}/ListItems/itemid/${id}`)
      .pipe(map(x => {
        localStorage.setItem('roles', JSON.stringify(x))
        if (x != null) {
          this.roleSubject.next(x[0]);
        }
        return x;
      }));
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
