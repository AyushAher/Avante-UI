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
  userrole: ListTypeItem[];
  constructor(private accountService: AccountService,
    private profileServicce: ProfileService,
    private router: Router,
    private route: ActivatedRoute,
    private listTypeService: ListTypeService,
  ) {
    //this.profile = this.profileServicce.userProfileValue;
    this.user = this.accountService.userValue;
    let isRedirected;

    this.route.queryParams.subscribe((data: any) => {
      isRedirected = data.redirected === "true" || data.redirected === true
    })
    if (this.user.userProfileId != null) {
      (async () => {
        // Do something before delay
        if (this.user.username != "admin") {
          this.profileServicce.getUserProfile(this.user.userProfileId);
          await delay(1000);
          this.listTypeService
            .getById("ROLES")
            .pipe(first())
            .subscribe({
              next: (data: ListTypeItem[]) => {
                this.roles = data;
                this.userrole = this.roles.filter(x => x.listTypeItemId == this.user.roleId)
                localStorage.setItem('roles', JSON.stringify(this.userrole))
                if (!isRedirected && this.userrole != [] && this.userrole != null) {
                  switch (this.userrole[0].itemname) {
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
              },
            });
        }

        // Do something after
      })();
    }
  }

}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
