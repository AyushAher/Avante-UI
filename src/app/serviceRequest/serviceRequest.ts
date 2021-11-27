/* tslint:disable */
import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {IDropdownSettings} from 'ng-multiselect-dropdown';
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
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {first} from 'rxjs/operators';
import {ColDef, ColumnApi, GridApi} from 'ag-grid-community';
import {environment} from '../../environments/environment';
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";
import {ModelEngContentComponent} from './modelengcontent';
import {ModelEngActionContentComponent} from './modelengactioncontent';
import {DatePipe} from '@angular/common'

import {
  AccountService,
  AlertService,
  ContactService,
  CountryService,
  CustomerService,
  CustomerSiteService,
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
import {HttpEventType, HttpResponse} from "@angular/common/http";
import {FilerendercomponentComponent} from "../Offerrequest/filerendercomponent.component";


@Component({
  selector: 'app-customer',
  templateUrl: './serviceRequest.html',
})
export class ServiceRequestComponent implements OnInit {
  user: User;
  serviceRequestform: FormGroup;
  loading = false;
  submitted = false;
  isSave = false;
  type: string = "SR";
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
  //public defaultdistributors: any[] = [{ key: "1", value: "Ashish" }, { key: "2", value: "CEO" }];
  public columnDefs: ColDef[];
  public ticketcolumnDefs: ColDef[];
  public actionDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;
  PdffileData: FileShare[];
  pdfBase64: string;
  public pdfcolumnDefs: ColDef[];
  private pdfcolumnApi: ColumnApi;
  private pdfapi: GridApi;
  private historycolumnApi: ColumnApi;
  private historyapi: GridApi;
  customerList: Customer[];
  engineerCommentList: EngineerCommentList[] = [];
  engcomment: EngineerCommentList;
  ticketHistoryList: tickersAssignedHistory[] = [];
  actionList: actionList[] = [];
  customerSitelist: CustomerSite[];
  customerlist: any;
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
  //dropdownList = [];
  dropdownSettings: IDropdownSettings = {};
  custcityname: string;
  breakdownlist: ListTypeItem[];
  allsites: any;
  accepted: boolean;


  @Output() public onUploadFinished = new EventEmitter();

  private fileUploadProgress: number;
  private transaction: number;
  private hastransaction: boolean;
  private file: any;

    constructor(
      private formBuilder: FormBuilder,
      private route: ActivatedRoute,
      private router: Router,
      private accountService: AccountService,
      private alertService: AlertService,
      private distributorService: DistributorService,
      private countryService: CountryService,
      private customerService: CustomerService,
      private customerSiteService: CustomerSiteService,
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
      public datepipe: DatePipe
  ) {
    this.notificationService.listen().subscribe((m: any) => {
      console.log(m);
      if (this.serviceRequestId != null) {
        this.serviceRequestService.getById(this.serviceRequestId).pipe(first())
          .subscribe({
            next: (data: any) => {
              this.engineerCommentList = data.object.engComments;
              this.actionList = data.object.engAction;
              this.actionList.forEach((value, index) => {
                value.actiondate = datepipe.transform(value.actiondate, "dd/MM/YYYY")
              })
            },
            error: error => {
              // this.alertService.error(error);
              this.notificationService.showSuccess(error, "Error");
              this.loading = false;
            }
          });

        this.serviceRequestService.getById(this.serviceRequestId).pipe(first())
          .subscribe({
            next: (data: any) => {
              this.engineerCommentList = data.object.engComments;
              this.actionList = data.object.engAction;
              this.actionList.forEach((value, index) => {
                value.actiondate = datepipe.transform(value.actiondate, "dd/MM/YYYY")
              })
            },
            error: error => {
              // this.alertService.error(error);
              this.notificationService.showSuccess(error, "Error");
              this.loading = false;
            }
          });
      }
    });
  }

  ngOnInit() {

    this.transaction = 0;
    this.user = this.accountService.userValue;

    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SCUST");
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

    if (this.user.roleId == environment.custRoleId) {
      this.IsCustomerView = true;
      this.IsDistributorView = false;
      this.IsEngineerView = false;
    } else if (this.user.roleId == environment.distRoleId) {
      this.IsCustomerView = false;
      this.IsDistributorView = true;
      this.IsEngineerView = false;
    } else {
      this.IsCustomerView = false;
      this.IsDistributorView = false;
      this.IsEngineerView = true;
    }

    this.serviceRequestform = this.formBuilder.group({
      serreqno: ['', Validators.required],
      distid: ['', Validators.required],
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
      recurringcomments: ['', Validators.required],
      breakoccurdetailsid: ['', Validators.required],
      alarmdetails: [''],
      resolveaction: [''],
      currentinstrustatus: ['', Validators.required],
      accepted: [false],
      serresolutiondate: [''],
      escalation: [''],
      requesttypeid: [''],
      subrequesttypeid: [''],
      remarks: [''],
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

    if (this.IsEngineerView == true) {
      this.serviceRequestform.get('requesttypeid').setValidators([Validators.required]);
      this.serviceRequestform.get('requesttypeid').updateValueAndValidity();
      this.serviceRequestform.get('subrequesttypeid').setValidators([Validators.required]);
      this.serviceRequestform.get('subrequesttypeid').updateValueAndValidity();
    }

    this.countryService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.countries = data.object;
        },
        error: error => {
          //  this.alertService.error(error);
          this.notificationService.showSuccess(error, "Error");
          this.loading = false;
        }
      });
    //SERTY

    this.listTypeService.getById("SERTY")
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.serviceTypeList = data;
        },
        error: error => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });


    this.serviceRequestService.getSerReqNo()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          let srno = data.object;
          this.serviceRequestform.patchValue({"serreqno": srno});
        },
        error: error => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });


    this.listTypeService.getById("BDOD")
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.breakdownlist = data;
        },
        error: error => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });


    this.listTypeService.getById("TRRQT")
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.reqtypelist = data;
        },
        error: error => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });
    this.dropdownSettings = {
      idField: 'listTypeItemId',
      textField: 'itemname',
    };

    this.listTypeService.getById("SRT")
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.subreqtypelist = data;
        },
        error: error => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });

    this.distributorService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.defaultdistributors = data.object;
        },
        error: error => {
          // this.alertService.error(error);
          this.notificationService.showSuccess(error, "Error");
          this.loading = false;
        }
      });

    this.serviceRequestId = this.route.snapshot.paramMap.get('id');
    if (this.serviceRequestId != null) {
      this.hasAddAccess = false;
      if (this.user.username == "admin") {
        this.hasAddAccess = true;
      }
      this.serviceRequestService.getById(this.serviceRequestId)
        .pipe(first())
        .subscribe({
          next: (data: any) => {

            this.getAllInstrument(data.object.siteid);
            var subreq = data.object.subrequesttypeid.split(',');
            let items: ListTypeItem[] = [];
            if (subreq.length > 0) {
              for (var i = 0; i < subreq.length; i++) {
                let t = new ListTypeItem();
                t.listTypeItemId = subreq[i];
                items.push(t);
              }
              this.serviceRequestform.patchValue({"subrequesttypeid": items});

              this.fileshareService.list(this.serviceRequestId)
                .pipe(first())
                .subscribe({
                  next: (data: any) => {
                    this.PdffileData = data.object;
                    //this.getPdffile(data.object.filePath);
                  },
                  error: error => {
                    this.notificationService.showError(error, "Error");
                    this.loading = false;
                  }
                });

            }
            //   data.object.subrequesttypeid = "";
            this.serviceRequestform.patchValue({"serreqno": data.object.serreqno});
            this.serviceRequestform.patchValue({"serreqdate": new Date(data.object.serreqdate)});
            this.serviceRequestform.patchValue({"serresolutiondate": new Date(data.object.serresolutiondate)});
            this.serviceRequestform.patchValue({"machmodelname": data.object.machmodelnametext});
            this.serviceRequestform.patchValue({"serreqdate": new Date(data.object.serreqdate)});
            this.serviceRequestform.patchValue({"serresolutiondate": new Date(data.object.serresolutiondate)});
            this.serviceRequestform.patchValue({"machmodelname": data.object.machmodelnametext});
            this.serviceRequestform.patchValue({"distid": data.object.distid});
            this.serviceRequestform.patchValue({"assignedto": data.object.assignedto});
            this.serviceRequestform.patchValue({"visittype": data.object.visittype});
            this.serviceRequestform.patchValue({"companyname": data.object.companyname});
            this.serviceRequestform.patchValue({"requesttime": data.object.requesttime});
            this.serviceRequestform.patchValue({"sitename": data.object.sitename});
            this.serviceRequestform.patchValue({"country": data.object.country});
            this.serviceRequestform.patchValue({"contactperson": data.object.contactperson});
            this.serviceRequestform.patchValue({"email": data.object.email});
            this.serviceRequestform.patchValue({"operatorname": data.object.operatorname});
            this.serviceRequestform.patchValue({"operatornumber": data.object.operatornumber});
            this.serviceRequestform.patchValue({"operatoremail": data.object.operatoremail});
            this.serviceRequestform.patchValue({"machinesno": data.object.machinesno});
            this.serviceRequestform.patchValue({"machengineer": data.object.machengineer});
            this.serviceRequestform.patchValue({"xraygenerator": data.object.xraygenerator});
            this.serviceRequestform.patchValue({"breakdowntype": data.object.breakdowntype});
            this.serviceRequestform.patchValue({"isrecurring": data.object.isrecurring});
            this.serviceRequestform.patchValue({"recurringcomments": data.object.recurringcomments});
            this.serviceRequestform.patchValue({"breakoccurdetailsid": data.object.breakoccurdetailsid});
            this.serviceRequestform.patchValue({"alarmdetails": data.object.alarmdetails});
            this.serviceRequestform.patchValue({"resolveaction": data.object.resolveaction});
            this.serviceRequestform.patchValue({"currentinstrustatus": data.object.currentinstrustatus});
            this.serviceRequestform.patchValue({"accepted": data.object.accepted});
            this.serviceRequestform.patchValue({"escalation": data.object.escalation});
            this.serviceRequestform.patchValue({"requesttypeid": data.object.requesttypeid});
            this.serviceRequestform.patchValue({"remarks": data.object.remarks});
            //

            this.Accepted(data.object.accepted)
            this.serviceRequestform.patchValue({"machmodelname": (data.object.machmodelname)});
            this.customerId = data.object.custid;
            this.siteId = data.object.siteid;
            this.getDistRegnContacts(data.object.distid);
            this.engineerCommentList = data.object.engComments

            // transform next date to required format
            let datepipe = new DatePipe("en-US");

            this.engineerCommentList.forEach((value, index) => {
              value.nextdate = datepipe.transform(value.nextdate, "dd/MM/YYYY")
            })

            this.actionList = data.object.engAction;
            this.actionList.forEach((value, index) => {
              value.actiondate = datepipe.transform(value.actiondate, "dd/MM/YYYY")
            })
            this.engineerid = data.object.assignedto;
            this.ticketHistoryList = data.object.assignedHistory;

            this.ticketHistoryList.forEach((value, index) => {
              value.assigneddate = datepipe.transform(value.assigneddate, "dd/MM/YYYY")
            })

            //this.serviceRequestform.patchValue(data.object);
          },
          error: error => {
            // this.alertService.error(error);
            this.notificationService.showSuccess(error, "Error");
            this.loading = false;
          }
        });

    } else {
      this.contactService.getCustomerSiteByContact(this.user.contactId)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.logindata = data.object;
            //this.customerList = this.logindata.customer;
            //if (this.customerList != undefined) {
            //  this.customerId = this.logindata.customer.id;
            //}
            this.siteId = this.logindata.sites[0].id;
            this.customerId = this.logindata.id;
            this.customerSitelist = this.logindata.sites;
            this.serviceRequestform.patchValue({"companyname": this.logindata.custname});
            this.serviceRequestform.patchValue({"distid": this.logindata.defdistid});
            this.distId = this.logindata.defdistid;
            this.serviceRequestform.patchValue({"contactperson": this.user.username});
            this.serviceRequestform.patchValue({"email": this.user.email});
            this.serviceRequestform.patchValue({"sitename": this.logindata.sites[0].custregname});


            //var subreq = this.logindata.sites.id.join(',');
            let subreq = this.logindata.sites.map(x => x.id).join(',');

            this.instrumentService.getinstubysiteIds(subreq)
              .pipe(first())
              .subscribe({
                next: (data: any) => {
                  this.instrumentList = data.object;
                },
                error: error => {
                  //  this.alertService.error(error);
                  this.notificationService.showSuccess(error, "Error");
                  this.loading = false;
                }
              });


            // this.getAllInstrument(this.logindata.sites[0].id);
            // this.getDistRegnContacts(this.logindata.defdistid);
            //if (this.logindata.contacts.length > 0) {
            //  this.serviceRequestform.patchValue({ "operatorname": this.logindata.contacts[0].fname + '' + this.logindata.contacts[0].lname });
            //  this.serviceRequestform.patchValue({ "operatornumber": this.logindata.contacts[0].pcontactno });
            //  this.serviceRequestform.patchValue({ "operatoremail": this.logindata.contacts[0].pemail });
            //}
            //else {
            //  this.serviceRequestform.patchValue({ "operatorname": this.logindata.sites[0].contacts[0].fname + '' + this.logindata.sites[0].contacts[0].lname });
            //  this.serviceRequestform.patchValue({ "operatornumber": this.logindata.sites[0].contacts[0].pcontactno });
            //  this.serviceRequestform.patchValue({ "operatoremail": this.logindata.sites[0].contacts[0].pemail });
            //}
          },
          error: error => {
            //  this.alertService.error(error);
            this.notificationService.showSuccess(error, "Error");
            this.loading = false;
          }
        });
    }

    this.columnDefs = this.createColumnDefs();
    this.ticketcolumnDefs = this.createColumnHistoryDefs();
    this.actionDefs = this.createColumnActionDefs();
    this.pdfcolumnDefs = this.pdfcreateColumnDefs();
    this.serviceRequestform.get('distid').disable();

    if (this.IsEngineerView) {
      this.serviceRequestform.get('assignedto').disable();
      this.serviceRequestform.get('serreqdate').disable();
      this.serviceRequestform.get('requesttime').disable();
      this.serviceRequestform.get('country').disable();
      this.serviceRequestform.get('machinesno').disable();
      this.serviceRequestform.get('breakdowntype').disable();
      this.serviceRequestform.get('isrecurring').disable();
      this.serviceRequestform.get('recurringcomments').disable();
      this.serviceRequestform.get('breakoccurdetails').disable();
      this.serviceRequestform.get('alarmdetails').disable();
      this.serviceRequestform.get('resolveaction').disable();
      this.serviceRequestform.get('visittype').disable();
      this.serviceRequestform.get('currentinstrustatus').disable();
    } else if (this.IsDistributorView) {
      this.serviceRequestform.get('assignedto').enable();
      this.serviceRequestform.get('requesttime').disable();
      this.serviceRequestform.get('serreqdate').disable();
      this.serviceRequestform.get('country').disable();
      this.serviceRequestform.get('machinesno').disable();
      this.serviceRequestform.get('breakdowntype').disable();
      this.serviceRequestform.get('isrecurring').disable();
      this.serviceRequestform.get('recurringcomments').disable();
      this.serviceRequestform.get('breakoccurdetails').disable();
      this.serviceRequestform.get('alarmdetails').disable();
      this.serviceRequestform.get('resolveaction').disable();
      this.serviceRequestform.get('visittype').disable();
      this.serviceRequestform.get('currentinstrustatus').disable();
    } else {
      this.serviceRequestform.get('assignedto').disable();
      this.serviceRequestform.get('serreqdate').enable();

    }
    // this.ticketcolumnDefs = this.createColumnTicketDefs();
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.serviceRequestform.controls;
  }

  get a() {
    return this.serviceRequestform.controls.engineer;
  }

  onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.serviceRequestform.invalid) {
      return;
    }
    this.isSave = true;
    this.loading = true;

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
        this.serviceRequest.subrequesttypeid = selectarray.map(x => x.listTypeItemId).join(',');
      }

      if (this.IsCustomerView == true) {
        this.serviceRequest.serresolutiondate = null;
      }

      this.serviceRequestService.save(this.serviceRequest)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            //debugger;
            if (data.result) {
              this.saveFileShare(data.object.id);
              if (this.file != null) {

                this.uploadPdfFile(this.file, data.object.id)
              }
              this.notificationService.showSuccess(data.resultMessage, "Success");

              this.router.navigate(["servicerequestlist"]);
            } else {
              this.notificationService.showError(data.resultMessage, "Error");
            }
            this.loading = false;

          },
          error: error => {
            // this.alertService.error(error);
            this.notificationService.showSuccess(error, "Error");
            this.loading = false;
          }
        });
    } else {
      this.serviceRequest = this.serviceRequestform.getRawValue();
      this.serviceRequest.id = this.serviceRequestId;
      this.serviceRequest.siteid = this.siteId;
      this.serviceRequest.custid = this.customerId;
      this.serviceRequest.engComments = [];
      this.serviceRequest.assignedHistory = [];
      this.serviceRequest.engAction = [];

      if (this.serviceRequestform.get('subrequesttypeid').value.length > 0) {
        var selectarray = this.serviceRequestform.get('subrequesttypeid').value;
        this.serviceRequest.subrequesttypeid = selectarray.map(x => x.listTypeItemId).join(',');
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
              this.router.navigate(["servicerequestlist"]);
            } else {
              this.notificationService.showError(data.resultMessage, "Error");
            }
            this.loading = false;

          },
          error: error => {
            //  this.alertService.error(error);
            this.notificationService.showSuccess(error, "Error");
            this.loading = false;
          }
        });
    }
  }

  Accepted(isAccepted?) {
    if (isAccepted == "on") {
      this.accepted = !this.accepted
    } else {
      this.accepted = isAccepted
    }
  }

  generatereport() {
    this.servicereport = new ServiceReport();
    this.servicereport.serviceRequestId = this.serviceRequestId;
    this.servicereport.customer = this.serviceRequestform.get('companyname').value;
    this.servicereport.srOf = this.user.firstName + '' + this.user.lastName + '/' + this.countries.filter(x => x.id == this.serviceRequestform.get('country').value)[0].name + '/' + this.datepipe.transform(this.serviceRequestform.get('serreqdate').value, 'yyyy-MM-dd');
    this.servicereport.country = this.countries.filter(x => x.id == this.serviceRequestform.get('country').value)[0].name;
    this.servicereport.problem = this.breakdownlist.filter(x => x.listTypeItemId == this.serviceRequestform.get('breakoccurdetailsid').value)[0].itemname + "||" + this.serviceRequestform.get('alarmdetails').value + '||' + this.serviceRequestform.get('remarks').value;
    this.servicereport.installation = (this.serviceRequestform.get('subrequesttypeid').value.filter(x => x.listTypeItemId == environment.INS)).length > 0 ? true : false;
    this.servicereport.analyticalassit = (this.serviceRequestform.get('subrequesttypeid').value.filter(x => x.listTypeItemId == environment.ANAS)).length > 0 ? true : false;
    this.servicereport.prevmaintenance = (this.serviceRequestform.get('subrequesttypeid').value.filter(x => x.listTypeItemId == environment.PRMN1)).length > 0 ? true : false;
    this.servicereport.rework = (this.serviceRequestform.get('subrequesttypeid').value.filter(x => x.listTypeItemId == environment.REWK)).length > 0 ? true : false;
    this.servicereport.corrmaintenance = (this.serviceRequestform.get('subrequesttypeid').value.filter(x => x.listTypeItemId == environment.CRMA)).length > 0 ? true : false;

    if (this.customerId != null) {
      this.customerService.getById(this.customerId)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.custcityname = data.object.address.city;
            this.servicereport.town = this.custcityname;
            console.log(data)
            //this.getPdffile(data.object.filePath);
            this.servicereport
            this.servicereportService.save(this.servicereport)
              .pipe(first())
              .subscribe({
                next: (data: any) => {
                  debugger;
                  if (data.result) {
                    this.notificationService.showSuccess(data.resultMessage, "Success");

                    // Add Record with status 'completed' in ticket action
                    this.srAssignedHistory = new tickersAssignedHistory;
                    this.srAssignedHistory.engineerid = this.engineerid;
                    this.srAssignedHistory.servicerequestid = this.serviceRequestId;
                    this.srAssignedHistory.ticketstatus = "c488750a-47c4-11ec-9dbc-54bf64020316";
                    this.srAssignedHistory.assigneddate = new Date()

                    this.srAssignedHistoryService.save(this.srAssignedHistory)
                      .pipe(first())
                      .subscribe({
                        next: (data: any) => {
                          if (!data.result) {
                            this.notificationService.showError(data.resultMessage, "Error");
                          }
                        },
                        error: error => {
                          // this.alertService.error(error);
                          this.notificationService.showSuccess(error, "Error");
                          this.loading = false;
                        }
                      });

                    this.router.navigate(["servicereport", data.object.id]);
                  } else {
                    this.notificationService.showError(data.resultMessage, "Error");
                  }
                  this.loading = false;
                },
                error: error => {
                  // this.alertService.error(error);
                  this.notificationService.showSuccess(error, "Error");
                  this.loading = false;
                }
              });
          },
          error: error => {
            this.notificationService.showError(error, "Error");
            this.loading = false;
          }
        });
    } else {
      this.servicereportService.save(this.servicereport)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            debugger;
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              // Add Record with status 'completed' in ticket action
              this.srAssignedHistory = new tickersAssignedHistory;
              this.srAssignedHistory.engineerid = this.engineerid;
              this.srAssignedHistory.servicerequestid = this.serviceRequestId;
              this.srAssignedHistory.ticketstatus = "c488750a-47c4-11ec-9dbc-54bf64020316";
              this.srAssignedHistory.assigneddate = new Date()

              this.srAssignedHistoryService.save(this.srAssignedHistory)
                .pipe(first())
                .subscribe({
                  next: (data: any) => {
                    if (!data.result) {
                      this.notificationService.showError(data.resultMessage, "Error");
                    }
                  },
                  error: error => {
                    // this.alertService.error(error);
                    this.notificationService.showSuccess(error, "Error");
                    this.loading = false;
                  }
                });
              this.router.navigate(["servicereport", data.object.id]);
            } else {
              this.notificationService.showError(data.resultMessage, "Error");
            }
            this.loading = false;

          },
          error: error => {
            // this.alertService.error(error);
            this.notificationService.showSuccess(error, "Error");
            this.loading = false;
          }
        });
    }

  }

  addAssignedHistory(sr: ServiceRequest) {
    if (this.engineerid != null && this.engineerid != sr.assignedto) {

      this.srAssignedHistory = new tickersAssignedHistory;
      this.srAssignedHistory.engineerid = this.engineerid;
      this.srAssignedHistory.servicerequestid = sr.id;
      this.srAssignedHistory.ticketstatus = "728d83a4-716a-48d7-8080-e5948afb4525";
      this.srAssignedHistory.assigneddate = new Date()

      this.srAssignedHistoryService.save(this.srAssignedHistory)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            //debugger;
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.router.navigate(["servicerequestlist"]);
            } else {
              this.notificationService.showError(data.resultMessage, "Error");
            }
            this.loading = false;

          },
          error: error => {
            // this.alertService.error(error);
            this.notificationService.showSuccess(error, "Error");
            this.loading = false;
          }
        });
    }
  }

  //onassingedTo(event) {
  //  //debugger;
  //  this.engineerid = event.value;
  //}

  getDistRegnContacts(distid: string) {
    //debugger;
    this.distributorService.getDistributorRegionContacts(distid)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          //debugger;
          this.appendList = data.object;
          //this.appendList.push(data.object.regions[0].contacts);
        },
        error: error => {
          //  this.alertService.error(error);
          this.notificationService.showSuccess(error, "Error");
          this.loading = false;
        }
      });
  }

  saveFileShare(id: string) {
    //fileshare: FileShare;
    if (this.pdfPath != null) {
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
                this.router.navigate(["servicerequestlist"]);
              } else {
                this.notificationService.showError(data.resultMessage, "Error");
              }
              this.loading = false;
            },
            error: error => {
              this.notificationService.showError(error, "Error");
              this.loading = false;
            }
          });
      }
    }
  }

  getPdffile(filePath: string) {
    //debugger;
    if (filePath != null && filePath != "") {
      this.uploadService.getFile(filePath)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            //debugger;
            this.download(data.data);
            // this.alertService.success('File Upload Successfully.');
            // this.imagePath = data.path;
            // console.log(data);

          },
          error: error => {
            this.notificationService.showError(error, "Error");
            // this.imageUrl = this.noimageData;
          }
        });
    }
  }

  download(fileData: any) {
    //debugger;
    const byteArray = new Uint8Array(atob(fileData).split('').map(char => char.charCodeAt(0)));
    let b = new Blob([byteArray], {type: 'application/pdf'});
    const url = window.URL.createObjectURL(b);
    window.open(url);
    // i.e. display the PDF content via iframe
    // document.querySelector("iframe").src = url;
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

      console.log(node, document.getElementById("demo"))
      ul.appendChild(node);

    }
  };

  public onRowClicked(e) {
    //debugger;
    if (e.event.target !== undefined) {
      let data = e.data;
      let actionType = e.event.target.getAttribute("data-action-type");
      //this.serviceRequestId = this.route.snapshot.paramMap.get('id');
      switch (actionType) {
        case "remove":
          if (confirm("Are you sure, you want to remove the engineer comment?") == true) {
            //this.instrumentService.deleteConfig(data.configTypeid, data.configValueid)
            this.engcomservice.delete(data.id)
              .pipe(first())
              .subscribe({
                next: (d: any) => {
                  if (d.result) {
                    this.notificationService.showSuccess(d.resultMessage, "Success");
                  } else {
                    this.notificationService.showError(d.resultMessage, "Error");
                  }
                },
                error: error => {
                  this.notificationService.showError(error, "Error");
                  this.loading = false;
                }
              });
          }
        case "edit":
          this.open(this.serviceRequestId, data.id, this.engineerid);
      }
    }
  }

  onCellValueChanged(event) {
    //debugger;
    //console.log(event) to test it
    var data = event.data;
    event.data.modified = true;
    //if (this.selectedConfigType.filter(x => x.id == data.configValueid && x.listTypeItemId == data.configTypeid
    //  && x.sparePartId == data.id).length > 0) {
    //  var d = this.selectedConfigType.filter(x => x.id == data.configValueid && x.listTypeItemId == data.configTypeid
    //    && x.sparePartId == data.id);
    //  d[0].insqty = event.newValue;
    //}
  }

  private pdfcreateColumnDefs() {
    return [
      {
        headerName: "Action",
        field: "id",
        filter: false,
        editable: false,
        width: 100,
        sortable: false,
        cellRendererFramework: FilerendercomponentComponent,
        cellRendererParams: {
          deleteaccess: this.hasDeleteAccess,
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
        error: error => {
          //  this.alertService.error(error);
          this.notificationService.showSuccess(error, "Error");
          this.loading = false;
        }
      });
  }

  public oninstuchange(id: string) {
    debugger;
    var instument;

    this.instrumentService.getSerReqInstrument(id)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          instument = data.object;
          this.siteId = data.object.custSiteId;
          this.serviceRequestform.patchValue({"machmodelname": instument.instype});
          this.serviceRequestform.patchValue({"operatorname": instument.operatorEng.fname + '' + instument.operatorEng.lname});
          this.serviceRequestform.patchValue({"operatornumber": instument.operatorEng.pcontactno});
          this.serviceRequestform.patchValue({"operatoremail": instument.operatorEng.pemail});
          this.serviceRequestform.patchValue({"machengineer": instument.machineEng.fname + ' ' + instument.machineEng.lname});
          this.serviceRequestform.patchValue({"xraygenerator": instument.insversion});
        },
        error: error => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });

  }

  // public onPdfRowClicked(e) {
  //   //debugger;
  //   if (e.event.target !== undefined) {
  //     let data = e.data;
  //     let actionType = e.event.target.getAttribute("data-action-type");
  //     this.serviceRequestId = this.route.snapshot.paramMap.get('id');
  //     switch (actionType) {
  //       case "remove":
  //         if (confirm("Are you sure, you want to remove the config type?") == true) {
  //           //this.instrumentService.deleteConfig(data.configTypeid, data.configValueid)
  //           this.fileshareService.delete(data.id)
  //             .pipe(first())
  //             .subscribe({
  //               next: (d: any) => {
  //                 if (d.result) {
  //                   this.notificationService.showSuccess(d.resultMessage, "Success");
  //                   this.fileshareService.getById(this.serviceRequestId)
  //                     .pipe(first())
  //                     .subscribe({
  //                       next: (data: any) => {
  //                         this.PdffileData = data.object;
  //                         //this.getPdffile(data.object.filePath);
  //                       },
  //                       error: error => {
  //                         this.notificationService.showError(error, "Error");
  //                         this.loading = false;
  //                       }
  //                     });
  //                 } else {
  //                   this.notificationService.showError(d.resultMessage, "Error");
  //                 }
  //               },
  //               error: error => {
  //                 this.notificationService.showError(error, "Error");
  //                 this.loading = false;
  //               }
  //             });
  //         }
  //         break;
  //       case "download":
  //         this.getPdffile(data.filePath);
  //     }
  //   }
  // }

  private createColumnDefs() {
    return [
      {
        headerName: 'Action',
        field: 'id',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        template:
          `<button class="btn btn-link" type="button" (click)="delete(params)"><i class="fas fa-trash-alt" data-action-type="remove" title="Delete"></i></button>
          <button type="button" class="btn btn-link" data-action-type="edit" ><i class="fas fas fa-pen" title="Edit Value" data-action-type="edit"></i></button>`
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
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false
      },
      {
        headerName: 'Status',
        field: 'ticketstatus',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false
      }
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
        sortable: false,
        template:
          `<button class="btn btn-link" type="button" (click)="delete(params)"><i class="fas fa-trash-alt" data-action-type="remove" title="Delete"></i></button>
          <button type="button" class="btn btn-link" data-action-type="edit" ><i class="fas fas fa-pen" title="Edit Value" data-action-type="edit"></i></button>`
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
        field: 'actiontaken',
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
        template: `<button type="button" class="btn btn-link" data-action-type="download" ><i class="fas fas fa-download" title="Edit Value" data-action-type="download"></i></button>`
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

  onGridReady(params): void {
    //debugger;
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }

  uploadPdfFile(files, serviceRequestId) {
    //
    // let file = event.target.files;
    // if (event.target.files && event.target.files[0]) {
    //   //  this.uploadService.upload(file).subscribe(event => { //debugger; });;
    //   this.uploadService.uploadPdf(file)
    //     .pipe(first())
    //     .subscribe({
    //       next: (data: any) => {
    //         //debugger;
    //         this.notificationService.showSuccess("File Upload Successfully", "Success");
    //         this.pdfPath = data.path;
    //         //this.pdfFileName = file.name;
    //       },
    //       error: error => {
    //         this.notificationService.showError(error, "Error");
    //       }
    //     });
    // }

    if (files.length === 0) {
      return;
    }
    let filesToUpload: File[] = files;
    const formData = new FormData();

    Array.from(filesToUpload).map((file, index) => {
      return formData.append("file" + index, file, file.name);
    });
    this.fileshareService.upload(formData, serviceRequestId,"SRREQ").subscribe((event) => {
      if (event.type === HttpEventType.UploadProgress)
        this.fileUploadProgress = Math.round((100 * event.loaded) / event.total);
      else if (event.type === HttpEventType.Response) {
        this.onUploadFinished.emit(event.body);
      }
    });
  }


  open(param: string, param1: string, param2: string) {
    //debugger;
    const initialState = {
      itemId: param,
      id: param1,
      engineerid: this.engineerid
    };
    console.log(initialState);
    this.bsModalRef = this.modalService.show(ModelEngContentComponent, {initialState});
  }

  openaction(param: string, param1: string) {
    //debugger;
    const initialState = {
      itemId: param,
      id: param1,
      engineerid: this.engineerid,
      engineerlist: this.appendList
    };
    this.bsActionModalRef = this.modalService.show(ModelEngActionContentComponent, {initialState});
  }

  public onactionRowClicked(e) {
    //debugger;
    if (e.event.target !== undefined) {
      let data = e.data;
      let actionType = e.event.target.getAttribute("data-action-type");
      //this.serviceRequestId = this.route.snapshot.paramMap.get('id');
      switch (actionType) {
        case "remove":
          if (confirm("Are you sure, you want to remove the engineer action?") == true) {
            //this.instrumentService.deleteConfig(data.configTypeid, data.configValueid)
            this.actionservice.delete(data.id)
              .pipe(first())
              .subscribe({
                next: (d: any) => {
                  if (d.result) {
                    this.notificationService.showSuccess(d.resultMessage, "Success");
                    const selectedData = this.api.getSelectedRows();
                    this.api.applyTransaction({remove: selectedData});
                  } else {
                    this.notificationService.showError(d.resultMessage, "Error");
                  }
                },
                error: error => {
                  this.notificationService.showError(error, "Error");
                  this.loading = false;
                }
              });
          }
        case "edit":
          this.openaction(this.serviceRequestId, data.id);
        case "download":
          console.log(e.data.id)
          let params:any = {}
          params.id = e.data.id;
          params.fileUrl = e.data.teamviewerrecroding
          this.downloadTeamViewerRecording(params)
          break
      }
    }
  }


  downloadTeamViewerRecording(params: any) {
    this.fileshareService.download(params.id,"/SRATN").subscribe((event) => {
      if (event.type === HttpEventType.Response) {
        this.downloadFile(params,event);
      }
    });
  }

  private downloadFile(params,data: HttpResponse<Blob>) {
    debugger;
    const downloadedFile = new Blob([data.body], {type: data.body.type});
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
