import { Component } from '@angular/core';
import { User } from '../_models';
import { AccountService } from '../_services';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  //styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent {
  user: User;
  constructor(private accountService: AccountService) {
    this.user = this.accountService.userValue;
  }

  logout() {
    this.accountService.logout();
  }
}
