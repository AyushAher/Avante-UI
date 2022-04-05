import { Component, OnInit } from '@angular/core';

import { Currency, ResultMsg, ProfileReadOnly,User } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import {
  AccountService, AlertService, CurrencyService, NotificationService, ProfileService
} from '../_services';


@Component({
  selector: 'app-currency',
  templateUrl: './currency.html',
})
export class CurrencyComponent implements OnInit {
  currencyform: FormGroup;
  currency: Currency
  loading = false;
  submitted = false;
  isSave = false;
  type: string;
  id: string;
  currencymodel: Currency;
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  user: User;
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private currencyService: CurrencyService,
    private alertService: AlertService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
  ) { }

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SCURR");
      if (profilePermission.length > 0) {
        this.hasReadAccess = profilePermission[0].read;
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
        this.hasUpdateAccess = profilePermission[0].update;
      }
    }
    if (this.user.username == "admin") {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
      this.hasUpdateAccess = true;
      this.hasReadAccess = true;
    }


    this.currencyform = this.formBuilder.group({
      code: ['', [Validators.required, Validators.maxLength(10)]],
      name: ['', [Validators.required, Validators.maxLength(256)]],
      minor_Unit: ['', [Validators.required, Validators.maxLength(5)]]   ,
      n_Code: [''],
      symbol: [''],
      isdeleted: [false],
    });

    this.id = this.route.snapshot.paramMap.get('id');
    console.log(this.id);

    if (this.id != null) {
      this.hasAddAccess = false;
      if (this.user.username == "admin") {
        this.hasAddAccess = true;
      }
      this.currencyService.getById(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.currencyform.patchValue(data.object);
          },
          error: error => {
            
            this.loading = false;
          }
        });
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.currencyform.controls; }

  onSubmit() {
    //debugger;
    this.submitted = true;
    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.currencyform.invalid) {
      return;
    }
    // this.isSave = true;
    this.loading = true;

    this.currency = this.currencyform.value;
    if (this.id == null) {
      this.currencyService.save(this.currency)
        .pipe(first())
        .subscribe({
          next: (data: ResultMsg) => {
            //debugger;
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");

              this.router.navigate(['currencylist']);
            }
            else {
              
            }
            this.loading = false;
          },
          error: error => {
            // this.alertService.error(error);
            
            this.loading = false;
          }
        });
    }
    else {
      this.currency = this.currencyform.value;
      this.currency.id = this.id;
      this.currencyService.update(this.id, this.currency)
        .pipe(first())
        .subscribe({
          next: (data: ResultMsg) => {
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.router.navigate(['currencylist']);

            }
            else {
              
            }
            this.loading = false;

          },
          error: error => {
            
            this.loading = false;
          }
        });
    }
  }

}
