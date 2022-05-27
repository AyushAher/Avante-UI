import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { first } from 'rxjs/operators';
import { UsernotificationService } from '../_services/usernotification.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-notificationspopup',
  templateUrl: './notificationspopup.component.html',
  styleUrls: ['./notificationspopup.component.css']
})
export class NotificationspopupComponent implements OnInit {
  notification: HTMLElement;
  checdiv: HTMLElement;
  flag3: boolean;
  notificationList: any = [];
  @Output() closePopup = new EventEmitter<boolean>()
  @Output() popUpClosed = new EventEmitter<boolean>()

  constructor(private userNotification: UsernotificationService, private _location: Location) { }

  ngOnInit(): void {
    this.userNotification.getAll().pipe(first())
      .subscribe((data: any) => {
        if (data.result) {
          this.notificationList = data.object;
        }
      })
  }

  close() {
    this.closePopup.emit(false);
    this.popUpClosed.emit(true)
  }

  ClearNotifications() {
    this.userNotification.clearAll().pipe(first())
      .subscribe((data: any) => this.notificationList = [])
  }

  deleteNotification(id) {
    this.userNotification.delete(id).pipe(first())
      .subscribe((data: any) => {
        if (data.result) {
          this.notificationList = data.object;
        }
      })
  }


}
