import {Component, OnInit} from '@angular/core';
import {ProfileReadOnly, User} from "../_models";
import {AccountService, CustdashboardsettingsService, ListTypeService, ProfileService} from "../_services";
import {first} from "rxjs/operators";

declare function CustomerDashboardCharts(): any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./css/material-dashboard.min.css', './css/nucleo-icons.css', './css/nucleo-svg.css']
})
export class DashboardComponent implements OnInit {
  user: User;
  row1: string[]
  row2: string[]
  row3: string[]

  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;

  constructor(
    private accountService: AccountService,
    private listTypeService: ListTypeService,
    private profileService: ProfileService,
    private SettingsService: CustdashboardsettingsService,
  ) {
  }

  ngOnInit() {
    CustomerDashboardCharts()
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "CUSDH");
      if (profilePermission.length > 0) {
        this.hasReadAccess = profilePermission[0].read;
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
        this.hasUpdateAccess = profilePermission[0].update;
      }
    }

    if (this.hasReadAccess) {
      this.SettingsService.getById(this.user.userId)
        .pipe(first())
        .subscribe({
          next: (data0: any) => {
            let data = data0.object
            if (data != null && data.length > 0 && data0.result) {
              data.forEach(x => {
                document.getElementById(x.graphNameCode).style.display = "block";
              })

          }
        }
      })
    }
  }
}
