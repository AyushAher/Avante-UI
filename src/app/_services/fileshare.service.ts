import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, first } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { FileShare } from '../_models';

@Injectable({ providedIn: 'root' })
export class FileshareService {
  

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
    }

 

  save(fileshare: FileShare) {
    return this.http.post(`${environment.apiUrl}/FileShares`, fileshare);
    }

    getAll() {
      return this.http.get<FileShare[]>(`${environment.apiUrl}/FileShares`);
    }

    getById(id: string) {
      return this.http.get<FileShare>(`${environment.apiUrl}/FileShares/${id}`);
    }



  upload(fileshare: FormData, id: string) {
    debugger;
    return this.http.post(`${environment.apiUrl}/FileShares/upload/${id}`, fileshare, {
      reportProgress: true,
      observe: "events",
    });
  }

  list(id: string) {
    return this.http.get<FileShare[]>(
      `${environment.apiUrl}/FileShares/getfile/${id}`
    );
  }

  public download(fileUrl: string) {
    return this.http.get(
      `${environment.apiUrl}/FileShares/download?fileUrl=${fileUrl}`,
      {
        reportProgress: true,
        observe: "events",
        responseType: "blob",
      }
    );
  }



    update(id, params) {
      return this.http.put(`${environment.apiUrl}/FileShares`, params)
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
      return this.http.delete(`${environment.apiUrl}/FileShares/${id}`)
            .pipe(map(x => {
               
                return x;
            }));
    }
}
