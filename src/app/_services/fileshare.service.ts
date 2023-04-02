import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { FileShare } from '../_models';
import { EnvService } from './env/env.service';

@Injectable({ providedIn: 'root' })
export class FileshareService {


  constructor(
    private router: Router,
    private environment: EnvService,
    private http: HttpClient
  ) {
  }


  save(fileshare: FileShare) {
    return this.http.post(`${this.environment.apiUrl}/FileShares`, fileshare);
  }

  getAll() {
    return this.http.get<FileShare[]>(`${this.environment.apiUrl}/FileShares`);
  }

  getById(id: string) {
    return this.http.get<FileShare>(`${this.environment.apiUrl}/FileShares/${id}`);
  }

  getImg(id: string, code: string) {
    return this.http.get<FileShare>(`${this.environment.apiUrl}/FileShares/getImg/${code}/${id}`);
  }

  upload(fileshare: FormData, id: string, code: string, IMG?) {
    return this.http.post(`${this.environment.apiUrl}/FileShares/upload/${code}/${id}/${IMG}`, fileshare, {
      reportProgress: true,
      observe: "events",
    });
  }

  list(id: string) {
    return this.http.get<FileShare[]>(
      `${this.environment.apiUrl}/FileShares/getfile/${id}`
    );
  }

  public download(fileUrl: string, code: string = "") {
    return this.http.get(
      `${this.environment.apiUrl}/FileShares/download${code}?fileUrl=${fileUrl}`,
      {
        reportProgress: true,
        observe: "events",
        responseType: "blob",
      }
    );
  }


  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/FileShares`, params)
      .pipe(map(x => {
        // update stored user if the logged in user updated their own record
        //if (id == this.distributor.id) {
        //      // update local storage
        //      const user = { ...this.userValue, ...params };
        //      sessionStorage.setItem('user', JSON.stringify(user));

        //      // publish updated user to subscribers
        //      this.userSubject.next(user);
        //  }
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/FileShares/file/${id}`)
      .pipe(map(x => {

        return x;
      }));
  }
}
