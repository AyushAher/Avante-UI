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

@Injectable({ providedIn: 'root' })
export class AccountService {
  private userSubject: BehaviorSubject<User>;
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
    this.userSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('user')));
    this.zohoSubject = new BehaviorSubject<string>(JSON.parse(localStorage.getItem('zohotoken')));
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
            this.CIMConfig(this.userValue.username, this.password)
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
        // this.clear();
        return user;
      }));
  }

  ChangeCIM(){
    
  }


  Authenticate = (username: any, password: any, companyId = "", businessUnitId = "", brandId = "") => {
    this.login(username, password, companyId, businessUnitId, brandId)
      .pipe(first()).subscribe({
        next: () => {
          this.currentuser = this.userValue;
          if (this.currentuser.username == "admin") {
            this.router.navigate(["/"],
              {
                queryParams: { redirected: true }
              });
            return this.SetUpConfig(username, password)
          }
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
                      this.router.navigate(["/"],
                        {
                          queryParams: { redirected: true }
                        })
                      this.CIMConfig(username, password, false)
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

  private SetUpConfig(username, password) {
    this.password = password

    const modalOptions: any = {
      backdrop: 'static',
      ignoreBackdropClick: true,
      keyboard: false,
      initialState: {
        isDialog: true,
        username,
        password
      },
    }
    this.modalRef = this.modalService.show(SetUp, modalOptions);

    this.modalRef.content.onClose.subscribe(result => {
      if (!result.newSetUp) return this.CIMConfig(username, this.password);
      this.modalRef = this.modalService.show(CreateCompanyComponent, modalOptions)

      this.modalRef.content.onClose.subscribe((companySuccess) => {
        if (!companySuccess.result) return;
        modalOptions.initialState.companyId = companySuccess.object.id;
        this.modalRef = this.modalService.show(CreateBrandComponent, modalOptions)
        this.modalRef.content.onClose.subscribe((brandData) => {
          if (!brandData.result) return;
          modalOptions.initialState.brandId = brandData.object.id;

          this.modalRef = this.modalService.show(CreateBusinessUnitComponent, modalOptions)
          this.modalRef.content.onClose.subscribe((buData) => {
            if (!brandData.result) return;
            modalOptions.initialState.businessUnitId = buData.object.id;
            this.modalService.hide()
            this.login(modalOptions.initialState.username, this.password, modalOptions.initialState.companyId, modalOptions.initialState.businessUnitId, modalOptions.initialState.brandId)
              .pipe(first()).subscribe(() => {
                this.router.navigate(["/distributor"], {
                  queryParams: {
                    isNewSetUp: true
                  }
                })
                this.notificationService.filter('newSetup');
              })


          })
        })

      })

    })
  }

  private CIMConfig(username, password, isAdmin = true) {
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
          this.modalRef = this.modalService.show(CIMComponent, modalOptions);
          this.modalRef.content.onClose.subscribe(result => {
            if (!result.result) {
              this.companyId = result.companyId;
              return;
            }

            this.login(username, password, result.form.companyId, result.form.businessUnitId, result.form.brandId)
              .pipe(first()).subscribe(() => {
                this.currentuser = this.userValue;

                if (isAdmin) this.router.navigate(["/"]);
                else {
                  this.notificationService.filter('loggedin');
                  this.router.navigate(['/distdashboard'])
                  setTimeout(() => {
                    this.router.navigate(['/']);
                  }, 200);
                }
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


  GetCurrentCIMDetails(){
    return this.http.get(`${this.environment.apiUrl}/users/CIMDetails`);
  }
}
