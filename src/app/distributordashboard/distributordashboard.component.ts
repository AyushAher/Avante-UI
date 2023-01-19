import { Component, OnInit, ViewChild } from '@angular/core';
import {
  AccountService,
  CustdashboardsettingsService,
  DistributorService,
  InstrumentService,
  ListTypeService,
  ProfileService,
  ServiceRequestService
} from "../_services";
import { ProfileReadOnly, User } from "../_models";
import { first } from "rxjs/operators";
import { DistributordashboardService } from '../_services/distributordashboard.service';
import { Router } from '@angular/router';

declare function DistributorDashboardCharts(): any;

@Component({
  selector: 'app-distributordashboard',
  templateUrl: './distributordashboard.component.html',
  // styleUrls: ['./distributordashboard.component.css']
})
export class DistributordashboardComponent implements OnInit {
  user: User;
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;

  sRRaised: number = 0;
  insHighestSReq: number = 0;
  engHandlingReq: any = []
  instrumnetInstalled: any;
  instrumnetUnderService: any;
  plannedRevenue: any = 0;
  oncallRevenue: any = 0;
  breakdownRevenue: any = 0;
  preventiveRevenue: any = 0;
  amcRevenue: any = 0;
  customerRevenueList: any;
  totalRevenue: any;
  customerRevenueBgColors: any = [
    "#6f42c1",
    "#007bff",
    "#17a2b8",
    "#00cccc",
    "#adb2bd",
  ]
  // calenderLst = ["3MNTHS", "6MNTHS", "12MNTHS"]
  // currentFilter = this.calenderLst[0];

  @ViewChild('3MNTHS') Mnths3;
  @ViewChild('6MNTHS') Mnths6;
  @ViewChild('12MNTHS') Mnths12;

  criticalSerReq: any;
  isHidden: boolean = true;
  constructor(
    private accountService: AccountService,
    private profileService: ProfileService,
    private serviceRequestService: ServiceRequestService,
    private distributorService: DistributorService,
    private router: Router,
    private distributorDashboardService: DistributordashboardService,
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

    setTimeout(() => {
      this.CalenderChange(365)
    }, 500);

    this.serviceRequestService.getAll(this.user.userId)
      .pipe(first()).subscribe((data: any) =>
        this.criticalSerReq = data.object.filter(x => x.isCritical).length)

  }
  CalenderChange(days) {
    this.BtnBackgroundChange(days)
    var e = new Date();
    var s = new Date(new Date().setDate(e.getDate() - days));
    this.onCalenderFilter(s, e)
  }

  CriticalSerReq() {
    this.router.navigate(["/servicerequestlist"])
  }

  toggle = () => this.isHidden = !this.isHidden

  onCalenderFilter(sdate, edate) {
    this.GetInstrumentsInstalled(sdate, edate)
    this.GetRevenuefromCustomer(sdate, edate)
    this.GetServiceContractRevenue(sdate, edate)
    this.GetDistDashboardData(sdate, edate)
    setTimeout(() => DistributorDashboardCharts(), 1000)
  }

  GetInstrumentsInstalled(sdate, edate) {
    this.distributorDashboardService.GetInstrumentInstalled({ distId: "", sdate, edate })
      .pipe(first()).subscribe((data: any) => {
        this.instrumnetInstalled = data.object.instrumentInstalled
        this.instrumnetUnderService = data.object.instrumentUnderService
        let obj = {
          instrumnetInstalled: data.object.instrumentInstalled,
          instrumnetUnderService: data.object.instrumentUnderService
        }
        localStorage.setItem('instrumentData', JSON.stringify(obj))
      })
  }

  GetRevenuefromCustomer(sdate, edate) {
    this.distributorDashboardService.RevenueFromCustomer({ distId: "", sdate, edate })
      .pipe(first()).subscribe((data: any) => {
        this.customerRevenueList = data.object
        this.totalRevenue = data.object.map(x => x.total).reduce((a, b) => a + b, 0);
        localStorage.setItem('customerrevenue', JSON.stringify(data.object))
      })
  }

