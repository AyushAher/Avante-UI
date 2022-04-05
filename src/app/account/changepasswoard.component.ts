import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AccountService, NotificationService} from "../_services";
import {BsModalService} from "ngx-bootstrap/modal";
import {ChangePasswordModel, User} from "../_models";
import {FormBuilder, Validators} from "@angular/forms";
import {first} from "rxjs/operators";

@Component({
  selector: 'app-changepasswoard',
  templateUrl: './changepasswoard.component.html',
})
export class ChangepasswoardComponent implements OnInit {
  NewPasswoard: ChangePasswordModel;
  user: User;
  Form: any;
  loading: boolean = false;
  submitted: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private notificationService: NotificationService,
    public activeModal: BsModalService
  ) {
  }

  ngOnInit() {

    this.user = this.accountService.userValue;

    this.Form = this.formBuilder.group({
      oPass: ['', Validators.required],
      nPass: ['', [Validators.required, Validators.minLength(8)]],
      cPass: ['', [Validators.required, Validators.minLength(8)]],
    })
  }

  get f() {
    return this.Form.controls;
  }

  onValueSubmit() {

    this.submitted = true;
    // stop here if form is invalid
    if (this.Form.invalid) {
      console.log(this.Form)
      return;
    }
    // this.isSave = true;
    this.loading = true;

    this.NewPasswoard = this.Form.value
    this.NewPasswoard.userId = this.user.userId;

    if (this.Form.get('nPass').value == this.Form.get('cPass').value) {
      console.log('data');
      this.accountService.ChangePassword(this.NewPasswoard)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.result) {
              this.close();
              this.notificationService.showSuccess(data.resultMessage, "Success");
            } else {
              
            }
          },
        })
    } else {
      this.notificationService.showError("Password Does Not Match", "Error");
    }
    this.loading = false;
  }

  close() {
    //alert('test cholde');
    this.activeModal.hide();
    console.log('hide')
    this.notificationService.filter("itemadded");
  }
}
