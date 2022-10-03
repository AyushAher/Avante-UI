import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, first } from 'rxjs/operators';
import { Profile, ProfileReadOnly } from '../_models';
import { EnvService } from './env/env.service';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private profileSubject: BehaviorSubject<ProfileReadOnly>;
  public userprofile: Observable<ProfileReadOnly>;

  constructor(
    private router: Router,
    private environment: EnvService,
    private http: HttpClient
  ) {
    this.profileSubject = new BehaviorSubject<ProfileReadOnly>(JSON.parse(localStorage.getItem('userprofile')));
    //this.user = this.distrubutorSubject.asObservable();
    this.userprofile = this.profileSubject.asObservable();
  }

  public get userProfileValue(): ProfileReadOnly {
    return this.profileSubject.value;
  }

  //isAllowedRoles(profilePermission: any) {
  //  let permission: any = [];
  //  var isSearch = profilePermission
  //}


  save(profile: Profile) {
    return this.http.post(`${this.environment.apiUrl}/Profiles`, profile);
  }

  getAll() {
    return this.http.get<Profile[]>(`${this.environment.apiUrl}/Profiles`);
  }

  getById(id: string) {
    return this.http.get<Profile>(`${this.environment.apiUrl}/Profiles/${id}`);
  }
  GetAllScreens() {
    return this.http.get(`${this.environment.apiUrl}/Profiles/GetAllScreens`);
  }

  getUserProfile(value: string) {
    //debugger;
    this.http.get<Profile>(`${this.environment.apiUrl}/UserProfiles/${value}`).
      pipe(first()).subscribe((data: any) => {
        this.getById(data.object.profileId)
          .pipe(first()).subscribe((pdata: any) => {
            localStorage.setItem('userprofile', JSON.stringify(pdata.object));
            this.profileSubject.next(pdata.object);
          });
      });
  }

  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/Profiles`, params)
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
    return this.http.delete(`${this.environment.apiUrl}/Profiles/${id}`)
      .pipe(map(x => {
        //// auto logout if the logged in user deleted their own record
        //if (id == this.userValue.id) {
        //    this.logout();
        //}
        return x;
      }));
  }
}
