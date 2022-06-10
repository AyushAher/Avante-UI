import { Component, OnInit } from '@angular/core';
import { ListTypeItem, ProfileReadOnly, User } from "../_models";
import {
  AccountService,
  CustdashboardsettingsService,
  ListTypeService,
  NotificationService,
  ProfileService
} from "../_services";
import { first } from "rxjs/operators";
import { Router } from '@angular/router';

@Component({
  selector: 'app-distributordashboardsettings',
  templateUrl: './distributordashboardsettings.component.html'
})

export class DistributordashboardsettingsComponent implements OnInit {
  model: any
  id: string;
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  user: User
  rowdata1: ListTypeItem[];
  rowdata2: ListTypeItem[];
  Data = []
  localData: any[] = [];

  constructor(
    private router: Router,
    private accountService: AccountService,
    private Service: CustdashboardsettingsService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private listTypeService: ListTypeService,
  ) {
  }

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "DHSET");
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

    this.listTypeService.getById("DDRW1").pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => this.rowdata1 = data
      });

    this.listTypeService.getById("DDRW2").pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => this.rowdata2 = data
      });

    this.id = this.user.userId;

    this.hasAddAccess = this.user.username == "admin";

    this.Service.getById(this.id)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.Data = data.object;
          this.Data.forEach(value => {
            this.localData.push(value);
            let valu = document.getElementById(`chk_${value.graphName}`) as HTMLInputElement;
            valu.checked = true;
          })
        }
      });
  }

  toggle(e, formcontroller) {
    let prev = this.localData.filter(row => row.graphName == e && row.displayIn == formcontroller)
    if (prev.length == 0 || prev == null) {
      this.model = {
        displayIn: formcontroller,
        position: 0,
        isDefault: false,
        dashboardFor: "DHCT",
        graphName: e
      }
      this.localData.push(this.model)
      this.model = null
    } else {
      let indexOfElement = this.localData.findIndex((x) => x.graphName == e && x.displayIn == formcontroller)
      if (indexOfElement >= 0) {
        this.localData.splice(indexOfElement, 1);
      }

    }
  }

  resetOptions() {
    if (confirm("Reset all options to default settings?")) {

      this.Service.reset(this.id, "DHDT")
        .pipe(first())
        .subscribe({
          next: () => { },
        });
    }
  }

  onSubmit() {
    let row1 = 0
    let row2 = 0
    this.localData.forEach(value => {
      switch (value.displayIn) {
        case "row1":
          row1 = row1 + 1
          break;
        case "row2":
          row2 = row2 + 1
          break;
      }
    })
    if (row1 === 2 && row2 === 2) {
      this.Service.update(this.id, this.localData)
        .pipe(first())
        .subscribe({
          next: () => {
            this.router.navigate(["/"])
          },
        });
    } else {
      if (row1 != 2) this.notificationService.showError("Minimum 2 options can be selected for Row 1", "Error")
      if (row2 != 2) this.notificationService.showError("Minimum 2 options can be selected for Row 2", "Error")

    }
  }
}
