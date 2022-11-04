import { Injectable } from '@angular/core';

import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class NotificationService {

  constructor(private toastr: ToastrService) { }

  showSuccess(message, title) {
    this.toastr.success(message, title)
  }

  showError(message, title) {
    this.toastr.error(message, title)
  }

  showInfo(message, title) {
    this.toastr.info(message, title)
  }

  showWarning(message, title) {
    this.toastr.warning(message, title)
  }

  private _listeners = new Subject<any>();
  listen(): Observable<any> {
    return this._listeners.asObservable();
  }

  filter(filterBy: string) {
    this._listeners.next(filterBy);
  }
  RestrictAdmin() {
    this.showWarning("Admin cannot create records.","Warning")
  }

}
