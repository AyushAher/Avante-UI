import {Component, OnInit} from '@angular/core';
import {AccountService, CustdashboardsettingsService, ListTypeService, ProfileService} from "../_services";
import {ListTypeItem, ProfileReadOnly, User} from "../_models";
import {first} from "rxjs/operators";

declare function DistributorDashboardCharts(): any;

@Component({
  selector: 'app-distributordashboard',
  templateUrl: './distributordashboard.component.html',
  styleUrls: ['./distributordashboard.component.css']
})
export class DistributordashboardComponent implements OnInit {
  user: User;
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;

  constructor(
    private accountService: AccountService,
    private listTypeService: ListTypeService,
    private SettingsService: CustdashboardsettingsService,
    private profileService: ProfileService,
  ) {
  }

  ngOnInit() {
    DistributorDashboardCharts()
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "DISDH");
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
            let data = data0.object;
            if (data != null && data.length > 0 && data0.result) {
              data.forEach(x => {
                document.getElementById(x.graphNameCode).style.visibility = "visible";
              })
            }
          }
        })
    }
  }
}
