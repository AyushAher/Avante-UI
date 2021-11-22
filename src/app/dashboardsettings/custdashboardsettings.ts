// noinspection DuplicatedCode

import {Component, OnInit} from "@angular/core";
import {ListTypeItem, ProfileReadOnly, ResultMsg, User} from "../_models";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {
  AccountService,
  AlertService,
  custdashboardsettingsService,
  ListTypeService,
  NotificationService,
  ProfileService
} from "../_services";
import {first} from "rxjs/operators";
import {IDropdownSettings} from "ng-multiselect-dropdown";

@Component({
  selector: 'app-customer',
  templateUrl: './custdashboardsettings.html',
})
export class Custdashboardsettings implements OnInit {
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
  user: User;
  rowdata1: ListTypeItem[];
  rowdata2: ListTypeItem[];
  rowdata3: ListTypeItem[];

  rowdatalist1: IDropdownSettings = {};
  rowdatalist2: IDropdownSettings = {};
  rowdatalist3: IDropdownSettings = {};

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private Service: custdashboardsettingsService,
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
      row1: ['', Validators.required],
      row2: ['', Validators.required],
      row3: ['', Validators.required],
    });

    this.listTypeService
      .getById("CDRW1")
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
      .getById("CDRW2")
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

    this.listTypeService
      .getById("CDRW3")
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.rowdata3 = data;
        },
        error: (error) => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        },
      });

    this.id = this.user.userId;
    if (this.id != null) {
      this.hasAddAccess = this.user.username == "admin";
      this.Service.getById(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {

            var subreq1 = data.object.row1.split(',');
            var subreq2 = data.object.row2.split(',');
            var subreq3 = data.object.row3.split(',');


            let items1: ListTypeItem[] = [];
            if (subreq1.length > 0) {
              for (var i = 0; i < subreq1.length; i++) {
                let t = new ListTypeItem();
                t.listTypeItemId = subreq1[i];
                items1.push(t);
              }
            }
            let items2: ListTypeItem[] = [];
            if (subreq2.length > 0) {
              for (var i = 0; i < subreq2.length; i++) {
                let t = new ListTypeItem();
                t.listTypeItemId = subreq2[i];
                items2.push(t);
              }
            }
            let items3: ListTypeItem[] = [];
            if (subreq3.length > 0) {
              for (var i = 0; i < subreq3.length; i++) {
                let t = new ListTypeItem();
                t.listTypeItemId = subreq3[i];
                items3.push(t);
              }
            }

            this.form.patchValue({"row1": items1});
            this.form.patchValue({"row2": items2});
            this.form.patchValue({"row3": items3});
          },
          error: error => {
            this.notificationService.showError(error, "Error");
            this.loading = false;
          }
        });
    }
    this.rowdatalist1 = {
      idField: 'listTypeItemId',
      textField: 'itemname',
      limitSelection: 4
    };
    this.rowdatalist2 = {
      idField: 'listTypeItemId',
      textField: 'itemname',
      limitSelection: 3
    };
    this.rowdatalist3 = {
      idField: 'listTypeItemId',
      textField: 'itemname',
      limitSelection: 3
    };
  }

  resetOptions() {

    if (confirm("Reset all options to default settings?")) {


      this.form.value.row1 = "cc0d4cc1-4bc3-11ec-9dbc-54bf64020316,cc0ff452-4bc3-11ec-9dbc-54bf64020316,cc0ba5a9-4bc3-11ec-9dbc-54bf64020316,cc0ecdbb-4bc3-11ec-9dbc-54bf64020316"
      this.form.value.row2 = "cc152dcd-4bc3-11ec-9dbc-54bf64020316,cc125e01-4bc3-11ec-9dbc-54bf64020316,cc13e0f4-4bc3-11ec-9dbc-54bf64020316"
      this.form.value.row3 = "cc1af8e8-4bc3-11ec-9dbc-54bf64020316,cc1c8605-4bc3-11ec-9dbc-54bf64020316,cc17d3ae-4bc3-11ec-9dbc-54bf64020316"

      this.model = this.form.value;
      this.model.userId = this.user.userId

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
    var form = this.form
    var selectarray1 = form.get('row1').value;
    form.value.row1 = selectarray1.map(x => x.listTypeItemId).join(',');

    var selectarray2 = form.get('row2').value;
    form.value.row2 = selectarray2.map(x => x.listTypeItemId).join(',');

    var selectarray3 = form.get('row3').value;
    form.value.row3 = selectarray3.map(x => x.listTypeItemId).join(',');

    this.model = this.form.value;
    this.model.userId = this.user.userId

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
