import { Component, OnInit } from "@angular/core";
import { ListTypeItem, ProfileReadOnly, User } from "../_models";
import { Router } from "@angular/router";
import { AccountService, ListTypeService, NotificationService, ProfileService } from "../_services";
import { first } from "rxjs/operators";
import { CustdashboardsettingsService } from "../_services/custdashboardsettings.service";

@Component({
  selector: 'app-customerdashboardsettings',
  templateUrl: './custdashboardsettings.html',
})
export class CustdashboardsettingsComponent implements OnInit {
  id: string;
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  user: User
  Data = []
  localData: any[] = [];

  rowdata1: ListTypeItem[];
  rowdata2: ListTypeItem[];
  rowdata3: ListTypeItem[];

  row1Error: boolean = false;
  row2Error: boolean = false;
  row3Error: boolean = false;
  model: any;

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
    if (this.user.isAdmin) {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
      this.hasUpdateAccess = true;
      this.hasReadAccess = true;
    }

    this.listTypeService
      .getById("CDRW1")
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => this.rowdata1 = data
      });

    this.listTypeService.getById("CDRW2")
      .pipe(first()).subscribe({
        next: (data: ListTypeItem[]) => this.rowdata2 = data
      });

    this.listTypeService
      .getById("CDRW3")
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.rowdata3 = data;
        },
      });

    this.id = this.user.userId;

    this.hasAddAccess = this.user.isAdmin;

    this.Service.getById(this.id)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.Data = data.object;
          setTimeout(() => {
            this.Data.forEach(value => {
              let valu = document.getElementById(`chk_${value.graphName}`) as HTMLInputElement
              valu.checked = true
              this.localData.push(value)
            })
          }, 1500);
        }
      });
  }

  toggle(graphName, displayIn) {
    let prev = this.localData.filter(row => row.graphName == graphName && row.displayIn == displayIn)
    if (prev.length == 0 || prev == null) {
      this.model = {
        displayIn,
        position: 0,
        isDefault: false,
        dashboardFor: "DHCT",
        graphName
      }
      this.localData.push(this.model)
    }
    else {
      let indexOfElement = this.localData.findIndex((x) => x.graphName == graphName && x.displayIn == displayIn)
      if (indexOfElement >= 0) {
        this.localData.splice(indexOfElement, 1);
      }
    }

    this.onSubmit()
  }

  resetOptions() {
    if (confirm("Reset all options to default settings?")) {
      this.Service.reset(this.id, "DHCT")
        .pipe(first())
        .subscribe({
          next: (data: any) => { },
        });
    }
  }

  onSubmit() {
    let row1 = 0
    let row2 = 0
    let row3 = 0

    this.localData.forEach(value => {
      value.isactive = true
      value.isdeleted = false
      switch (value.displayIn) {
        case "row1":
          row1 = row1 + 1
          break;
        case "row2":
          row2 = row2 + 1
          break;
        case "row3":
          row3 = row3 + 1
          break;
      }
    })
    if (row1 === 4 && row2 === 3 && row3 === 3) {
      this.Service.update(this.id, this.localData)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.result) this.router.navigate(['']);
          }
        });
    } else {
      if (row1 != 4) this.notificationService.showError("Only 4 options can be selected for Row 1", "Error")
      if (row2 != 3) this.notificationService.showError("Only 3 options can be selected for Row 2", "Error")
      if (row3 != 3) this.notificationService.showError("Only 3 options can be selected for Row 3", "Error")
    }
  }
}
