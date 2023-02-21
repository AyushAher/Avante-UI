import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class NotificationService {

  private invalidCharactersArray = ["*", "'", '"', ":"];
  private _listeners = new Subject<any>();

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

  listen(): Observable<any> {
    return this._listeners.asObservable();
  }

  filter(filterBy: string) {
    this._listeners.next(filterBy);
  }

  RestrictAdmin() {
    this.showWarning("Admin cannot create records.", "Warning")
  }

  private HasInvalidCharacter(string: string) {
    let isInvalid = false;
    this.invalidCharactersArray.map((x) => {
      isInvalid = string.includes(x);
      if (isInvalid) this.showError(`The text cannot contain characters like ${x}`, "Invalid character");
    });
    return isInvalid;
  }

  ValidateTextInputFields() {
    debugger;
    let inputElementArray = document.getElementsByTagName('input');
    let textAreaElementArray = document.getElementsByTagName('textarea');

    let textAreaArray = Array.from(textAreaElementArray);
    let inputArray = Array.from(inputElementArray);

    if ((inputArray == null || inputArray.length == 0) &&
      (textAreaArray == null || textAreaArray.length == 0)) return;

    let textElementArray = inputArray.filter(x => x.type == "text");
    textElementArray.forEach((e) => this.ValidateField(e));
    textAreaArray.forEach((e) => this.ValidateField(e));
  }
  
  ValidateField(x) {
    x.addEventListener('keydown', (event) => {
      if (event.ctrlKey // (A)
        || event.altKey // (A)
        || typeof event.key !== 'string' // (B)
        || event.key.length !== 1) { // (C)
        return;
      }

      if (this.HasInvalidCharacter(event.key)) event.preventDefault();
    }, false);

  }
}

