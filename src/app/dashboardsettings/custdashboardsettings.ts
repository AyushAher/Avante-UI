// noinspection DuplicatedCode

import {Component, OnInit} from "@angular/core";
import {ListTypeItem, ProfileReadOnly, User} from "../_models";
import {FormBuilder, FormGroup} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {AccountService, AlertService, ListTypeService, NotificationService, ProfileService} from "../_services";
import {first} from "rxjs/operators";
import {CustdashboardsettingsService} from "../_services/custdashboardsettings.service";

@Component({
  selector: 'app-customer',
  templateUrl: './custdashboardsettings.html',
})
export class CustdashboardsettingsComponent implements OnInit {
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
  Data = []

  rowdata1: ListTypeItem[];
  rowdata2: ListTypeItem[];
  rowdata3: ListTypeItem[];
  row1Error: boolean = false;
  row2Error: boolean = false;
  row3Error: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private Service: CustdashboardsettingsService,
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
      displayin: "",
      position: 0,
      isdefault: false,
      dashboardfor: "DHCT",
      graphname: ""
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

    this.hasAddAccess = this.user.username == "admin";

    this.Service.getById(this.id)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.Data = data.object;
          this.Data.forEach(value => {
            let valu = document.getElementById(`chk_${value.graphName}`) as HTMLInputElement
            valu.checked = true
          })
        },
        error: error => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });
  }

  toggle(e, formcontroller) {
    let prev = this.Data.filter(row => row.graphname == e)
    this.model = this.form.value
    this.model.displayin = formcontroller
    this.model.position = 0
    this.model.graphname = e
    this.model.dashboardfor = "DHCT"
    this.model.isdefault = false
    debugger;
    if (prev.length == 0 || prev == null) {
      this.Data.push(this.model)
    } else {
      let indexOfElement = this.Data.indexOf(this.model)
      this.Data.splice(indexOfElement, 1)

    }
    this.model = null
    this.form.reset()

  }

  // resetOptions() {
  //   if (confirm("Reset all options to default settings?")) {
  //
  //     this.row1Data = ["3111664b-50dc-11ec-8b07-1c39472d435b", "3112bc8d-50dc-11ec-8b07-1c39472d435b", "31146d57-50dc-11ec-8b07-1c39472d435b", "31161195-50dc-11ec-8b07-1c39472d435b"]
  //     this.Data = ["311a14f0-50dc-11ec-8b07-1c39472d435b", "311b60af-50dc-11ec-8b07-1c39472d435b", "311cb2f0-50dc-11ec-8b07-1c39472d435b"]
  //     this.row3Data = ["3122bea2-50dc-11ec-8b07-1c39472d435b", "312604bc-50dc-11ec-8b07-1c39472d435b", "3127b51b-50dc-11ec-8b07-1c39472d435b"]
  //
  //     this.model = this.form.value;
  //     this.model.userId = this.user.userId
  //
  //     this.model.row1 = this.row1Data.toString()
  //     this.model.row2 = this.Data.toString()
  //     this.model.row3 = this.row3Data.toString()
  //
  //     this.Service.update(this.id, this.model)
  //       .pipe(first())
  //       .subscribe({
  //         next: (data: ResultMsg) => {
  //           if (data.result) {
  //             this.notificationService.showSuccess("Settings Restored to default", "Success");
  //             this.router.navigate(['']);
  //
  //           } else {
  //             this.notificationService.showError(data.resultMessage, "Error");
  //           }
  //           this.loading = false;
  //         },
  //         error: error => {
  //           this.notificationService.showError(error, "Error");
  //           this.loading = false;
  //         }
  //       });
  //   }
  // }

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


    this.Service.update(this.id, this.Data)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
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
