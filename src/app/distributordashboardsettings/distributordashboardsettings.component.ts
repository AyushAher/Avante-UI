import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {ListTypeItem, ProfileReadOnly, ResultMsg, User} from "../_models";
import {ActivatedRoute, Router} from "@angular/router";
import {
  AccountService,
  AlertService,
  DistributordashboardsettingsService,
  ListTypeService,
  NotificationService,
  ProfileService
} from "../_services";
import {first} from "rxjs/operators";

@Component({
  selector: 'app-distributordashboardsettings',
  templateUrl: './distributordashboardsettings.component.html'
})

export class DistributordashboardsettingsComponent implements OnInit {
  form: FormGroup;
  model: any
  loading = false;
  submitted = false;
  isSave = false;
  type: string;
  id: string;
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  user: User
  row1Data = []
  row2Data = []

  rowdata1: ListTypeItem[];
  rowdata2: ListTypeItem[];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private Service: DistributordashboardsettingsService,
    private alertService: AlertService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private listTypeService: ListTypeService,
  ) {
  }

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


    this.form = this.formBuilder.group({
      row1: [''],
      row2: [''],
    });

    this.listTypeService
      .getById("DDRW1")
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.rowdata1 = data;
        },
        error: (error) => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        },
      });

    this.listTypeService
      .getById("DDRW2")
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.rowdata2 = data;
        },
        error: (error) => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        },
      });

    this.id = this.user.userId;

    this.hasAddAccess = this.user.username == "admin";
    this.Service.getById(this.id)
      .pipe(first())
      .subscribe({
        next: (data: any) => {

          var Object = data.object
          this.row1Data = Object.row1.split(",")
          this.row1Data.forEach(value => {
            console.log(value)
            let r1 = document.getElementById(value) as HTMLInputElement
            r1.checked = true
          })

          this.row2Data = Object.row2.split(",")
          this.row2Data.forEach(value => {
            console.log(value)
            let r2 = document.getElementById(value) as HTMLInputElement
            r2.checked = true
          })
        },
        error: error => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });
  }

  toggle(e, formcontroller) {
    let indexOfChecked
    switch (formcontroller) {
      case "row1":
        indexOfChecked = this.row1Data.indexOf(e)
        // if item is in the list
        if (indexOfChecked >= 0) {
          this.row1Data.splice(indexOfChecked, 1)
        } else {
          this.row1Data.push(e)
        }
        break
      case 'row2':
        indexOfChecked = this.row2Data.indexOf(e)
        // if item is in the list
        if (indexOfChecked >= 0) {
          this.row2Data.splice(indexOfChecked, 1)
        } else {
          this.row2Data.push(e)
        }
        break
    }
  }

  resetOptions() {
    if (confirm("Reset all options to default settings?")) {

      this.row1Data = ['62df0bd7-4c98-11ec-9dbc-54bf64020316', '62e0af36-4c98-11ec-9dbc-54bf64020316', '62e2b128-4c98-11ec-9dbc-54bf64020316', '62e476d4-4c98-11ec-9dbc-54bf64020316']
      this.row2Data =['62e8e7d1-4c98-11ec-9dbc-54bf64020316','62e7616e-4c98-11ec-9dbc-54bf64020316']

      this.model = this.form.value;
      this.model.userId = this.user.userId

      this.model.row1 = this.row1Data.toString()
      this.model.row2 = this.row2Data.toString()

      this.Service.update(this.id, this.model)
        .pipe(first())
        .subscribe({
          next: (data: ResultMsg) => {
            if (data.result) {
              this.notificationService.showSuccess("Settings Restored to default", "Success");
              this.router.navigate(['']);

            } else {
              this.notificationService.showError(data.resultMessage, "Error");
            }
            this.loading = false;
          },
          error: error => {
            this.notificationService.showError(error, "Error");
            this.loading = false;
          }
        });
    }
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.form.controls;
  }

  onSubmit() {
    //debugger;
    this.submitted = true;
    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }
    // this.isSave = true;
    this.loading = true;

    this.model = this.form.value;
    this.model.userId = this.user.userId

    this.model.row1 = this.row1Data.toString()
    this.model.row2 = this.row2Data.toString()

    this.Service.update(this.id, this.model)
      .pipe(first())
      .subscribe({
        next: (data: ResultMsg) => {
          if (data.result) {
            this.notificationService.showSuccess(data.resultMessage, "Success");
            this.router.navigate(['']);

          } else {
            this.notificationService.showError(data.resultMessage, "Error");
          }
          this.loading = false;

        },
        error: error => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });
  }

}
