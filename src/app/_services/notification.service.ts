import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class NotificationService {

  private invalidCharactersArray = ["*", "'", '"', ":"];
  private _listeners = new Subject<any>();

  constructor(private toastr: ToastrService, private activeRoute: ActivatedRoute,
    private router: Router) { }

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

  SetNavParam() {
    this.router.navigate(
      [],
      {
        relativeTo: this.activeRoute,
        queryParams: { isNSNav: true },
        //queryParamsHandling: 'merge'
      });
  }


  ValidateTextInputFields() {
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

      this.invalidCharactersArray.map((y) => {
        if (event.key.includes(y)) {
          this.showError(`The text cannot contain characters like ${y}`, "Invalid character");
          event.preventDefault();
        }
      });
    }, false);

  }
}

