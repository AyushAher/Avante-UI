import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from '../_models';
import { AccountService } from '../_services';
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { ChangepasswoardComponent } from "../account/changepasswoard.component";
import { UsernotificationService } from '../_services/usernotification.service';
import { first } from 'rxjs/operators';
import ChangeCIM from '../account/ChangeCIM.component';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  //styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent {
  user: User;
  bsModalRef: BsModalRef;
  notifications: any = 0;
  isAdmin: boolean = false;
  @Output() showNotifications = new EventEmitter<boolean>()
  @Input() isClosed = false;
  notificationList: any[];

  constructor(
    private accountService: AccountService,
    private modalService: BsModalService,
    private userNotification: UsernotificationService,
    private userNotificationService: UsernotificationService
  ) {
    this.accountService.userSubject.subscribe((data) => this.user = data);
    this.isAdmin = this.user.isAdmin;

    setTimeout(() => {
      this.userNotificationService.getAll().pipe(first())
        .subscribe((data: any) => {
          data.object.length >= 100 ? this.notifications = "99+" : this.notifications = data.object.length
        })
    }, 100);

    setInterval(() => {
      if (this.isClosed) this.closed()
    }, 1000)
    this.userNotification.getAll().pipe(first())
      .subscribe((data: any) => {
        if (data.result) {
          this.notificationList = data.object;
        }
      })

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

  ToggleDropdown(id: string) {
    document.getElementById(id).classList.toggle("show")
  }

  ClearNotifications() {
    this.userNotification.clearAll().pipe(first())
      .subscribe((data: any) => {
        this.notificationList = []
        this.closed()
      })
  }

  deleteNotification(id) {
    this.userNotification.delete(id).pipe(first())
      .subscribe((data: any) => {
        if (data.result) {
          this.notificationList = data.object;
          this.closed()
        }
      })
  }

  ChangeCIM() {
    this.accountService.CIMConfig(this.user.username, localStorage.getItem('password'));
  }

  NewCIMSetup() {
    this.accountService.Authenticate(this.user.username, localStorage.getItem('password'), this.user.companyId);
  }

  logout() {
    this.accountService.logout();
  }
}
