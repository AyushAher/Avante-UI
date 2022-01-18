import {Component, OnInit} from '@angular/core';
import {
  AccountService,
  CustdashboardsettingsService,
  DistributorService,
  InstrumentService,
  ListTypeService,
  ProfileService,
  ServiceRequestService
} from "../_services";
import {ProfileReadOnly, User} from "../_models";
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

  sRRaised: number = 0;
  insInstalled: number = 0;
  insHighestSReq: number = 0;
  engHandlingReq: any = []

  constructor(
    private accountService: AccountService,
    private listTypeService: ListTypeService,
    private SettingsService: CustdashboardsettingsService,
    private profileService: ProfileService,
    private serviceRequestService: ServiceRequestService,
    private distributorService: DistributorService,
    private instrumnetService: InstrumentService
  ) {
  }

  ngOnInit() {
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
        .subscribe((data0: any) => {
          let data = data0.object;
          if (data != null && data.length > 0 && data0.result) {
            data.forEach(x => document.getElementById(x.graphNameCode).style.visibility = "visible")
          }
        })

      this.distributorService.getByConId(this.user.contactId)
        .pipe(first())
        .subscribe((data: any) => {
          let distId = data.object[0].id
          this.instrumnetService.getAll(this.user.userId).pipe(first())
            .subscribe((ins: any) => this.insInstalled = ins.object.filter(x => x.installby == distId).length)

          this.serviceRequestService.getDistDashboardData(distId).pipe(first()).subscribe((sreq: any) => {
            sreq = sreq.object
            let label = []
            let chartData = []
            sreq.instrumentWithHighestServiceRequest.forEach(x => {
                label.push(x.key);
                chartData.push(x.count);
              }
            )

            localStorage.setItem('instrumentWithHighestServiceRequest', JSON.stringify({label: label, data: chartData}))
            this.sRRaised = sreq.serviceRequestRaised
            this.insHighestSReq = sreq.instrumentWithHighestServiceRequest.length
            this.engHandlingReq = sreq.engHandlingReq
          })
        })

    }
    DistributorDashboardCharts()
  }
}
