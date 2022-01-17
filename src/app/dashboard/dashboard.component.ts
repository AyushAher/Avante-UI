import {Component, OnInit} from '@angular/core';
import {ProfileReadOnly, User} from "../_models";
import {
  AccountService,
  CustdashboardsettingsService,
  CustomerService,
  DistributorService,
  ListTypeService,
  ProfileService,
  ServiceRequestService,
  SrRecomandService
} from "../_services";
import {first} from "rxjs/operators";
import {DatePipe} from "@angular/common";
import {CustspinventoryService} from "../_services/custspinventory.service";

declare function CustomerDashboardCharts(): any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./css/material-dashboard.min.css', './css/nucleo-icons.css', './css/nucleo-svg.css']
})
export class DashboardComponent implements OnInit {
  user: User;

  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;


  customerName: string
  customerCountry: string;
  totalCustContacts: number = 0
  custDefDistName: string
  custDefDistId: any
  defDistCountryName: any
  spRecomList: any
  srList: any

  constructor(
    private accountService: AccountService,
    private listTypeService: ListTypeService,
    private profileService: ProfileService,
    private SettingsService: CustdashboardsettingsService,
    private customerService: CustomerService,
    private distributorService: DistributorService,
    private spareRecomService: SrRecomandService,
    private serviceRequestService: ServiceRequestService,
    private custSPInventoryService: CustspinventoryService,
  ) {
  }

  ngOnInit() {

    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;

    this.custSPInventoryService.getAll(this.user.contactId, null)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          let label = []
          let chartData = []
          data.object = data.object.splice(0, 5)
          data.object.forEach(x => {
            label.push(x.partNo)
            chartData.push(x.qtyAvailable)
          })
          localStorage.setItem('spInventoryChart', JSON.stringify({label: label, data: chartData}))
        }
      });

    CustomerDashboardCharts()

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

              this.customerService.getAllByConId(this.user.contactId)
                .pipe(first())
                .subscribe({
                  next: (data: any) => {
                    let cust = data.object[0]
                    this.customerName = cust?.custname;
                    this.customerCountry = cust?.address.countryName
                    this.custDefDistName = cust.defdist
                    this.custDefDistId = cust.defdistid

                    data.object.forEach(x => {
                      this.totalCustContacts += x.contacts.length
                      x.sites.forEach(y => this.totalCustContacts += y.contacts.length)
                    })

                    this.distributorService.getById(cust.defdistid)
                      .pipe(first())
                      .subscribe({
                        next: (dist: any) => this.defDistCountryName = dist.object.address.countryName
                      })

                  }
                })
            }
          }
        })

      this.spareRecomService.getByGrid(this.user.contactId)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.spRecomList = data.object;
            const datepipie = new DatePipe("en-US");

            this.spRecomList.forEach((value) => {
              value.assignedTofName = value.assignedTofName + " " + value.assignedTolName
              value.serviceReportDate = datepipie.transform(
                value.serviceReportDate,
                "MM/dd/yyyy"
              );
            })
          },
        });

      this.serviceRequestService.getAll(this.user.userId)
        .pipe(first())
        .subscribe({
          next: (data: any) => {

            let label = []
            let chartData = []
            let bgColor = []

            data.object.forEach(x => {
              label.push(x.visittypeName)
              chartData.push(data.object.filter(x => x.visittype == x.visittype).length)
              bgColor.push(`#${Math.floor(Math.random() * 16777215).toString(16)}`)
            })

            let srqType = {label: label, chartData: chartData, bgColor: bgColor}
            localStorage.setItem('servicerequesttype', JSON.stringify(srqType))

            this.srList = data.object.filter(x => x.createdby == this.user.userId);
          }
        });

    }
  }

}
