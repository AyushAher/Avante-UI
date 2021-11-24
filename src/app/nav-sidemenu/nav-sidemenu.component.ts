import {Component} from '@angular/core';
import {ListTypeItem, ProfileReadOnly, User} from '../_models';
import {AccountService, ListTypeService, NotificationService, ProfileService} from '../_services';
import {first} from "rxjs/operators";
import {Router} from "@angular/router";

@Component({
  selector: 'app-nav-sidemenu',
  templateUrl: './navsidemenu.html',

})
export class NavSideMenuComponent {
  user: User;
  profile: ProfileReadOnly;
  hasDistributor: boolean = false;
  hasCustomer: boolean = false;
  hasInstrument: boolean = false;
  hasSparePart: boolean = false;
  hasUserProfile: boolean = false;
  hasProfile: boolean = false;
  hasCurrency: boolean = false;
  hasCountry: boolean = false;
  hasSearch: boolean = false;
  hasMaster: boolean = false;
  hasexport: boolean = false;
  hasTravelDetails: boolean = false;
  hasStayDetails: boolean = false;
  hasVisaDetails: boolean = false;
  hasLocalExpenses: boolean = false;
  hascustomersatisfactionsurveylist: boolean = false


  roles: ListTypeItem[];
  userrole: ListTypeItem[];
  settings: string
  hasDistributorSettings: boolean = false;
  hasCustomerSettings: boolean = false

  constructor(
    private accountService: AccountService,
    private profileService: ProfileService,
    private profileServicce: ProfileService,
    private router: Router,
    private notificationService: NotificationService,
    private listTypeService: ListTypeService,
  ) {
    debugger;
    this.user = this.accountService.userValue;
    this.profile = this.profileService.userProfileValue;

    if (this.profile != null) {
      if (this.profile.permissions.filter(x => x.screenCode == 'SDIST').length > 0) {
        this.hasDistributor = this.profile.permissions.filter(x => x.screenCode == 'SDIST')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'SDIST')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'SDIST')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'SDIST')[0].delete == true
      }
      if (this.profile.permissions.filter(x => x.screenCode == 'SCUST').length > 0) {
        this.hasCustomer = this.profile.permissions.filter(x => x.screenCode == 'SCUST')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'SCUST')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'SCUST')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'SCUST')[0].delete == true
      }
      if (this.profile.permissions.filter(x => x.screenCode == 'SINST').length > 0) {
        this.hasInstrument = this.profile.permissions.filter(x => x.screenCode == 'SINST')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'SINST')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'SINST')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'SINST')[0].delete == true
      }

      if (this.profile.permissions.filter(x => x.screenCode == 'SSPAR').length > 0) {
        this.hasSparePart = this.profile.permissions.filter(x => x.screenCode == 'SSPAR')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'SSPAR')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'SSPAR')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'SSPAR')[0].delete == true
      }

      if (this.profile.permissions.filter(x => x.screenCode == 'URPRF').length > 0) {
        this.hasUserProfile = this.profile.permissions.filter(x => x.screenCode == 'URPRF')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'URPRF')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'URPRF')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'URPRF')[0].delete == true
      }

      if (this.profile.permissions.filter(x => x.screenCode == 'SCURR').length > 0) {
        this.hasCurrency = this.profile.permissions.filter(x => x.screenCode == 'SCURR')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'SCURR')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'SCURR')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'SCURR')[0].delete == true
      }

      if (this.profile.permissions.filter(x => x.screenCode == 'SCOUN').length > 0) {
        this.hasCountry = this.profile.permissions.filter(x => x.screenCode == 'SCOUN')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'SCOUN')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'SCOUN')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'SCOUN')[0].delete == true
      }

      if (this.profile.permissions.filter(x => x.screenCode == 'SSRCH').length > 0) {
        this.hasSearch = this.profile.permissions.filter(x => x.screenCode == 'SSRCH')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'SSRCH')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'SSRCH')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'SSRCH')[0].delete == true
      }

      if (this.profile.permissions.filter(x => x.screenCode == 'PROF').length > 0) {
        this.hasProfile = this.profile.permissions.filter(x => x.screenCode == 'PROF')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'PROF')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'PROF')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'PROF')[0].delete == true
      }

      if (this.profile.permissions.filter(x => x.screenCode == 'MAST').length > 0) {
        this.hasMaster = this.profile.permissions.filter(x => x.screenCode == 'MAST')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'MAST')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'MAST')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'MAST')[0].delete == true
      }
      //this.hasDistributor = this.profile.Permissions
    }
    if (this.user.username == "admin") {
      this.hasDistributor = true;
      this.hasCustomer = true;
      this.hasInstrument = true;
      this.hasSparePart = true;
      this.hasUserProfile = true;
      this.hasProfile = true;
      this.hasCurrency = true;
      this.hasCountry = true;
      this.hasSearch = true;
      this.hasMaster = true;
      this.hasexport = true;
      this.hasTravelDetails = true;
      this.hasStayDetails = true;
      this.hasVisaDetails = true;
      this.hasLocalExpenses = true;
      this.hascustomersatisfactionsurveylist = true;
    }

    this.listTypeService
      .getById("ROLES")
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.roles = data;
          this.userrole = this.roles.filter(x => x.listTypeItemId == this.user.roleId)
          switch (this.userrole[0].itemname) {
            case "Distributor Support":
              this.hasDistributorSettings = true
              // this.router.navigate(["distdashboard"]);
              break;

            case "Customer":
              this.hasCustomerSettings = true
              // this.router.navigate(["custdashboard"]);
              break;
          }
        },
        error: (error) => {
          this.notificationService.showError(error, "Error");
        },
      });

  }
}
