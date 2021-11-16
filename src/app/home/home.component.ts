import { Component } from '@angular/core';

import { User, Profile, ListTypeItem } from '../_models';
import { AccountService, ProfileService, NotificationService, ListTypeService } from '../_services';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';

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
    private notificationService: NotificationService,
    private listTypeService: ListTypeService,
  ) {


    //this.profile = this.profileServicce.userProfileValue;
    this.user = this.accountService.userValue;
    console.log(this.user)

    if (this.user.userProfileId != null) {

      (async () => {
        // Do something before delay
        // console.log('before delay')
        this.profileServicce.getUserProfile(this.user.userProfileId);
        await delay(1000);

        // Do something after
        // console.log('after delay')
      })();
    }
    this.listTypeService
      .getById("ROLES")
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.roles = data;
          this.userrole = this.roles.filter(x => x.listTypeItemId == this.user.roleId)
          console.log(this.userrole)
          switch (this.userrole[0].itemname) {
            case "Distributor Support":
              this.router.navigate(["distdashboard"]);
              break;

            case "Customer":
              this.router.navigate(["custdashboard"]);  
            break;
          }
        },
        error: (error) => {
          this.notificationService.showError(error, "Error");
        },
      });

  }

}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
