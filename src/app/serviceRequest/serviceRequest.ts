import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Component, OnInit } from '@angular/core';
import {
  actionList,
  Contact,
  Country,
  Customer,
  CustomerSite,
  Distributor,
  EngineerCommentList,
  FileShare,
  Instrument,
  ListTypeItem,
  ProfileReadOnly,
  ResultMsg,
  ServiceReport,
  ServiceRequest,
  tickersAssignedHistory,
  User
} from '../_models';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColumnApi, GridApi } from 'ag-grid-community';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ModelEngContentComponent } from './modelengcontent';
import { ModelEngActionContentComponent } from './modelengactioncontent';
import { DatePipe } from '@angular/common';
import { EngschedulerService } from '../_services/engscheduler.service';

import {
  AccountService,
  AlertService,
  ContactService,
  CountryService,
  CustomerService,
  DistributorService,
  EngActionService,
  EngCommentService,
  FileshareService,
  InstrumentService,
  ListTypeService,
  NotificationService,
  ProfileService,
  ServiceReportService,
  ServiceRequestService,
  SRAssignedHistoryService,
  UploadService
} from '../_services';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { FilerendercomponentComponent } from '../Offerrequest/filerendercomponent.component';
import { EnvService } from '../_services/env/env.service';
import { GetParsedDate } from '../_helpers/Providers';


@Component({
  selector: 'app-customer',
  templateUrl: './serviceRequest.html',
})

export class ServiceRequestComponent implements OnInit {
  user: User;
  serviceRequestform: FormGroup;
  submitted = false;
  serviceRequestId: string;
  pdfPath: any;
  countries: Country[];
  defaultdistributors: Distributor[];
  serviceRequest: ServiceRequest;
  srAssignedHistory: tickersAssignedHistory;
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  appendList: Contact[];
  public columnDefs: any[];
  public ticketcolumnDefs: any[];
  public actionDefs: any[];
  private columnApi: ColumnApi;
  private api: GridApi;
  PdffileData: FileShare[];
  pdfBase64: string;
  public pdfcolumnDefs: any[];
  private pdfcolumnApi: ColumnApi;
  private pdfapi: GridApi;
  private historycolumnApi: ColumnApi;
  private historyapi: GridApi;
  customerList: Customer[];
  engineerCommentList: EngineerCommentList[] = [];
  engcomment: EngineerCommentList;
  ticketHistoryList: tickersAssignedHistory[] = [];
  actionList: actionList[] = [];
  customerSitelist: CustomerSite[] = [];
  customerlist: any = [];
  customer: any = [];
  serviceTypeList: ListTypeItem[];
  subreqtypelist: ListTypeItem[];
  reqtypelist: ListTypeItem[];
  instrumentList: Instrument[];
  IsCustomerView: boolean = true;
  IsDistributorView: boolean = false;
  IsEngineerView: boolean = false;
  logindata: any;
  customerId: any;
  siteId: any;
  distId: any;
  bsModalRef: BsModalRef;
  bsActionModalRef: BsModalRef;
  engineername: string;
  engineerid: string;
  servicereport: ServiceReport;
  dropdownSettings: IDropdownSettings = {};
  custcityname: string;
  breakdownlist: ListTypeItem[];
  allsites: any;
  accepted: boolean = false;
  isAmc: boolean = false;
  scheduleLink: string;

