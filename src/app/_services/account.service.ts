import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { first } from 'rxjs/operators';

import { ChangePasswordModel, ListTypeItem, Profile, User } from '../_models';
import { EnvService } from './env/env.service';
import { ListTypeService } from './listType.service';
import { ProfileService } from './profile.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { CIMComponent } from '../account/cim.component';
import { NotificationService } from './notification.service';
import { CompanyService } from './company.service';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private userSubject: BehaviorSubject<User>;
  private zohoSubject: BehaviorSubject<string>;
  public user: Observable<User>;

  public modalRef: BsModalRef;
  private currentuser: User;
  private roles: ListTypeItem[];
  private userrole: ListTypeItem;

  constructor(
    private router: Router,
    private http: HttpClient,
    private environment: EnvService,
    private profileServicce: ProfileService,
    private listTypeService: ListTypeService,
    private modalService: BsModalService,
    private notificationService: NotificationService,
    private companyService: CompanyService
  ) {
    this.userSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('user')));
    this.zohoSubject = new BehaviorSubject<string>(JSON.parse(localStorage.getItem('zohotoken')));
    this.user = this.userSubject.asObservable();
  }

  public get userValue(): User {
    return this.userSubject.value;
  }

  public get zohoauthValue(): string {
    return this.zohoSubject.value;
  }

  public GetUserRegions() {
    return this.http.get(`${this.environment.apiUrl}/user/GetUserRegions`)
  }

  zohoauthSet(v: string) {
    this.zohoSubject.next(v);
  }


  clear() {
    localStorage.removeItem('zohotoken');
    this.zohoSubject.next(null);
  }


  login(username, password, companyId, businessUnitId, brandId) {

    password = window.btoa(password);
    return this.http.post<User>(`${this.environment.apiUrl}/user/authenticate`, { username, password, companyId, businessUnitId, brandId })
      .pipe(map(user => {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        localStorage.setItem('user', JSON.stringify(user));
        this.userSubject.next(user);
        this.clear();
        return user;
      }));
  }



  Authenticate = (username: any, password: any, companyId = "", businessUnitId = "", brandId = "") => {
    this.login(username, password, companyId, businessUnitId, brandId)
      .pipe(first()).subscribe({
        next: () => {
          this.currentuser = this.userValue;
          if (this.currentuser.username == "admin") return this.CIMConfig(username, password)

          else {
            this.profileServicce.getUserProfile(this.currentuser.userProfileId);
            setTimeout(() => {
              this.listTypeService.getById("ROLES")
                .pipe(first()).subscribe((data: ListTypeItem[]) => {
                  this.roles = data;
                  let userrole = this.roles.find(x => x.listTypeItemId == this.currentuser.roleId)
                  if (userrole == null) return;
                  localStorage.setItem('roles', JSON.stringify([userrole]))

                  switch (userrole.itemname) {
                    case "Distributor Support":
                      this.CIMConfig(username, password)
                      break;

                    case "Customer":
                      this.router.navigate(["custdashboard"]);
                      break;

                    case "Engineer":
                      this.router.navigate(["engdashboard"]);
                      break;
                  }
                });
            }, 1000);
          }

        },
        error: () => false
      });
  }

  private CIMConfig(username, password) {

    this.companyService.GetAllModelData()
      .pipe(first()).subscribe({
        next: (data: any) => {
          data = data.object;
          if (data == null)
            return this.notificationService.showError("Some Error Occurred. Please Refresh the page.", "Error")

          const modalOptions: any = {
            backdrop: 'static',
            ignoreBackdropClick: true,
            keyboard: false,
            initialState: {
              username,
              password,
              cimData: data
            },
          }
          this.modalRef = this.modalService.show(CIMComponent, modalOptions);
          this.modalRef.content.onClose.subscribe(result => {
            if (!result.result) return;
            this.login(username, password, result.form.companyId, result.form.businessUnitId, result.form.brandId)
              .pipe(first()).subscribe(() => {
                this.router.navigate(["/"])
                this.currentuser = this.userValue;
              })

          })
        },
        error: () => this.notificationService.showError("Some Error Occurred. Please Refresh the page.", "Error")
      })
  }


  logout() {
    // remove user from local storage and set current user to null
    localStorage.clear();
    this.clear();
    this.userSubject.next(null);
    this.router.navigate(['/account/login']);
  }

  register(user: User) {
    return this.http.post(`${this.environment.apiUrl}/user`, user);
  }

  ChangePassword(changePassword: ChangePasswordModel) {
    return this.http.post(`${this.environment.apiUrl}/user/changepassword`, changePassword);
  }

  ForgotPassword(email: string) {
    return this.http.post(`${this.environment.apiUrl}/user/forgotpassword/` + email, null);
  }

  getAll() {
    return this.http.get<User[]>(`${this.environment.apiUrl}/users`);
  }

  getById(id: string) {
    return this.http.get<User>(`${this.environment.apiUrl}/user/GetUserByContactId/${id}`);
  }

  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/users/${id}`, params)
      .pipe(map(x => {
        // update stored user if the logged in user updated their own record
        if (id == this.userValue.id) {
          // update local storage
          const user = { ...this.userValue, ...params };
          localStorage.setItem('user', JSON.stringify(user));

          // publish updated user to subscribers
          this.userSubject.next(user);
        }
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/users/${id}`)
      .pipe(map(x => {
        // auto logout if the logged in user deleted their own record
        if (id == this.userValue.id) {
          this.logout();
        }
        return x;
      }));
  }
}
