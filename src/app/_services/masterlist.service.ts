import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { ListType } from '../_models';

@Injectable({ providedIn: 'root' })
export class MasterListService {
  private ContactSubject: BehaviorSubject<ListType>;
  public contact: Observable<ListType>;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
  }


  getAll() {
    return this.http.get<ListType[]>(`${environment.apiUrl}/ListItems/GetListType`);
  }

  getById(id: string) {
    return this.http.get<ListType>(`${environment.apiUrl}/ListItems/${id}`);
  }

}
