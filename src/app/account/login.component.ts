import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService, NotificationService } from '../_services';
import { ChangepasswoardComponent } from "./changepasswoard.component";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { ForgotpasswoardComponent } from "./forgotpasswoard.component";

@Component({ templateUrl: 'login.component.html' })
export class LoginComponent implements OnInit {
  form: FormGroup;
  loading = false;
  submitted = false;
  bsModalRef: BsModalRef;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private notificationService: NotificationService,
    private modalService: BsModalService,
  ) { }

  ngOnInit() {
    //debugger;

    if (localStorage.getItem('user') !== null) {
      localStorage.removeItem('user');
      localStorage.removeItem('userprofile');
    }

    this.form = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.form.controls;
  }

  ForgotPassword() {
    this.bsModalRef = this.modalService.show(ForgotpasswoardComponent);
  }

  onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    this.accountService.login(this.f.username.value, this.f.password.value)
      .pipe(first())
      .subscribe({
        next: () => {
          // get return url from query parameters or default to home page
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigateByUrl(returnUrl);
        },
        error: error => {
          this.loading = false;
        }
      });
  }
}