  GetServiceContractRevenue(sdate, edate) {
    this.distributorDashboardService.ServiceContractRevenue({ distId: "", sdate, edate })
      .pipe(first()).subscribe((data: any) => {
        this.plannedRevenue = data.object.plannedRevenue
        this.oncallRevenue = data.object.oncallRevenue
        this.breakdownRevenue = data.object.breakdownRevenue
        this.preventiveRevenue = data.object.preventiveRevenue
        this.amcRevenue = data.object.amcRevenue

        var parentGrp = data.object?.grpAmc.reduce(function (r, a) {
          r[a.amcServiceTypeCode] = r[a.amcServiceTypeCode] || [];
          r[a.amcServiceTypeCode].push(a);
          return r;
        }, Object.create(null));

        var amcGrp = parentGrp.AMC?.reduce(function (r, a) {
          a.createdon = new Date(a.createdon).getMonth();
          r[a.createdon] = r[a.createdon] || 0;
          r[a.createdon] += (a.zerorate * a.baseCurrencyAmt);

          return r;
        }, Object.create(null));

        var oncallGrp = parentGrp.ONCAL?.reduce(function (r, a) {
          a.createdon = new Date(a.createdon).getMonth();
          r[a.createdon] = r[a.createdon] || 0;
          r[a.createdon] += (a.zerorate * a.baseCurrencyAmt);
          return r;
        }, Object.create(null));

        var prevGrp = parentGrp.PREV?.reduce(function (r, a) {
          a.createdon = new Date(a.createdon).getMonth();
          r[a.createdon] = r[a.createdon] || 0;
          r[a.createdon] += (a.zerorate * a.baseCurrencyAmt);
          return r;
        }, Object.create(null));


        var brkdwGrp = parentGrp.BRKDW?.reduce(function (r, a) {
          a.createdon = new Date(a.createdon).getMonth();
          r[a.createdon] = r[a.createdon] || 0;
          r[a.createdon] += (a.zerorate * a.baseCurrencyAmt);
          return r;
        }, Object.create(null));


        var planGrp = parentGrp.PLAN?.reduce(function (r, a) {
          a.createdon = new Date(a.createdon).getMonth();
          r[a.createdon] = r[a.createdon] || 0;
          r[a.createdon] += (a.zerorate * a.baseCurrencyAmt);
          return r;
        }, Object.create(null));

        var lines = { AMC: amcGrp, PREV: prevGrp, ONCAL: oncallGrp, BRKDW: brkdwGrp, PLAN: planGrp }
        localStorage.setItem('lines', JSON.stringify(lines));

      })
  }

  GetDistDashboardData(sdate, edate) {
    this.distributorService.getByConId(this.user.contactId)
      .pipe(first())
      .subscribe((data: any) => {
        this.serviceRequestService.getDistDashboardData({ distId: data.object[0].id, sdate, edate })
          .pipe(first()).subscribe((sreq: any) => {
            sreq = sreq.object
            let label = []
            let chartData = []
            sreq.instrumentWithHighestServiceRequest.forEach(x => {
              label.push(x.key);
              chartData.push(x.count);
            })

            localStorage.setItem('instrumentWithHighestServiceRequest', JSON.stringify({ label: label, data: chartData }))
            this.sRRaised = sreq.serviceRequestRaised
            this.insHighestSReq = sreq.instrumentWithHighestServiceRequest.length
            this.engHandlingReq = sreq.engHandlingReq
          })
      })
  }

  dateRange(va) {
    if (!va || va.length <= 1) return;

    let sDate = new Date(va[0]);
    let eDate = new Date(va[1]);
    var diff = eDate.getDate() - sDate.getDate()
    this.BtnBackgroundChange(diff);


    this.onCalenderFilter(sDate, eDate);
  }
  BtnBackgroundChange(diff) {
    switch (diff) {
      case 90:
        this.Mnths3.nativeElement.classList.add("active")
        this.Mnths6.nativeElement.classList.remove("active")
        this.Mnths12.nativeElement.classList.remove("active")
        break;

      case 180:
        this.Mnths6.nativeElement.classList.add("active")
        this.Mnths3.nativeElement.classList.remove("active")
        this.Mnths12.nativeElement.classList.remove("active")
        break;

      case 365:
        this.Mnths12.nativeElement.classList.add("active")
        this.Mnths6.nativeElement.classList.remove("active")
        this.Mnths3.nativeElement.classList.remove("active")
        break;


      default:
        this.Mnths6.nativeElement.classList.remove("active")
        this.Mnths3.nativeElement.classList.remove("active")
        this.Mnths12.nativeElement.classList.remove("active")
        break;

    }
  }
}
