import { Component } from '@angular/core';

import { ListTypeItem, Profile, User } from '../_models';
import { AccountService, ListTypeService, NotificationService, ProfileService } from '../_services';
import { first } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  user: User;
  profile: Profile;
  roles: ListTypeItem[];
  constructor(private accountService: AccountService,
    private profileServicce: ProfileService,
    private router: Router,
    private route: ActivatedRoute,
    private listTypeService: ListTypeService,
  ) {
    let isRedirected;
    this.route.queryParams.subscribe((data: any) => {
      isRedirected = data.redirected === "true" || data.redirected === true
    })
    this.user = this.accountService.userValue;
    if (!isRedirected && this.user.username != "admin") {
      this.profileServicce.getUserProfile(this.user.userProfileId);
      setTimeout(() => {
        this.listTypeService.getById("ROLES")
          .pipe(first()).subscribe((data: ListTypeItem[]) => {
            this.roles = data;
            let userrole = this.roles.find(x => x.listTypeItemId == this.user.roleId)
            localStorage.setItem('roles', JSON.stringify([userrole]))
            if (userrole != null) {
              switch (userrole.itemname) {
                case "Distributor Support":
                  this.router.navigate(["distdashboard"]);
                  break;

                case "Customer":
                  this.router.navigate(["custdashboard"]);
                  break;

                case "Engineer":
                  this.router.navigate(["engdashboard"]);
                  break;
              }
            }
          });
      }, 1000);
    }

  }

}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