  transaction: number;
  hastransaction: boolean;
  file: any;
  role: any;
  instrumentStatus: ListTypeItem[];
  stagelist: ListTypeItem[];
  statuslist: ListTypeItem[];
  scheduleData: any;
  scheduleDefs: any[];
  hasCallScheduled: boolean;
  isGenerateReport: boolean = false;
  isNewMode: boolean;
  isEditMode: boolean;
  designationList: ListTypeItem[];
  datepipe = new DatePipe('en-US')
  lockRequest: boolean;
  formData: any;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private distributorService: DistributorService,
    private countryService: CountryService,
    private customerService: CustomerService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private serviceRequestService: ServiceRequestService,
    private fileshareService: FileshareService,
    private uploadService: UploadService,
    private contactService: ContactService,
    private listTypeService: ListTypeService,
    private instrumentService: InstrumentService,
    private modalService: BsModalService,
    private engcomservice: EngCommentService,
    private actionservice: EngActionService,
    private srAssignedHistoryService: SRAssignedHistoryService,
    private servicereportService: ServiceReportService,
    private environment: EnvService,
    private EngschedulerService: EngschedulerService,
  ) {
    this.notificationService.listen().subscribe((m: any) => {
      if (this.serviceRequestId != null) {
        this.serviceRequestService.getById(this.serviceRequestId).pipe(first())
          .subscribe({
            next: (data: any) => {
              this.engineerCommentList = data.object.engComments;

              this.engineerCommentList.forEach((value, index) => {
                value.nextdate = this.datepipe.transform(GetParsedDate(value.nextdate), "dd/MM/YYYY")
              })

              this.actionList = data.object.engAction;
              this.actionList.forEach((value, index) => {
                value.actiondate = this.datepipe.transform(GetParsedDate(value.actiondate), "dd/MM/YYYY")
              })
              this.api.refreshCells()
            }
          });
        this.EngschedulerService.getByEngId(this.user.contactId).pipe(first())
          .subscribe((data: any) => {
            data.object.filter(x => x.serReqId == this.serviceRequestId).length > 0 ? this.hasCallScheduled = true : this.hasCallScheduled = false;
          })
        this.serviceRequestService.getById(this.serviceRequestId).pipe(first())
          .subscribe({
            next: (data: any) => {
              this.engineerCommentList = data.object.engComments;

              this.engineerCommentList.forEach((value, index) => {
                value.nextdate = this.datepipe.transform(GetParsedDate(value.nextdate), "dd/MM/YYYY")
              })
              this.actionList = data.object.engAction;
              this.actionList.forEach((value, index) => {
                value.actiondate = this.datepipe.transform(GetParsedDate(value.actiondate), "dd/MM/YYYY")
              })
              this.api.refreshCells()
            },
          });
      }
    })
  }

  async ngOnInit() {

    this.transaction = 0;
    this.user = this.accountService.userValue;
    this.serviceRequestId = this.route.snapshot.paramMap.get('id');
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SRREQ");
      if (profilePermission.length > 0) {
        this.hasReadAccess = profilePermission[0].read;
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
        this.hasUpdateAccess = profilePermission[0].update;
      }
    }


    if (this.user.isAdmin) {
      this.hasAddAccess = false;
      this.hasDeleteAccess = false;
      this.hasUpdateAccess = false;
      this.hasReadAccess = false;
      this.notificationService.RestrictAdmin()
      return;
    }

    else {
      let role = JSON.parse(sessionStorage.getItem('roles'));
      this.role = role[0]?.itemCode;
    }

    let role = this.role;
    this.listTypeService.getItemById(this.user.roleId).pipe(first()).subscribe();

    if (role == this.environment.custRoleCode) {
      this.IsCustomerView = true;
      this.IsDistributorView = false;
      this.IsEngineerView = false;
    } else if (role == this.environment.distRoleCode) {
      this.IsCustomerView = false;
      this.IsDistributorView = true;
      this.IsEngineerView = false;
    } else {
      this.IsCustomerView = false;
      this.IsDistributorView = false;
      this.IsEngineerView = true;
    }

    this.serviceRequestform = this.formBuilder.group({
      sdate: [""],
      edate: [""],
      serreqno: ['', Validators.required],
      distid: ['', Validators.required],
      custid: [''],
      statusid: [''],
      stageid: [''],
      siteid: [''],
      assignedto: [''],
      serreqdate: ['', Validators.required],
      visittype: ['', Validators.required],
      companyname: ['', Validators.required],
      requesttime: ['', Validators.required],
      sitename: [''],
      country: ['', Validators.required],
      contactperson: ['', Validators.required],
      email: ['', Validators.required],
      operatorname: [''],
      operatornumber: [''],
      operatoremail: [''],
      machmodelname: [''],
      machinesno: ['', Validators.required],
      machengineer: [''],
      xraygenerator: [''],
      breakdowntype: ['', Validators.required],
      isrecurring: [false],
      recurringcomments: [''],
      breakoccurdetailsid: ['', Validators.required],
      alarmdetails: [''],
      resolveaction: [''],
      currentinstrustatus: ['', Validators.required],
      accepted: [{ value: false, disabled: this.accepted }],
      serresolutiondate: [''],
      escalation: [''],
      requesttypeid: [''],
      subrequesttypeid: ["", Validators.required],
      remarks: [''],
      delayedReasons: [''],
      isactive: [true],
      isdeleted: [false],
      isCritical: [false],
      engComments: this.formBuilder.group({
        nextdate: [''],
        comments: ['']
      }),
      assignedHistory: this.formBuilder.group({
        engineername: [''],
        assigneddate: [''],
        ticketstatus: [''],
        comments: ['']
      }),
      engAction: this.formBuilder.group({
        engineername: [''],
        actiontaken: [''],
        comments: [''],
        teamviewerrecroding: [''],
        actiondate: ['']
      })
    });

    this.serviceRequestform.get("siteid").valueChanges.subscribe((data: any) => {
      this.getInstrumnetsBySiteIds(data)
      if (this.serviceRequestId == null) setTimeout(() => this.serviceRequestform.get("machinesno").reset(), 1000);
    })

    this.serviceRequestform.get("machinesno").valueChanges.subscribe((data: any) => {
      if (data) this.oninstuchange(data)
    })
    this.serviceRequestform.get("serresolutiondate").valueChanges
      .subscribe((data: any) => {
        debugger;
        if (!data) return;
        if (data < GetParsedDate(this.serviceRequestform.get("serreqdate").value)) {
          this.notificationService.showError("The Resolution Date should be after Service Request Date", "Invalid Date")
        }
      })


    if (this.IsEngineerView == true) {
      this.serviceRequestform.get('requesttypeid').setValidators([Validators.required]);
      this.serviceRequestform.get('requesttypeid').updateValueAndValidity();
      this.serviceRequestform.get('subrequesttypeid').setValidators([Validators.required]);
      this.serviceRequestform.get('subrequesttypeid').updateValueAndValidity();

      this.EngschedulerService.getByEngId(this.user.contactId).pipe(first())
        .subscribe((data: any) => {
          data.object.filter(x => x.serReqId == this.serviceRequestId).length > 0 ? this.hasCallScheduled = true : this.hasCallScheduled = false;
        })
    }

    this.customerService.getAll().pipe(first())
      .subscribe((data: any) => {
        this.customerlist = data.object
        setTimeout(() => {
          this.onCustomerChanged()
        }, 500);
      })

    this.countryService.getAll().pipe(first())
      .subscribe((data: any) => this.countries = data.object);

    this.listTypeService.getById('SERTY').pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.serviceTypeList = data;
          if (this.IsCustomerView) {
            this.serviceTypeList = this.serviceTypeList.filter(x => x.itemCode != "PREV" && x.itemCode != "PLAN")
          }
        }
      });

    this.listTypeService.getById('DESIG').pipe(first())
      .subscribe({
        next: (data: any[]) => {
          this.designationList = data.filter(x => x.isEscalationSupervisor)
        }
      });

    this.listTypeService.getById('SRSAT').pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.stagelist = data;
          if (this.serviceRequestId == null) {
            this.serviceRequestform.get('stageid').setValue(data.find(x => x.itemCode == "NTSTD")?.listTypeItemId);
          }
        },
      });

    this.listTypeService.getById('SRQST')
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.statuslist = data;
          if (this.serviceRequestId == null) {
            this.serviceRequestform.get('statusid').setValue(data.find(x => x.itemCode == "NTACP")?.listTypeItemId);

            if (this.IsCustomerView)
              this.serviceRequestform.get('statusid').setValue(data.find(x => x.itemCode == "NTASS")?.listTypeItemId);

          }

          if (this.IsEngineerView) {
            this.statuslist = this.statuslist.filter(x => x.itemCode != "NTASS" && x.itemCode != "ASSGN")
            this.serviceRequestform.get('statusid').setValue(this.statuslist.find(x => x.itemCode == "NTACP")?.listTypeItemId);

          }
        }
      });

    this.listTypeService.getById('CINSS').pipe(first())
      .subscribe((data: ListTypeItem[]) => this.instrumentStatus = data);

    this.listTypeService.getById("BDOD").pipe(first())
      .subscribe((data: ListTypeItem[]) => this.breakdownlist = data);


    this.listTypeService.getById("TRRQT").pipe(first())
      .subscribe((data: ListTypeItem[]) => {
        this.reqtypelist = data;
        if (this.IsCustomerView)
          this.serviceRequestform.get('requesttypeid').setValue(data.find(x => x.itemCode == 'CUSTR')?.listTypeItemId);
      });


    this.dropdownSettings = {
      idField: 'itemCode',
      textField: 'itemname',
    };

    this.listTypeService.getById('SRT').pipe(first())
      .subscribe((data: any) => this.subreqtypelist = data);

    this.distributorService.getAll().pipe(first())
      .subscribe({
        next: (data: any) => this.defaultdistributors = data.object
      });

    this.scheduleLink = `/schedule/${this.serviceRequestId}`;


    this.ticketcolumnDefs = this.createColumnHistoryDefs();
    this.scheduleDefs = this.createColumnScheduleDefs();

    if (this.serviceRequestId != null) {
      this.serviceRequestService.getById(this.serviceRequestId)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.lockRequest = data.object.lockRequest
            this.onServiceTypeChange(data.object.visittype);
            this.getInstrumnetsBySiteIds(data.object.siteid)
            var subreq = data.object.subrequesttypeid.split(',');
            let items: ListTypeItem[] = [];

            if (subreq.length > 0) {
              for (var i = 0; i < subreq.length; i++) {
                let t = new ListTypeItem();
                t.itemCode = subreq[i];
                items.push(t);
              }

              this.serviceRequestform.patchValue({ "subrequesttypeid": items });

              this.fileshareService.list(this.serviceRequestId).pipe(first())
                .subscribe({
                  next: (data: any) => this.PdffileData = data.object
                });

            }

            this.customerId = data.object.custid

            this.customerService.getAll().pipe(first())
              .subscribe((custData: any) => {

                this.customerlist = custData.object
                this.onCustomerChanged()

                this.distributorService.getDistributorRegionContacts(data.object.distid)
                  .pipe(first())
                  .subscribe({
                    next: (engData: any) => {
                      this.appendList = engData.object;
                      setTimeout(() => {
                        this.serviceRequestform.patchValue({ "sdate": data.object.sdate });
                        this.serviceRequestform.patchValue({ "edate": data.object.edate });
                        this.serviceRequestform.patchValue({ "serreqno": data.object.serreqno });
                        this.serviceRequestform.patchValue({ "serreqdate": this.datepipe.transform(GetParsedDate(data.object.serreqdate), 'dd/MM/YYYY') });
                        this.serviceRequestform.patchValue({ "machmodelname": data.object.machmodelnametext });
                        this.serviceRequestform.patchValue({ "serreqdate": this.datepipe.transform(GetParsedDate(data.object.serreqdate), 'dd/MM/YYYY') });
                        this.serviceRequestform.patchValue({ "serresolutiondate": GetParsedDate(data.object.serresolutiondate) });
                        this.serviceRequestform.patchValue({ "machmodelname": data.object.machmodelnametext });
                        this.serviceRequestform.patchValue({ "distid": data.object.distid });
                        this.serviceRequestform.patchValue({ "custid": data.object.custid });
                        this.serviceRequestform.patchValue({ "visittype": data.object.visittype });
                        this.serviceRequestform.patchValue({ "companyname": data.object.companyname });
                        this.serviceRequestform.patchValue({ "requesttime": data.object.requesttime });
                        this.serviceRequestform.patchValue({ "sitename": data.object.sitename });
                        this.serviceRequestform.patchValue({ "country": data.object.country });
                        this.serviceRequestform.patchValue({ "contactperson": data.object.contactperson });
                        this.serviceRequestform.patchValue({ "email": data.object.email });
                        this.serviceRequestform.patchValue({ "operatorname": data.object.operatorname });
                        this.serviceRequestform.patchValue({ "operatornumber": data.object.operatornumber });
                        this.serviceRequestform.patchValue({ "operatoremail": data.object.operatoremail });
                        this.serviceRequestform.patchValue({ "siteid": data.object.siteid });
                        this.serviceRequestform.patchValue({ "machinesno": data.object.machinesno })
                        this.serviceRequestform.patchValue({ "machengineer": data.object.machengineer });
                        this.serviceRequestform.patchValue({ "xraygenerator": data.object.xraygenerator });
                        this.serviceRequestform.patchValue({ "breakdowntype": data.object.breakdowntype });
                        this.serviceRequestform.patchValue({ "isrecurring": data.object.isrecurring });
                        this.serviceRequestform.patchValue({ "recurringcomments": data.object.recurringcomments });
                        this.serviceRequestform.patchValue({ "breakoccurdetailsid": data.object.breakoccurdetailsid });
                        this.serviceRequestform.patchValue({ "alarmdetails": data.object.alarmdetails });
                        this.serviceRequestform.patchValue({ "resolveaction": data.object.resolveaction });
                        this.serviceRequestform.patchValue({ "currentinstrustatus": data.object.currentinstrustatus });
                        this.serviceRequestform.patchValue({ "stageid": data.object.stageid });
                        this.serviceRequestform.patchValue({ "escalation": data.object.escalation });
                        this.serviceRequestform.patchValue({ "requesttypeid": data.object.requesttypeid });
                        this.serviceRequestform.patchValue({ "remarks": data.object.remarks });
                        this.serviceRequestform.patchValue({ "machmodelname": (data.object.machmodelname) });
                        this.serviceRequestform.patchValue({ "statusid": data.object.statusid });
                        this.serviceRequestform.patchValue({ "delayedReasons": data.object.delayedReasons });
                        this.serviceRequestform.get("assignedto").setValue(data.object.assignedto);

                        this.formData = data.object;
                        this.serviceRequestform.patchValue(this.formData);

                        if (data.object.isReportGenerated) {
                          this.serviceRequestform.disable()
                          this.isGenerateReport = true;
                        }
                      }, 100);

                      this.listTypeService.getById('SRQST')
                        .pipe(first()).subscribe({
                          next: (status: ListTypeItem[]) => {
                            if (this.IsEngineerView && status.find(x => x.listTypeItemId == data.object.statusid)?.itemCode == "ASSGN") {
                              let notAcpted = status.find(x => x.itemCode == "NTACP")?.listTypeItemId
                              this.serviceRequestform.patchValue({ "statusid": notAcpted });
                            }
                          }
                        })

                      this.scheduleData = []
                      setTimeout(() => {
                        if (data.object.assignedto != null && data.object.assignedto != "") {
                          this.EngschedulerService.getByEngId(data.object.assignedto)
                            .pipe(first()).subscribe((sch: any) => {
                              this.scheduleData = sch.object.filter(x => x.serReqId == this.serviceRequestId);
                              if (this.scheduleData.length > 0) this.hasCallScheduled = true;

                              this.scheduleData.forEach(element => {
                                element.endTime = this.datepipe.transform(GetParsedDate(element.endTime), "short")
                                element.startTime = this.datepipe.transform(GetParsedDate(element.startTime), "short")
                                element.Time = element.location + " : " + element.startTime + " - " + element.endTime
                              });

                            })
                        }
                      }, 2000);

                      this.accepted = this.statuslist.find(x => x.itemCode == "ACPTD")?.listTypeItemId == data.object.statusid

                      this.customerId = data.object.custid;
                      this.siteId = data.object.siteid;
                      this.engineerCommentList = data.object.engComments

                      let datepipe = new DatePipe("en-US");

                      this.engineerCommentList.forEach((value) => value.nextdate = datepipe.transform(GetParsedDate(value.nextdate), "dd/MM/YYYY"))

                      this.actionList = data.object.engAction;
                      this.actionList.forEach((value) => value.actiondate = datepipe.transform(GetParsedDate(value.actiondate), "dd/MM/YYYY"))

                      this.engineerid = data.object.assignedto;
                      this.ticketHistoryList = data.object.assignedHistory;

                      this.ticketHistoryList.forEach((value) => value.assigneddate = datepipe.transform(GetParsedDate(value.assigneddate), "dd/MM/YYYY"))
                    }
                  });
              })
          },
        });

      setTimeout(() => {
        this.serviceRequestform.disable();
        this.columnDefs = this.createColumnDefsRO();
        this.actionDefs = this.createColumnActionDefsRO();
        this.pdfcolumnDefs = this.pdfcreateColumnDefsRO();

      }, 100);

    }
    else {

      this.customerService.getAll().pipe(first())
        .subscribe((custData: any) => this.customerlist = custData.object)
      this.serviceRequestService.getSerReqNo()
        .pipe(first()).subscribe((data: any) => this.serviceRequestform.patchValue({ "serreqno": data.object }));
      this.serviceRequestform.get('requesttime').setValue(this.datepipe.transform(Date.now(), "H:mm"))
      this.serviceRequestform.get('serreqdate').setValue(this.datepipe.transform(Date.now(), 'dd/MM/YYYY'))

      this.contactService.getCustomerSiteByContact(this.user.contactId)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.SetCustomerData(data.object)

            this.distributorService.getDistributorRegionContacts(this.distId)
              .pipe(first()).subscribe((data: any) => this.appendList = data.object);

            if (this.IsDistributorView) {
              this.distributorService.getByConId(this.user.contactId).pipe(first())
                .subscribe({
                  next: (data: any) => {
                    if (this.user.username != "admin") {
                      this.serviceRequestform.get('distid').setValue(data.object[0].id)
                      this.distId = data.object[0].id
                    }
                  }
                })
            }
          },
        });

      this.FormControlDisable()
      this.isNewMode = true
      this.columnDefs = this.createColumnDefs();
      this.actionDefs = this.createColumnActionDefs();
      this.pdfcolumnDefs = this.pdfcreateColumnDefs();

    }

    if (this.user.userType == "site") {
      this.serviceRequestform.get('siteid').disable();
    }
  }

  EditMode() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.isEditMode = true;

      this.router.navigate(
        ["."],
        {
          relativeTo: this.route,
          queryParams: {
            isNSNav: false
          },
          queryParamsHandling: 'merge',
        });

      this.serviceRequestform.enable();
      this.columnDefs = this.createColumnDefs();
      this.actionDefs = this.createColumnActionDefs();
      this.pdfcolumnDefs = this.pdfcreateColumnDefs();

      this.FormControlDisable();
    }
  }

  Back() {

    this.router.navigate(["servicerequestlist"]);

  }

  CancelEdit() {
    if (!confirm("Are you sure you want to discard changes?")) return;
    if (this.serviceRequestId != null) this.serviceRequestform.patchValue(this.formData);
    else this.serviceRequestform.reset();
    this.serviceRequestform.disable()
    this.columnDefs = this.createColumnDefsRO();
    this.actionDefs = this.createColumnActionDefsRO();
    this.pdfcolumnDefs = this.pdfcreateColumnDefsRO();

    this.isEditMode = false;
    this.isNewMode = false;
    this.notificationService.SetNavParam();
  }

  FormControlDisable() {
    if (this.user.username != "admin") {

      if (this.accepted && this.IsEngineerView) {
        this.serviceRequestform.get('statusid').disable();
      }

      this.serviceRequestform.get('requesttypeid').disable();
      this.serviceRequestform.get('subrequesttypeid').disable();
      this.serviceRequestform.get('remarks').disable();
      this.serviceRequestform.get('custid').disable();
      this.serviceRequestform.get('siteid').disable();
      this.serviceRequestform.get('country').disable();
      this.serviceRequestform.get('distid').disable();

      if (this.IsEngineerView) {
        this.serviceRequestform.get('assignedto').disable();
        this.serviceRequestform.get('country').disable();
        this.serviceRequestform.get('machinesno').disable();
        this.serviceRequestform.get('breakdowntype').disable();
        this.serviceRequestform.get('isrecurring').disable();
        this.serviceRequestform.get('recurringcomments').disable();
        this.serviceRequestform.get('breakoccurdetailsid').disable();
        this.serviceRequestform.get('alarmdetails').disable();
        this.serviceRequestform.get('resolveaction').disable();
        this.serviceRequestform.get('visittype').disable();
        this.serviceRequestform.get('currentinstrustatus').disable();
        this.serviceRequestform.get("contactperson").disable();
        this.serviceRequestform.get("email").disable();
      } else if (this.IsDistributorView) {
        this.serviceRequestform.get('assignedto').enable();
        this.serviceRequestform.get('country').disable();
        this.serviceRequestform.get('statusid').disable();
        this.serviceRequestform.get('custid').enable();
        this.serviceRequestform.get('siteid').enable();
      } else {
        if (this.user.userType?.toLocaleLowerCase() == "site") {
          this.serviceRequestform.get('siteid').disable();
        }
        else {
          this.serviceRequestform.get('siteid').enable();
        }
        this.serviceRequestform.get('stageid').disable();
        this.serviceRequestform.get("contactperson").disable();
        this.serviceRequestform.get("email").disable();
        this.serviceRequestform.get('assignedto').disable();
        this.serviceRequestform.get('statusid').disable();
        this.serviceRequestform.get('stageid').disable();
        this.serviceRequestform.get('serreqdate').enable();

      }
    }
  }

  ToggleDropdown(id: string) {
    document.getElementById(id).classList.toggle("show")
  }

  DeleteRecord() {
    if (confirm("Are you sure you want to delete the record?")) {

      this.serviceRequestService.delete(this.serviceRequestId).pipe(first())
        .subscribe((data: any) => {
          if (data.result)
            this.router.navigate(["servicerequestlist"], {
              //relativeTo: this.activeRoute,
              queryParams: { isNSNav: true },
              //queryParamsHandling: 'merge'
            })
        })
    }
  }

  onCustomerChanged(value: any = this.customerId) {
    let object;
    if (value) object = this.customerlist.find(x => x.id == value);
    else object = this.customerlist[0]

    this.SetCustomerData(object)
  }

  SetCustomerData(data: any) {
    this.logindata = data;
    this.serviceRequestform.patchValue({ "distid": this.logindata.defdistid });
    this.distId = this.logindata.defdistid;
    this.customerId = this.logindata.id;
    this.serviceRequestform.patchValue({ "country": this.logindata.address?.countryid });
    this.serviceRequestform.patchValue({ "custid": this.logindata?.id });
    this.serviceRequestform.patchValue({ "companyname": this.logindata?.custname });

    if (!this.IsDistributorView) {
      this.serviceRequestform.patchValue({ "contactperson": this.user?.username });
      this.serviceRequestform.patchValue({ "email": this.user?.email });
    }

    if (this.logindata.sites != null) {
      this.siteId = this.logindata.sites[0].id
      this.customerSitelist = this.logindata.sites;
      this.customerSitelist = [];
      let siteLst = this.user.custSites?.split(",")
      this.logindata.sites.forEach(element => {
        if (siteLst?.length > 0 && this.user.userType?.toLocaleLowerCase() == "customer" && siteLst?.find(x => x == element.id) == null) return;
        this.customerSitelist.push(element);
      })

      this.serviceRequestform.patchValue({ "sitename": this.logindata.sites[0].custregname });
      this.serviceRequestform.patchValue({ "siteid": this.logindata.sites[0].id });
      if (this.serviceRequestId == null) this.getInstrumnetsBySiteIds(this.logindata.sites[0].id)
    }
  }
  getInstrumnetsBySiteIds(id: any) {
    this.instrumentService.getinstubysiteIds(id).pipe(first())
      .subscribe({
        next: (data: any) => {
          this.instrumentList = data.object
        }
      });
  }
  // convenience getter for easy access to form fields
  get f() {
    return this.serviceRequestform.controls;
  }

  get a() {
    return this.serviceRequestform.controls.engineer;
  }

  onSubmit(redirect = true) {
    this.submitted = true
    this.serviceRequestform.markAllAsTouched();
    this.serviceRequestform.get('subrequesttypeid').enable();

    if (this.IsEngineerView && this.accepted) {
      if (!this.hasCallScheduled) {
        return this.notificationService.showError("As u have accepted the request please schedule a call to process further.", "Error")
      }
    }

    if (this.serviceRequestform.get("serresolutiondate").value < GetParsedDate(this.serviceRequestform.get("serreqdate").value)) {
      this.notificationService.showError("The Resolution Date should be after Service Request Date", "Invalid Date")
    }

    // reset alerts on submit
    this.alertService.clear();

    if (this.serviceRequestform.invalid || !this.serviceRequestform.get('subrequesttypeid').value) {
      return;// this.notificationService.showError("Please Check Form again", "Error");
    }

    if (this.isGenerateReport != false) return
    // stop here if form is invalid

    const datepipie = new DatePipe("en-US");

    let sDate = this.serviceRequestform.get('sdate').value
    let eDate = this.serviceRequestform.get('edate').value

    if ((sDate != "" && sDate != null) && (eDate != "" && eDate != null)) {
      let dateSent = GetParsedDate(sDate);
      let currentDate = GetParsedDate(eDate);

      let calc = Math.floor(
        (Date.UTC(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate()
        ) - Date.UTC(
          dateSent.getFullYear(),
          dateSent.getMonth(),
          dateSent.getDate()
        )) /
        (1000 * 60 * 60 * 24)
      );

      if (calc <= 0)
        return this.notificationService.showError("End Date should not be greater than Start Date", "Error");

      this.serviceRequestform.get('sdate').setValue(datepipie.transform(dateSent, 'dd/MM/YYYY'));
      this.serviceRequestform.get('edate').setValue(datepipie.transform(currentDate, 'dd/MM/YYYY'));
    }


    if (this.serviceRequestId == null) {

      this.serviceRequest = this.serviceRequestform.getRawValue();
      this.serviceRequest.engComments = [];
      this.serviceRequest.assignedHistory = [];
      this.serviceRequest.engAction = [];

      this.serviceRequest.siteid = this.siteId;
      this.serviceRequest.custid = this.customerId;

      if (this.serviceRequest.isrecurring == null) {
        this.serviceRequest.isrecurring = false;
      }

      if (this.serviceRequestform.get('subrequesttypeid').value.length > 0) {
        var selectarray = this.serviceRequestform.get('subrequesttypeid').value;
        this.serviceRequest.subrequesttypeid = selectarray.map(x => x.itemCode).join(',');
      }

      if (this.IsCustomerView == true)
        this.serviceRequest.serresolutiondate = null


      this.serviceRequestService.save(this.serviceRequest)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.result) {
              this.saveFileShare(data.object.id);
              if (this.file != null) {
                this.uploadPdfFile(this.file, data.object.id)
              }

              if (this.IsDistributorView) {
                this.addAssignedHistory(this.serviceRequest);
              }
              this.notificationService.showSuccess(data.resultMessage, "Success");
              if (redirect)
                this.router.navigate(["servicerequestlist"], {
                  //relativeTo: this.activeRoute,
                  queryParams: { isNSNav: true },
                  //queryParamsHandling: 'merge'
                });
            }
          },
        });
    }
    else {
      this.serviceRequest = this.serviceRequestform.getRawValue();
      this.serviceRequest.id = this.serviceRequestId;
      this.serviceRequest.siteid = this.siteId;
      this.serviceRequest.custid = this.customerId;
      this.serviceRequest.engComments = [];
      this.serviceRequest.assignedHistory = [];
      this.serviceRequest.engAction = [];

      if (this.IsEngineerView && this.serviceRequest.isCritical) this.serviceRequest.isCritical = false;
      if (this.serviceRequestform.get('subrequesttypeid').value.length > 0) {
        var selectarray = this.serviceRequestform.get('subrequesttypeid').value;
        this.serviceRequest.subrequesttypeid = selectarray;
        if (typeof (selectarray) != "string") {
          this.serviceRequest.subrequesttypeid = selectarray.map(x => x.itemCode).join(',');
        }
      }

      this.serviceRequestService.update(this.serviceRequestId, this.serviceRequest)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.result) {
              this.saveFileShare(this.serviceRequestId);
              if (this.file != null) {
                this.uploadPdfFile(this.file, this.serviceRequestId)
              }
              if (this.IsDistributorView) {
                this.addAssignedHistory(this.serviceRequest);
              }
              this.notificationService.showSuccess(data.resultMessage, "Success");
              if (redirect)
                this.router.navigate(["servicerequestlist"], {
                  //relativeTo: this.activeRoute,
                  queryParams: { isNSNav: true },
                  //queryParamsHandling: 'merge'
                });
            }
          }
        });
    }
  }

  onStatusChange() {
    let assignedStatusId = this.statuslist.find(x => x.itemCode == "ASSGN")?.listTypeItemId
    let notAssignedStatusId = this.statuslist.find(x => x.itemCode == "NTASS")?.listTypeItemId
    if (this.IsDistributorView && this.serviceRequestform.get('assignedto').value != null && this.serviceRequestform.get('assignedto').value != "") {
      if (this.serviceRequestform.get('statusid').value == notAssignedStatusId) {
        this.serviceRequestform.get('statusid').setValue(assignedStatusId);
      }
    }
  }

  onServiceTypeChange(serviceTypeId) {
    this.isAmc = false;
    let servicetypeCode = this.serviceTypeList?.filter(x => x.listTypeItemId == serviceTypeId)[0]?.itemCode;
    if (servicetypeCode == "AMC" || servicetypeCode == "PLAN") {
      this.isAmc = true;
      this.serviceRequestform.get('sdate').setValidators(Validators.required)
      this.serviceRequestform.get('sdate').updateValueAndValidity()
      this.serviceRequestform.get('sdate').reset()

      this.serviceRequestform.get('edate').setValidators(Validators.required)
      this.serviceRequestform.get('edate').updateValueAndValidity()
      this.serviceRequestform.get('edate').reset()


      this.serviceRequestform.get('breakoccurdetailsid').clearValidators()
      this.serviceRequestform.get('breakoccurdetailsid').updateValueAndValidity()
      this.serviceRequestform.get('breakoccurdetailsid').reset()

      this.serviceRequestform.get('alarmdetails').clearValidators()
      this.serviceRequestform.get('alarmdetails').updateValueAndValidity()
      this.serviceRequestform.get('alarmdetails').reset()

      this.serviceRequestform.get('breakdowntype').clearValidators()
      this.serviceRequestform.get('breakdowntype').updateValueAndValidity()
      this.serviceRequestform.get('breakdowntype').reset()


    }

    else {
      this.isAmc = false;

      this.serviceRequestform.get('sdate').clearValidators()
      this.serviceRequestform.get('sdate').updateValueAndValidity()
      this.serviceRequestform.get('sdate').reset()

      this.serviceRequestform.get('edate').clearValidators()
      this.serviceRequestform.get('edate').updateValueAndValidity()
      this.serviceRequestform.get('edate').reset()

      this.serviceRequestform.get('breakoccurdetailsid').setValidators(Validators.required)
      this.serviceRequestform.get('breakoccurdetailsid').updateValueAndValidity()
      this.serviceRequestform.get('breakoccurdetailsid').reset()

      this.serviceRequestform.get('alarmdetails').setValidators(Validators.required)
      this.serviceRequestform.get('alarmdetails').updateValueAndValidity()
      this.serviceRequestform.get('alarmdetails').reset()

      this.serviceRequestform.get('breakdowntype').setValidators(Validators.required)
      this.serviceRequestform.get('breakdowntype').updateValueAndValidity()
      this.serviceRequestform.get('breakdowntype').reset()

    }
  }

  Accepted() {
    if (this.isGenerateReport == false) {
      this.accepted = true
      this.hasCallScheduled = false;
      let serviceRequest = new ServiceRequest();
      serviceRequest.id = this.serviceRequestId;
      serviceRequest.accepted = true

      this.serviceRequestform.get('statusid').disable();
      let assignedStat = this.statuslist.find(x => x.itemCode == "ACPTD")?.listTypeItemId
      this.serviceRequestform.get('statusid').setValue(assignedStat);
      let inPrgStage = this.stagelist.find(x => x.itemCode == "INPGS")?.listTypeItemId
      this.serviceRequestform.get('stageid').setValue(inPrgStage);
      serviceRequest.statusid = assignedStat
      serviceRequest.stageid = inPrgStage

      this.serviceRequestService.updateIsAccepted(this.serviceRequestId, serviceRequest)
        .subscribe((data: any) => {
          this.serviceRequestform.get('accepted').disable();
          this.serviceRequestform.get('accepted').setValue(true)
          this.notificationService.showSuccess(data.resultMessage, "Success");
        })
    }
  }

  generatereport() {
    if (this.isGenerateReport == false) {
      this.onSubmit();
      let scheduleCalls = this.scheduleData.filter(x => x.serReqId == this.serviceRequestId)
      if (this.scheduleData == null || this.scheduleData.length <= 0 || scheduleCalls.length <= 0) {
        return this.notificationService.showError("Cannot Generate Report. No Calls Had been Scheduled in the Scheduler", "Error")
      }

      this.servicereport = new ServiceReport();

      this.servicereport.serviceRequestId = this.serviceRequestId;
      this.servicereport.customer = this.serviceRequestform.get('companyname').value;
      this.servicereport.srOf = this.user.firstName + '' + this.user.lastName + '/' + this.countries.find(x => x.id == this.serviceRequestform.get('country').value)?.name + '/' + this.datepipe.transform(GetParsedDate(this.serviceRequestform.get('serreqdate').value), 'yyyy-MM-dd');
      this.servicereport.country = this.countries.find(x => x.id == this.serviceRequestform.get('country')?.value)?.name;
      this.servicereport.problem = this.breakdownlist.find(x => x.listTypeItemId == this.serviceRequestform.get('breakoccurdetailsid').value)?.itemname + '||' + this.serviceRequestform.get('alarmdetails')?.value + '||' + this.serviceRequestform.get('remarks')?.value;

      this.instrumentService.getAll(this.user.userId)
        .pipe(first())
        .subscribe((data: any) => {
          let instrumentList = data.object;
          this.servicereport.instrument = instrumentList.find(x => x.id == this.serviceRequestform.get('machinesno').value)?.id;
        });

      if (this.isAmc) this.servicereport.problem = 'AMC';

      this.servicereport.installation = (this.serviceRequestform.get('subrequesttypeid').value?.split(",").filter(x => x == this.environment.INS)).length > 0;
      this.servicereport.analyticalassit = (this.serviceRequestform.get('subrequesttypeid').value?.split(",").filter(x => x == this.environment.ANAS)).length > 0;
      this.servicereport.prevmaintenance = (this.serviceRequestform.get('subrequesttypeid').value?.split(",").filter(x => x == this.environment.PRMN1)).length > 0;
      this.servicereport.rework = (this.serviceRequestform.get('subrequesttypeid').value?.split(",").filter(x => x == this.environment.REWK)).length > 0;
      this.servicereport.corrmaintenance = (this.serviceRequestform.get('subrequesttypeid').value?.split(",").filter(x => x == this.environment.CRMA)).length > 0;
      if (this.customerId != null) {
        this.customerService.getById(this.customerId)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              this.custcityname = data.object.address.city;
              this.servicereport.town = this.custcityname;

              this.servicereportService.save(this.servicereport)
                .pipe(first())
                .subscribe({
                  next: (data: any) => {

                    if (data.result) {
                      this.notificationService.showSuccess(data.resultMessage, "Success");

                      this.srAssignedHistory = new tickersAssignedHistory;
                      this.srAssignedHistory.engineerid = this.engineerid;
                      this.srAssignedHistory.servicerequestid = this.serviceRequestId;
                      this.srAssignedHistory.ticketstatus = "INPRG";
                      this.srAssignedHistory.assigneddate = new Date()

                      this.srAssignedHistoryService.save(this.srAssignedHistory).pipe(first()).subscribe();

                      this.router.navigate(["servicereport", data.object.id], {
                        //relativeTo: this.activeRoute,
                        queryParams: { isNSNav: true },
                        //queryParamsHandling: 'merge'
                      });
                    }

                  }
                });
            }
          });
      }
      else {
        this.servicereportService.save(this.servicereport)
          .pipe(first())
          .subscribe({
            next: (data: any) => {

              if (data.result) {
                this.notificationService.showSuccess(data.resultMessage, "Success");

                this.srAssignedHistory = new tickersAssignedHistory;
                this.srAssignedHistory.engineerid = this.engineerid;
                this.srAssignedHistory.servicerequestid = this.serviceRequestId;
                this.srAssignedHistory.ticketstatus = "INPRG";
                this.srAssignedHistory.assigneddate = new Date()

                this.srAssignedHistoryService.save(this.srAssignedHistory).pipe(first()).subscribe();

                this.router.navigate(["servicereport", data.object.id], {
                  //relativeTo: this.activeRoute,
                  queryParams: { isNSNav: true },
                  //queryParamsHandling: 'merge'
                });
              }


            }
          });
      }



    }

  }

  addAssignedHistory(sr: ServiceRequest) {
    if (this.engineerid != null && this.engineerid != sr.assignedto && this.isGenerateReport == false) {
      this.srAssignedHistory = new tickersAssignedHistory;
      this.srAssignedHistory.engineerid = this.engineerid;
      this.srAssignedHistory.servicerequestid = sr.id;
      this.srAssignedHistory.ticketstatus = "INPRG";
      this.srAssignedHistory.assigneddate = new Date()

      this.srAssignedHistoryService.save(this.srAssignedHistory)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.result) this.router.navigate(["servicerequestlist"], {
              //relativeTo: this.activeRoute,
              queryParams: { isNSNav: true },
              //queryParamsHandling: 'merge'
            })
          }
        });
    }
  }

  getDistRegnContacts(distid: string) {
    this.distributorService.getDistributorRegionContacts(distid)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.appendList = data.object;
        }
      });
  }

  saveFileShare(id: string) {
    if (this.pdfPath != null && this.isGenerateReport == false) {
      for (var i = 0; i < this.pdfPath.length; i++) {
        let fileshare = new FileShare();
        fileshare.fileName = this.pdfPath[i].fileName;
        fileshare.filePath = this.pdfPath[i].filepath;
        fileshare.parentId = id;
        this.fileshareService.save(fileshare)
          .pipe(first())
          .subscribe({
            next: (data: ResultMsg) => {
              if (data.result) {
                this.notificationService.showSuccess(data.resultMessage, "Success");
                this.router.navigate(["servicerequestlist"], {
                  //relativeTo: this.activeRoute,
                  queryParams: { isNSNav: true },
                  //queryParamsHandling: 'merge'
                });
              }
            }
          });
      }
    }
  }

  getPdffile(filePath: string) {
    if (filePath != null && filePath != "") {
      this.uploadService.getFile(filePath)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.download(data.data);
          },
        });
    }
  }

  download(fileData: any) {
    const byteArray = new Uint8Array(atob(fileData).split('').map(char => char.charCodeAt(0)));
    let b = new Blob([byteArray], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(b);
    window.open(url);
  }

  getfil(x) {
    this.file = x;
  }

  listfile = (x) => {
    document.getElementById("selectedfiles").style.display = "block";

    var selectedfiles = document.getElementById("selectedfiles");
    var ulist = document.createElement("ul");
    ulist.id = "demo";
    selectedfiles.appendChild(ulist);

    if (this.transaction != 0) {
      document.getElementById("demo").remove();
    }

    this.transaction++;
    this.hastransaction = true;

    for (let i = 0; i <= x.length; i++) {
      var name = x[i].name;
      var ul = document.getElementById("demo");
      var node = document.createElement("li");
      var textnode = document.createTextNode(name)
      node.appendChild(textnode);

      ul.appendChild(node);

    }
  };

  public onRowClicked(e) {
    if (e.event.target !== undefined && this.isGenerateReport == false) {
      let data = e.data;
      let actionType = e.event.target.getAttribute("data-action-type");
      switch (actionType) {
        case "remove":
          if (confirm("Are you sure, you want to remove the engineer comment?") == true) {
            this.engcomservice.delete(data.id)
              .pipe(first())
              .subscribe({
                next: (d: any) => {
                  if (d.result) this.notificationService.showSuccess(d.resultMessage, "Success");
                }
              });
          }
        case "edit":
          this.open(this.serviceRequestId, data.id, this.engineerid);
      }
    }
  }

  onCellValueChanged(event) {
    event.data.modified = true;
  }

  private pdfcreateColumnDefs() {
    return [
      {
        headerName: "Action",
        field: "id",
        filter: false,
        editable: false,
        lockPosition: "left",
        sortable: false,
        cellRendererFramework: FilerendercomponentComponent,
        cellRendererParams: {
          deleteaccess: this.hasDeleteAccess && this.isGenerateReport == false,
          id: this.serviceRequestId
        },
      },
      {
        headerName: "File Name",
        field: "displayName",
        filter: true,
        tooltipField: "File Name",
        enableSorting: true,
        editable: false,
        sortable: true,
      },
    ]
  }

  private pdfcreateColumnDefsRO() {
    return [
      {
        headerName: "File Name",
        field: "displayName",
        filter: true,
        tooltipField: "File Name",
        enableSorting: true,
        editable: false,
        sortable: true,
      },
    ]
  }

  pdfonGridReady(params): void {
    this.pdfapi = params.api;
    this.pdfcolumnApi = params.columnApi;
    this.pdfapi.sizeColumnsToFit();
  }

  historyready(params): void {
    this.historyapi = params.api;
    this.historycolumnApi = params.columnApi;
  }

  public getAllInstrument(siteid: string) {
    this.instrumentService.searchByKeyword("", siteid)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.instrumentList = data.object;
        },
      });
  }

  public oninstuchange(id: string) {
    var instument;

    this.instrumentService.getSerReqInstrument(id)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          instument = data.object;
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

  private createColumnDefsRO() {
    return [
      {
        headerName: 'Next Date',
        field: 'nextdate',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        tooltipField: 'nextDate',
      },
      {
        headerName: 'Comments',
        field: 'comments',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false
      }
    ]
  }

  private createColumnDefs() {
    return [
      {
        headerName: 'Action',
        field: 'id',
        filter: false,
        enableSorting: false,
        editable: false,
        lockPosition: "left",
        sortable: false,
        hide: this.isGenerateReport,
        cellRenderer: (params) => {
          if (this.hasDeleteAccess && !this.hasUpdateAccess) {
            return `<button class="btn btn-link" type="button" (click)="delete(params)"><i class="fas fa-trash-alt" data-action-type="remove" title="Delete"></i></button>`
          } else if (this.hasDeleteAccess && this.hasUpdateAccess) {
            return `<button class="btn btn-link" type="button" (click)="delete(params)"><i class="fas fa-trash-alt" data-action-type="remove" title="Delete"></i></button>
          <button type="button" class="btn btn-link" data-action-type="edit" ><i class="fas fas fa-pen" title="Edit Value" data-action-type="edit"></i></button>`
          } else if (!this.hasDeleteAccess && this.hasUpdateAccess) {
            return `<button type="button" class="btn btn-link" data-action-type="edit" ><i class="fas fas fa-pen" title="Edit Value" data-action-type="edit"></i></button>`
          }
        }
      },
      {
        headerName: 'Next Date',
        field: 'nextdate',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        tooltipField: 'nextDate',
      },
      {
        headerName: 'Comments',
        field: 'comments',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false
      }
    ]
  }


  private createColumnHistoryDefs() {
    return [
      {
        headerName: 'Engineer Name',
        field: 'engineername',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        tooltipField: 'engineername',
      },
      {
        headerName: 'Assigned Date',
        field: 'assigneddate',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false
      },
      {
        headerName: 'Comments',
        field: 'comments',
        width: 600,
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false
      },
    ]
  }

  private createColumnActionDefs() {
    return [
      {
        headerName: 'Action',
        field: 'id',
        filter: false,
        enableSorting: false,
        editable: false,
        hide: !this.IsEngineerView && this.isGenerateReport == false,
        sortable: false,
        lockPosition: "left",
        cellRenderer: (params) => {
          if (this.hasDeleteAccess && !this.hasUpdateAccess) {
            return `<button class="btn btn-link" type="button" (click)="delete(params)"><i class="fas fa-trash-alt" data-action-type="remove" title="Delete"></i></button>`
          } else if (this.hasDeleteAccess && this.hasUpdateAccess) {
            return `<button class="btn btn-link" type="button" (click)="delete(params)"><i class="fas fa-trash-alt" data-action-type="remove" title="Delete"></i></button>
          <button type="button" class="btn btn-link" data-action-type="edit" ><i class="fas fas fa-pen" title="Edit Value" data-action-type="edit"></i></button>`
          } else if (!this.hasDeleteAccess && this.hasUpdateAccess) {
            return `<button type="button" class="btn btn-link" data-action-type="edit" ><i class="fas fas fa-pen" title="Edit Value" data-action-type="edit"></i></button>`
          }
        }
      },
      {
        headerName: 'Engineer Name',
        field: 'engineername',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        tooltipField: 'engineername',
      },
      {
        headerName: 'Action Taken',
        field: 'actiontakenId',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false
      },
      {
        headerName: 'Comments',
        field: 'comments',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false
      },
      {
        headerName: 'Team Viewer Recording',
        field: 'teamviewrecording',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        cellRenderer: (params) => {
          if (params.value != null) {
            return `<button type="button" class="btn btn-link" data-action-type="download" ><i class="fas fas fa-download" title="Edit Value" data-action-type="download"></i></button>`
          } else {
            return ``
          }
        }
      },
      {
        headerName: 'Date',
        field: 'actiondate',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false
      }
    ]
  }

  private createColumnActionDefsRO() {
    return [
      {
        headerName: 'Engineer Name',
        field: 'engineername',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        tooltipField: 'engineername',
      },
      {
        headerName: 'Action Taken',
        field: 'actiontakenId',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false
      },
      {
        headerName: 'Comments',
        field: 'comments',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false
      },
      {
        headerName: 'Date',
        field: 'actiondate',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false
      }
    ]
  }

  private createColumnScheduleDefs() {
    return [
      {
        headerName: 'EngName',
        field: 'engName',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false
      },
      {
        headerName: 'Title',
        field: 'subject',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        tooltipField: 'engineername',
      },
      {
        headerName: 'Location and Date ',
        field: 'Time',
        width: 450,
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false
      },
      {
        headerName: 'Description ',
        field: 'description',
        filter: false,
        width: 300,
        enableSorting: false,
        editable: false,
        sortable: false
      },

    ]
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }

  uploadPdfFile(files, serviceRequestId) {
    if (this.isGenerateReport == false) {
      if (files.length === 0) {
        return;
      }

      let filesToUpload: File[] = files;
      const formData = new FormData();

      Array.from(filesToUpload).map((file, index) => {
        return formData.append("file" + index, file, file.name);
      });

      this.fileshareService.upload(formData, serviceRequestId, "SRREQ").subscribe((event) => { });
    }
  }


  open(param: string, param1: string, param2: string) {
    if (this.isGenerateReport == false) {
      const initialState = {
        itemId: param,
        id: param1,
        engineerid: this.engineerid,
        item: this.serviceRequestform.value
      };
      this.bsModalRef = this.modalService.show(ModelEngContentComponent, { initialState });
    }
  }

  openaction(param: string, param1: string) {
    if (this.isGenerateReport == false) {
      const modalOptions: any = {
        backdrop: 'static',
        ignoreBackdropClick: true,
        keyboard: false,
        initialState: {
          itemId: param,
          id: param1,
          engineerid: this.engineerid,
          engineerlist: this.appendList,
          item: this.serviceRequestform.value
        },
      }
      this.bsActionModalRef = this.modalService.show(ModelEngActionContentComponent, modalOptions);
    }
  }

  public onactionRowClicked(e) {
    if (e.event.target !== undefined && this.isGenerateReport == false) {
      let data = e.data;
      let actionType = e.event.target.getAttribute("data-action-type");
      switch (actionType) {
        case "remove":
          if (confirm("Are you sure, you want to remove the engineer action?") == true) {
            this.actionservice.delete(data.id)
              .pipe(first())
              .subscribe({
                next: (d: any) => {
                  if (d.result) {
                    this.notificationService.showSuccess(d.resultMessage, "Success");
                    const selectedData = this.api.getSelectedRows();
                    this.api.applyTransaction({ remove: selectedData });
                  }
                }
              });
          }
          break
        case "edit":
          this.openaction(this.serviceRequestId, data.id);
          break

        case "download":
          let params: any = {}
          params.id = e.data.id;
          params.fileUrl = e.data.teamviewerrecroding

          if (e.data.teamviewerrecroding != null || params.teamviewerrecroding == null) {
            this.downloadTeamViewerRecording(params)
          } else {
            this.notificationService.showError("No Recording ", "Error")
          }
          break

      }
    }
  }


  downloadTeamViewerRecording(params: any) {
    this.fileshareService.download(params.id, "/SRATN").subscribe((event) => {
      if (event.type === HttpEventType.Response)
        this.downloadFile(params, event);

    });
  }

  private downloadFile(params, data: HttpResponse<Blob>) {
    const downloadedFile = new Blob([data.body], { type: data.body.type });
    const a = document.createElement("a");
    a.setAttribute("style", "display:block;");
    document.body.appendChild(a);
    a.download = params.id;
    a.href = URL.createObjectURL(downloadedFile);
    a.innerHTML = params.fileUrl;
    a.target = "_blank";
    a.click();
    document.body.removeChild(a);
  }

  public onhisRowClicked(e) {

  }

  close() {
    alert('test');
    this.bsModalRef.hide();
  }
}
