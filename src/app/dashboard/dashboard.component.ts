import { Component, OnInit, ViewChild } from '@angular/core';
import { ListTypeItem, ProfileReadOnly, User } from "../_models";
import {
  AccountService,
  ContactService,
  CustomerService,
  DistributorService,
  InstrumentService,
  ListTypeService,
  NotificationService,
  ServiceRequestService,
  SrRecomandService
} from "../_services";
import { first } from "rxjs/operators";
import { FormBuilder } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { CustomerdashboardService } from '../_services/customerdashboard.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { CostofownershipComponent } from '../costofownership/costofownership.component';
import { OfferrequestService } from '../_services/Offerrequest.service';
import { CustspinventoryService } from '../_services/custspinventory.service';

declare function CustomerDashboardCharts(): any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
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
  srList: any;
  amcData: any;
  bsModalRef: BsModalRef;
  calenderLst = ["3MNTHS", "6MNTHS", "12MNTHS"]
  costData: any[];

  @ViewChild('3MNTHS') Mnths3;
  @ViewChild('6MNTHS') Mnths6;
  @ViewChild('12MNTHS') Mnths12;

  instruemntLength = 0;
  shipmentInProcess: number = 0;
  isHidden: boolean = true;
  spInventory: any;
  isSiteContact: boolean;

  constructor(
    private accountService: AccountService,
    private distributorService: DistributorService,
    private serviceRequestService: ServiceRequestService,
    private notificationService: NotificationService,
    private formbuilder: FormBuilder,
    private contactService: ContactService,
    private listTypeItemService: ListTypeService,
    private modalService: BsModalService,
    private customerDashboardService: CustomerdashboardService,
    private offerRequestService: OfferrequestService,
    private custSpInventoryService: CustspinventoryService
  ) {
  }

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.isSiteContact = this.user.userType.toLowerCase() != "site"

    setTimeout(() => {
      this.CalenderChange(365)
    }, 500);

    this.customerDashboardService.GetCustomerDetails()
      .subscribe((data: any) => {
        let cust = data.object
        this.custSite = cust.sites;

        this.siteName = this.custSite[this.currentIndex].custregname;
        this.siteRegion = this.custSite[this.currentIndex].regname;
        this.currentSiteId = this.custSite[this.currentIndex].id;
        this.customerName = cust?.custname;
        this.GetInstrumentsByCurrentSiteId()
        this.customerCountry = cust?.address.countryName
        this.custDefDistName = cust.defdist
        this.custDefDistId = cust.defdistid

        this.totalCustContacts += cust.contacts.length
        cust.sites.forEach(y => this.totalCustContacts += y.contacts.length)

        this.distributorService.getById(cust.defdistid)
          .pipe(first()).subscribe((dist: any) => this.defDistCountryName = dist.object.address.countryName)

      })

    this.offerRequestService.getAll().pipe(first())
      .subscribe((OfReqData: any) => this.shipmentInProcess = OfReqData.object?.filter(x => !x.isCompleted && x.isShipment)?.length)

    this.custSpInventoryService.getAll(this.user.contactId).pipe(first())
      .subscribe((spInv: any) => this.spInventory = spInv.object)
  }

  CalenderChange(days) {
    this.BtnBackgroundChange(days)
    var e = new Date();
    var s = new Date(new Date().setDate(e.getDate() - days));
    this.onCalenderFilter(s, e)
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

  toggle = () => this.isHidden = !this.isHidden

  onCalenderFilter(sdate, edate) {
    this.getServiceRequestData(sdate, edate);
    this.GetAllAMC(sdate, edate);
    this.GetPoCost(sdate, edate);
    this.GetSparePartsRecommended(sdate, edate);
    setTimeout(() => CustomerDashboardCharts(), 2000)
  }


  GetSparePartsRecommended(sdate, edate) {
    this.customerDashboardService.GetSparePartsRecommended()
      .subscribe((data: any) => {
        this.spRecomList = [];
        data.object.forEach((value) => {
          if (this.GetDiffDate(new Date(value.createdOn), edate, sdate)) {
            value.assignedTofName = value.assignedTofName + " " + value.assignedTolName
            this.spRecomList.push(value)
          }
        })
      });

  }

  getServiceRequestData(sdate, edate) {
    this.customerDashboardService.GetAllServiceRequest()
      .pipe(first()).subscribe((data: any) => {

        let label = []
        var pendingRequestLabels = []
        var pendingRequestValue = []
        let chartData = []
        let bgColor = []
        let pendingrequestBgColor = []
        // data.object = data.object.filter(x => !x.isReportGenerated)
        data.object.forEach(x => {
          if (this.GetDiffDate(new Date(x.createdon), edate, sdate)) {

            if (x.isReportGenerated == false)
              pendingRequestLabels.push(x.visittypeName)
            else
              label.push(x.visittypeName)
          }
        })

        label = [... new Set(label)]
        pendingRequestLabels = [... new Set(pendingRequestLabels)]

        for (let i = 0; i < label.length; i++) {
          const element = label[i];
          chartData.push(data.object.filter(x => x.visittypeName == element && x.isReportGenerated == true && this.GetDiffDate(new Date(x.createdon), edate, sdate)).length)
          bgColor.push(`#${Math.floor(Math.random() * 16777215).toString(16)}`)
        }

        for (let i = 0; i < pendingRequestLabels.length; i++) {
          const element = pendingRequestLabels[i];
          pendingRequestValue.push(data.object.filter(x => x.visittypeName == element && x.isReportGenerated == false && this.GetDiffDate(new Date(x.createdon), edate, sdate)).length)
          pendingrequestBgColor.push(`#${Math.floor(Math.random() * 16777215).toString(16)}`)
        }

        sessionStorage.setItem('servicerequesttype', JSON.stringify({ label, chartData }))
        sessionStorage.setItem('pendingservicerequest', JSON.stringify({ chartData: pendingRequestValue, label: pendingRequestLabels }))

        this.srList = data.object.filter(x => this.GetDiffDate(new Date(x.createdon), edate, sdate));
      });

  }

  GetAllAMC(sdate, edate) {
    this.customerDashboardService.GetAllAmc()
      .subscribe((data: any) => {
        this.amcData = data.object.filter(x => this.GetDiffDate(new Date(x.createdon), edate, sdate) && !x.isCompleted);
      })
  }

  GetDiffDate(createdOn: Date, edate: Date, sdate: Date) {
    var seCompare = edate.getTime() - sdate.getTime()
    seCompare = seCompare / (1000 * 60 * 60 * 24)

    var eCompare = edate.getTime() - createdOn.getTime()
    eCompare = eCompare / (1000 * 60 * 60 * 24)

    var sCompare = createdOn.getTime() - sdate.getTime()
    sCompare = sCompare / (1000 * 60 * 60 * 24)

    if (sCompare < 0) return false;
    if (seCompare < 0) return false;
    if (eCompare < 0) return false;
    return true;
  }


  next() {
    let max = this.custSite.length - 1;
    this.currentIndex != max ? this.currentIndex++ : this.currentIndex = 0;

    this.siteName = this.custSite[this.currentIndex].custregname;
    this.siteRegion = this.custSite[this.currentIndex].regname;
    this.currentSiteId = this.custSite[this.currentIndex].id;
    this.GetInstrumentsByCurrentSiteId();
  }

  GetPoCost(sdate, edate) {
    this.customerDashboardService.GetCostData({ sdate, edate })
      .pipe(first()).subscribe((data: any) => {
        sessionStorage.setItem("costData", JSON.stringify(data.object))
      })
  }

  OnPopUpOpen(instrumentId) {
    const initialState = { instrumentId }
    this.bsModalRef = this.modalService.show(CostofownershipComponent, { initialState });

  }


  GetInstrumentsByCurrentSiteId() {
    this.customerDashboardService.GetSiteInstrument(this.currentSiteId)
      .subscribe((data: any) => {
        this.lstInstrument = data.object;
        this.instruemntLength = this.lstInstrument.length;
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
      .subscribe((data: any) => {
        let srno = data.object;
        this.serviceRequestform.patchValue({ "serreqno": srno });
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
    this.serviceRequestform.get('serreqdate').setValue(this.datepipe.transform(Date.now(), "dd/MM/YYYY"))
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
              if (data.result) {
                setTimeout(() => {
                  this.ngOnInit();
                  this.notificationService.showSuccess(data.resultMessage, "Success")
                }, 2000);
              }
            }
          })
      }
    }, 1000);

  }

  public oninstuchange(id: string) {
    this.customerDashboardService.GetSerReqInstrument(id)
      .subscribe((data: any) => {
        var instument = data.object;
        this.siteId = data.object.custSiteId;
        this.serviceRequestform.patchValue({ "machmodelname": instument.instype });
        this.serviceRequestform.patchValue({ "operatorname": instument.operatorEng.fname + '' + instument.operatorEng.lname });
        this.serviceRequestform.patchValue({ "operatornumber": instument.operatorEng.pcontactno });
        this.serviceRequestform.patchValue({ "operatoremail": instument.operatorEng.pemail });
        this.serviceRequestform.patchValue({ "machengineer": instument.machineEng.fname + ' ' + instument.machineEng.lname });
        this.serviceRequestform.patchValue({ "xraygenerator": instument.insversion });
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
