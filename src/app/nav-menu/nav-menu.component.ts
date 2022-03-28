import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from '../_models';
import { AccountService } from '../_services';
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { ChangepasswoardComponent } from "../account/changepasswoard.component";
import { UsernotificationService } from '../_services/usernotification.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  //styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent {
  user: User;
  bsModalRef: BsModalRef;
  notifications = 0;
  @Output() showNotifications = new EventEmitter<boolean>()
  @Input() isClosed = false;

  constructor(
    private accountService: AccountService,
    private modalService: BsModalService,
    private userNotificationService: UsernotificationService
  ) {
    this.user = this.accountService.userValue;
    setTimeout(() => {
      this.userNotificationService.getAll().pipe(first())
        .subscribe((data: any) => {
          this.notifications = data.object.length
        })
    }, 100);

    setInterval(() => {
      if (this.isClosed) this.closed()
    }, 1000)


  }

  closed() {
    this.userNotificationService.getAll().pipe(first())
      .subscribe((data: any) => {
        this.notifications = data.object.length
        this.isClosed = false;
      })
  }

  Notifications() {
    this.showNotifications.emit(true)
  }

  ChangePassword() {
    this.bsModalRef = this.modalService.show(ChangepasswoardComponent);
  }

  logout() {
    this.accountService.logout();
  }
}
