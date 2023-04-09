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
import { CreateCompanyComponent } from '../account/company.component';
import { CreateBusinessUnitComponent } from '../account/businessunit.component';
import { CreateBrandComponent } from '../account/brand.component';
import SetUp from '../account/setup.component';
import ExistingCIM from '../account/Existing.component';

@Injectable({ providedIn: 'root' })
export class AccountService {
  public userSubject: BehaviorSubject<User>;
  private zohoSubject: BehaviorSubject<string>;
  public user: Observable<User>;

  public modalRef: BsModalRef;
  private currentuser: User;
  private roles: ListTypeItem[];
  private password: string;
  companyId: any;

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
    this.userSubject = new BehaviorSubject<User>(JSON.parse(sessionStorage.getItem('user')));
    this.zohoSubject = new BehaviorSubject<string>(JSON.parse(sessionStorage.getItem('zohotoken')));
    this.user = this.userSubject.asObservable();
    this.notificationService.listen().subscribe((data: any) => {

      const modalOptions: any = {
        backdrop: 'static',
        ignoreBackdropClick: true,
        keyboard: false,
        initialState: {
          companyId: this.companyId
        },
      }

      setTimeout(() => {
        switch (data) {
          case "cim":
            this.CIMConfig(this.userValue.username, this.password, this.userValue.isAdmin, this.userValue.isSuperAdmin)
            break;

          case "company":
            this.modalRef = this.modalService.show(CreateCompanyComponent, modalOptions)
            break;

          case "brand":
            this.modalRef = this.modalService.show(CreateBrandComponent, modalOptions)
            break;

          case "businessunit":
            this.modalRef = this.modalService.show(CreateBusinessUnitComponent, modalOptions)
            break;
        }
      }, 1000);

    })
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
    sessionStorage.removeItem('zohotoken');
    this.zohoSubject.next(null);
  }


  login(username, password, companyId, businessUnitId, brandId) {
    password = window.btoa(password);
    return this.http.post<User>(`${this.environment.apiUrl}/user/authenticate`, { username, password, companyId, businessUnitId, brandId })
      .pipe(map(user => {
        sessionStorage.setItem('user', JSON.stringify(user));
        this.userSubject.next(user);
        return user;
      }));
  }

  ChangeCIM() {

  }


  Authenticate = (username: any, password: any, companyId = "", businessUnitId = "", brandId = "") => {
    this.login(username, password, companyId, businessUnitId, brandId)
      .pipe(first()).subscribe({
        next: () => {
          this.currentuser = this.userValue;
          if (this.currentuser.isAdmin) {
            this.router.navigate(["/"],
              {
                queryParams: { redirected: true, isNSNav: true }
              })
            return this.CIMConfig(username, password, true, false)
          }
          else {
            this.profileServicce.getUserProfile(this.currentuser.userProfileId);
            setTimeout(() => {
              this.listTypeService.getById("ROLES")
                .pipe(first()).subscribe((data: ListTypeItem[]) => {
                  this.roles = data;
                  let userrole = this.roles.find(x => x.listTypeItemId == this.currentuser.roleId)
                  if (userrole == null) return;
                  sessionStorage.setItem('roles', JSON.stringify([userrole]))

                  switch (userrole.itemname) {
                    case "Distributor Support":
                      this.router.navigate(["/"],
                        {
                          queryParams: { redirected: true, isNSNav: true }
                        })
                      this.CIMConfig(username, password, false, false)
                      break;
                    case "Customer":
                      this.router.navigate(["custdashboard"], {
                        //relativeTo: this.activeRoute,
                        queryParams: { isNSNav: true },
                        //queryParamsHandling: 'merge'
                      });
                      break;

                    case "Engineer":
                      this.router.navigate(["engdashboard"], {
                        //relativeTo: this.activeRoute,
                        queryParams: { isNSNav: true },
                        //queryParamsHandling: 'merge'
                      });
                      break;
                  }
                });
            }, 1000);
          }

        },
        error: () => false
      });
  }


  CIMConfig(username, password, isAdmin = true, isSuperAdmin) {
    this.password = password
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

          if (isSuperAdmin || (!isAdmin && !isSuperAdmin)) {

            this.login(username, password, this.userValue.companyId, "", "")
              .pipe(first()).subscribe(() => {
                this.modalRef = this.modalService.show(CIMComponent, modalOptions);
                this.modalRef.content.onClose.subscribe(result => {
                  if (!result.result) {
                    this.companyId = result.companyId;
                    return;
                  }

                  this.login(username, password, result.form.companyId, (isAdmin || isSuperAdmin) ? "" : result.form.businessUnitId, (isAdmin || isSuperAdmin) ? "" : result.form.brandId)
                    .pipe(first()).subscribe(() => {
                      if (isAdmin) this.router.navigate(['/'], {
                        //relativeTo: this.activeRoute,
                        queryParams: { isNSNav: true },
                        //queryParamsHandling: 'merge'
                      });
                      else {
                        this.router.navigate(['/distdashboard'], {
                          //relativeTo: this.activeRoute,
                          queryParams: { isNSNav: true },
                          //queryParamsHandling: 'merge'
                        })
                        this.notificationService.filter('loggedin');
                        setTimeout(() => {
                          this.router.navigate(['/'], {
                            //relativeTo: this.activeRoute,
                            queryParams: { isNSNav: true },
                            //queryParamsHandling: 'merge'
                          });
                        }, 200);
                      }
                    })
                })
              })
          }
          else if (!isSuperAdmin && isAdmin) {
            this.login(username, password, this.userValue.companyId, "", "")
              .subscribe(() => {
                this.currentuser = this.userValue;
                if (isAdmin) this.router.navigate(['/'], {
                  //relativeTo: this.activeRoute,
                  queryParams: { isNSNav: true },
                  //queryParamsHandling: 'merge'
                });
                else {
                  this.router.navigate(['/distdashboard'], {
                    //relativeTo: this.activeRoute,
                    queryParams: { isNSNav: true },
                    //queryParamsHandling: 'merge'
                  })
                  this.notificationService.filter('loggedin');
                  setTimeout(() => {
                    this.router.navigate(['/'], {
                      //relativeTo: this.activeRoute,
                      queryParams: { isNSNav: true },
                      //queryParamsHandling: 'merge'
                    });
                  }, 200);
                }
              })
          }

        },
        error: () => this.notificationService.showError("Some Error Occurred. Please Refresh the page.", "Error")
      })
  }


  logout() {
    // remove user from local storage and set current user to null
    sessionStorage.clear();
    this.clear();
    this.userSubject.next(null);
    this.router.navigate(['/account/login'], {
      //relativeTo: this.activeRoute,
      queryParams: { isNSNav: true },
      //queryParamsHandling: 'merge'
    });
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
          sessionStorage.setItem('user', JSON.stringify(user));

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
