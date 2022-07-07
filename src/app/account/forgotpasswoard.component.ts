import { Component, OnInit } from '@angular/core';
import { User } from "../_models";
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AccountService, NotificationService } from "../_services";
import { BsModalService } from "ngx-bootstrap/modal";
import { first } from "rxjs/operators";

@Component({
  selector: 'app-forgotpasswoard',
  templateUrl: './forgotpasswoard.component.html',
  styleUrls: ["./style.css"]
})
export class ForgotpasswoardComponent implements OnInit {

  NewPasswoard: string;
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
    this.Form = this.formBuilder.group({
      email: ["", Validators.email]
    })
  }

  get f() {
    return this.Form.controls;
  }

  onValueSubmit() {

    this.submitted = true;
    // stop here if form is invalid
    if (this.Form.invalid) {
      return;
    }
    this.loading = true;
    this.NewPasswoard = this.Form.value.email

    this.accountService.ForgotPassword(this.NewPasswoard)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          if (data.result) {
            this.close();
            this.notificationService.showSuccess(data.resultMessage, "Success");
          } else {

          }
        },
        error: (error: any) => {

        }
      })

    this.loading = false;
  }

  close() {
    //alert('test cholde');
    this.activeModal.hide();
    this.notificationService.filter("itemadded");
  }
}
