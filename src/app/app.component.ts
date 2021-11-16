import { Component } from '@angular/core';
import { User, Profile } from './_models';
import { AccountService, ProfileService, NotificationService } from './_services';
import { first } from 'rxjs/operators';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'app';
  user: User;
  profile: Profile;
  constructor(private accountService: AccountService,
    private profileServicce: ProfileService,
    private notifiactionServicce: NotificationService,
  ) {
    //debugger;
    

    //this.profile = this.profileServicce.userProfileValue; 
  }

}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

