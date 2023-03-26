import { Component, OnInit } from '@angular/core';

import { Currency, ResultMsg, ProfileReadOnly, User } from '../_models';
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
  isEditMode: boolean;
  isNewMode: boolean;
  minorUnit_Length_Error: any;
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
      code: ['', [Validators.required, Validators.maxLength(10), Validators.pattern('^[a-zA-Z ]*$')]],
      name: ['', [Validators.required, Validators.maxLength(256)]],
      minor_Unit: ['', [Validators.required, Validators.min(0), Validators.max(99999)]],
      n_Code: ['', [Validators.min(0), Validators.max(99999)]],
      symbol: [''],
      isdeleted: [false],
    });

    this.id = this.route.snapshot.paramMap.get('id');

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
        });
      this.currencyform.disable()
    } else {
      this.isNewMode = true;
    }
  }

  EditMode() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.isEditMode = true;
      this.currencyform.enable();
    }
  }

  Back() {

    if ((this.isEditMode || this.isNewMode)) {
      if (confirm("Are you sure want to go back? All unsaved changes will be lost!"))
        this.router.navigate(["currencylist"]);
    }

    else this.router.navigate(["currencylist"]);

  }

  CancelEdit() {
    this.currencyform.disable()
    this.isEditMode = false;
    this.isNewMode = false;
  }

  DeleteRecord() {
    if (confirm("Are you sure you want to delete the record?")) {
      this.currencyService.delete(this.id).pipe(first())
        .subscribe((data: any) => {
          if (data.result)
        {
          this.router.navigate(["currencylist"]);
        }
        else
        {
          this.notificationService.showInfo(data.resultMessage, "Info");
        }
        })
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.currencyform.controls; }

  onSubmit() {
    //debugger;
    this.submitted = true;
    this.currencyform.markAllAsTouched();
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
              this.notificationService.showInfo(data.resultMessage, "Info");
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
