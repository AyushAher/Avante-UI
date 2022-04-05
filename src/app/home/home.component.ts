import {Component} from '@angular/core';

import {ListTypeItem, Profile, User} from '../_models';
import {AccountService, ListTypeService, NotificationService, ProfileService} from '../_services';
import {first} from 'rxjs/operators';
import {Router} from '@angular/router';

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

    if (this.user.userProfileId != null) {
      (async () => {
        // Do something before delay
        // console.log('before delay')
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
                console.log(this.userrole)
                localStorage.setItem('roles', JSON.stringify(this.userrole))
                if (this.userrole != [] && this.userrole != null) {
                  switch (this.userrole[0].itemname) {
                    case "Distributor Support":
                      this.router.navigate(["distdashboard"]);
                      break;

                    case "Customer":
                      this.router.navigate(["custdashboard"]);
                      break;
                  }
                }
              },
              error: (error) => {
                
              },
            });
        }

        // Do something after
        // console.log('after delay')
      })();
    }
  }

}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
