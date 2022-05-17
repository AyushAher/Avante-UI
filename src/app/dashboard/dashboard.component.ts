import { Component, OnInit } from '@angular/core';
import { ListTypeItem, ProfileReadOnly, User } from "../_models";
import {
  AccountService,
  ContactService,
  CustdashboardsettingsService,
  CustomerService,
  DistributorService,
  InstrumentService,
  ListTypeService,
  NotificationService,
  ProfileService,
  ServiceRequestService,
  SrRecomandService
} from "../_services";
import { first } from "rxjs/operators";
import { CustspinventoryService } from "../_services/custspinventory.service";
import { FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

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

  currentIndex = 0;
  custSite = []
  siteName: string = ""
  siteRegion: string = ""
  currentSiteId: string;
  lstInstrument: any;
  serviceRequestform: any;
  reqtypelist: ListTypeItem[];
  datepipe: any = new DatePipe("en-US");
  logindata: any;
  distId: any;
  siteId: string;
  customerId: any;
  serviceTypeList: ListTypeItem[];
  serviceRequest: any;

  constructor(
    private accountService: AccountService,
    private instrumentService: InstrumentService,
    private profileService: ProfileService,
    private SettingsService: CustdashboardsettingsService,
    private customerService: CustomerService,
    private distributorService: DistributorService,
    private spareRecomService: SrRecomandService,
    private serviceRequestService: ServiceRequestService,
    private notificationService: NotificationService,
    private formbuilder: FormBuilder,
    private custSPInventoryService: CustspinventoryService,
    private contactService: ContactService,
    private listTypeItemService: ListTypeService
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
          localStorage.setItem('spInventoryChart', JSON.stringify({ label: label.reverse(), data: chartData.reverse() }))
        }
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
            bgColor.push(`#${Math.floor(Math.random() * 16777215).toString(16)}`)
          })

          label = [... new Set(label)]

          for (let i = 0; i < label.length; i++) {
            const element = label[i];
            chartData.push(data.object.filter(x => x.visittypeName == element).length)
          }


          let srqType = { label, chartData, bgColor }
          localStorage.setItem('servicerequesttype', JSON.stringify(srqType))

        }
      });

    setTimeout(() => {
      CustomerDashboardCharts()
    }, 1000)

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

                    this.custSite = cust.sites;

                    this.siteName = this.custSite[this.currentIndex].custregname;
                    this.siteRegion = this.custSite[this.currentIndex].regname;
                    this.currentSiteId = this.custSite[this.currentIndex].id;
                    this.GetInstrumentsByCurrentSiteId()
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
            this.spRecomList.forEach((value) => value.assignedTofName = value.assignedTofName + " " + value.assignedTolName)
          },
        });

    }
  }

  next() {
    let max = this.custSite.length - 1;
    this.currentIndex != max ? this.currentIndex++ : this.currentIndex = 0;

    this.siteName = this.custSite[this.currentIndex].custregname;
    this.siteRegion = this.custSite[this.currentIndex].regname;
    this.currentSiteId = this.custSite[this.currentIndex].id;
    this.GetInstrumentsByCurrentSiteId();
  }


  GetInstrumentsByCurrentSiteId() {
    this.instrumentService.getinstubysiteIds(this.currentSiteId)
      .pipe(first()).subscribe((data: any) => {
        this.lstInstrument = data.object;
      })

  }

  prev() {
    this.currentIndex != 0 ? this.currentIndex-- : this.currentIndex++;
    this.siteName = this.custSite[this.currentIndex].custregname;
    this.siteRegion = this.custSite[this.currentIndex].regname;
    this.currentSiteId = this.custSite[this.currentIndex].id;
    this.GetInstrumentsByCurrentSiteId();
  }


  criticalServiceRequest(insId) {

    this.serviceRequestform = this.formbuilder.group({
      sdate: [""],
      edate: [""],
      serreqno: [""],
      distid: [''],
      custid: [''],
      statusid: [''],
      stageid: [''],
      siteid: [''],
      assignedto: [''],
      serreqdate: [''],
      visittype: [''],
      companyname: [''],
      requesttime: [''],
      sitename: [''],
      country: [''],
      contactperson: [''],
      email: [''],
      operatorname: [''],
      operatornumber: [''],
      operatoremail: [''],
      machmodelname: [''],
      machinesno: [''],
      machengineer: [''],
      xraygenerator: [''],
      breakdowntype: [''],
      isrecurring: [false],
      recurringcomments: [''],
      breakoccurdetailsid: [''],
      alarmdetails: [''],
      resolveaction: [''],
      currentinstrustatus: [''],
      accepted: [false],
      serresolutiondate: [''],
      escalation: [''],
      requesttypeid: [''],
      subrequesttypeid: [""],
      remarks: [''],
      delayedReasons: [''],
      isCritical: [true],
      engComments: this.formbuilder.group({
        nextdate: [''],
        comments: ['']
      }),
      assignedHistory: this.formbuilder.group({
        engineername: [''],
        assigneddate: [''],
        ticketstatus: [''],
        comments: ['']
      }),
      engAction: this.formbuilder.group({
        engineername: [''],
        actiontaken: [''],
        comments: [''],
        teamviewerrecroding: [''],
        actiondate: ['']
      })
    });

    this.serviceRequestService.getSerReqNo()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          let srno = data.object;
          this.serviceRequestform.patchValue({ "serreqno": srno });
        },
      });
    this.listTypeItemService.getById('SERTY').pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) =>
          this.serviceRequestform.get('visittype').setValue(data.find(x => x.itemCode == "BRKDW")?.listTypeItemId)
      });

    this.listTypeItemService.getById("TRRQT").pipe(first())
      .subscribe((data: ListTypeItem[]) => {
        this.reqtypelist = data;
        this.serviceRequestform.get('requesttypeid').setValue(data.find(x => x.itemCode == 'CUSTR')?.listTypeItemId);
      });
    this.serviceRequestform.get('requesttime').setValue(this.datepipe.transform(Date.now(), "H:mm"))
    this.serviceRequestform.get('serreqdate').setValue(this.datepipe.transform(Date.now(), "MM/dd/yyyy"))
    this.contactService.getCustomerSiteByContact(this.user.contactId)
      .pipe(first())
      .subscribe({
        next: (data: any) => this.SetCustomerData(data.object)
      });
    this.serviceRequestform.get('machinesno').setValue(insId)
    this.oninstuchange(insId)

    setTimeout(() => {
      this.serviceRequest = this.serviceRequestform.value;
      this.serviceRequest.engComments = [];
      this.serviceRequest.assignedHistory = [];
      this.serviceRequest.engAction = [];
      this.serviceRequest.serresolutiondate = null;

      if (confirm("Are you sure you want to raise a critical request?")) {
        this.serviceRequestService.save(this.serviceRequest).pipe(first())
          .subscribe({
            next: (data: any) => {
              if (data.result)
                this.notificationService.showSuccess(data.resultMessage, "Success")
            }
          })
      }
    }, 1000);

  }

  public oninstuchange(id: string) {
    this.instrumentService.getSerReqInstrument(id)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          var instument = data.object;
          this.siteId = data.object.custSiteId;
          this.serviceRequestform.patchValue({ "machmodelname": instument.instype });
          this.serviceRequestform.patchValue({ "operatorname": instument.operatorEng.fname + '' + instument.operatorEng.lname });
          this.serviceRequestform.patchValue({ "operatornumber": instument.operatorEng.pcontactno });
          this.serviceRequestform.patchValue({ "operatoremail": instument.operatorEng.pemail });
          this.serviceRequestform.patchValue({ "machengineer": instument.machineEng.fname + ' ' + instument.machineEng.lname });
          this.serviceRequestform.patchValue({ "xraygenerator": instument.insversion });
        },
      });

  }

  SetCustomerData(data: any) {
    this.logindata = data;
    this.serviceRequestform.patchValue({ "distid": this.logindata.defdistid });
    this.distId = this.logindata.defdistid;
    this.customerId = this.logindata.id;
    this.serviceRequestform.patchValue({ "country": this.logindata.address?.countryid });
    this.serviceRequestform.patchValue({ "custid": this.logindata?.id });
    this.serviceRequestform.patchValue({ "companyname": this.logindata?.custname });

    this.serviceRequestform.patchValue({ "contactperson": this.user?.username });
    this.serviceRequestform.patchValue({ "email": this.user?.email });

    if (this.logindata.sites != null) {
      this.siteId = this.currentSiteId
      this.serviceRequestform.patchValue({ "sitename": this.logindata.sites[0].custregname });
      this.serviceRequestform.patchValue({ "siteid": this.logindata.sites[0].id });
    }
  }

}
