import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserProfile, User } from '../_models';
import { EnvService } from './env/env.service';

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private ContactSubject: BehaviorSubject<UserProfile>;
  public contact: Observable<UserProfile>;

  constructor(
    private router: Router,
    private http: HttpClient,
    private environment: EnvService,
  ) {
  }

  save(profile: UserProfile) {
    return this.http.post(`${this.environment.apiUrl}/UserProfiles`, profile);
  }

  getAll() {
    return this.http.get<UserProfile[]>(`${this.environment.apiUrl}/UserProfiles`);
  }

  getById(id: string) {
    return this.http.get<UserProfile>(`${this.environment.apiUrl}/UserProfiles/${id}`);
  }

  getByUserId(id: string) {
    return this.http.get<User>(`${this.environment.apiUrl}/UserProfiles/GetUserByContactId/${id}`);
  }



  getUserAll() {
    return this.http.get<User[]>(`${this.environment.apiUrl}/UserProfiles/GetAllUser`);
  }

  getByProfileRegion(profilefor: string, id: string) {
    return this.http.get<UserProfile>(`${this.environment.apiUrl}/UserProfiles/GetProfileRegions/${profilefor}/${id}`);
  }

  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/UserProfiles`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/UserProfiles/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }
}
