import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountService, AlertService } from '../_services';
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { ForgotpasswoardComponent } from "./forgotpasswoard.component";

@Component({
  templateUrl: 'login.component.html',
  styleUrls: ["style.css"]
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  loading = false;
  submitted = false;
  bsModalRef: BsModalRef;

  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private alertService: AlertService,
    private modalService: BsModalService,
  ) { }

  ngOnInit() {
    //debugger;

    if (sessionStorage.getItem('user') !== null) {
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('userprofile');
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
    this.loading = true;
    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    sessionStorage.setItem('password', this.f.password.value);
    this.accountService.Authenticate(this.f.username.value, this.f.password.value, "", "", "")
    setTimeout(() => this.loading = false, 5000);
  }

}
