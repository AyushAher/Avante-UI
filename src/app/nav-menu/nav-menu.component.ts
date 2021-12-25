import {Component} from '@angular/core';
import {User} from '../_models';
import {AccountService} from '../_services';
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";
import {ChangepasswoardComponent} from "../account/changepasswoard.component";

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  //styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent {
  user: User;
  bsModalRef: BsModalRef;

  constructor(
    private accountService: AccountService,
    private modalService: BsModalService,
  ) {
    this.user = this.accountService.userValue;
  }

  ChangePassword() {
    this.bsModalRef = this.modalService.show(ChangepasswoardComponent);
  }

  logout() {
    this.accountService.logout();
  }
}
