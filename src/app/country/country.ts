import { Component, OnInit } from '@angular/core';

import { Country, Currency, ListTypeItem, ResultMsg, ProfileReadOnly, User } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import {
  AccountService, AlertService, CountryService, CurrencyService, ListTypeService, NotificationService, ProfileService
} from '../_services';


@Component({
  selector: 'app-country',
  templateUrl: './country.html',
})
export class CountryComponent implements OnInit {
  user: User;
  countryform: FormGroup;
  loading = false;
  submitted = false;
  isSave = false;
  id: string;
  country: Country;
  continents: ListTypeItem[];
  currency: Currency[];
  code: string = "CONTI";
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  isNewMode: boolean;
  isEditMode: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private countryService: CountryService,
    private currencyService: CurrencyService,
    private listTypeService: ListTypeService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
  ) { }

  ngOnInit() {

    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SCOUN");
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


    this.countryform = this.formBuilder.group({
      name: ['', Validators.required],
      iso_2: ['', Validators.required],
      iso_3: ['', Validators.required],
      formal: [''],
      region: ['', Validators.required],
      sub_Region: [''],
      capital: [''],
      continentid: ['', Validators.required],
      currencyid: ['', Validators.required],
      isdeleted: [false],
    });

    this.currencyService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.currency = data.object;
        }
      });

    this.listTypeService.getById(this.code)
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.continents = data;
        },
      });

    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id != null) {
      this.hasAddAccess = false;
      if (this.user.username == "admin") {
        this.hasAddAccess = true;
      }
      this.countryService.getById(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.countryform.patchValue(data.object);
          },
        });
      this.countryform.disable()
    } else {
      this.isNewMode = true;
    }

  }

  EditMode() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.isEditMode = true;
      this.countryform.enable();
    }
  }

  Back() {

    if ((this.isEditMode || this.isNewMode)) {
      if (confirm("Are you sure want to go back? All unsaved changes will be lost!"))
        this.router.navigate(["countrylist"]);
    }

    else this.router.navigate(["countrylist"]);

  }

  CancelEdit() {
    this.countryform.disable()
    this.isEditMode = false;
    this.isNewMode = false;
  }

  DeleteRecord() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.countryService.delete(this.id).pipe(first())
        .subscribe((data: any) => {
          if (data.result)
            this.router.navigate(["countrylist"]);
        })
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.countryform.controls; }

  onSubmit() {
    //debugger;
    this.submitted = true;
    this.countryform.markAllAsTouched();
    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.countryform.invalid) {
      return;
    }
    this.isSave = true;
    this.loading = true;
    if (this.id == null) {

      this.countryService.save(this.countryform.value)
        .pipe(first())
        .subscribe({
          next: (data: ResultMsg) => {
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.router.navigate(['countrylist']);
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
    else {
      this.country = this.countryform.value;
      this.country.id = this.id;
      this.countryService.update(this.id, this.country)
        .pipe(first())
        .subscribe({
          next: (data: ResultMsg) => {
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.router.navigate(['countrylist']);
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
