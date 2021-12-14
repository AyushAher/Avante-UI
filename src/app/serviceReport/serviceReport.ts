import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';

import {
  ConfigTypeValue,
  Contact,
  Country,
  custSPInventory,
  Distributor,
  FileShare,
  Instrument,
  ListTypeItem,
  ProfileReadOnly,
  ResultMsg,
  ServiceReport,
  ServiceRequest,
  SparePart,
  sparePartRecomanded,
  sparePartsConsume,
  User,
  workDone,
  workTime
} from '../_models';
import {SignaturePad} from 'angular2-signaturepad';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {debounceTime, distinctUntilChanged, first, map} from 'rxjs/operators';
import {ColDef, ColumnApi, GridApi} from 'ag-grid-community';
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";
import {WorkdoneContentComponent} from './workdonecontent';
import {WorkTimeContentComponent} from './workTime';
import {
  AccountService,
  AlertService,
  ConfigTypeValueService,
  CountryService,
  CustomerService,
  DistributorService,
  FileshareService,
  InstrumentService,
  InventoryService,
  ListTypeService,
  NotificationService,
  ProfileService,
  ServiceReportService,
  ServiceRequestService,
  SparePartService,
  SrConsumedService,
  SrRecomandService,
  UploadService,
  workdoneService,
  worktimeService
} from '../_services';
import {Observable, OperatorFunction} from 'rxjs';
import {DatePipe} from "@angular/common";
import {HttpEventType} from "@angular/common/http";
import {FilerendercomponentComponent} from "../Offerrequest/filerendercomponent.component";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import {CustspinventoryService} from "../_services/custspinventory.service";
import {PreventivemaintenancetableComponent} from "../preventivemaintenancetable/preventivemaintenancetable.component";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-customer',
  templateUrl: './serviceReport.html',
})

export class ServiceReportComponent implements OnInit {
  user: User;
  filteredOptions: Observable<string[]>;
  ServiceReportform: FormGroup;
  loading = false;
  submitted = false;
  isSave = false;
  type: string = "SR";
  ServiceReportId: string;
  countries: Country[];
  defaultdistributors: Distributor[];
  listTypeItems: ListTypeItem[];
  departmentList: ListTypeItem[];
  brandlist: ListTypeItem[];
  ServiceReport: ServiceReport;
  workdonelist: workDone[]=[];
  profilePermission: ProfileReadOnly;
  srRecomndModel: sparePartRecomanded;
  srConsumedModel: sparePartsConsume;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  pdfPath: any;
  //public defaultdistributors: any[] = [{ key: "1", value: "Ashish" }, { key: "2", value: "CEO" }];
  public columnDefs: ColDef[];
  public columnworkdefs: ColDef[];
  public spcolumnDefs: ColDef[];
  public spRecomandDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;
  workTime: workTime[] = [];
  servicerequest: ServiceRequest;
  sparePartsList: SparePart[] = [];
  sparePartRecomanded: sparePartRecomanded[] = [];
  configValueList: ConfigTypeValue[];
  spconsumedlist: sparePartsConsume[] = [];
  selectedConfigType: ConfigTypeValue[]=[];
  signatureImg: string;
  @ViewChild('sigpad1') signaturePad: SignaturePad;
  @ViewChild('sigpad2') signaturePadcust: SignaturePad;
  bsModalRef: BsModalRef;
  bsActionModalRef: BsModalRef;
  allcontactlist: Contact[];
  instrumentlist: Instrument[];
  sparepartlist: SparePart[];
  sparepartinvontorylist: SparePart[];
  invlist: custSPInventory;
  PdffileData: FileShare[];
  pdfBase64: string;
  public pdfcolumnDefs: ColDef[];
  private pdfcolumnApi: ColumnApi;
  private pdfapi: GridApi;
  signaturePadOptions: Object = {
    'minWidth': 2,
    'canvasWidth': 500,
    'canvasHeight': 100
  };
  custsign: any;
  engsign: any;
  private transaction: number;
  private file: any;
  private hastransaction: boolean;
  @Output() public onUploadFinished = new EventEmitter();
  private fileUploadProgress: number;
  sparepartrecmmlist: any;

  datepipe = new DatePipe("en-US");
  checkedImg = "data:image/png;base64,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"
  unCheckedImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAcAAAAIACAMAAAAi+0xoAAABnlBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///+WSgAsAAAAiHRSTlMAAQIDBAUGCwwNDg8QERMUFR0eHyAhLi8xMjM0NTY3ODk6QUJERkdISUpLTU5PUFFVV1haW1xeYGFiY2RlgIGCg4iLjI2OkZKTlJWZmpydoqeoqaq+v8DBxMXGyMnKzM3Oz9DR0tPU1dna29zd3uDk5ebo6err7O3u8PHy8/T19vf4+fr7/P3+w2NfOQAAAAFiS0dEiRxhJswAAAaoSURBVHja7dzpWxVlHMfhHxyUTdOyRXFDMyOxVHADN9QktxI0FwxXMJfQLELMLOFIwJ/dC0lRAVkcmcfr/rz3zfe+Rmc8M0+EJEmSJEmSJEmSJEmSJEmSJEmSJEl6T6taub3l9MXunofFUWVa8WFP18XTLdtXVr01vPINBy8PW/ad13Ni6+K561XvOf+vLeeroXN7queiV1LXPmDF+W2gva5klnyl9Vfsl4d+3lk2C76y5jumy0u3mwoz9Vt5yWx56vq6GfEtbnXbmbNGTi2dvt/mBwbLX32bp/uv3z6XXz4vwtaF0/H7uNNUee2nZdO4e+m1U37rX/smv88fWSnP/f3l1H5b/M9Lzis2TOXX4PYl9w1vm+Lvz0H75L+nGye9f3lsnRT6p3aS54c/bJNGvRM+TSy4aJlU6pzoif6IXdLp8Ot+m0bMkk4j37zqt8T/XydV3wevAP5gk7Q6+bLfak/wqT3Pv/QsUbhmkdTqHv+iTLM90mv3uAvwtjnS65cXl2CjNVLs+e8SJd3GSLGbpWOAdbZIs7oxwHZTpFnb2KdjT0yRZgOLIiJiryVSrTkiIs4bItXORkRUDhki1YaqIqLeDum2yQ+5aXc4Iq6bId2uRlT5ISnhhitjlRVSriZ2GCHlGqPFCCm3P84YIeXao8MIKXchbhgh5brinhFS7m70GyHl+sL5kUk3GLP4M9+tKXeC6tuvfO3RWVxNMwf89TNbZ9Xy+9kDDvLLsBXFzAFbrZxlxzIHXG3kLFubOWCFkbOsInNAG2cbQIAAAQogQIAAAQIUQIAAAQIEKIAAAQI0MUABBAgQoAAKIECAAAVQAAECBCiAAAECBAhQAAECBAgQoAACBAgQIEABBAgQoAAKIECAAAVQAAECBCiAAggQIEABBAgQIECAAggQIECAAAUQIECAAAEKIECAAAVQAAECBCiAAggQIEABFECAAAEKIECAAAECFECAAAECBCiAAAECBAhQAAECBCiAAggQIEABFECAAAEKIECAAAECFECAAAECBCiAAAECBAhQAAECBCiAAggQIEABFECAAAEKoAACBAhQAAECBAgQoAACBAgQIEABBAgQIECAAggQIEABFECAAAEKoAACBAhQAAUQIECAAggQIECAAAUQIECAAAEKIECAAAECFECAAAEKoAACBAhQAAUQIECAAggQIECAAAUQIECAAAEKIECAAAECFECAAAEKoAACBAhQAAUQIECAAiiAAAECFECAAAECBCiAAAECBAhQAAECBAgQoAACBAhQAAUQIECAAiiAAAECFEABBAgQoAACBAgQIEABBAgQIECAAggQIECAAAUQIECAAiiAAAECFEABBAgQoAAKIECAAAUQIECAAAEKIECAAAECFECAAAGaGKAAAgQIUAAFECBAgAIogAABAhRAgAABAgQogAABAgQIUAABAgQIEKAAAgQIUAAFECBAgAIogAABAhRAAQQIEKAAAgQIECBAAQQIECBAgAIIECBAgAAFECBAgAIogAABAhRAAQQIEKAACiBAgAAFEGBWgBU2zrKqzAHXGDnLajMHPGrkLDueOWBxuZWzq+Zp5oCj9wlm5/fbaPaAo8Vjte5kMqhi3fGnM9eI4qgSbjD6jZByfXHPCCl3N24YIeW6osMIKXchzhgh5dqjxQgptz92GCHlGmOVEVKuJqqGrZBuw5UR182Qblcj4ogZ0u1QRNSbId2+iojKITuk2lBVRMQ5Q6TajxERsdcQqdb07EWoJ5ZIs4FFz34KbjdFmrWN/ZZfZ4o0qxsDLOm2RYrdLP3/dZpGY6RYw/P3oQq3rJFedwov3mhrMkd67Rr3SmLhqj1S60ph/Eulq/yolFjDtS+/Fvy9SdLq5CvvdS95YJOU6vvg1TfzN41YJZ1Gvn7924pvzZJOhyb4OGaBV3yTqXPhRJ83Leu1TBr1fjTxB2qf/mmbFPprxWSfGK4ftE7+K34x+Uei2zzP5/8JfttUn/luGbBQzq+/hqk/1F7/yEZ57vHGNx6U4F40x/1e8+bDEj70PJjbLn0yneMuyva5lcllI60Lp3liSX2ftfJXX/30z5xZ3OoizNvld2rpzA596rRZnrq2bqYHPxV23zZbXrq1qzCLs7tK6y+bLg/d2Fk2y+PXSurafDcxzz1pqyuZyxF61c1nfT84bw2dbaqe+zGI5RsOXnZT+u7rObF10Vs7y7KypvFAe0dXT7/TKTOu2N/T1dF+oLGm0gmqkiRJkiRJkiRJkiRJkiRJkiRJkiS9r/0HWyxT9qD0o5gAAAAASUVORK5CYII="

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
    private ServiceReportService: ServiceReportService,
    private fileshareService: FileshareService,
    private uploadService: UploadService,
    private listTypeService: ListTypeService,
    private configService: ConfigTypeValueService,
    private sparePartService: SparePartService,
    private modalService: BsModalService,
    private workdoneservice: workdoneService,
    private worktimeservice: worktimeService,
    private instrumentservice: InstrumentService,
    private serviceRequestService: ServiceRequestService,
    private srrecomndservice: SrRecomandService,
    private srConsumedservice: SrConsumedService,
    private srInventoryservice: InventoryService,
    private CustSPInventoryService: CustspinventoryService
  ) {
    this.notificationService.listen().subscribe((m: any) => {
      if (this.ServiceReportId != null) {
        this.ServiceReportService.getById(this.ServiceReportId).pipe(first())
          .subscribe({
            next: (data: any) => {
              this.workdonelist = data.object.lstWorkdone;
              this.workTime = data.object.lstWorktime;

              this.workTime.forEach((value, index) => {
                value.worktimedate = this.datepipe.transform(value.worktimedate, "dd/MM/YYYY")
              })

              this.sparePartRecomanded = data.object.lstSPRecommend;
              this.spconsumedlist = data.object.lstSPConsumed;
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


  ngAfterViewInit() {
    // this.signaturePad is now available
    this.signaturePad.set('minWidth', 2);
    this.signaturePad.clear();
    this.signaturePadcust.set('minWidth', 2);
    this.signaturePadcust.clear();
  }

  //formatter = (result: { name: string }) => result.name.toUpperCase();
  formatter = (x: Country) => x.name;
  search: OperatorFunction<string, readonly Country[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term === '' ? []
        : this.countries.filter(v => v.name.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )

  searchinstu: OperatorFunction<string, readonly Instrument[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term === '' ? []
        : this.instrumentlist.filter(v => v.serialnos.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )
  formatterinstu = (x: Instrument) => x.serialnos;


  searchpart: OperatorFunction<string, readonly SparePart[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term === '' ? []
        : this.sparepartrecmmlist.filter(v => v.partNo.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )

  formatterpart = (x: SparePart) => x.partNo;

  searchpartcon: OperatorFunction<string, readonly SparePart[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term === '' ? []
        : this.sparepartlist.filter(v => v.partNo.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )
  formatterpartcon = (x: SparePart) => x.partNo;

  ngOnInit() {

    this.transaction = 0;
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SRREP");
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

    this.ServiceReportform = this.formBuilder.group({
      customer: [''],
      srOf: [''],
      department: [''],
      country: [''],
      town: [''],
      respInstrument: [''],
      labChief: ['', Validators.required],
      computerarlsn: ['', Validators.required],
      instrument: ['', Validators.required],
      software: ['', Validators.required],
      brandName: ['', Validators.required],
      firmaware: ['', Validators.required],
      installation: [false],
      analyticalassit: [false],
      prevmaintenance: [false],
      corrmaintenance: [false],
      rework:[false],
      problem: ['', Validators.required],
      workCompletedstr: ['', Validators.required],
      workfinishedstr: ['', Validators.required],
      interruptedstr: ['', Validators.required],
      reason: ['', Validators.required],
      nextvisitscheduled: ['', Validators.required],
      engineercomments: ['', Validators.required],
      signengname: ['', Validators.required],
      engineerSing: [''],
      signcustname: ['', Validators.required],
      customerSing: [''],
      workTime: this.formBuilder.group({
        date: [''],
        startTime: [''],
        endTime: [''],
        totalHrs: ['']
      }),
      sparePartsList: this.formBuilder.group({
        sparepartConsumed: [''],
        sparepartId: ['']
      }),
      recondad: [''],
      consumed:['']
    });

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

    this.instrumentservice.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.instrumentlist = data.object;
        },
        error: error => {
          //  this.alertService.error(error);
          this.notificationService.showSuccess(error, "Error");
          this.loading = false;
        }
      });

    this.sparePartService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.sparepartrecmmlist = data.object;
        },
        error: error => {
          //  this.alertService.error(error);


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


          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });

    this.listTypeService.getById("DPART")
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.departmentList = data;
        },
        error: error => {

          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });

    this.listTypeService.getById("SUPPL")
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.brandlist = data;
        },
        error: error => {

          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });

    this.listTypeService.getById("CONTY")
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.listTypeItems = data;
        },
        error: error => {

          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });


    this.ServiceReportId = this.route.snapshot.paramMap.get('id');
    if (this.ServiceReportId != null) {
      this.hasAddAccess = false;
      if (this.user.username == "admin") {
        this.hasAddAccess = true;
      }
      this.ServiceReportService.getById(this.ServiceReportId)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.ServiceReportform.patchValue(data.object);
            this.ServiceReportform.patchValue({"workCompletedstr": data.object.workCompleted == true ? "0" : "1"});
            this.ServiceReportform.patchValue({"workfinishedstr": data.object.workfinished == true ? "0" : "1"});
            this.ServiceReportform.patchValue({"interruptedstr": data.object.interrupted == true ? "0" : "1"});
            this.ServiceReportform.controls['instrument'].setValue({serialnos: data.object.instrument});
            this.workdonelist = data.object.lstWorkdone;
            this.workTime = data.object.lstWorktime;

            let datepipe = new DatePipe("en-US");
            this.workTime.forEach((value, index) => {
              value.worktimedate = datepipe.transform(value.worktimedate, "dd/MM/YYYY")
            })

            this.spconsumedlist = data.object.lstSPConsumed;
            this.sparePartRecomanded = data.object.lstSPRecommend;
            this.custsign = data.object.custsignature;
            this.engsign = data.object.engsignature;

            this.serviceRequestService.getById(data.object.serviceRequestId)
              .pipe(first())
              .subscribe({
                next: (data: any) => {

                  this.CustSPInventoryService.getAll(this.user.contactId, data.object.custid)
                    .pipe(first())
                    .subscribe({
                      next: (data: any) => {
                        this.sparepartlist = data.object;
                      },
                      error: error => {
                        //  this.alertService.error(error);

                        this.notificationService.showError(error, "Error");
                        this.loading = false;
                      }
                    });

                  this.servicerequest = data.object;

                  this.customerService.getallcontact(data.object.custid)
                    .pipe(first())
                    .subscribe({
                      next: (data: any) => {
                        this.allcontactlist = data.object;
                        console.log(data.object)
                      },
                      error: error => {

                        this.notificationService.showError(error, "Error");
                        this.loading = false;
                      }
                    });
                },
                error: error => {

                  this.notificationService.showError(error, "Error");
                  this.loading = false;
                }
              });
          },
          error: error => {
            // this.alertService.error(error);
            this.notificationService.showSuccess(error, "Error");
            this.loading = false;
          }
        });

      //
      // this.fileshareService.getById(this.ServiceReportId)
      //   .pipe(first())
      //   .subscribe({
      //     next: (data: any) => {
      // this.PdffileData = data.object;
      // this.getPdffile(data.object.filePath);
      //     },
      //     error: error => {

      //       this.notificationService.showError(error, "Error");
      //       this.loading = false;
      //     }
      //   });


      this.fileshareService.list(this.ServiceReportId)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.PdffileData = data.object;
          },
          error: (err: any) => {

            this.notificationService.showError(err, "Error");
          },
        });

    }

    this.columnworkdefs = this.createworkdoneColumnDefs();
    this.columnDefs = this.createColumnDefs();
    this.spcolumnDefs = this.createColumnspDefs();
    this.spRecomandDefs = this.createColumnspreDefs();
    this.pdfcolumnDefs = this.pdfcreateColumnDefs();
  }

  // convenience getter for easy access to form fields
  get f() { return this.ServiceReportform.controls; }
  get a() { return this.ServiceReportform.controls.engineer; }

  onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.ServiceReportform.invalid) {
      return;
    }
    this.isSave = true;
    this.loading = true;
    this.ServiceReport = this.ServiceReportform.value;
    let nextvisitscheduled = new Date(this.ServiceReport.nextvisitscheduled);
    this.ServiceReport.nextvisitscheduled = this.datepipe.transform(nextvisitscheduled, "MM/dd/yyyy")
    this.ServiceReport.workCompleted = this.ServiceReport.workCompletedstr == "0" ? true : false;
    this.ServiceReport.workfinished = this.ServiceReport.workfinishedstr == "0" ? true : false;
    this.ServiceReport.interrupted = this.ServiceReport.interruptedstr == "0" ? true : false;
    if (this.signaturePad.toDataURL() == "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAABkCAYAAABwx8J9AAAAAXNSR0IArs4c6QAABEZJREFUeF7t1QENAAAIwzDwbxodLMXBe5LvOAIECBAgQOC9wL5PIAABAgQIECAwBt0TECBAgACBgIBBD5QoAgECBAgQMOh+gAABAgQIBAQMeqBEEQgQIECAgEH3AwQIECBAICBg0AMlikCAAAECBAy6HyBAgAABAgEBgx4oUQQCBAgQIGDQ/QABAgQIEAgIGPRAiSIQIECAAAGD7gcIECBAgEBAwKAHShSBAAECBAgYdD9AgAABAgQCAgY9UKIIBAgQIEDAoPsBAgQIECAQEDDogRJFIECAAAECBt0PECBAgACBgIBBD5QoAgECBAgQMOh+gAABAgQIBAQMeqBEEQgQIECAgEH3AwQIECBAICBg0AMlikCAAAECBAy6HyBAgAABAgEBgx4oUQQCBAgQIGDQ/QABAgQIEAgIGPRAiSIQIECAAAGD7gcIECBAgEBAwKAHShSBAAECBAgYdD9AgAABAgQCAgY9UKIIBAgQIEDAoPsBAgQIECAQEDDogRJFIECAAAECBt0PECBAgACBgIBBD5QoAgECBAgQMOh+gAABAgQIBAQMeqBEEQgQIECAgEH3AwQIECBAICBg0AMlikCAAAECBAy6HyBAgAABAgEBgx4oUQQCBAgQIGDQ/QABAgQIEAgIGPRAiSIQIECAAAGD7gcIECBAgEBAwKAHShSBAAECBAgYdD9AgAABAgQCAgY9UKIIBAgQIEDAoPsBAgQIECAQEDDogRJFIECAAAECBt0PECBAgACBgIBBD5QoAgECBAgQMOh+gAABAgQIBAQMeqBEEQgQIECAgEH3AwQIECBAICBg0AMlikCAAAECBAy6HyBAgAABAgEBgx4oUQQCBAgQIGDQ/QABAgQIEAgIGPRAiSIQIECAAAGD7gcIECBAgEBAwKAHShSBAAECBAgYdD9AgAABAgQCAgY9UKIIBAgQIEDAoPsBAgQIECAQEDDogRJFIECAAAECBt0PECBAgACBgIBBD5QoAgECBAgQMOh+gAABAgQIBAQMeqBEEQgQIECAgEH3AwQIECBAICBg0AMlikCAAAECBAy6HyBAgAABAgEBgx4oUQQCBAgQIGDQ/QABAgQIEAgIGPRAiSIQIECAAAGD7gcIECBAgEBAwKAHShSBAAECBAgYdD9AgAABAgQCAgY9UKIIBAgQIEDAoPsBAgQIECAQEDDogRJFIECAAAECBt0PECBAgACBgIBBD5QoAgECBAgQMOh+gAABAgQIBAQMeqBEEQgQIECAgEH3AwQIECBAICBg0AMlikCAAAECBAy6HyBAgAABAgEBgx4oUQQCBAgQIGDQ/QABAgQIEAgIGPRAiSIQIECAAAGD7gcIECBAgEBAwKAHShSBAAECBAgYdD9AgAABAgQCAgY9UKIIBAgQIEDAoPsBAgQIECAQEDDogRJFIECAAAECBt0PECBAgACBgIBBD5QoAgECBAgQOEexAGVgyV5WAAAAAElFTkSuQmCC") {
      if (this.custsign != null) {
        this.ServiceReport.custsignature = this.custsign;
      }
    } else {
      this.ServiceReport.custsignature = this.signaturePad.toDataURL();
    }

    if (this.signaturePadcust.toDataURL() == "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAABkCAYAAABwx8J9AAAAAXNSR0IArs4c6QAABEZJREFUeF7t1QENAAAIwzDwbxodLMXBe5LvOAIECBAgQOC9wL5PIAABAgQIECAwBt0TECBAgACBgIBBD5QoAgECBAgQMOh+gAABAgQIBAQMeqBEEQgQIECAgEH3AwQIECBAICBg0AMlikCAAAECBAy6HyBAgAABAgEBgx4oUQQCBAgQIGDQ/QABAgQIEAgIGPRAiSIQIECAAAGD7gcIECBAgEBAwKAHShSBAAECBAgYdD9AgAABAgQCAgY9UKIIBAgQIEDAoPsBAgQIECAQEDDogRJFIECAAAECBt0PECBAgACBgIBBD5QoAgECBAgQMOh+gAABAgQIBAQMeqBEEQgQIECAgEH3AwQIECBAICBg0AMlikCAAAECBAy6HyBAgAABAgEBgx4oUQQCBAgQIGDQ/QABAgQIEAgIGPRAiSIQIECAAAGD7gcIECBAgEBAwKAHShSBAAECBAgYdD9AgAABAgQCAgY9UKIIBAgQIEDAoPsBAgQIECAQEDDogRJFIECAAAECBt0PECBAgACBgIBBD5QoAgECBAgQMOh+gAABAgQIBAQMeqBEEQgQIECAgEH3AwQIECBAICBg0AMlikCAAAECBAy6HyBAgAABAgEBgx4oUQQCBAgQIGDQ/QABAgQIEAgIGPRAiSIQIECAAAGD7gcIECBAgEBAwKAHShSBAAECBAgYdD9AgAABAgQCAgY9UKIIBAgQIEDAoPsBAgQIECAQEDDogRJFIECAAAECBt0PECBAgACBgIBBD5QoAgECBAgQMOh+gAABAgQIBAQMeqBEEQgQIECAgEH3AwQIECBAICBg0AMlikCAAAECBAy6HyBAgAABAgEBgx4oUQQCBAgQIGDQ/QABAgQIEAgIGPRAiSIQIECAAAGD7gcIECBAgEBAwKAHShSBAAECBAgYdD9AgAABAgQCAgY9UKIIBAgQIEDAoPsBAgQIECAQEDDogRJFIECAAAECBt0PECBAgACBgIBBD5QoAgECBAgQMOh+gAABAgQIBAQMeqBEEQgQIECAgEH3AwQIECBAICBg0AMlikCAAAECBAy6HyBAgAABAgEBgx4oUQQCBAgQIGDQ/QABAgQIEAgIGPRAiSIQIECAAAGD7gcIECBAgEBAwKAHShSBAAECBAgYdD9AgAABAgQCAgY9UKIIBAgQIEDAoPsBAgQIECAQEDDogRJFIECAAAECBt0PECBAgACBgIBBD5QoAgECBAgQMOh+gAABAgQIBAQMeqBEEQgQIECAgEH3AwQIECBAICBg0AMlikCAAAECBAy6HyBAgAABAgEBgx4oUQQCBAgQIGDQ/QABAgQIEAgIGPRAiSIQIECAAAGD7gcIECBAgEBAwKAHShSBAAECBAgYdD9AgAABAgQCAgY9UKIIBAgQIEDAoPsBAgQIECAQEDDogRJFIECAAAECBt0PECBAgACBgIBBD5QoAgECBAgQOEexAGVgyV5WAAAAAElFTkSuQmCC") {
      if (this.engsign != null) {
        this.ServiceReport.engsignature = this.engsign;
      }
    }
    else {
      this.ServiceReport.engsignature = this.signaturePadcust.toDataURL();
    }

    this.ServiceReport.instrument = this.ServiceReport.instrument.serialnos
    if (this.ServiceReportId == null) {

      this.ServiceReportService.save(this.ServiceReport)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.result) {
              this.saveFileShare(data.object.id);
              if (this.file != null) {
                this.uploadPdfFile(this.file, data.object.id);
              }
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.router.navigate(["ServiceReportlist"]);
            }
            else {


              this.notificationService.showError(data.resultMessage, "Error");
            }
            this.loading = false;

          },
          error: error => {
            // this.alertService.error(error);

            this.notificationService.showError(error, "Error");
            this.loading = false;
          }
        });
    }
    else {
      this.ServiceReport = this.ServiceReportform.value;
      this.ServiceReport.id = this.ServiceReportId;
      this.ServiceReportService.update(this.ServiceReportId, this.ServiceReport)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.result) {
              this.saveFileShare(this.ServiceReportId);

              if (this.file != null) {
                this.uploadPdfFile(this.file, this.ServiceReportId)
              }

              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.router.navigate(["servicereportlist"]);
            }
            else {


              this.notificationService.showError(data.resultMessage, "Error");
            }
            this.loading = false;

          },
          error: error => {
          //  this.alertService.error(error);
            this.notificationService.showError(error, "Error");
            this.loading = false;
          }
        });
    }
  }

  drawComplete() {
  }

  drawComplete2() {
  }

  drawStart() {
  }

  clearSignature() {
    this.signaturePad.clear();
  }

  savePad() {
    const base64Data = this.signaturePad.toDataURL();
    this.signatureImg = base64Data;
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
    if (e.event.target !== undefined) {
      let data = e.data;
      let actionType = e.event.target.getAttribute("data-action-type");
      //this.serviceRequestId = this.route.snapshot.paramMap.get('id');
      switch (actionType) {
        case "remove":
          if (confirm("Are you sure, you want to remove the engineer comment?") == true) {
            //this.instrumentService.deleteConfig(data.configTypeid, data.configValueid)
            this.workdoneservice.delete(data.id)
              .pipe(first())
              .subscribe({
                next: (d: any) => {
                  if (d.result) {
                    this.notificationService.showSuccess(d.resultMessage, "Success");
                  }
                  else {


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
          this.open(this.ServiceReportId, data.id);
      }
    }
  }

  public onRowClickedPre(e) {
    if (e.event.target !== undefined) {
      let data = e.data;
      let actionType = e.event.target.getAttribute("data-action-type");
      //this.serviceRequestId = this.route.snapshot.paramMap.get('id');
      switch (actionType) {
        case "remove":
          if (confirm("Are you sure, you want to remove the sparepart?") == true) {
            //this.instrumentService.deleteConfig(data.configTypeid, data.configValueid)
            this.srrecomndservice.delete(data.id)
              .pipe(first())
              .subscribe({
                next: (d: any) => {
                  if (d.result) {
                    this.notificationService.showSuccess(d.resultMessage, "Success");
                    this.notificationService.filter("itemadded");
                  }
                  else {


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
          let sprec: sparePartRecomanded;
          sprec = data;
          this.srrecomndservice.update(sprec.id,sprec)
            .pipe(first())
            .subscribe({
              next: (data: any) => {
                if (data.result) {
                  this.notificationService.showSuccess(data.resultMessage, "Success");
                  this.notificationService.filter("itemadded");
                  //this.configList = data.object;
                  // this.listvalue.get("configValue").setValue("");
                }
                else {


                  this.notificationService.showError(data.resultMessage, "Error");
                }
                this.loading = false;
              },
              error: error => {

                this.notificationService.showError(error, "Error");
                this.loading = false;
              }
            });
          //this.open(this.ServiceReportId, data.id);
      }
    }
  }

  public onRowClickedCon(e) {
    if (e.event.target !== undefined) {
      let data = e.data;
      let actionType = e.event.target.getAttribute("data-action-type");
      //this.serviceRequestId = this.route.snapshot.paramMap.get('id');
      switch (actionType) {
        case "remove":
          if (confirm("Are you sure, you want to remove the sparepart?") == true) {
            //this.instrumentService.deleteConfig(data.configTypeid, data.configValueid)
            this.srConsumedservice.delete(data.id)
              .pipe(first())
              .subscribe({
                next: (d: any) => {
                  if (d.result) {
                    this.notificationService.showSuccess(d.resultMessage, "Success");
                    this.notificationService.filter("itemadded");
                  }
                  else {


                    this.notificationService.showError(d.resultMessage, "Error");
                  }
                },
                // error: error => {

                //   this.notificationService.showError(error, "Error");
                //   this.loading = false;
                // }
              });
          }
        case "edit":
          let sprec: sparePartsConsume;
          sprec = data;
          if (Number(sprec.qtyconsumed) <= Number(sprec.qtyAvailable)) {
            this.srConsumedservice.update(sprec.id, sprec)
              .pipe(first())
              .subscribe({
                next: (data: any) => {
                  if (data.result) {
                    let newQtyAvailable: number = Number(sprec.qtyAvailable) - Number(sprec.qtyconsumed);
                    this.CustSPInventoryService.updateqty(sprec.customerSPInventoryId, newQtyAvailable.toString()).pipe(first()).subscribe()
                    this.notificationService.filter("itemadded");
                    //this.configList = data.object;
                    // this.listvalue.get("configValue").setValue("");
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
          } else {
            this.notificationService.showError("The Required Qty. is not Available. Please Recommend the Spare"+
              " Parts", "Error");
          }

        //this.open(this.ServiceReportId, data.id);
      }
    }
  }

  public onworktimeRowClicked(e) {
    if (e.event.target !== undefined) {
      let data = e.data;
      let actionType = e.event.target.getAttribute("data-action-type");
      //this.serviceRequestId = this.route.snapshot.paramMap.get('id');
      switch (actionType) {
        case "remove":
          if (confirm("Are you sure, you want to remove the worktime?") == true) {
            //this.instrumentService.deleteConfig(data.configTypeid, data.configValueid)
            this.worktimeservice.delete(data.id)
              .pipe(first())
              .subscribe({
                next: (d: any) => {
                  if (d.result) {
                    this.notificationService.showSuccess(d.resultMessage, "Success");
                    this.notificationService.filter("itemadded");
                  }
                  else {


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
          this.opentime(this.ServiceReportId, data.id);
      }
    }
  }

  onCellValueChanged(event) {
    var data = event.data;
    event.data.modified = true;
    //if (this.selectedConfigType.filter(x => x.id == data.configValueid && x.listTypeItemId == data.configTypeid
    //  && x.sparePartId == data.id).length > 0) {
    //  var d = this.selectedConfigType.filter(x => x.id == data.configValueid && x.listTypeItemId == data.configTypeid
    //    && x.sparePartId == data.id);
    //  d[0].insqty = event.newValue;
    //}
  }

  onCellValueChangedPre(event) {
    var data = event.data;
    event.data.modified = true;
    //if (this.selectedConfigType.filter(x => x.id == data.configValueid && x.listTypeItemId == data.configTypeid
    //  && x.sparePartId == data.id).length > 0) {
    //  var d = this.selectedConfigType.filter(x => x.id == data.configValueid && x.listTypeItemId == data.configTypeid
    //    && x.sparePartId == data.id);
    //  d[0].insqty = event.newValue;
    //}
  }

  //}
  updateSpareParts(params) {
  }

  addPartrecmm() {
    let v = this.ServiceReportform.get('recondad').value;
    this.srRecomndModel = new sparePartRecomanded();
    this.srRecomndModel.partno = v.partNo;
    this.srRecomndModel.hsccode = v.hsCode;
    this.srRecomndModel.servicereportid = this.ServiceReportId;
    this.srrecomndservice.save(this.srRecomndModel)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          if (data.result) {
            this.notificationService.showSuccess(data.resultMessage, "Success");
            this.notificationService.filter("itemadded");
            //this.configList = data.object;
            // this.listvalue.get("configValue").setValue("");
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

  //private createColumnspDefs() {
  //  return [
  //    {
  //      headerName: 'sparePartName',
  //      field: 'partNo',
  //      filter: false,
  //      enableSorting: false,
  //      editable: false,
  //      sortable: false,
  //      tooltipField: 'sparePartName',
  //    },
  //    {
  //      headerName: 'inventory',
  //      field: 'inventory',
  //      filter: false,
  //      enableSorting: false,
  //      editable: false,
  //      sortable: false
  //    }
  //  ]

  uploadPdfFile(files, id) {
    // let file = event.target.files;
    // if (event.target.files && event.target.files[0]) {
    //   //  this.uploadService.upload(file).subscribe(event => {  });;
    //   this.uploadService.uploadPdf(file)
    //     .pipe(first())
    //     .subscribe({
    //       next: (data: any) => {
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
    this.fileshareService.upload(formData, id, "SRREP").subscribe((event) => {
      if (event.type === HttpEventType.UploadProgress)
        this.fileUploadProgress = Math.round((100 * event.loaded) / event.total);
      else if (event.type === HttpEventType.Response) {
        this.onUploadFinished.emit(event.body);
      }
    });
  }

  private createworkdoneColumnDefs() {
    return [
      {
        headerName: 'Action',
        field: 'id',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,

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
        headerName: 'Work Done',
        field: 'workdone',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        tooltipField: 'Work Done',
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
        sortable: false,

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
        headerName: 'Work Time Date',
        field: 'worktimedate',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        tooltipField: 'Work Time Date',
      },
      {
        headerName: 'Start Time',
        field: 'starttime',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false
      },
      {
        headerName: 'End Time',
        field: 'endtime',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false
      },
      {
        headerName: 'Per Day Hrs',
        field: 'perdayhrs',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false
      }
    ]
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }

  onConfigChange(param: string) {
    this.configService.getById(param)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.configValueList = data.object;
        },
        error: error => {

          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });
  }

  open(param: string, param1: string) {
    const initialState = {
      itemId: param,
      id: param1
    };
    this.bsModalRef = this.modalService.show(WorkdoneContentComponent, {initialState});
  }

  openPrev(param: string) {

    const initialState = {
      id: param
    };

    this.bsModalRef = this.modalService.show(PreventivemaintenancetableComponent, {initialState});
  }

  //opentime
  opentime(param: string, param1: string) {
    const initialState = {
      itemId: param,
      id: param1
    };
    this.bsModalRef = this.modalService.show(WorkTimeContentComponent, {initialState});
  }

  //addPartcons
  addPartcons() {
    let v = this.ServiceReportform.get('consumed').value;
    this.srConsumedModel = new sparePartsConsume();
    this.srConsumedModel.partno = v.partNo;
    this.srConsumedModel.hsccode = v.hscCode;
    this.srConsumedModel.servicereportid = this.ServiceReportId;
    this.srConsumedModel.qtyAvailable = v.qtyAvailable;
    this.srConsumedModel.customerSPInventoryId = v.id;
    this.srConsumedservice.save(this.srConsumedModel)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          if (data.result) {
            this.notificationService.filter("itemadded");
            //this.configList = data.object;
            // this.listvalue.get("configValue").setValue("");
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

  private createColumnspDefs() {
    return [
      {
        headerName: 'Action',
        field: 'id',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,

        cellRenderer: (params) => {
          if (this.hasDeleteAccess && !this.hasUpdateAccess) {
            return `<button class="btn btn-link" type="button" (click)="delete(params)"><i class="fas fa-trash-alt" data-action-type="remove" title="Delete"></i></button>`
          } else if (this.hasDeleteAccess && this.hasUpdateAccess) {
            return `<button class="btn btn-link" type="button" (click)="delete(params)"><i class="fas fa-trash-alt" data-action-type="remove" title="Delete"></i></button>
          <button type="button" class="btn btn-link" data-action-type="edit" ><i class="fas fas fa-save" title="Edit Value" data-action-type="edit"></i></button>`
          } else if (!this.hasDeleteAccess && this.hasUpdateAccess) {
            return `<button type="button" class="btn btn-link" data-action-type="edit" ><i class="fas fas fa-save" title="Edit Value" data-action-type="edit"></i></button>`
          }
        }
      },
      {
        headerName: 'Part No',
        field: 'partno',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        tooltipField: 'partno',
      },
      {
        headerName: 'HSC Code',
        field: 'hsccode',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false
      },
      {
        headerName: 'Qty Available',
        field: 'qtyAvailable',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false
      },
      {
        headerName: 'Qty Required',
        field: 'qtyconsumed',
        filter: false,
        enableSorting: false,
        editable: true,
        sortable: false
      },
    ]
  }

  private createColumnspreDefs() {
    return [
      {
        headerName: 'Action',
        field: 'id',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        cellRenderer: (params) => {
          if (this.hasDeleteAccess && !this.hasUpdateAccess) {
            return `<button class="btn btn-link" type="button" (click)="delete(params)"><i class="fas fa-trash-alt" data-action-type="remove" title="Delete"></i></button>`
          } else if (this.hasDeleteAccess && this.hasUpdateAccess) {
            return `<button class="btn btn-link" type="button" (click)="delete(params)"><i class="fas fa-trash-alt" data-action-type="remove" title="Delete"></i></button>
          <button type="button" class="btn btn-link" data-action-type="edit" ><i class="fas fas fa-save" title="Edit Value" data-action-type="edit"></i></button>`
          } else if (!this.hasDeleteAccess && this.hasUpdateAccess) {
            return `<button type="button" class="btn btn-link" data-action-type="edit" ><i class="fas fas fa-save" title="Edit Value" data-action-type="edit"></i></button>`
          }
        }
      },
      {
        headerName: 'PartNo',
        field: 'partno',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        tooltipField: 'partno',
      },
      {
        headerName: 'Qty',
        field: 'qtyrecommended',
        filter: false,
        enableSorting: false,
        editable: true,
        sortable: false
      },
      {
        headerName: 'HS Code',
        field: 'hsccode',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false
      }
    ]
  }

  public onPdfRowClicked(e) {
    if (e.event.target !== undefined) {
      let data = e.data;
      let actionType = e.event.target.getAttribute("data-action-type");
      this.ServiceReportId = this.route.snapshot.paramMap.get('id');
      switch (actionType) {
        case "remove":
          if (confirm("Are you sure, you want to remove the config type?") == true) {
            //this.instrumentService.deleteConfig(data.configTypeid, data.configValueid)
            this.fileshareService.delete(data.id)
              .pipe(first())
              .subscribe({
                next: (d: any) => {
                  if (d.result) {
                    this.notificationService.showSuccess(d.resultMessage, "Success");
                    this.fileshareService.getById(this.ServiceReportId)
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
                  else {

                    this.notificationService.showError(d.resultMessage, "Error");
                  }
                },
                error: error => {

                  this.notificationService.showError(error, "Error");
                  this.loading = false;
                }
              });
          }
          break;
        case "download":
          this.getPdffile(data.filePath);
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
            // this.alertService.success('File Upload Successfully.');
            // this.imagePath = data.path;

          },
          error: error => {

            this.notificationService.showError(error, "Error");
            // this.imageUrl = this.noimageData;
          }
        });
    }
  }

  download(fileData: any) {
    const byteArray = new Uint8Array(atob(fileData).split('').map(char => char.charCodeAt(0)));
    let b = new Blob([byteArray], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(b);
    window.open(url);
    // i.e. display the PDF content via iframe
    // document.querySelector("iframe").src = url;
  }

  pdfonGridReady(params): void {
    this.pdfapi = params.api;
    this.pdfcolumnApi = params.columnApi;
    this.pdfapi.sizeColumnsToFit();
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
          id: this.ServiceReportId
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
                //this.router.navigate(["ServiceReportlist"]);
              }
              else {

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

  GeneratePDF() {
    this.ServiceReportService.getView(this.ServiceReportId)
      .pipe(first())
      .subscribe({
          next: (data: any) => {
            console.log(data)
            data = data.object
            let totalHrs = 0;

            {
              data.analyticalassit == true ? data.analyticalassit = this.checkedImg : data.analyticalassit = this.unCheckedImg;
              data.installation == true ? data.installation = this.checkedImg : data.installation = this.unCheckedImg;
              data.rework == true ? data.rework = this.checkedImg : data.rework = this.unCheckedImg;
              data.prevmaintenance == true ? data.prevmaintenance = this.checkedImg : data.prevmaintenance = this.unCheckedImg;
              data.corrmaintenance == true ? data.corrmaintenance = this.checkedImg : data.corrmaintenance = this.unCheckedImg;
              data.workfinished == true ? data.workfinished = this.checkedImg : data.workfinished = this.unCheckedImg;
              data.attachment == true ? data.attachment = this.checkedImg : data.attachment = this.unCheckedImg;
              data.interrupted == true ? data.interrupted = this.checkedImg : data.interrupted = this.unCheckedImg;
              data.isworkdone == true ? data.isworkdone = this.checkedImg : data.isworkdone = this.unCheckedImg;
              data.workTime.forEach(x => {
                x.worktimedate = this.datepipe.transform(x.worktimedate, "dd-MM-yy");
                totalHrs = totalHrs + Number(x.perdayhrs)
              })
              data.nextvisitscheduled = this.datepipe.transform(data.nextvisitscheduled, "dd-MMM-yy")
            }

            let docDefinition = {
              content: [
                {
                  columns: [
                    {
                      image: "data:image/png;base64,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",
                      width: 100
                    },
                    {
                      text: 'Service Report',
                      fontSize: 16,
                      alignment: 'center',
                      color: '#fff'
                    },
                    {
                      image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAaQAAADcCAYAAAA/StUtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAKp3SURBVHhe7J0FYFRH14bf9bi7k2AJ7g7FKdYWCi11++puX93dv/71lrpTpRR3dwkSJCHuruu7/zmzNyVAbJcAgd6HbrM79+7euXNnzjtnVGEnICMjIyMjc5ZRSn9lZGRkZGTOKrIgycjIyMi0C2RBkpGRkZFpF8iCJCMjIyPTLpAFSUZGRkamXSALkoyMjIxMu0AWJBkZGRmZdoEsSDIyMjIy7QJZkGRkZGRk2gWyIMnIyMjItAtkQZKRkZGRaRfIgiQjIyMj0y6QBUlGRkZGpl0gC5KMjIyMTLtAFiQZGRkZmXaBLEgyMjIyMu0CeYM+GZkGVNVW4VB2GkpqK1BaXYGd+WnYUZqPCkMNaox61NLLaLHAbLPQ2XYoFUpo1Rq4qbTw0XnAz9MLfu5emBTdFVG+wfD38kHH8DgK94VWo4VKqYSKvqNQKBwXlJGR+QdZkGTaLZwzOXuKLMovyYifmGXrjbv4P/2PP5+qwa+pq0FuaQFWHNqJ7w9sxOHiHHFdq80Ki80Gq93muGBrSo8UlVDPAIzt1BN3DZmC2OBo6Eig1EoV1CqV4wQZmX85siDJtBtsNkdWNBrMMBpNMBhMKC2tQmlJFaqryTupozC9AWazFVarVYiOkjwOjUYFjVYNN50G7u5ahIYHIsDfC+6ebtBRGB/X0XHVKRr+AhKovVmH8PfhnVicsQ/l5E3VmQyw1atSq8RJIU7TkBD1jYjHVUlDMLBjT4T6h8LbzR3uGp3jPBmZfyGyIMmcVTj78ctktMBktsBQZ4RC6RAaDmdhqqrU4+ChHOzam4FDqbkkUtWwWmzifKPRTL/SoCu03muRvCQ3rQpJSdEYO7IL+vdPhJ+/NwmXWgjVqQrUupTdeG/TAuzMPwy92YhqowEW9pw4Aq0VJ44v/VWRGF/eexQeGnUpgn0D4aVxIyHVOM6TkfmXIAuSzDlJUWE59uw5io1bjmDPvgyUV9SSF1VHOZrESWTpY9lawWGkVPzXx1uLIf3jMXRoN3TqHAkfH0/hTanVrouTzWzCrqP78NnuVVifeQj51aUkUCaKgZ0KmHRSa1ApYKO49w2Mwc29xmBIr0EI9Q6Ar7undIKMzPmNLEgy5wXLlu/GvN82oqioEmXl1ajTm9jxEF7W8QiXhFVKDEgIDPDEf64bhwEDOpE4ucHX18txmouY9Aa8se5XzD+wGeV1VcivKodFCJMTxYziZlORiFosuLbvWNw54iJE+YXAz8NbOkFG5vxEFiSZ1mG3wlpVDXtNDVldE2xGI0BeAKxm8hDMUFI2ssPKfojDN2GvhIyqQqkB1BoodTpA63ipAvyh0LmJn21rykqq8Nei7Vizfh8yM4tRWaWnUBYhbko7GcfgBxVF1YZxFyRi4oRBiIsPRURYAFQsCqfAwYwUvL7pb2zPPoTU0nzYlZQ6nDjOFDk1paHVjmv7jMGcvmPQNTwOQV6+0kEZmfMLWZBkToJHkikNdbBVVcJWUQNbdQVspQUwJCfDsi8F1rw8eNM5nHU499RnIccf+h8ZeckPEe+V9DLTQYOXJ1ThUXAbNQyauA5Q+QUBbu5QBvhB6elFIuXO32gjbPjl141YvjIZOXllKCisEOJjF308jeFo0iNfBpERvrjpmrHo0aMDoqMCoTqF5jwmPT8Dz676Cfvz0pFalg8jX8XaVDwageNN2mijv1d1G46bBk9GEgmTj/upeXMyMu0NWZBkBHazEZb0dNiKilCTnwN1QRbM+/fDuj8VvmSQrWRALaQw4kU5hvs6nEVFBlW8bDaq+CuFYbZ6+0I9oCe0CR2hju1M3lMQ1PEdoHDzkL516mzZchALl+zClu2HUVJKHp6Ie9Pxrxem+NhgzLhoEPr2TUDH+HAoT9FjyinKxodbFmFN2l7syk+XPCaKhxNJadco4WZX4daBkzClxxAMjE2CRqWWjsrInNvIgvQvRTx1iwl2gwE2ox72imIYliyFaX+KMJJ2HuXGZpk8IVIjEiwTbOUVsFZUgRvbONtY6TfoiDP29DjYg2LvSUW/pea/ZKBryVPymHERtIm9oYoKhy00Alpu6msDFi3biZUr9uDIkTzkFlRQCHt4TcfeIUwqhId64eo5o9C3T0ckJIQJT+tUyC3OxYtrfkFyTip2FZAw0e8ppCHvrYLOt6uV8FJo8MT4K3Bxl0GICY2UDsrInLvIgvQvxcZNRsY62CorRJOcglcQCAmFkjwWKLiJyg4LHVfWVMGu18NWVw3L0UzyonJgKy0mYSqHNScLyCuAlr5rIYPK4iQNenYZ9qBYfqwkTrZeSbD0HICAbt2h7tEDyjbq1N+0IQWLV+7GqjV7oddz0yOJbnOx5v4wOtytSyQmTuyDYUMTERsTIh10nSO56fho+xKsT92D5LJcIUpOCROnEUXtwvBumDVoPC7tO5K8JXmouMy5iyxI/1ZsJB0kJC6jr4Zx1w6Ydu4hz6kUltIiEqhcqIpKxc+aKFe50qxXD/sgGvq/lgSqVqOGx8XToOnVnzynrlAFhTlOOkV+/Hkd9iSnY8/edBSXkJdodywH1CQs1HR4YP8EXHrxYPTuFY+AwFMXya1pyZi7Yzm2p6cgpapQDGJwuLCtw65WwW6x4JELZuHqvmMQHxojHZGRObeQBUmmDSBvqiALlkOHYdp/EJYjB2HcvQdelLVMVOPnYc9OdOGfBMumjsTJqNNAN3wINEm9yGPqBV3XJMcJp4DNYsVK8pRWrd2HxUt3kjOkpttp3s/jc3RqBUaP6kGv7hgxohs0JJqnyrqD2zF350rM37sBBqU08KG1pZMUnIVpYlQipvYeiRsGTCL9PIUKh4zMWUD1DCG9l5FxEQWUXn5QxyVAN2AQtD17QhUeCVtYKKxaFawlpfCgc1ztb+LvsO+isFqhziDh27oVehI9c3U1VBoNeUzB4jxX4KbK+PgwDB/SFe7uJHskorl5ZRTuaLZsFBIsC3kxaRkl2Lb9MMrKquHr7Y6QED/pBNeIDYrAhE59EODuBRvda1oZeUssKq2sM3Jz35HqYiw6sE14wEmBEfCQJ9XKnEPIgnSuYTHCnHEEpu27YNy8EaZtm6GKjoTSs/1MmuR+KG1SN2iHDIG2ayLUHTvD6u0BS24uvMjQcqe8Kx5TvTDxdzWlZTBv2wpz6mFYuC+LPBR1WASf5hK8UkOf3vHo0S0Gfn6eyMwqgsHAV6x/NQIJk8Foxb4DOTh0MBt5JGSxMcHw8nJ9+LpGrcGAuEQMiuoMrV2FNPI8a9W2Vvct8TwnSl6sy9iPrLICRHr6ICowXDoqI9O+kQWpvWMlATp6EIZVq2FcuQL6FUthWLoI+sWLYSvNhzKhM3Rdu0LRDmvC5DdB5R8EbZeu0PTuQx5UPOyxUcKzUVeUQ82d8q2zsyfBwxDY8qpLS4G9+2A8dBCWwgLy1DzIY3J9wIEviVG/vgmIjQ6Ch5sa6Rl5sJIwOJrxGsMhWCWlddi9NxMZGYViSPupzl/y9/LFiLgkdAmKFAu4HirJFd5Sa5ciYlHaX5aP5KzDsNKHfiRw3KwnI9OekfuQ2imGzZvI+9kCW0khLAV5sKRnwc1kIttnh5qemKFTJ/g+9CA0XXtI3zhXsMF0YD/0qakwL/gLmsOHxD0Z6Yj1FLKijoyumec3de0CTZdEuE2dRt5ZN+moa9RU67FxcwoWLt6JDVvSSJPq/bOmUShUCArwRK+ecbjishHo2TNeOuI6GSV5+GnHKny85W/km2uhNJMctzKpbCT6Pho3XNdvHF6afD1UGq10REam/SELUrvCSh7Qchi3boV5bzIUOTliGDQbaq7l8qg1N/qrvGQaPCbPgKZzF+l75ybmI1R7zzwKQ/JO8vqWw01vgIHu0dUMKUbmUfqwF2Hv1BHqfgPhMW0KNNEdHCe4SG5uKZav2oMFf29DRlYF6SevMN5cLHnVBxU6xgdj6NCOuOqyMfAP8JGOuYbZbMKa1N14f/XvWH40GTa1ktSmlSlFacLF/Oo+o/HCxKsR7H/qQ9ZlZE4HsiC1A/gB1P31O0zr1sJMnoOipIRsiAKWE4wzT0hVzp4Br2tugsrH3xF4HmDlBUhTj8KcvBW1X3wNHd20ie7/VD0mo0IJbWcSpi5J8P7PzVD6uD7ogPdqSk3Nw29/bsa83zdCqVRLHlPTsCgplVb07B6PaZP7Y/q0QdIR18kqzMVb63/HZ9uXiAm1aO0SRHQqD+AYHdMNtw6/CFO6D5YOyMi0H+Q+pLOM3axH7bdfwvjtt0BampiEyv0joo+kAToyJmoSI+9rzy8xYpQ6d6jDI6BJ7AYteTW2uHCYDh2Bh9ksBjG4Aqcfr7OgLC2D8WAKTMnJlNhGqDt0gMKFyaNcQQgM9EGP7rFI6hqJyopq5OVX8gE62pRw8koQChQUVWHv3gwcOJiDmMhABAa57i35evmgX2wX9AuOw57coygz13GtUjraEnYcrSzCgbyj6OwbjLiQKClcRqZ9IAvSWca8fTuqv/wC6vJyGMmwNFbf5cmhtqQk+N77IFS+gVLo+YdCrYGKhElLHo3boCGwhQXBumMnuNeDFxZ11l/i81mYWDKURcUw7N8Hw9q1MNTq4d7dtb43Nzct4uPD0b9fAvx8PbH/QBY5KSR9zYqCHXqDGekZhdi24whSDuWJYeauro3nqXVDYlgcJicOREpeJo5WFDp0sRVwc2apvhobMg/AZLViSNypz+WSkWkrZEE6y+iXLIJ9y2ZhHBqDx2kpeyfC9+EnoA77d6xXplCpoQri0XlJ0A4fAUQEwbT3ANzI6HMzpiuw0CsMRvKYSsWgCkvyHqhiwlxe9YGHdnftEoURQxOhrzMgNS1fNIk17S054O0w+NytO1LFKL4EEjeXIAXi/ZHGdumLELUbNucchsnO23+0DMew3KTHbvqOhj4M6nBqgz9kZNoKuQ/pLFP55ivA/Pmoa+QxsHFhQfL5+BPoEs+10XRth92ohzE7GyV//gLf+X+T4bWD92N1lfqBIsrgIDGp1u/xR6GO6SQddZ7Kylrs2HEQb737N4pK6mCz8aCHliBB8fVAly6RePCu6eiQ4PpcIb3RgG1p+zH7x1dRadFDyUsPtRIvN3fM7jYMr0y5EZ7taC6bzL8T2UM6i9gqS6BftgTIyjmpr4TFiJtXvF94Hrp+g0Qfxr8VbspTBwTCo3c/KIcNgcVqhPVwmlghvJVd+sfB5lqkb10d7OQx6detgyUjA5pe3UR/lrNwM15sbBjGj+sNd50S+w5kS2MNmhcGg9EiRvCtXrdfDJjo1T0O7h7Or2yuUasRGxSOaUmDUFFSiJTyghaaEI/BnvneoiwcyEnDwPB4+Hqf2moTMjKngixIZxHz0cPQL19KRrH8JMPKw7tVl0yD50WXQqlpm+0XznWUGhKmkDC49R8E3YihsBRkwz2/WKyV13qf4Bj8HSFOJEzW9KOoW7IE9spKqgD0F8edgSsMnp5u6EGiMnlCX9G3VFRcTUdajlldnQlp6YVYuGQnysuqMGigC8P56fpBXn6Y0G0QyipKsaMgvVXNd4zNbkNaRSEWH9mJCN9AdAmRF2eVOTvIgtSG5OaUYMHCDWSUEqSQ5jFu3AT90qU8pvg4s8VNSjY/P/je9zDUwaFSqEw9Cl6/LpiEaeRoGHp0Q01WBjzKyk8amdhaRNrz6uckTOaUAzDu3ApN51ioApxPe16CyNfXExPH90FokBYphwqg17fchMceDQvT/oM52LrtEMJDfBERGSQdbT289NDoLn0xKrIzFqfugt5iko40D1+/RF+D/ZmHEenhg84RpzZ3S0bGFWRBagPq6ox45Mlv8N6HixAS4o/hQ1s3cqlu3Rpok/fAxMZQgmu1PKrO84UXoevW0xEo0ygKjRa6yBj4TJkKm68PLPv3Q2U2u9SMV4+CnoWtsBD6JcvJgz0C9+HDyDVzfiVvjUaFrl3jcMm0gUg5mI3c3DLHw20BG12/oLASy1YmIz29AD17xMLDg2egtR61So3Y4EjcMHAi1h7Zg7waunYr4OiVGWrxx5EdsJlNGNGhB917a/0sGZlTRxYkF+EaZXVVLb79fjUef+Z7HD6cA7vNjsEDu6J/v47SWU1jt5pgWrMS9oOH0LD+zNssqGdOhcf4KVDonDNE/0a4qYxX5tZ0TYLH9OlQBHjCnJYGhd7QisayZrBYYMvIIA92EWxeGiAmgbwf54SJ46bTaclb6oshAzpj1950VFXVSUebh7eM52a8NWv3wdNNgw5xoU6tjcfXdtPoMKfPaESo3bAu5wjM1tYMtiBRtFqxPjMF6QUZ6BuVAJ822hhRRqYl5FF2TsLJxZMdP/3sN3w/bxt5R2YRxrjp1Hjm0YswbsJQ8bk5DHv2oPKt16HJTIdR8pC4LqpRqeD19rvQ9e4rwmScx1qYg6r/vQPDps1s2aVQ19EolbB3SoDvffdD25W8VjG82zk4j7DIfP75Unz+7Up6z/modUWPBbdnUjTuv3c6ErvG0OWd81q4h+1wfhYmzX0cpbVVsDbwyJuFrhPlE4SPLr0HoxNcu28ZGWeQPaRWwsbDZLJgw4YDePjxr7B81QGYzccXbJ1Og2uuGN+qmfimXdthXLZE7PRZb5Y8qMBrbr8V7iPHQEHCJOMaSi8fuI+dgOqeSUBenlitgZviXG18EjvflpWLQQ+26nJounSCUuvOboh0Rsuwx6Kk59uvXyeMG90bJcUVyMktE010LULXLyyqxIKFO2A0GNExIVx4XvybrYF8SAR5++GWwZPhR+/X5x4mQWyFUNNtVxn1+Dl5Lfw1WjEZV6NSt/q6MjLOIgtSi9ih15uwZ3c6HvjvF/jp142oqKhptFBqtRrMvHgw/Py9pJCmMWxYC+3Onf94R7woqCU0DF5XXg9VsLz4ZVvgHR4F78nTqKaghSUrE3ajUQiTK4hKA4taSgpqFi6Ewtcbmo6d2H1xWuh4v6XxY3sjKsIfO3elw0KeU2uixeK1Z282fpu/kb4bhJioIKicWO2BxWRQx56Y0qUflh7eBYPFBGuT22ocg6+7NCMZG1L3ol9UJwR7+sqiJHNakAWpGYxGM/btPYJXX/8VH3y2VMyyl0xTo+i0alw2czi8fTykkCawmWFctxo4kPJP/xEP83a74Vrohg2jwi57R22JtntPeM68GNY6I6xFBWI0navmVCxFRMJmWLcO1oIsqKIioCTvw7FKgxPQ8+7YMQLTpwyEifJZVl4J/eXZaC3FzA6zyYrlK/ciI70A0dFBQuDY+2otIT4BuL7fWGhJCJOLsmEwm1q+rM2O7JoyLNy2FjG+gYgMDIZOLW9lIdO2yILUDD/8uBbPvvQLGYsKKq8sRE2LEaPVqXH5rOFiPkpzWPLICCxbDFtOvjBwLD9mL094XXbVv2Z5oDOOUgO3gYPgPmEMzIcOwVZWBpWL/UsiF5CgKI9moObPP6H0cocyPp4u4byBdnPXYsiQrrhgRBL2pWSjvLy2VX1L7KCkZ5bg1z82wstDR95SMNzpt1qLluI6vFNvjIhNwvbcw6g1GWGytbD0EMWr2m7GvNQtKCzMQWJEPAI8T21bDRmZhsiC1AylpZXYuTsdtbUGKaR5tOQhXX7pCHi0MNvetG8/6hYsAPR6MUTZjcyA7vLZcB89Fgq51nlaUbp7wePCKbDU1MJKomQnI8xDxVuWgJMR3hK9dDt2oCQ/F6qISGh8fFzq//Pz9cLoUT1Enquo1FOeMzpUp1nsdIoC23ZkIj+/BDHRwfD2doPKietH+gfjhn4T4KFUiV1pTZQWnBrNXZmXJkouzcPvyRvQNyIB/jpP6LRyvpU5dWRBag6qEW7YdBBlVGttyTtidFoNZs8c1qIgGZN3w7x8mRAjNh0WH294XXkd1NGx4rjM6cdtwEC4TxoPVZA3THlFQEWFeBauCBOv0u6VkYnalSuhIm9J4ecHpbfzngMvQXTByB7o2S0GhUUVoq/SbOEYNR8ru92KoxklWLhoGzzddaLJmJvxWouSBIwXWJ3RZSCprAWZVSWoNurpgGOzw8bgLS9qzQZ8vWM56ioqEeTrjwASe54DJSPjKrIgNYM7GYhlK/agsLiSPrVOkC67dHiL65GZd22HbucOGGw2kPmCetokeEycBIW8RNAZRaF1h6ZLD+hGjoAlK1tsuKeorgH3xjgrTGYy0EqzCZotW1C5cyc04WGwBwS4tGV4aKgfJo7tCa1GgaLiGlRX11J82GdpLlZ2MThi09Y0rFi9B/GxofCkfNhS5aghPp7eGJM4AH0jO6KwugJKuw2V+lqxDXqTwkT/tpWk44sti+GjVMPX0xe+Onfy0mRhknEeWZCaQa1RY9nKPcjNLadPrROk1nhIpt07YNu+Qwxo4IUxNZOmQtu9t+OgzBlH6eEF9/EToEnqBGt5FWy1VdAZjMKDdUaY+FxeiVxbWYHaFctQZyWBcncT6+85C3stPXvGY+igTrBYrCgtq0ENN+O1iA0GvRmLluxEcVE5fHw8EeDvJVaOaC0xAaG4vO9oDA9PICeJRLGuGpVGEkUWJumchrBYcdPhiqwDWLB3A9RWK4mYEsHu3lCrnd8MsS3gfjh5JOC5hyxILbB9Z6rYv6Y1Hc3chzTrkqHND2qwmWHasgm25GQxMsqSEA/P6TPE/j8yZxdVcDjcx02AwtcD9spqWGpImEgMnN21VmxtQX899+9H7YZ14tkq/H2gdG99M1o9LCjDhiYhMiIA5eXVqKrWwyTmvzWXH1khIJrx/l6yXayN6OvjgcAAbxHeWkL9QzCx2yAkhkTDarXAlzz4Sn0dDLA6jP0JUVDY7KixGLE0cx9+2blGDBrhva3c6VxPN+fv3VXq6gwUP6VTQ+Jl2geyILUAT4bdteeomIvUEixIl04fAi/vprcwsFdVwLhuFeypR4Vt0M2cKQYzUAlynCBz1tF0SoR2xDBus4WhohKasjIhMC3P2DkG22r2lpRG8rTWroGxtIA8CQVUkRHCSDtLXGwIxozqQQLlgULyfHg0nmN6QAvCRP/tTs5EcvJR4Wnx4q9BTm6hHh8Yjot7DMfkhF7w9fCBn84DNSRMVVYj7JRvbeQi/TMbi67HwmSx27Aq5yB+37UWReUFKCSvs5Q8LX+dO9xd2OKjtZSWVtF9mqlS6CEXqXMQWZBaIDI8ACtWJaO4pIY+NVf4eSitGhdPHQSfZjqUTZWlqNmwBpqMHBiD/OF50SVQR8nL/bc3FGQ0dT16w5qUBKXVDJvJAHVllag4NJ8LjofP5dF46qOZMKxaAZvSDpUfeUv+zm9Fr6EKT/duMejcORJqpQI11SQK1fWj8ZqOlZ3EobS8Dhu3HEHy3nR4emjh4a4W3pczeHp4YXCHJMzoNQJRvkEkTF6I9vJHiNYDZYYamEm1RbMevRiehGyma+8qycHCtB1YuGcjSqtKkVtdhmzeC8yoh4ZEu47S1kIeGK8eYTQ77kelbH0TI8MLHBcVV8JmtSMk1L8FMaK0ItGUFav98a8RpHLyTL7atgQapRphPgFSaMuoNSosJ0HKy+cVk5s3RWwwpl3YH/7cNNIExpxs1CxZDM/yCiiGDYLHlKlQnMHmDBnncAsMgtvwkVB1iIXJYII1Lw+eZESd7V/iZj8+X7knGYb0Q0BNHZThoS4144WF+GHE8G6IjgqEl6cbsrNLYDJznwkfbSpWHG5DeYUBq9fuQ05OMQwGMwL9vVqcN9cYiWGxmJw0EFMTB2BkXBJigiLQOSgSCT4hUBosMJHXZODFXLUqR7zIOzQobNhemo3FR3dh3q7V2JS2F6mFWcgrLYQ7CZC7zk2Ip0alcWq03uatKbCYraJZPTomWAptHDtPArbQ01BxvGRBam/8KxZXzSstwLNLvsXXyatx08BJ+L8Zd0pHWsebb/2BX/7YCLOl+YmUPKrp/964Fj17N73BmnHzRlS88Cy8a2thvepqeN94i3REpr1jrqqEacVSVG/cgLqtW+FPYQYXig938/PKDqoxo6AdOQ6KIUNcb8ai689fuA27dh7Fhs0pQnB4GHjTwsSQF6Ngg2zD6JHdhLj17B6HmBaMeWuwmIzYlpqCo/pS5FeVoZI8J24qtNE/MdBAXJu8TIoer17urfNAl4Aw9ImIR7h/CNy0rRfH7KwisR5gGVXuBvbvimAS6maxkWjV1ZJI6qCgl0z747wXpEO5aXhyyddYcHQ39zajd2gslt70Ary8fKUzWmbl8t147Z0/UFLWfLMdL6760L1TcPFFI6SQkzGuWYXK556Cigqe+z33w2PShdIRmXOFqrxsGNevg3LR39AcTRfzkJwd+MB1cx4QbvTxhmLESPj26Qv3CZPFMVcwkbezduMB7NyZhj9JoExGhw/nEKdmUKjJG7Gjf58EdOsWg8EDu6BP73jpYPuEN8JctGwXosP94evvjcGDOlNo896OtbwctspyaCKjuClDCpVpb5zXTXar9m/DE0u/EqN+lBYqoGQ49GYjPChDDu7QXTqrZTzctWL4d0tr2SkVSnRICMfAfp2kkJMxHzoIt3VrYSED5HnpbCg95ea6cw2dty88u/WAKj4BtgAfWIqLoK2pdboZT/QtmcxwT01F7Y4dsNdWQUkGVuXvvKfC3kZ8hzAM6NcR0VFBCA32QWlpCWpqbY4+nSbrnY6FXXPzK7BzTwYOHswSzdO8J1JYqJ9Tqz6cbvbvS8Uff23HkSO50Gg0JERdkJTE/a8tiFFVOSxFBVBQJVTl0/qKqMyZ57wVpHdW/4Y3Vv2E7cWZDjEiONsaqMbIw3Kv7DOaAprPyPV4eenw519bUVbevIfEPxcXG4oRw5reMda8fy80WzbDNnYc3IaNlEJlzkXUoWHQ9esPTUIn2Dy0sJCweFD2cMZb4pzpmFRrhmX/PlhTD8GSlQVFgD9UAc4PfGBh6tQxXHg8XbqEo0vnaBQWllFlykQ5t7n8zvnajvJKPfYkZ2Df/gzs3Z+NI6n5CPD1QEAz/aKnk9zcEvzy+0Z8+8MarFm3F9GRgejfvzMunNhXjDhsDr6j2rSDUBbnQx0VB3WgPLWivXNeCtKXa//Ak8u+Q56hUqy7dSJeKg1GxyYioLWDG0hpNm89jKzs4qYrmgQLUnCQDyaO7yOFnIxxxzbUpqfBbcZMqCOjpVCZcxclVOGR0HTvAUXHzrAorLBnZkFDxr+FxrLjENmKMpeqqBSGvckwHzlMH23QdIiFgvKrs7AwRUYEo0f3WCR2jUJilwgE+XuKHWtr6xwVNOmqxyMyuF2M3kvPLMbOXankNeViz94MlBRTeaI87ksCdbo8p7oag+gb4hVSfvp1HX74aR0yMgrJ+wvBuPH9cPH0gYiMbFlY7GYj9JtWiVqoW3Q8lH7Oi7vMmef86kOy2XDjT29i5cHtKDLWSYXrZDw0Otw7/CI8PukaKaRllizZIfqRKqkG2WhBluDC/83n90mfToQK+sfvwUw16YCXXoVCI29Rfr5hKS6A5fBB1HzyGTQZR8VqHOwBOQPPeeLJrFZvL2g6d4Y7edPuU6ZLR1yngjz8nLxSHD6ci+Ur92DbzgwK5WHsvHkh9zfVC1VDyKIr+Lp2+HjpEBrii8BAH3h6uCE6Olisu9ctMRoBgd7ObcFBScITfVPJA9t3MBsZmUWoITGqrq4Tc4ly8yrEQrG8ev6QQV3QIS4E7nTN1mAtzEftd9/AbfQISr/uUHieHe9OxnnOG0EyGvS44/f38UPyGipYdrox6UAj2FUKjIvrgZ+vfhxurRx2azaacdk1byI7p7SJgssoEBbqiwW/Pyl9Ph672YCauR/BrrfA574HpVCZ8xFbejqKd24Bfv4ZuoICMfChqVzTFOyDqFgq/H2hSuoG3aRJcB81lkKaa3prHbm5pcgkDygntwR796Vh247DKKvgodN8lP82IU78IrHkJYV4IYTAQC+xAoSbm0ZsUOnu7gYvT52YAqFWK8V5vHU7r7PHk8x5vhAPNzeZzPTXhIrKWjF/yGKlu1WowK1ww4cmon+/joiP5ybHSKdWXKhb9DuMG7ZAN2UyPAYM4Xkb0hGZc4HzQpAO56Ti3r8+xdqMA1zPk0KbgfK3r8YDT0+6CrcM5Zpn67jr/s+wectBIXiNo6DC6YUlC5poBTXUoOLn72BVuCPw6tZ7ZzLnJmarBcjMgmnbelR/8gl0Zit4vQ9nhUlNRp23UVcGB0MdEwvrzEsRNHyUdPTUYLHgVcXLyqrorx4HD2WLieD7UnJEU6GdRzywOFEcHF4U5/36/O8QJ/7IQ7kdw7kdnhY7S8eHkSDTeUpeXYJe/Jl/kb/u463G9MkDMHBgFyFuwcE+8PV1brCPfsta8krnQh0aIqZSqBM6SkdkziXOeUHadHgXHl38JbblpR0rJ63ATrW3GV0H49urH5NCWuaHH9biw88Wo04sI9TYxRyC9PfvT1HF7ORaneFoGmpWLYXXoEFw695XCpU537GbDLBmZMCwZTVqv/oBGovln63rWwv7JtyMR5Yc9qAgWBM6wXvmxfAa3LYDY3iX5LKyapRX1IomNJ5AW5Bfiv0HM5GeWYqS0moSERIqSWTEi/6xuCilFRrYogizIgmSeIkjFhIbb3SMC0T3pHhEhPshMiYcvt4eQoRcmaBblrIbim9/hOXwAeguGAmPS+ZAHSFvcnmucs4L0rbDezDt2xdQbdI3rhFNwM12fQNj8MmMe5HUoelh2g1JP5qPW+/+WKy83PjFFPDz88D3X9yNkNCTO15N+/bCuGsrPC+6CEofecTPvw27UQ9jVjbK534K980bYeE134Q5dw72mMwkaOrAAPKaQuB1zVVwGzFOOtq28KRWbl6r03NTm0V85iY3XraouqYOhjoTjPS5pJSb/6pYNRHkr0UEiQJv6e9BIuPl5SH2aOIdbbkZz91NAw93HbQ6jVNbrzfEtH0dqj79Aqb8fChra+H5zDPw7DdQrNwuc+5yzguSyWzCnI+exLLcA2I4d6uhKptWqcJ/R1+OR8bPkQJbZvrMF5GX39R2FLyqsjvefeNGdOseJ4Udw7hrBywH98Nzjtxc92/GWlUJW04G6hb8Qa/F0LDAOFkM2eNgU87fUvIutVFR8LpiJnQDR52xpajYdNhIVO0srFYLzGYeV6gg0VGIeULsGbHXxH/bAru+Cqat61Hz42+w5GRDV00Vw/Ej4H3NbVBGRjs3qEKmXXLOP0GtRotXLrkZHk4sOSKgkmyk/23PPICyylIpsGUSu0aL9vHGsYs2+coK3mH2ZESBkdet+9fDkzM1Sb3gc/fDCJr7FWx9+1PliIw4HWut6WYhYvPPDX+2qiqYDxxA5StvofiKy1H+3FOwVZTwaacVFhoecMDrPbq56eDtTZ6Qt7sY2MCrivOxthAjc8oulD90L93bFSh/5U3Y6V7tegPcn38Wvvc9CVV0rCxG5wnnxTykQG9/JGem4VBJjiiorYU7abMqihHg5YvBcU1PZm1ISJA3Vq3dB6Ox8emPXCPsRqKV1O3k7cjtRgOUajVUchu3DKFQa6AKDIT7yJHQTZtOtfwQmFIOQ23iqlLr+edck5mXvYY5g7yvv/+GaftW+n1PqIJDqaSfOzu4mmurYD26HzXffIPq/72D2vl/wpKRCRXdm81ihdvlM+Dz2DPQJfaU16Q7zzhvhn1z013iq/9BQXXrvR3Gplbiqm4j8NGse1q53bQd0y99GXl5ja/+zbXCyZP64+nHL5NCjmGqrYHVaIS7CzPwZf4FWK2w1lbDsHIpqj/5DGrKLxYqnq4UUPZLeK8iaDRQUr5Wd+0C7xuvhaZ7fzrWNk1obYcd5uw06FeugnHlGlgL8hyj+ywWKHiTPzqDB3TYo6Ph/+LLUEVGkZjL69Gdj5w3gsT8tmkZbpj/Hsy21s+R5/1bEn1D8fZFt2JkYn8ptHnefPN3zPtzk+jgbYx+fRLw8fu3S5+Oh5O7rdrUZc5TyBjbDHqYD+5G7bx5MG3dSW6D2SVhYurFSaFWQeHtC12fvvCYOhaq2E5QBoRC4eTeQy7D4moxw1ZZCkt+llgmSb9pO8wHUqEw1MBmJRGSBEicTi9+r06Ih9dtt8GtF5VPnTyZ/HzmvBIkzsE937gZaSV5UkAr0ahw3+BpeGHqTVJA8+zYfgT3PfKFmOR3Iiw2kRGB+GPeI/zJESgj4xKUoek/S3E+an/4BvpFS6EwmcTCp2JstauwOEmVIoWHJzSdOsNt+FC4XTCKBIu8d7X62DnitObysRQPjipXtvgt/7WTqFZXwlJWhNq9e4Ctu2E+cgTWkiLH+QzfQ2P3QdcVSxP5+cHn/vvhNni4I05yeTrvaaeCxBmVJ+M5X3M7mpuBYR8/jCpeOqiV2MhLGhAcTV7SbeiX0EMKbRqzyYLJFz8v5mqIuB6HAqEhPvjhq/vh4ysPQZVpO+xWs+jgr/31T5i274S9toY8Dss/ZvpUCzIPC7BzH2dQIKz+wdD17AJdPDeP6UQTmZJEgq/BzWl2nvRrMQnPzUZ/TUcyYc3Kh726CvaKCvKCKoW3U09zcauPv4J/X6OFbvhAeM2+jISSyuI51Pclc+q0O0ESlaaSLVDUkZcTNZkyqfOdlh8u+xEPLv9W+tQ67FoVHh5yCZ6ZfJ0U0jz3PzQX6zYeaKSCx0O/dXjuiZkYNlye/CpzurCg9q+F0P/xK6z5eUIg7Caz6HOpx9WC/Y9ASH9bQ8NrtXRd/l1+ifNIAJU6LexuHnCfNA4el14GdWAYH5H5F9LuBElfVQjT3lfhW7sUto7/hbLD1c6VDKLOoMeAd+5ERnmhFNIyNl7fLrIr3rrkdnSK6CCFNs2RQzm44db3oDfy8pkN4TkYSsyaOQL33z1NCpOROX2YqiuAzEOoW7Ac5r3JsPE8p7o6KMh7qS869YX8bBT2+jjU/7XxkHAPT8DXHx6jh8Nt4gSoo3lyupMFXea8o30JEkXFdvhDKAs+plJmh9G9LxTdH4fWr3UrKTRkT3oKxs19AnXmk/t5GkWh4G3/8ebUm3Dr0Gn0seV5DTNmv4KsnGLp0/H07Z2ATz5ofGCDjMzpxF5ZjKqff4OZ992qLBej1exmE4mUXrznlR642DcUqbYwAg2FR7yn67C/ptBqofRwF81v3Gel7tMbHjMuhq5DVz5LRuYf2o0g2W0WoHgD7AdehNKQDxupg1INWCOvhqLrPVCqnBvmye3cL/89Fy9s/AsKHkLaCnh9u3FRicJL6hh28jyiE/nyy2X44LMlYrZ6Q1jMoqMC8dtPPLBBRuZsYoWtuADm9FTUrdkEFBbCXJgvvCc7D5CorRX9QPVCxYjc3MAsnGgg6oVHQN/hz3yOlb+v0ULh5QGlzg12EiJ1WAQ0HTvBbdQgqKM6QOHpJ74mI9MY7UaQLOUHYN31OHTWNFh57VKifvK1LfFxKGNntcpraUiVvhaD374TGVXFdKNSYAvYdWq8Mvpq3D3yEqrRNX+9grwyzLjiVbGs/vEoEBUZgG8/vw9e3lQzlJFpbxhrYMrKgGHDVthJpKxFhQ5vigcscAWOzIJDaKjgCBNxnAwJIRIvCherJGh1UEdGQBUZDc2gPnBL6Ay4yfsQyThHuxAku7kO9sPvQln4A6z646PDm2WavPtB1f0pqLxb7ts5kT0ZBzDtq+dQqq/h0tUiPFF2Ulgi3p51F+LCoqTQprl0zivIyDyx2U6BoEAvvPTU5eg7QG6WkDkXoUoWC5PN6hCof5CGg/M+Q6KC6FwlUUamOc5+brKZYc9bAGXOd7CdIEYMHYZWvxOK7J9ht/Burc7RPaYLHho8FVblCTW8JlBa7FiSdwDrsg845nu0wBWzRzoK6AnU1RmwLyVd+iQjc66hpsKgpT/uUGg9G7w8AA15/Qoeji2LkUzbclZzFG/kZS3dSd7RO6Q8ykYdGA6zG+xQZHwL5C101NqcQKVUYc6wqRgYFk+FqzW3S1ck8fppx3IcLcmVwppmxiVDERTkI32qxw6D0YJ9BxtMApSRkZGRaZazKkgKay2saV9CpaC/JwwMaAgfUqgVsGeRl6TPlkJbT5CXH96Zfgs8eP2rRryZE1FYbFiRfxgbM/Y7Lt4CY0Z2l94dw25XoKCAt6mQkZGRkWkNZ68PyW6BLf1HKI+8Bh5g15pI8BxZW9R1UHa8lbwdDym0ddSZDHjqr8/w/q5lUIp9W5rHrlLi4oR+eHPmHQj3a3ozPU6+lP2ZuPbm9+gejt2FGGkXGYAP/ncLwsIDpFCZcw2jQY8qfQ2q62pRXFOJGqOBnHSbaKZVKZXwd/dCoJc33LRu8PbwhJubc/nyfIcn7JZWVaCoshx5VaWo0dehzqiHwWgUCyLb7JSW9E+tVkOn0cKd0tHdzQ2Bnt6IoHIX6OMHL88TWyBkzlfOiiDxJXk1BvvOu6C0UaZshRfCKMkI2BWUgbu/AEXUNIq9cw5eQUUprvruJWzMT4WiJVGia/HooW9n34/pPUc0u7Ml76g5a87ryM1vuAK4ggqSDrfcOAFzLh8lhR1DGDU6V4wcbIXXdn5AacPJ087vt7KqEusPJyOrMAcFpUUorS5DMRnUDHpfqWdvvl6QVIgggxkVEAQvEqYAH38E+QbAx8sHUYGhGNSxm3j/b8NiNmP9wd04kpeJ0spS5BTnI6MwH4dLclBRWw2FRvVPVnCM4CO4vHG+IFugpFeUfxC6hscgKigMYYFhCPILxGBKz4TIkze+lDl/ODuCZKqEbdvdUNXuhtXs3OXF0laenaDv+jLcgzo7Ap1gT+Yh3Pnn+9hekA6ltflrs5c0IqozPp3zEGL8Q6XQxvl70XY8/cLP9KV6oXMUsBHDE/HWqzdIYccoLC3Goh1rkVNRTGc6j4qEbEy3gRiY1FsKOc1QNskrLcDcFX+IioHzKERt+NoxFyMmOFwKA37dsBSHctPJODmXD/jsPh0SMWXAyWLvKkVlxVi8ZxN2HNqLhXs2otJUB94NVRQRev1z31JUJfvpiDt9EIfpf0p6NsHuPhjfcyDiI2IRGxyBgQmJCCPj6gqpeVlYvHMdKurImEthrYXzyYMzboD6DKwJl12QjbWHknEwOw0LdqwTHhE/c05DEW9OKxaclm5CSmf6piNdVVR1M9swpmtvDKRXp6gOuCCxD3y9T/+cptTso/h1ywpYnNhBgOEs46Vxw+T+o9A5xvnRwa5QS5WlZbs3Ym9Wqktl9PHZt0rvzh5nXJDsPGxu/0tQ5P9KYiQFOolKa4fBexR0fV+EQusrhbYSut3l+zbjvgUfI41qb5QA0oHGsWqU+PjCm3DV4MlQNVOo2Uu6ZPbzKComIyb9pkKhQtfO4fh67r3kbR2fQcorK/Dw12/hj+R1ULQgjE1xQcc++Pmxt6VPpxfeovrNnz7DGyt/goKtsLOQuPcK6YBP7noGHcKipUDgsjcexqr9WymxpIBWoqDfu3TAWLx/8+NSiOtYLBZ8vHQedh7ei7+pQPNiu+QGOayKi/DzttHPkDkVzXpDqHYfHxGH3vGJmD7wAums1rF4xwbcM/dllJtqHQroDHR+1idLRJPi6WL5ns1YuWc70vKOYu3BXTDwYCUSECvnaym6/MdNraR4KFBtsNJfpXOPnE4WW2hQuvq7eWNMUj90jemImQNHIyrs9G14uWTzclz78QviWToFC4LFhql9huPpK+5AbEiEdOD0UVxWhAe/fAMLD2xzqYwWfb5aenf2OLM7xlItw5ZFNeysj0S/kavYrQpolVkkJl6AP3kIztQG6NzYoHCYjAasyNzfoiDxT2cW52Fqt6HwcW9m+3E60WIyYtuOTPpw7De9vdwweGAn+Podv/I3t5MryJvalpKMan2dIwM5+Sqrq8LFfUdSTdFJUXYBk8WMuz95VdTCGotLSy+uKT972e0YTDXchsPk/96+lgxZlmOuSyPfa+rFv9A3PgkT+wx1/JCLHEw/gjfmf413FnyLg4XZjkfn5EjORqHfEZOxKX8ZLCYcLszBtqP7sfnAbmQX59M1LIihfMgraLdERlEe1u7fjqraGhLKY2nQmpdWpcE9U686LR7Socwj+GLVn3hn/ncwmPYjLT+P8qQFHf21GNzRE8O6uaF/RzcM6OSOwZ3dMKq7B4YneUJHcSkoM4tbcaLkOtKT7onT80BeBtal7EJqTrpoRk0kT1TTqg02nSMzPwt/79wAi5nnZR2fti2+SDzTinLgRZWBwZ16tOpZnwp6Qx3WHdiJlJwMRyW3sTg183rokuulXzp7nNFRdty0obAZAQ2vpSUFuoitjn4g61vYizZKIa2HPZ2rhkzG5d2Gwcbt2c3AD3ZvRSE+2DgftSaDFHoy3ME9cfwgcY8NKS2rxvadadKn4xnWtQ96xnSiLztTLI/Bi8i+Pv8r6dPpgz2+JZtWo6DOtVGDvEbg0A5J6Nsxsdm+uDPNh4t+wgNfvokvVs8XFQ/uuzjljNkY9LuiwkE15uKacny+5k88/t27eOCLN6QTzi2MRj3+N/8b3Pv5G3hh3hckNCbccaEvHrrYH49fGoT7Lw7AnVMjcM+0obh32gX0GoN7p4/HbRdOwbVjhuLyYT6I9NFQcriY1vXpSRWHFYd24bmfPsJdn76MH9Ytkk5oJ1AcreRp/7hhCZaSlyvTMmfUOiiUaigjL4TFeyJU5LqfCsJumMqgSH0L+rKjTtuRYC8/PD72coyK6CzWsGsONlSf7liKI1Qra46gEF9cOWsYGbd6kbOjptaEHXvSpc/HE+AXiE7R8ZRx+ZPz6WEhr2MV1Yjq6qjmfBqxUMF/869v6HZc9BzUKkzoM0z0pbQXflu7EK///jm2ZaY4vGQXbaOziD4pEqb0kiKc3vry6WH3kX24f+7rePm3L5BemIprRwXiiuFe6BU/BhP7T8JVF4zAuP6T0afjrYgOugbhAVcizO8KBPnMgZfbVKoMch6wkVdjhdniSHT+v8FsQ7XehjqTrVGh4rBGHxEZfL3ZhD93rsPzJExv/f4lqisqpIPtAMpb3E/8/C+fYvvhvVKgTFOc+eqqLgDKLvfA6jcaKvdTEyWxkEJdKpQpL5E5d96idAyJxn8GT4aPxg325rwUylS1ZgPeWft7s16Shlzy2bOGw92Nl1Vx/B63/hQWlDtc/kaY2mcEuvFCrq54SXTLBoMB6/dulQLaHvaO0jLScLBEas5yFkoHX50HEnm77NPcZNFavlz5J5775RPUGulZNmL8zgShvgF4bPYt0qdzgy+W/05e0ev4ecsKeGuBBy4KwXVjw9Ah7DIEes+Enye/roC/5wx4uPWDThNNrwhoNWHQqkOoXuINo7kKwf7ArOF+GNzBU4iSksrIRf188fZN4bhzQhCi/bX0bGyoNdCL/upNdnTw04o+KXNjz4vyKHtMJdUVeHvBN7hn7qs4kH5IOnj24VaWo6V5eGneZ8gszJdCZRrjrLSfKL0ioUq6DzbfC8TcolOBF2LVVW2FNflZ+uSkcVEqMSFpEB4fNQtBFBFuWmoSqsH9cWQbNu7fLoZsNwp9PyTED7MuGUxRkX5MYUN2TgmWr0p2fD6BXgldMahrL1FzdsFJogKrxzfrFkufTg9/bVspCr1LkNDOHjwOgzu3vBPvmSArPwv/I28vt7JMiO3ZQE357voRk8VQ5nOFTxf/jJd//QwH8jNgIC9mUJwn+nfWoVMECZD3BGjU/vTyIwEKJeFpfKi7SukOb7chiAsdhDkXdMS9JGizBvph5kB/3DwxChcN6E0eVkc8c0UQXr0mBHdfGIR7J4fgzRsi8dClIbjpgiB0DXIno9VEQaHnabSY8ffeTXjwizexYMMq6cDZh/tINxzZg8+X/Iyq2mopVOZEzl6DvmcsFJ3vBvxGkqckhbkI23Jl3p+wZy+QQlqPt5sHbhk2DZOTBsPeQn+SmTL7/Us+F4MJmkKtVmHi+D7kGEhJS4WkolKP9RsPOD6fgEqtxrS+w9ExONwlB8QKG/ZkHkFmbvPNia5iJTf0mw0keK5Ejrwjd7UOQ5P6wrO5ASFnkKd//hh5ZUWODvKzhEqlwY2TZkmf2jmUTi/99DFem/8VysmQ1hmsCPFUY+JAD/i4J8DTrT+UCo10cvMoFGp4u3dHZOC16BR5FwZ2nYzrJwTgirEaJET2Q4D3DegUfQ/G9bkdM4dMxjVjeuHykbEY2yMKQ5J64sox0bhzWjB5XM30QVM4G/9tmQfxzC8fYt6GpdKBswzHiyL93ealWLBxBWyWUxjVdR5z9gSJUHgnwN7lPsCHROkUPCWROe1W2A+9DUvRLkegE2i1bnj6wmtxcaf+sDW35QQpX1p1CX5cuwCWJhZe5RFkUVGBuGhKT9FnxvDE3+LiShh4g7RGGJzYBx1Co+l8Fx4H3Ts3Vby5wLkt21vL4i2rUEDehCvwUNmJ3QZiQHySFHJ2+Wbx71iVvK1pY3aGeGjSnDMyh6YteOfPr/Dxsl9RXlMDNXn9/xkTjDdvDEHvTqEI9b8ISvJ6nIH7V7XqQHrFINBnOnrF34eOETNIqAaTdxUumvm8dMMR7DsbHaPuIOG6A5FBdyMi4D+IDZtJIhZAnljLTQlc4cgqL8SL8z7GT+sWSqFnGcp4lXU1ePnPL7ArPUUKlGnIWRUkhkUJJEp23xFQncJUCdHiZSoBkh8CTJVSaOsJ9wvGA8MvQa/AqGZFide5e2nzfJRUlUohJ+Pu4YbZs0ZBw3MtSKC4ZlRSUoX9KY2vw6fWatEzvit0LGBS35MzWEiMtx9NgV5fJ4W0ERTv53+bK31wHiWlY8+ERDJcwVLI2WXumj9RZ266D/BMEBEQipumXiZ9at+89ceXeHfJj2LZLbvVLryTq8cGYmT3K9Al4hHyjrrRWS60M0uolJ7wcOtN4nMJvNwSpVAuAirR7KdRhcBN2xFumhgSoSDyzrJgV1hEBa9V0Hm55cX4cOGP2H5wtxR4duG+rsLqctzy0QtIzc+SQmXqOeuCJCBRUiTeT57SKLH/katwPlWbi2Dd+aAU4hx94hLx2AWXIt7T3zE5sgkqzHrM+fYVMR+iMViEYqNDcO1lI8imcxJTwcgvx9adRx0nNMINF0xDj+iOLgkSU1ZVgSVb2nZi29HcdGSVFEifnMNO6dc3Ih4jEnmemBR4FtmcvBWFlVSJaIu48DOi++N7rH+19rn9d/IV8GgnzZfN8cfmFfhw8TzU6GthMNoxpY8fLujmhriQafD1HA+tJkIIR1vAfUuKVjT7WW3VVMatCPLQtLqYsKd0sCAbr1DFKiXjiBR6lqE4ZZYV4H+/f4mKGucrz+cz7UOQGM94IOkB2PxHnpKnxBPsUbYV1m3OL4PBa5Nd2Hskruw/Ae6830sTuZ5rOVtzj+C3jcspbzVeW9O5aTFiBK8C7hgAwS18R9MKRPt2Y4QEhqBvp25Qi7XtpMDWQlEor6vFLzvaVpA+WvAzGYDG768leEb9hP4j0YtEvj3w/eZlYumdJh5X6+DnQq+EsGg8cclN+O3+VzHv3lfw7pX3YGrfYVSb1zmEqol8407HLxo5UfrUflm2exOe/+ljVOprYCQxGt7FE5ePcEfHyAvh4zGGysnZWUA2IvBqaFXh+O+sMPKgWl9IeF+z9Uf24ZOlv8BqbrwSeabhkXe/7VqL39Ythom3kJcRtB9B4kLsGQdF0sOw+lGm1zhm47sEG9GSbbCnfSEFtB6NSo1Hx8/BbBImMQqrqUjQsSdWf4+KyqbnPCQkhOGuWy4k48w1STv2HcjCshWNj7ZjLh88FgkhPLjB+TtnYTyUk4F9h/ZLIacI3d+i/ZvF7zoLewwd/cMwIJ7EyMVJv21NcmYqrC6KKz8OXp9u9qBx2PTSV1jyzMe4dfLlGN5jEEb1GoxZY6bj/255Arvenodlj32Ax6ZcgRAf/5OE6YObHoG7rn1vaV9RVY4F5B1x/4uFancRPhoSI1/0SOgHP88xYuj22UKl9Iaf1zh0j/PByASKhxNZy2azYh7d1+cr50shZx+z0YRnfp+Ljfu4X7OJkbv/MtqPIEkoPGNgT/wvTAFjodS5bswUNjNsaZ/BXrBGCmk9PLjgo9n3YUaPYc2KQ2FtBaZ++Qx5EY1nJp1Oi+EjkhAR5hgGW1Zehx27Gl+1gemekIRgv2DSZhfum4xtVlkh/m/FL1LAqfHxr9+htNrF5gSK/qAuvTCwnQz13ntgLyprmh4Z2RI8JP+KkZPx3u1PISGyg1hCSqvhZiPHArq8LI+nmwcCvf3Qq1MS7ppxIza/9h1mDRnvWJmC0qNjeAzG9h3u2rM9gyzYuQHztqwUrQAWqsX3iPZATJAWAd4XQKdxbXHYtsTfcyg06lDcOzMU/h5OLIdEdRET2YRPls7DcvIA2wsGowG3f/YK8kqKpZB/N+1OkBiVexi0vV6ELfxyKsC81L90wAm4LqywVMO27xmg0rVJcm9NuQGDozo6+giaILkgHfObGVoaFxOCK2YPp8iowNsWFBWWobK86XkI1424EKFevsKIOQvLYkZBDvR1tY6AU2DupgVwdoVjAcVbaVOIibC6duINrDyyGxV6Xs3CBQ+Jmx57D8Xr19wnBbQAC5RaDS8PL7z7n0ew8OF3EBUQihdm3wqdtu3XWmtLtu7fjY/+/A4WqZmZU0unsZP4upN3wpWqsy+m3G8VG3wPAn0CMb2Xk2s4kshmVhRh+a6NMJvaR9MdJ3JJTSWufudRFFe4Npr1fKJdCpKoRWo8oez6EBTRs6HQuFYQuIVGaSqFdce9sNU5v514iH8ovrrsAfQOiW1SlHiS7B3LvkJlbeM1cJVahf79uyA+LkjcV3pmMZL3NT26ZvrwiYgLixKGzXnsyC8vxopd66XPrpF8cC+Kq1wsHGzAew7ExW24LcSpcjAvA3qj0Xk9omfA86j6JCRCRR6Rs7Dn1CexFza++g1G9x1G5vzsG/SmEBM3D+/G4cp8qSPWIT9GM3kWZl7Bvv3Mm1GrfEkko9A/yYuE0sk0pXtbsGsdVuzdLAW0A8hQ7c1Nw8cLvoPRRPn0X0y7FKR/oAKt6P4k7NHXw65Qu9QdwSPvFIZcWLfdDkOd801Q0cFR+GzGnejsF/LP4gsnUmmswdTPnxGTSBsjIT4Md942meybHXkFldiVzKPtmraOF/UdLpbbcRYeUVRQVY4/dlNhc9b4NuD37cthcmXiHqUPLwMzqGtvhAS0j6HeDIu0zaWZsHZ4qrSIdHN9zhBXQnjrh/beVHcgKxVLd6wXzZP1cIXOx1MBL3d/iv8pLqnSxnh79EaPOC9cPyJIxLPV0P0V1VRgR+p+ulcXWgBOE9xE+i43J+5Y1/RKMP8C2rcgMVSQFV3vhSJuNuxkHFx0HKCqPQzN3occpcxJkmK74o6h0xHi7iPicyI8+GFvfhq+XPu7FHIyvbrHYuY0Xg1ciX37s5GRXigdOZlJvYaL/giXbpa+cpiMy4H0g1KAc9isFvy2bT3MLuwPwsWI9/2Z0muII6CdYDiFWmeVWY/UKteGvp8zUJHYm52GHXlpwjDWwyLaIUqFiJCO5Pj6S6HtgwCvkVRGxmPmKH8E+2qEN9fqkk33+M2ahVi6Z4sU0H64/uPnsGznOmFT/o20f0EiOLOpkh6BPYm8JW0wuemO8Nbyz6Mt2Qz79rvEjrXO8p8RF+G1iVcjyM3TEaETMJN39Oza35BWyPshnYyPrycuuKA7vDyV2LknHUtX7mlSHKMio9EpKs418aXCdrAgE5+udm000bfLf0eVi8OjVSoV4sJjyYidmR0yW4vLRZu+aCJh3nIwGfkuzsc6F+AtxhdtWUXZ8VjN3Gy1o0+UO7qFe8DPoxe06iDpSPshxG8yxS0Cr18dif4xHiSain+eNf/l4sX6elIxo8AyQzUO5TQ9wOisQY/guveeoQrlYSng38U5IUj1KKMvgirhOlg0wdxV4ZTBrs+UivK1Yvt0m8X5GfuzB1+IKweMh6+28ea00roqTJr7FPTGxpcIGjSwC+66ZTJ0Wjds356K9PSm+7UennIVwn0CGxW/luDhxhn52ahxdmQZJdK7S39tdkXzJqFrBnr4YGhiHymg/eCSsNdDxmtr+n7c+dkrKKsqb3Ie2bkK18T3ZB7Gon1bj9u52Er3Heijgq8nGXpl+xMjRqFwQ0TQTUiKjcELN8RiQpK3MGj8iDRkILzclAjwVMFDpzypUsKrPaSQ0S8qbX+j26w2K2748Jl/5aTZc0qQBB2uBnq8CJtXV6dFieG+WWv5Hhj2PE9vnDe8L025Ec+PvgweWl2jNe9SykTP/fWZWIi1MYYNS8KQ/nHYtTcH6zY1vuAq06NTN3SJ7ED354oi2ZFdnIe1+7ZLAa1jb9oBx46wLsATYUd07YOZA8dIIe0Hd43OFV0/BhnqNQd24oo3HhYDRgoqSsQOuucDtXV12EYeoFhQpAFKep7FFVZU1tZSdqqmvN5Ybj/7uGtjEBPyCMJ8B+K+S4MxvKM3ooM0uLCHN+6bFII3r4nBlUMDoaZy1LAqwXtg7cg4hKPFuVJI+yK9KA9Pffk29PrGK7fnK+eeIBHq0MFQ9XsLNv+BouCwMLUWduHVShs8Sv6Cbe8zgAud9zeOnonL+oyGv9adcrYUKGG0WTA3eQ3+2tX4/KfQUH9MmNhHbG1++FAOqquaXn/uupEXwoebCJ2E++8zyWguTN4sZqm3lk8X/YYq3uzPWdtDhd2X4jk0sTeUmrbfKvtUCfWnGv4pOjZcUHZkHsKc957E1Odvx3er5ou1yErIa7Kcw+LEW2zP37XOsVtuA3gAUX6VGbnlFhRXrYXRxOswtk9RUim9EOAzARqVFrdMDcFnd3bGs9d1x8Uju6FPlxgM6OyOME+N8Irq4TKSUVGErNKm+3LPKiSYP2xdic8W/CAF/Ds4JwVJ4BkFZd+3YQ2d6BiB58Sd0LMWBkpRSKKR+gFgdt41fm/GnXj8gplU81IdP/qOfrvWZMS9Cz/HriYGFowb0xPXXjkUKQdzsWtP0+vbje07Ar4ezs1Ib8j+9EPYR7XA1lBTW4Nt2Skw250fecS1667hsZjee7gU0r7gNQI93U6uPDgLGzFu1soqKcR/f/g/XPD4DXjk89fxw8o/sX7fDhzJzxQTHc8lSklQcyqLjxtdx/Bw6qIaM37dUIM9qdtRXrsYFuvp3ZnYdch/o0IY6jcFPeKGITZoEnw9r0dEwH303PvAaDHBSM+tscefXZhz2raC4FVfeO8rV/Mdf+3NpT9iTXL7G3xxujh3BYnRekPZ5zUg+lJYlZ5OiRJPtVDYamFP/xT2Ix+Sp+S8a3z72Mtxdf9xCOQ+pYaZjhSvVF+FO+d/hJyyk/uJlEo1rrhsNHr37oDdyekwGhufpKfV6TC6e3+qrTr/mLhJYl9+Bn7ctEwKaZ4P//weeaI93fnS46bWontcJ/gHts++hkk9ByHAsw2XvOEajcUGk9WMP3etx30kTjPeehCzXr0fHy/+ERtSdiGLDJ25nayb1hzCI27C83HTKLEtoxYLdxiRU7yJDHvTlaezCw+tj0KI33SEB9yEIL+L4O3WhR6TEdW1h1BUZUNhrVkMemiIGB1LFba8cufnKLYICXpSZBwm9RoMT54g7qIo1VEF55p3n0RmQY4Ucn5zbgsSwc9Z2f0xIOEm2NxieOpSq5+9ECXOpLl/w370S8BULh1pPe/NvAtPXjBLiMaJa5ftykvFg399DIPh5GY5jVaNy2eNQFlJFXbuarqgPzLjBgT5uDDklm0MRSczLxuVzay3x9gtViw6sBl63n5XuI+thycMxweG4/pR06WQ9kdCTAICfQPoXWtzRiuhtGKvScmDASgN8ypK8MKfX+LiV+7Bg5++gs+W/IzVe7ehuqZ97hDKTY2lFaUneUcN0WmAv7ZWYueRalTUrITBfG5smcAjBs3WbKQXHMbKPbX0/uQVX/jZ7cpKQ25501vJuAqnaLfYTnjpyrsxsefgk2yDMxhMBjz65ZvILTrPpx8Q57wg1aPqeCMJ0+MwuXcnD0QKbAXcxaKwVsKe+iFsR79xyVO6ecws3D58OiLcqRZe36HFOZIy4ZrUPfhoze8w80oBJ9CpUwS6dY9DXl4pjIbGa9OBfoEY3qWXS14SN0vuy07DupSdUkDjbE3ZjdJKEuOm7VKTaKkG0L9jN3SKTZBC2iejEvtAx7WV0wkZdt4viw3dyiPJeOq3T3HZGw/i9d/mYsP+HSQAp6dpyFV4lemSFlbkYK+i2mzFgu16bDu0ESWVv1Kt/cRtHI5lHKO5CHrTYTKiKXReGgnD2fESzdYyFFWsQHJmFdYdqiVhbUQQKNrFVRWodnEgT3PwIBCz1YKwkAjcPvUKJEXEUWK6Zm45dZft346Xf/gIpvN8JYfzRpAEwUNg6/EsbOFToaIM2NomPBYl0dSb8wvs6V+45Cm9MuUmPDPuCnhq3GCXlpTgZrNKiwnvbFmIX3asFGEnMmvmMHTpGIayZta3u33CpWIxT2fh6+fVlGPD4WRYm+l4n79zLcp5rTcnvSN2OMLIe7t08FgpoP1yzYgp8PHwPGM5XklJqbCwWbLjo9V/4Kb/PYX/zf8aaadpq3lXsJDB1BsNLT52brrbeLganyyuxbrkTSis+AE1hjWoNW4nY74SVfol9Hk9quqWoLzmRxzI/ACbD7yDvLK5qKzbQCKVB5PlzA2vZu/IYNqHnOI9WLPHABN7R415x3TjVgWfe/qMPE807xnXBQ9ffD1CvP2aXRezOXgU6x/J6/DT2nay++1p4vwSJMLNvxOUPZ+DOXQmbJpgqFqx3TEjPCVLBZD6EYnSt1Rane+cvmrYVDw+dg46+gTBrnYkrcJmQ5GxGs+t/Rlbjja+NURMbDj8fL2bNAw9OnVHGI8UcwGura/ftx070hofYl5WXkoe1O4mNxtsDu4mjgoOF0sFtXeiIqJx/ZiLoFGewg6QrsDPlLymUlMNXlnwNR77+m2saCed1LxKvWMvnhYUiVCpgDUHq/Dewgos3roX2w58iS3738XKXR9h6ba5WL3rf1i1+zP8sXEtPlx0BO/9lYnlO1ORWzIf+WXfkTj9iBp9G22N0gIGcwZ5fmuQnG7C1jTyjpqzAeQBsjCfbqYMvAD3TJ6DQE9e7UUKdAZ6RPysXvrtc2xM2SUFnn+cd4IkUKqh6PGUWHLIoolo9S60QpQ4s2T9BPuR9ykHOL/A6D2jZuDFCdego1sgbPWiRAYps6IY983/GNsyTx555+PrAXeP5pdFunPSZeTxubBDJwniwaJsrNy7jTL1yYbny1V/Ire8UDTvOYuPzh1T+gyj5G5/Q70b48FLbsClA8dQOrtiEU4RqTlv5aHduG/ua/hj0wrpwNmDO/V5n6BW6JHA002JfXl6fLCwDP/7qxDv/V2K//urCv/7sxL/t6BGvH/9t1L8uLESy1Jq8P7fJXh/YRo+XrwWyanrxUi9043edJQ8uF+x4/BBfLW6AlUm60mDGU7kTK0dd8WoKRjbfQC94/i4lgdLayvx36/eQlYBD8M//zg/BYlgLVBETYO960Owe3SHige6tCIPOPqUqqDI/BL2rN9gd2FNt2l9R+PFSdeim1/YMVGi1+7iDLy58ifnV1AgrrpgGvxcHCnGw9J51Fet2IKhAVYykPt3UKHlfrNWWqV6KDGjyTu6cuQUKeAcgOL83xnXo3eHLo4t6l2zCacErxVXWFmCJ394H1tS9kmhZwcWZmfFmb2N3GoTVpK3tPxAJbZn1mJvgR6b02vofR0qjBZ4aJV0nhK5VWZ8sbIU36+pRlmFChrV6d1p1mwtR2n1L8gq3oWvVlZiX04dtK1YkflMVVA8Pbxwx5QrkRQVf0qW92hRLv43/xtRyTnfOG8FqR5NxBig22OwB08n+2NrVb8Si5KwVjk/Apk/kyg5P/Fx2oAL8NLEazEotAOsLEqUd3gOy4asA3hv/e8wNrG8UFMoVCpMY2/EBSvKRnDH0YPYdcL6WEdyjqKKxbGlToQToSi4qTUY0rkbPNtyOPUZICIkAs9dcSeuHcZbiStcbtM/FXhUWyGPyJv3EYyGszcTn3fBFV63k0mgpjTjfiV+aUmg2OizUPH7httB8Hm8bI+flxKxEd4kSJHSkbbHQmJUVP4LDmbtxadLqrEltQaedO3WwBtynimSYhLw4PSrEcR7nrmS96io8rqZf+5cj69X/iEFnj+c94LEKPy7A10fhr3T7cL2qnQt70wjPCVjIRRHP4Ul5R2qjTjfxzKh5zC8MeU/mBzXCzYdFXy6eKmhDh9sW4JnF3+NbG4qc4Ibx804fhJuK+F+pLSSfOw8miKFOPh92ypkl9E9utBi4e/pg6tGnEPeUQMGde6Jp+fcgf/d+F9c1Gso7FRLcXhMLiTuKbA9bR8+XtI2O/y6AnsGWg1vGnj67pvLm1arQEyYFwnU6duSpKTqT/I8N+DjheVYsL2y1bfElQPtGW5yvrDfSMwZOAE6Jc9RcSHtKVGrDLV4Y/7XWL13qxR4fvCvECRGofGBIuEm2Hu9AqPvWChV9hYrKFYLnWAuhSrrB9j2vkTVMOeHh/ZP6I43p9+C63qMFt00LA4lddV4f9tifLt5McxOjPDpHNsR8WHR0ifn4CWWFm5fh30ZjiG73Gy4+fBe1JhdGGFE9xARGIKkuC5SwLmHD9VQ54ycjGevuhtvXn0frhg4Rqx5R9V4XqZAOuv0YrXb8O26hS3OEztd8Pbq7qd5ryb+baPRjqM55TBYUmC1Nb1UlquUVC1CTskGfLqwDKtTqqBmp681t0QnuZEouJ/hnY1VJIA3T74M0/sOJ+/SeQ9VQEKaX1GKN3//Aqk5jnmM58OWFf8aQWIUSi2UkZOh7vYo7HE30Wd7iwMe2FNSgv6X8xusux6jjOC8Ae8QGoWXLrwB9424+J+N4niOwsc7luHLTQths7auSZAL99Ozb6EIuZCDbTbszj6MbUf2io8/bVyK5KxUMTTcKejSPm4euGXcJWe0qeN0ERkcjmvGXIQnyWP68p4X8PQlN6GjXxhV69WwqbhJj046jQY7r6wI7y/+Ufp0ZmExCqOKxelcOJWzSEm1Fd+vK0KdcScqahpf49E17KgzpaGwfCEWbynD71srRAtCqx8XnRjiGwAvys9nmtCgYDxFeS7Cn7xGF/MXf21X5mF8sPBH6PV10KjP8AjS08C/SpDqUXkEQ9HxJth6vAqrVy+o3OjhSscag5fi54evKlkJ+/a7UVfu/Gx1fy8f/Hfs5Xhv6s3o5B0oauGFtZV4cd0v+HbLEtgdHVctMq73EESywXQWsjlWEp+DmUdQUJCNlclbUEluv9O2iM6PDY3AlAEXSAHnB8H+QRjdYyBuu/ByfHzXs5h781N4edZtmNFn5D+ek+hvctF4NIWJKiYLd2+A7Sws0Kqk2rmvty/dUtveU0P4l01itfQafLE0F5W161Cjd1SK2oKqmq2o1Ffj582VMFPmdKauxkLcN7YTol2cUnGqhFJl4H83/RcRfi5en8qikfLN79vW4vs1C6Ejz0t1Gp/lmeBfKUgCtafwlpS9X4Y9bDaUavKWmmlKJk2ilwKKsk1Q7boX9krnN9DydffCdYMn45PZ92N0VJKYQFtYV4WnV/+EH7YvE15MS6gpkreOc22ZHh7csP7wXjz47f9hV/oh570jwlPnhutGToVG2762tG4r2Ej3iO+CaQMvwPUTZuK5q+/BH4+/iy9vfRqXDx5LukTCpFa26WCI0soKLNu1Ufp0ZvEk74AHN5xOOKkq6qxYsK0K21PSUWskAW6jFRxsdqOIf06FyXljTOcnRscjxI8qiGeJIYl9cf+EOSQm2uZrxU3ADS41xjq8teAbvPbnV6g1myg9zl1R+vcKkoTCIwqKrvfBlvQC7G7xogmvqcfJ9psdGZ05lXzl+2HMXS0daT0qEpRBHXviszkP4qVRlyNI7Yb8uko8tuJb/Lh1KXlKLYvSJcMmuJR5+QZ4yOiKfdtQUl0halhOQdfkZp7pg9rfnkenA7Vag9CAYPTp0BWTySN85oq7sPDJD/HZjY9hfGI/WCg9T1mY6DdqjXpslJpSzzR+5LnzxopOuRYuwH2YRdVWMfrNZi+GwZQvHTk11Co/eing7UYVBSfzM8cpNCCUKiFndx7drNFTcN2ISVC7WDHgJ1dM5fmr1Quw8dBenMubSP7rBUmgIm8paioUA9+HLWgClFT5b65fmyd2KwxZUKc8B9v+l6VQ5wj3DcTto2bi68sfQk/fCBTqq/Hg8m/ww9YllKGab74L8AnA6G4DKRLOGxHejZJfrsBDzvt36g5fHz8p5N9FoI8/enXogulDxuHtmx/Dt3c+h84hkacsStzsklGUJ306s8QEhGBs196ntPhna+AkqjVZkVpshsVaC7OlbVbY1ojdo+3oGeZGQueEItH9eqh0ri1c3Ma4u7vjwVk3o8epDBKie6/R16GilqdxSGHnILIg1aNQUc6IhLL700DS67Dpopod8MCekspcAnvWr7ClvOnSbG83rQ6jEwfgt+ufxmVdh6K4phIPLP8S321c6JhB3wRqlQrPX3GHaAM/k3i5e+D5y2+XPv174cEcvOnfpAEjMfeOZzEwPumURImfYvlZWhGc+84GJfYV3sKZoKzagoz8ShKPthhZyJ5RD+jUPujXyZN+UwpuBTz4oR+PWg0Jl0LOLr7kqX5w06NiOsW/GVmQTkTrTe7LOCiHfwdb8ESxhldT3pLYvsJugj3jB2D9LJeGhXNNLSooHO/OvBNfTr8davK+7l72FT5Z+UuznkxMSAQGRlKN6gy1F3O7dJ8OSYgNi5JCZJRKFbryFgNX3InuER0cboAr0NdMLqwl2FZ0iuyAMB5oc5pFifXCZAaqa/UkHm0jwCqlB9y10QgPUjvXZEe3yh4JrzbSXkiIisPc25+mCue/1yzLgtQY7C1p/aHs/QKKOryFOk0cZfzGczsXAgVPmq05AuuGq2DK3ywdcQ7eqnzWoAlYf+dbGBPTDQ8v/xZP//lxkysR6zRa3Dl9jksTZV2BO13vnzxH+iTTkJ4JSeiT0M0x8sUV6Gu8u+jZomdMAmYNHH1aBYmTxkujwuAED3RLiKT7jZeOnDoKhdLpehmfHxsWDZ3WTQppHwzr3h/f3fmSKN//RmRBag6FDkGdxsB99DyxpQUFiHkVJ8JmSAhTTRpU+x6GPd21ffB5BF1scCR+uO5JvDbiCnyxYyUu/PQxVJy4Bh3BQ3X7J/XGmTJjOp0bBiX1lT6d2xjbeLsBfhZxoRHSzqAuGHXKPNwcerZwd3NHn87dxdJW7DmcDnjSpq+HCt2jteTRhMHbvad05FRRwGypRG2tY2pGa1CQB5IYHodusR2lkPYD56UL+g7BQ5OvkEL+XciC1AI8m12h0oktLVSj/oDdn41y4zmfhUlhqoDt4Buw7biPqoWuNcNwbfnmCy/D7gc/QrRvMO79/nXklZ28W6Svuzf+O+2a01qzZdRKFf475Qooz4OmBL1ej+GPXoM/1y8WRrKt4InOTnWqN4DTN9iHd7Q9S5AR7BndERN7DDxtgxs4adx1QFiAD1TKCLpk2+SlOlMqDOY8ZBebWi1I3Pc6Y9A4DOjYXQppX7Ao3TLtynYbv9OJLEithffR8eoA5aDPSZxeIiviRbJ0cgkQJslmhqJoJWzrLgeqjjhKo5OwEAb7BeGLKx7GQ2PnYMKnT+BwfvpxRo837Zs9eppru8k6gY+HF667cLb06dxm3poFKKooxS1zX8EN7z4FfRssbsrClltSCD0vw+Tss6YsxM8x9ix3rkeHRmJYt/7gjeBOF/zLPERboTh1v95uNyC/bB4yC99BRa0ZK/dXt2oeEjdx9wyLw/AubeWhnR50Wh1+fvhN0b/8b0IWJGfh9uroKVCNWwl7/H+ohHFTCxcyx+F6bDY7lHWpsG6+EfbMnyjEeVFiVCRM3eK6YvcDHyI1PwPL9qyFtcGqDn4e3rhl5JTT1pfEtbUrh46jeKikkHMXTrePVv1JwmGCzWrD3zvWoN+Dl2PF9rUwn8L24ln52UjJSnX5Gfi6e2J8Uj/p09njgqS+GBp3aiMGm4LLh94E5JVUU1rnUIhr5YGpNR7B0YLXkVu2BN8uLcIN72Uir7qVHhKVpyHd+qJfpx5SQPvF080dX9/19FntXzzTyILkKio3qBLvhGrMEigC+sCm4AUajxcmMQrPXAHFwRdh23oHYK6mcujapDWepDm572iM7zUC2w8lC8FjPHRuGD9wlGgXPx0o6d/VYy6RPp3bPPTFm8g8Yb5PSVU55vzfE5jy/B3Izs8Rg0icacozGg146qcPsSPzkFgJw3kUYrIxj9Y723ShOMwccSE0p6HywRWbilor9mYbYLLko8rF5YMs1gryRt/FoewjuPndDHyyphhVda2sTJDQRvsGYURSfyFM5wJJsV3x/vUPnRfr1LUGWZBOFY0vFEO+REXSx7AH9odC7SlEqV6Y2ERZrQooS9fBuvFq2AvXUqBrE1MZXiZlUFIfmOsXZKULJUR2QFxA2LGLtiHdYxMQFxEjfTp3KSkrxsq9W2BubMNFeki7M1Iw6NGrcfe7z2HH4WSUVJajzqhvVJx4zlkdCVFKxiHc8sEzWLR7A/2GK2LEcgREh4RDSxWL9sD4Hv1xIfcltbGXxD9Xa7ZiQ6oeOw5mwGROpiRzvhyYrY6tJeatLBfLBTkTTRWZuxvGXoIJfYdJIe0fbrqfMnQ8bhg5+bSU7/aGLEhtAGeToNjeUA+eC3vvN2D3iCOhckxwqy8wVpsCqrqjsO+8C7YDr1DJooLlwm609TQcFhri7YfHLr722MXaCK7VvnjZrdKnc5vX5n1B3lAzW9KTnlhsVvyxbz0ufPlu9Ll/Fh796m1s2rcdB7OPIrukALllRUjNyxRNfDe/+wSGP3UTFu7Z6Kh1uKJH9Lh4pemL+o+UAs4+YUHhmDRoDLy0PGJQCmwjuP8ordCIn7aUkqAfRq3B+fUgtSoe/MH9q2qn7DML7MSegzCHl906x9Co1Xhg1n/QITiizZ9Je0MWpDZGGTIMqgvmQ9HjRcC3JxRaX3BrGr+4Cc9uJ28p9yfY1l8Fe+5i2LkZ7xThtbj6J/YVI/LashbVLToBA7qd/b6NUyUtJx0rD22HiVfTaEk4bHbR9GY0m/DDxiW46M0HMfLpG9D/4Tno++BlGPrEtbjig6exdN82qnFTWrvWAvsPvP3BVaNdWyz3dDFr6AQ8fNE1bT4XhnMmNzXnFFmRkp5DFYA0x4FWwnspGS05VJZs5ClJga2BykS4bxCmDxmPwIDTt0ng6cTP0wfzHnodEX4hbV7xbE/IgnSaUISNgmr4t7B3fQxWz06waQKoXNjFyg/c2qY0ZEJx8FFg33OwVx2iknpq2w/wlsj/GT0NtjZ6ojz898ELL3et5t+O4CWYHvvxA2SVFnBtQAptJZI4keWE3WIVL34vwlxsomsI99WMpVo7D5Rpb1w1agpmDRwDNe+m2ob2j21prd6G/NJKEpgSyl6tS0de1buw4nccynkHmYXV2Jxa07pHQBd0U2tx5+TLMWPIWCnw3CSKPKTX59wJb3dPIbLnI7IgnWYUURdCNfJXoPuTsAcNB3ThwlvilLebeTuLpbBvuwv27Hmw611fAdlN54benXtA20YjctypdtyfvCNutjuXSU5LQWpuRrvUVV9Pb9w9qX0Op/emCs6dU+ZgbBKvc9d2gxw4O1XWWZFfYSXnsgwmc7F0pHnMlnLUmbZj3a5y3PdxNo4UG6QjzUDX4hVGbhxzMW4eN0MKPHfh/qRR/Ybi7gmzxPvzsflOFqQzhDJsLFQDP4S9xzOwBQ6F3b0TrEoPqnHbobQUQJH5Kuy7HweK11PpO3llhtbQITwGIzr1drQPngpUq5w9dAICz/FVvW1WK95bMg85ZcVi35j2BC+QO33gaIQEubDZ4hkiPrIDHrv0PxjZqYeYn9QWSchrIlYYLEjOMSG/OBV6455WDW7Qm3g+nw3L9lQjt9pMBrkFa0yHtVSpumr4JDx52c1UJs79aQsM39N1Ey7F+O4DWaGk0PMHWZDOMIqgIVAO/AjW3m9DEX8TrH4DYVOR4deTMOm3O4aHp34Me+lWKoDOjUIK9QvEreMvJT06tcLHTRwPXXL9Kf/O2WbVnk3Ymba/1c1CZwwyyiM698YrV98nBbRfEuO64KnLb8PortKK4KdYKxcON702HKjFT2uyUVG3BQYzz0tqmhrDAZRVL8XK3UXYX2hoOQp0Ee7/umbEFDxNcVeeZ0Om2bN+7oo70TUsVmzyeT4hC9JZQu0TA1Xnm6Ac8CHQ+U5YA8fArusGu1INlHwF+7bbYM/4HqhOl77ROuKjYtE3uqPrw3apME/uPRR+3uf+MvgfL/8d2ZUlbdLf02ZQ+vaMSsCzs28VhvlcoHt8Ip6bcwem9Bwiljk61Xjzigrleis2HDYhJf0QeUk70NQOskZzISpqf8bOw2l4a34Bquh7QtSagCcn+3l44bbxs/DS1ffAze3srRF4OukQHo3Xr7oHcYFhor/3fEEWpLOMQqmBMmY2lP3fAXq+CGWnW2BzH02l1gOK7Ndh3/MYcPRLlOUdkr7RPFEBIbh08FiXa052yhH/GTcDuuY2gzoXsNvENuSDYrqK9vbTsfqAU9DlOQ7947riNTKUXRNOYTO2s0Dn2I548eq7ceeky+ChdTvl9NRQ/qyosiK3WA+LPR9W2/F9QjabEXXGFFTW/oiDWZn4aFEpymqaESM6wJPDe0TG49GZN+Gxy245L5u0GtK/a0/cM2mONPDkLOfvNkIWpHYCZyeFdzwUHW+Gsu+bUHR9ADb/WVBovVGV/BGqtzwOa/r3sNedvMhqQ1SUOXvEJyHSO8D5pWzo/K6h0eRldTj3M7hCiasvmIZ3bnwY/xl7CRLpvsRqFmfjvth408OY1mcYXr/2PvTt2ks6cG4RHhxBhv5WYfCHJXR3LLbrojDxY6g2WlFWZ4PNWgWDaS8J0A7UmdbT3zWoMc5HZuFn2LBvE975Ix97cvSi4bWxq7E4skhe3GcEXqP0vX7c+bGySEuoVGpMGDAKlw4cK0aEnqrn2h5QPUNI72XaC7xenm9XKEJHAUHDUKvtjLBA8lh4eHjFXljK98FoU0PjFSF94Xh8PTxRVV2JLRkpTi1nYycD8/Jld6BnfBfhVZwJ/tiyCqn5WU7383Ane8/YzpjYZ6gU0jgBvv4Y02swuoTHwN/TCxmF+ai1Gps0bm2JqBColQj19sNt5Fk8NftmRIVGOg46wdGCHCzfswlV+lr6USmwlXA/4D1TrxRbm7QV/Tt2w8CEJPh4eCMtPwc1FvJu2ENxIm48uEFvsqPKYIOnto7u6zBSc7dg15E1SD66EZsPJ2PZ7jL8tLYKyTkGIWDH1SXoPU9x4N17x3TpgxsnXIr7plyFDpGx0gltQ3peBv7csQ6WButHtgZ+9t2jEjC53wgRx9MFr3fXt0NXHMg4gszKIocwuQj3G59tZEFq76jd4R7YEYrgYVAEDoLdXAaluRR6swVuCptjRB4v8Mp9TxI8EocFZfnujdBbzA7LW1+im3wpERcQjEdn3wIvErQzxa+bViC1IMtR0240Xo2/2NvpFtURk1q5DEx0SARG9xyEyKAwhPv4w53uN6eiRIiwMBeul+OTod/kJtOOAWGY3n8UricP7cbxM6HV6qQTnCMtPxuLd29AjUlambyR9Gjqxcsc3Tf96jYVJMaf0nB4Ul+x42qIpw+MBgOK9VUOoW9lWvL0q7wyMw7nGnAkrxpr91VgZbIeGw8asGKvHpsO16JMbyVPoMEakfSG01ZJFn9CtwG4eMAY3E/3N5oqHTqda+nbHEdz0/Hr1lWw8fUbpGtLL/bakiLiMKXfyNMqSAyX1/iwSOxJP4TCmgoRhRPj05rXQxeffUFS2NtyUxiZM4bNWAKlvpCMnxvgxis0UKZXkTDxX6KorBiv//IZ/qKadWvmJpltVjww+XJcPW4mdNozt1vlfXNfw6rkrVSxc27JA6vdisuGX4inXFnaiIz0oaw0bEjdi8zCXCzYvg45VcUUB/LTqIbJA5wVwr2hotFS6aCCzKcKQ0xJT6YTnXzDceHgURiV2BeDu/aCxkUhqmfdgZ14cd4nyCktJPHkeLUerVqDDa98LbYzOF3YrBZsO7yXvJp92EhxXXVopzDIjrSkNGET00w6Wqx2mOnFXhPbbv4O/+XPPA/Oyl/mYyT0niotZg0ehx7kxY9O7OeSx+kM66lSd98374qVO5zBZLNgxsDReOHKu8RKKmeChVtW4e0F3yGPKlqubEmT/O5v0ruzhyxI5wN2C1kF8oRYnCSDZSejm0HG9nB+Vqtqx1YSpAEdk+Dv5Vf/E2eE5IzDKKmqgLPZkAUphrydrlGnthU2G9P1KXtwOC8DpRWlyC7OFyuCpxRko9pQy73vjrixWNH5ImkkQ8nNIxqFCgkUj85hMYiPjEUoeZmJYXEY0q2POK8tKK2uwMGcdLGgKy+u6wxs1Ed170cG/swM4T+am4kNR/Ygv6QQGQU52JuViiOUD+1qpaPSQenIceK0O/GJc5raKJTDhRjRPx15/oPjE8kDiEZkSKTYN2pcj0HwOEM77JZWliGZKi/saToDl6eowBAkUv483R5SPbwT8gGKa3FNpUuCNLbXIOnd2UMWJBkZCbvVitKqcrElRXY5LwBah1qDHnWGOpgsJmGUuLCwwHvo3OFOL08yjGE+fojwC0JYQAgU58kEzFOG0qqIauqZJQUopPQsq6pEBQlrXnEB9melo8pqoPTVi32ouHnZTaOllw5xgaFIIK8nwC8AflQ58vf2QafgCIT6B8HL01v6cZnzFVmQZGRaCxcVh4skPso4CXlIVTXVyC8rhYG8epPFTLplFZ4Qr2jNQh/g4Y1AEqHzdf6QTPPIgiQjIyMj0y44M42bMjIyMjIyLSALkoyMjIxMu0AWJBkZGRmZdoEsSDIyMjIy7QJZkGRkZGRk2gWyIMnIyMjItAtkQZKRkZGRaRfIgiQjIyMj0y6QJ8bKyJznWG02sewRL9GjcnJdNTYPYt2+NoB/i+Mill+ieLTV78q0DK8jyJaenwHnA7GeYDtEFiQZmXYOG3FerNMZeKtxNvjLtq3CdR8+L1Yy75eQhL+f/EA6o3mKyouxfs8W5BTnoWN4B4zoPRjeXqe2ltyGAzsx49X7AZUCVw6/EG/d8LB0xHV4nyKzxYxafa1IJ61aK7ZjYOFt7Z5eZqvln8VTNSp1q7/XFPysOF6tFVxeMJfjezoF+sEv3sAPaxfCDBtev/wOXDHmYmg07W9XaFmQZGTaOb9uXIYX5n1MhtPaqpotG8Sf73sViR0645kv38JHq+YLg3fRwDH46PanpLOa5+VfPsXbf38natQhnr744p4XMbBzD+mo85jNJnyz4k88/NN7UNkVuGnsJXjx6nuko87D8aqoqcJ7v3+B91f+IQS3nqiAYDw98yZMGzZBGPuWeGDuq/hu7SJYYMW8+1/D6F5DpCPOU1NXgw///h4frfgDnjpefb95eD2/S/oMw2Nz7oD3aVw89pKX78aGQ3vEVilf3foUJg0YfcrCezpofzGSkZE5jgOZqcipKkVRZRkKKkrpVYKC8gYvEXbsVVxdAbXaser4qsP7xF+dRospPVu5vQB5CxXVlf9sDzGqa2/EBIZKn1yjsLIcv+9YQ86RAl5ad8SFnNo+Rqt3bUSf+2bj/1b8JpqjeJ8oNYsPCVM2eXcv//EV8ovypLObJjMnCwcyUmFV2MX2/24Ut1Nhf3Y6Pl7xO6qNtQ2eScNndfzzKqmtEk1pp3OLilJKjzqDtAU8pX9oYFi7FCNGFiQZmfYMWSsPnQ6h3gEI8w1EuF8QvN08xQrZ9QR5+Ypj9a9w3yBEBIXDarUhvTBHnMMb9Y3oOVC8bxEyVr0SkpAQHIkB8Ym4afJlCAsMkQ66RhV5Dnszj4imsZiAEAyJ7yodcZ6conxc+/7TqDPpwbvThtM9T+w9DJeNnIy+CYkI8fZDkLcvvNxb3vl4fWoy0ksLRHq6K9TwO8VmSYvN4tiSxNvxLEJ9A+ChOeYpeZLghVHYP8/KPwj9O/UQFYbTRW5JAWr1vE08ia5CJbaeb6/ITXYyMu0dKqJWq4Vqt0ooVSq88dsXeHfhDzBYjCRU/vj1v2+jc1QH2KxWOtVR02dSs9Mw7IkbRFgkeTi73p4nwmvF/k4WeOncoHHBEIoBEtx02KD5kA2eieLo5eYODYnfiWw+uAcXvX4vxdGGQR2S8OltTyE8JFw6SrdIv8lb8/E98u821zA546V7seHgLnF+AnlaS57+CD4kQPXkFeQisygXQ1ohwE9+/x4+XkLpolSgb0RHfHL3c4gJjZCOuoh4Xrz1ugp1tTV45Jv/4Yety+i+gP9Ovhp3TbkCOkp7sUMxbHTesfTi79XQ8+H+MPb4fLgZr7nEIBp+x0Org9sJTYXfkcf2wi+foVRfg94xnfHdA68imESRvSajxUz5gJ5ZO+lPkj0kGZn2DhloFRl5FiOGN70zWk1kzIBh5MEEkIfE8PF6MWJW79ki/nLzTMfQKFTWVmEbCcPbv87FA5+9im+W/44c8g5OpLiqHKuTt+CPDYuxNy0FFhKaeg5kHMHCrauwdu9WIZKlVWXYsH8H3pj3Ce757BXMW/M3cih+x2NHOf1m/cABH/JC6sWIByQcIM9p8fa1+HPjciTT9cxmszjWFLsyUoQYcfPTdPKMGooRExEW2SoxYorLS8UgC47b8MSeCPD2kY6cAuJ50XOgv47muiIOFP1ZHSJioePdbumZiOcliVFVbTVSqAKxYNNyPPLVO7jz05fw1OfviOeQU1IozjkRTrvUvExKt6V46uu3ceeHL+DD+d9jd9p+VOtrpbOAvXkZqCDBsov0GgoLpe+2Q8l457e5uPuzl/HDqj+R0YrmzTOB7CHJyJxj3PC/J7Bg93rRd/L41Gtwy5Qr4eF+ct/H5Gdvw3YyTjzibkqvoaI56sv1i4QBVtiobk41777RnTD3zucQHXLMK3j7z6/xyl9fwkK/P7vXCLxwzT0I9AsSx6Y+fzu2ZqYg1jcEL151N75f+QcW7t9OToFNNJ9xp3nn0BgsfeojeHo4mswMRgM+W/gjnp3/BZllMor9R+GzO56Fhby0JdvW4Okf30dGDQkWmaKbh0/BI7P+Az9vP/HdE+EN/RJunSK8PBakCd0H4P3bn3Z4Ek5iIg/hpvefwaJ9m+mTAi/NuBnXTZrVpt7Cn1tW4qGv3kIleSceKh0+u+u5k7YKzyjMxRdLfsanK/+EiVwEleQScVpSoiApogPm3v4MEiJjRThTQ7/305pF+L8F3yBXX8WaL77FoqOwWPHmtQ/i6jHTxbnXU375m/KLivIBe2gpuan4Y/cGWLnvTTwzBWIDwrD9zR/F+WcT2UOSkTmHqKgso9pvjWiG4xp4dGgk3N0aGc1Fxw9QjZvhppzVh3fjq42LER8UhgQyPmzAlGTs9mSl4r1Fxxsibn7jJjQ2VtFB4fB28xLhBhIBvcFAP2gXTXPXvvskFuzZjITAMMT4kmDR7ynoGDeXbUvZJb7DGMwmpBZkizjxCLuYYBI/er9mzya8TLX0DPKyfDVumJQ4ANeMn9mkGDFKMqrRASHi3jkNluzdRh7fZziSk05HKcJOkFdaiPLqSvE1hZKMMhn8tm66yi0rQqWhFtwg2Sk4EqFex99bTlEBbvvoBXzAIwUp/XpHJmBU174YndQfHUj06eFhPz3HR7/5P+kbJKSUnh8v/Bn//eUD5FL8PaBBj7AO6B/bBZFe/qRoSlTRNZlqOl5eXU7v7NBR2r2+8Bv8tnU14ikPxPkGi2esoGtkleSL8882siDJyJxD5JHhqKxx1Ih5KHeQX6DwFE6kvLoCJquj6YubtyprqzG193B8cOMjeOf6B9E1IpZ/QliAoooycR5TV1eDitpKYez5d8NCwqCVBG/H4X2orKsmsbJjPwkAN+VdPmwiPr31Sbx19X3CE2PYC6quozhKVNBvrjywUzRZRZGYDOvUA9sPJ+NFEqODpXnw1bnj5tEX47M7n0FSdLz0raZ5hjwoT62bqNnz3b234ndc99Zj+GXdYpSSYLeWo/k5YuQi/4qKEsKzFYMgnIW3bGdPh9Oze2w8IgODpSMEif7T33+I7an7RVpf1GcEfn3oLfz88Jv48cHX8fylN4vTOH5Hi7PEexbyrYf34vX5X0NptsGX4nzr+Evx032vYuGT7+Nl8lovHTAOPeO6iNO3HNrjaPKjh11nMoo5V7MGjcNHNz+Gt6+5Hx71/U30u+0BWZBkZM4hDuVlI7+8RBgprUrdZFNVZkGOEAaGByBM7jMUn9/1LPol9UGfjt0xoWsfIUjczMajwuopqSpHQWmRsE+8moKvh8M7Ylak7EAhHedf5ea1WUMn4v9ufhzdE5Iwqt/wf4SR/zYcLKE36lFUUyG+E+wXABsZxae+fx978jMQ5O6NW8dcgrunXwOPVgrCmH4jcMuk2ejEQ8fJs+GrHinLwx1zX8GbJHJFlD6tYX9RNvLIO+Pvs+fi3yAtK2sqUUZiVUZi/c+LPjvTw6EnIS6j9GIB52HdAd7+8GqQnilZh7E7c79oQuWBBc9efRd8fRz9YSUVJUgrdvQdcbLGkBfKlJHH88nfP8BKro1WrcYl/Ubh0ctvQXAweVNKNS4ccAE+uO0JjEjqK87fmnEY+ewhUbQ5/WeSGL1166Po1bkHRvQdCu1pHN3nCrIgycicQ6QU5aC4lrwPslK9IhPE8ObGSMk8/I/xdKdaMNecIXkw1YZapBRkC+FwU2nRIfTYnKDcsmKkF+UJEQvzCkBYwLEa/eHcDBjJ6+JfHdihK1675t5/REhv0Iu/DIfFhEZJn4DSilJY6TQ+82hhLl7642tsI2Mc7umHuyfMxl1Tr4J7I31gzfHIzBvx6tX34OL+Fwhjy/fKhn/u6gV4f8F30lnNw8JltFmEpzUqsQ9CfPxF+KaUXXj917l48ccP8dJPH/3zeuXnT1DHw6dbSWkli3uhiBunSUhQCDTaYwLw0/qlYs4YVwp4aPgvm5fjy+W/49NFP+PZ79/Dk799BDsJrq+HN+6ePEd8J4uezcKUbeI7Ub5BuGzIeBHeFDml+TDbreKZ9Y3thBeuvAtuGp04xiMAeYRee0IWJBmZcwg2oqIJiCzS2O79yYgGSEeOZ+ORfVQjtglDOLxLH4Rzv41EjdGILRmHxLFw/0CM6NJLOgJklBYgg0eF0bG+HbogvsEE1vqRW3z9m8ZcJISunnz6Hhs9hkf1xYc7OuD1fC2KCzdPaUgQuZlvP4kRf+bmpn5UU3fzOOahOcOInoPw4a1P4u6pVyKcvA+G4/DXzvWoqqoUn5vEYkVJOXk8nJZkBYck9kaQn+M33pj/NT5cOx9fbl2GL7Yu/ef1+YZFTnlI2STuqeSpspHle/fzajCCj35nZ+YRGCxm8b64rgLP//UFHv75PTz2ywf4YdMKJJGoT+szDA/NuAEX9B4iRjWm5aSTsHP/GRBMz65/0rFndxKUxjW19MzoXL7Ha0dNhX+DeVY5xfn4Z0kqri20A2RBkpE5R6itqRLNRtz0wk1AnaIT4KZtZEADsfnoQXEe9+vcPPZiKdQBr/vGnd7ctxTiG4iBnbpLR6hWX1UultBhA9U9tjPCeQABUVxWROJiEAZZqSLBieog5tnUc5S8J2ElCa6B18+FqdLX4M9tq4W9C/D0xvUXTMU08moU9BuHCrPx+5aVMJkM4lxX4OHVT8y+BXOGTRCeDltfBcUjt4VO+v1ZqcgoyhXncsd+oC8Lu8Mqj0zsiysHjceVA49/3Tv5Cnh5HmtyawleXSOTXjxgItzDH5G+x7zNWkqXOoPD2+LRb1cNm4zbR8/A3eMuw8NTr8UrV9+L1669D+/95zH8Z/xMcR6vj5fHw/R5wAlZbtHcJnm9jVFYWoTqOnrOfD6ld0xYjBgUUs+RrDT6KcdQfD/PNhju3gbIgiQjc46wK/0g0kTfEKCmohvITUwOG3ocJpMJJVLnPg986Nv5mOCwaGQV5gjPgJt9xMoEKsfcJRMJDhsxHu3Fw8IDfI6NCMsuzHPM9ifcVJqT1l3bTgLomBsEdObhyUIcgDqjHmlk+FnIvN08MGvQGMwePoGizfNyFFiRvBnrDuwU554KcUH1k2zpd+me/Ztoyqxnd/YRHOZmS/rnoXKDTwODfM/0q/DOjf896cXC5wzcZGexW4RO94/vik5h0dIR8jal5jKWcF5F45k5t+Ppy2+na9yMhy65HjdNmInB3QbAo0GfE4tHHVcKxCeFELLmyCzORVl1ufCEeci59wliuunIfpgtFpGH+kY7BkGcbWRBkpE5R9idnYasimJh7BMCQuHXwFg15FDGITHUmwkg0fJscB7P6F+1z9EHwSsBRP1jyIE0EqrdUlOep8b9nwm3THL2URRXVQjPjCfZeuqO7/NZlbJbXJOXppk9eJwUStcjb4z7MNjqudN3IkMi0TWyA4Z0SBSimFFeiOV7tsDawmRYo8GAl+d9inmrF0ohx+BmrK/XLhTeDhtXbw9vhDTo+2qMrOJ81Jj1wovsF9cZIccJGIkar/pN3lfDlzMYDXrkkRCLx0Dp2SU2ASFBx+L0z1pyFGWeD8SDKBqFjtXDz4U9HYZFyUBiD9OxdDtKAvv9mr/FX2Y/ea25PMCDvjcoLhHBJ4j09pxUMdeMmTFotPh7tpEFSUbmHKGgrFgM5WYj2iu6IwKb8ALm71wHi9Q30Cvq+GHUNVTDXsIrONBvBJJXMKDBmnJphbnYS8LD3kxieCzipJFdzL7cdFQauQ/Jjil9hh83+o4nq2ZLKz6woR0nLeLK4VkF5B2xx0VCweu1eZJnFRscjkl9R4imLBbGdfu2Y1vafvGdpsgqyMIHi3/Ek9+/j3s+eRn/++sbfLT4Z7xEIsUTT7dzvxRdw9fNCw9efI0QlObgtfVE/xH9SySPLrBh/04bcJTEaFc6iTu9V1J6csWgIcF+gdBpHYML+Jm+9MtnWLdnMw5nHMFB+t6iLSvx6m+f45Gv3hbnMGq6p3C/EChU9KukdEfysvDIt//DJ0t+EZOZH/jyTcyn7wlhJjJKClFlIo+KEnlUt74IEc2SDtjb4hUk+P6Zkb0GiL9nG1mQZGTOBciA8NwiHnXFr+jQiCYXyfxr1waHIJE4DD9hywjuU8ivKRO1ZnetG7qGxUhHSPDKi6GHVRjqiIBARPgHOg6QzcrhPhmunatVos/JXecwpkwhCWU5z42ieLEgBUrf4+ag9LwMcS1+ebhJXhWd04c8pGhPOo/7kkpysHb/drrOMW/gRCprSUAoDUottfhxy1JhwF/8+WO88/e3WJ+2T1zbnQTv9Wvuw+T+o6RvNU5NbTVKKkodppjuJzQwFF7ujXubrpJKQrwj84jwKD0UWgR4HC94ChKXC3sNgZoki9N73pYV+O837+Cez1/FPXNfpff/w+t/fY0luzdJ3+CoqtCrM6W9Skd5QIlSfTU+X/MXXqB0eOm3uVh/dC8SwqMRFxoJHlpfUFbkeGb0vbgInvR7bITfodRDqOIBD5RuOo0Ovg284bOJLEgyMucAJosJQd5+Yih277A4sTfRiYto1hOi80ZMUBi6hkZheLfja75KMsM8XDiaatp9YzojPipOOgIyyh4I9vBFUnAURiT1gX99jZpq3CG+/mLF8YHhHREtRuxx3d9BWVUZOoZFi7kyVw0dT4bTsdoB176t5B3xatw9IzuKTfnq6UWe2R0XXiZWeeB78lSzwB37zRPpFNsRr1x1D2b0Go5Ad2/x20a7FTq6VieKzz1jL8XcO5/HxUOPNRc2Ba904E/eYRjdT5/wOPShuNSvE9hW+Lq5oUtIhFj89uJBF6BvI6ubXz3mIjx/2c0YmdBd3P+R0nzy9I5gV1aaEJFrB4/Dm9c/KJ1NkKh3ju6A/7vxv5iY1M/RbErPhie79o5OwEPjZ+OqC6aRCDoWHwqk/BLi5YdRHbrR8zk2DJ/hof9xFL9o8cwmtpv5SOTdSf6djIxMu4WbWHJKC8XKAh5kPLgW7OHW+HDplIxUGGwWaKgW3SWyw3HL4RhMRqRwsxz98ycPqwPVqOsppt/OLM6HG9Xeo4PDqdYs1erJRBwtzCEvqBo+ZATjyLg1/M3qumqkF+bBSudF+wchiF4Mx5m3Pigiz86DvLF4MoC8ynU93L/Ev2s2WxAZGHLcnKdGod/PLy1CTnkR6oxGMaydd3j18fBEx5AoeEhr57WEhTw3TsuSmkp4SmnJ/VttCW/Ux3OG6ixm8jaD6MWjFU8WXN64MJvSPJ/Snjfr434ibprjVbvjqFIR0KCZrSHZhbnIrigRC9HywJVA8nDi6T7+SV9KK36WnF+4aTY6JPy4VdhryFNOL8oVfUiRVEHhIeR87bONLEgyMjIyMu0CuclORkZGRqZdIAuSjIyMjEy7QBYkGRkZGZl2gSxIMjIyMjLtAlmQZGRkZGTaBbIgycjIyMi0C2RBkpGRkZFpF8iCJCMjIyPTLpAFSUZGRkamXSALkoyMjIxMu0AWJBkZGRmZdoEsSDIyMjIy7QJZkGRkZGRk2gWyIMnIyMjItAtkQZKRkZGRaRfIgiQjIyMj0y6QBUlGRkZGpl0gC5KMjIyMTLugXW9hbrGYcbQgBwWVZQjy9EWHsCi4ux3bk7+t4eul5WeL68UEhiA6OAJqtVo6KtMc5TVV2JeZigAvbyTQc3LTuUtHnMdmt+FA9lFU1lbDTaNDv45J0pHTj5nywJ6MQzBZLFLI8VisVsSGhCOW8kZ6YS5ySgugUqqko8fDRSs+JAJhASFQKBRSKFBZWYHdOakoq64U4X6e3ugYGoWo4HDpjJMprijFvuw0kSaMt4cX+sR1RoCPv/jsDPklhdiXm46auhpxfU83D8RRPDtFxEpnnB/kFxdif95RVNXVQqVSIyogGD1jO0JDeUqmfdKuBSk5LQUvzfsEe3KPooN/GF6+9j70SugqHW17dh3ZjxfnfUyFNQO9oxPw3NV3o3NkB+loO4Ae1ab9u8iAuKHnGTTSrWHdgZ245aPnMbhDVzwz53bEhEVLR5zHRKJw64fPY3vafkT4B2Px0x9JR04/JVXlmPPGwyiqKoPdZoOVXg0x2624ZfyleODi6/Dizx/jqzV/QaM4XpA0ohKjgMVmxcOT52DOuEsoTCOObU7Zhd/XLcVvu9ai0qIXz9RX7Y5hXXrhhvEzMLL7AHFePSaTkb6zGz9vXoZFO9ahxm4GF1idXYlLB43F5L7DMbbPUCibEMWGsNj+uXklFu9Yi0V7NsOspl+y2aGxKTGoU3fMGTYR43oPgb8LIteuoDRdvG0tft24DAv3bIRZo4DdYkPnoAhMHzAKlw6fhITwGOlkmfZEu26yW39wD1Yf3IWymkpszz+C5PSDlLGs0tG2Z/2h3VhDr/K6Kiw/sgt76Hrtie9W/437PnsVG/ZskkLaD7XGOhTXlqOwokQIyilBdrKgvAQFVaXILSuUAs8MLEDZpYXIJ4+kqq4O7lo36KhGXf9yJ89PqXAUG/aM+HPD4x70uaC8FHmUDkW1Fag11Ilzmd82Lcf9c1/F51sWw2w2Y2xcTwyNTUKFvhZ/79uMu+nZ/kFGtB4reWmLtq7GvZ+/hp92rISRPo+I74kLu/aHu1qHbzYvxd1zX8F7f38PPQlXc5jNJrz662e457OX8UfyRnjRfU3s1B+jO/Ym6aS8f3QvHvr6bXy3cj5MxuZ/qz1jpPv8cNFPeOCr1/Hb3vXw9/DGpIQ+6BEei0PFOXhj0Q947scPkV2cL31Dpj2heoaQ3rcrKqsr8M2q+UgpyoKSNMhKtU0/KoQDqSbp6e4hndV25JMR+mzZr8goK6CLcSXLhhB3Hwzs1ANuutPXTOgMD3/9Fg4UZmJc177ol9hbCm0fpBfl4lcyuDH+IZjUd5hLTUn1sCj8smkZcuiZ+Hl44dZJs6Ujp59agx7frP4LRpMBE/uMwMMzrsd48homkBfCrzHdBmBI114I8PZFiG8ABnbsTvc7XBy7sN8IRPgFIjnzCPQWE/w1nrh9yhxEh0SgkipVl5HnlUsi2z+qEx6ccQP+M+YSjO09mH7LDyVlRThaVYS9Rw+RpzIBOhKM7Yf34umfPkRqRRF6h8fjvulX45aJl2Jqv5FIjElAfkEBUgtzsfbgTozrNhCRgaHkmB1rGqyHPb31+7bige/fhYLEfmrPIbh98hX4D3lu7BHFh8XAZDDgUFke9qYfRo+YjogPd93DPVtwY8/+jCP4z8fPQU+CPz6xPx686DrcMPoi9O/SE0pydtPyMrGfylAIpflgsiX/Buz0TyGqHe2fdttk9/vGpXjix/dgMlvRO7oTDuZlwKa045t7XkbfhOObqz5d8gvyy4tx2dBxSC8uxPqUnaI/yMPNA8OT+mJMz0HSmU3D4vfUTx/ATaVD96gOSMk5SnKtwPf3vYaeHbqIczZQoV6bshtatRZ3T78KGtWx/qVPlsxDflkx/MlQ3T31SgqxY/XuzVhFcdGTkeO2ejcyMsPImE0gA1bPX1tXYWfWYcweNA41VJtetGM96ox6aLVaTO41FAO79oZSqcTrv32O79b+jTy6xsAOXTG0e3/RxNIhIhY2eoS/UXolU2E0kiEMJjEYmdgXRZUl2E4G7sJ+wzGoc09xvUO56XTN1aL/wmK1iD4yLzcvXDNqMqLIcDLpuRn4kWrqvp7emNJnGOau/INLOy7sMwRDyCBz38MnJN7FlWV8m/TbJNoaDa5670kM7ZCEt298GAlR8eK3DtP15tM9llAFgwuFv5cvbhhzEYLIcDeFiYzJpa/dj81HkhHpH4xdb/9CYSas3bsVG8hIj6F7DyYx+G7NQpitZvJMtLiw7wgMprRtCDcjrqVnxn0ISk5/qlhcNngcusZ1ls44mULyjMY+eSPKa6tx15Qr8cjMG6QjLWOk5/bIl2/h122rYLHZ8dJld+KqcdOhVqnw66q/cPuXb0BHeWfBI++gZ6du0rccLNy8Et9vWISRSf0xY8g4kfZv/fElXl/yAxL8QvHc5bdjYv+R0tkO9h05iJs/eQGppbm4ZugkPHvVXaI/6EQ4Pa9640GsOrgbPUlsvr37RYQHh0lHHexJPSDKgL+vP+WXkVTGEnEoJwOLd60j79eACxL7YFf6IeRVlqJfXBdMonM83NxxgMLm71hHaVwtBIH7tkbR8xlG+a+ejMIcfLV2AcK8/DBnxIXwoTzA7Dx6AH/tWIuuoTGYTGLuTfe8Zt92rN6/DcOoIsjldz3FmfOqlvIX57Mp/UeJ7zaGkbzED+d/gxcWfovEkBh8d/cLiIk41jRXSs/2Q/Imi+qqMHPweIzqMVA6AhzISsOSXRtQXFUmKr86jRu6RnbAFSMnc+urQE/p8PrvX1D51+DKEZPw65ZVwpNXU/lkGzGbnsHu9P2Yt2kFbFYrfCgtpg8eg27RCeL7Ww4li2v0o3ND/ULIluwQ1+Pm3B6xnTGLKiINyczPojyxhCozVRQnO9kPLWKCw3EFXduTPD9mV9oBzN+5FoMTuqMbPdtv1vwtztdQeg2lNBzTazBVbnT4fPlvyC4vQqfQaFw0cAzlE0cfLz+zV8hzNpP3/dTlt4mws0m77LG308Pcl5WKIkMNZvYehdvGzcQLlGir0vZgMxmZJDJ2Db2WL1f9iSPkjh/MPoo9mYdRTYa9zmoSRmgVGbFEyvDhoU13GIOul5qbiRqbGdP6jsJ1VGie//VTrMs4gC0pe9AlMk48VAPVIt9b8APMJIwzBo4mMaDMTteoJgP93M8fif6F64ZOho0yz+rdG/Eo1UjTqXbrRslsNJlg0yjw9/Y1ZKDUIqMwLEC/JK/B4cw0lFRV4DDV4KqMdVBq1Vi3dzu+vu8lRAeF442/vhaiwGxIT8H2/DQMiU9ETGgk/tqwHE/89D5KKb0UFhuJgxZ/bF4h+gyOkscX4hcgBGl/xmG88ttnWExGmtvUvXXuqLboKZ1U2EPG4X//eRRhAcHIKsjGuwu/F8ZzBRWgdVkpIo2Gd+ouhOHp79/D1+sXgZQSbgolFu5chw4kZpy5G3be70jdj5d/+RRrD++GzURuJx1TqpXYS8/o5avuabYT/0T4Xlbv3oQPybCt3bcN7vT8dx49CCMJklKrwVYSqtevfxDdYzuJ81ft3YKnvn8fB4uy+cuw87U1Kmw/mIwPb3sSUZRuTcGpzB5yjb7WEUD3zoj7o3vm+z4RKxn9N377Ar9tWw095aP7Jl2JayZcLPIg88fO9eJvfFjkSWLETBp4AXqQUEaHRYnPxVTByiHvhxnetQ/GSfmlId07dUXfTkk4WpyLxXs24sFLb2xUkKr1NVh3ZC/c6XnOImN0ohgxvTomIYkMp0Z3rMM/lQziB4t+QhmJzRISnUOF2bC5q4WwsBjN27AMXy//FVuyD1OZ5b42Sh+VEkt3bcQzs2/BBeR9MVlF+Xh/5S+Icw/AlN5D/xGk3SRm7638FRdEJ2E4eSssSFyZfH/JT1i5axNVrszIKM6HlZOcfnc+VaR8SCiG9ujf6ECSGqoQcJ+RiqLCHmRDMWICqBJz57SrxTPxoYpjPXvTUvAi5dMV5Gmy+HC3gILylDdVTjML8vDoZTeJ81iQ3lv2s+h320dxX0m2iPOJVa1A8BZv+p1DVAHch53kIVspnNMipzgPT112K0LJe91O5eH/Fv6AeCrP3LybWpQjbIaC8mWA1gsaSr9pVBnhe+Pn/8AXb2Bt2l4oLXYhMAa7GRqbAnklhXj6yjtFnJKpwvneil+wfMcGdKTK6YrkLaJiq3LT4u9ta/AuieLwbv2wdv9O/L13A/w0HhjSpTc6uDny/86De/DO39+Jynd7EKR22Yd0kGrVWw7tgZ2M2ICO3dGrc3cEBwRBQRnhy9V/IfOE9l9PHtFFntSK/dtx3/Rr8CXVjN6+5gEeEoWjZFz3kwFvjmQSv430YOwmC/p17Ia+5JUE+QWBdAdzV/yGrJICcd6onoMRFhgs3n9JXgN3WjMHydDzqCwfrScennEDGYBa8b2jlHEm9xiGr+99CXPvfBbjOvdDZlUJlpJhrYfFw260YMmezRhANUA+793rHkSouy/2FWRgY/IOUWP7+NYnkUC1Gzb4l1Mt8b3rHkF3EiSu/b/4+1wx+uriHkPx9T0v4f2bHxejpo6WF8JDrRM1OmYLGSVxnZjO+OiWJ/AlnfvK7DsR4uGDVUd2UeFxpKuKavQ6lQZGsxE7Mg7hpRm34umLbsKgxH7YtH8Hvlq3EN5ad9wz7lL6jRdFZzw3U7Enx/FTkUhxZ/yPaxdibWoyxiUOoGfyPL6hdBiU0AOL9m7CPKrJGVro9zgRN6oUsCgXUGEdSPfO6frc7FsR4+WPHVmHsIVEiTmalYG3fvsKB4uzKa3G4Cu6z2/vfgnhngHYnHsYd3zyUrN9LuzJcbPhUhLj2z94Fv/54BnH66NnMZc8QzZCJ8Le6xeUN2vJaMyma945Zc4/YsQcLMgSghYT2LgQctrVixHDtX0hiPSdYP8gqCifNEb3oGh4ktCUUK2YRwA2RlllOSxk+NiL5ZF59Vjp/FKq4ReW5KO4tBCV5Dnw+xppJJ9arYK3mycZCQX0ej0enn4tnph0LS4fNZW+V4w3yVvYlHkQU5IG4uObn8Cntz6NCV36IiU/Q1TQCood5UbFAk7lk2vlfJ/1iHxJ4R5UuagPZ29XbVeKpukuEXH48NYnMJd+NzE0FrkVxXj6xw+Ex9cYZvL4D5E3piaDzoNhToTzpp+P33FixF0DH5BIrDmyGwOiO+Ptqx/AV2Q/HppwOeVPA95d/D2+Je+WR36KyhbFV0F5I5XS6ePbn8J7Nz+GDgFhKK6pxDfrFqA7e6CU326bcCmlmh2LqayvTdklrsX3600VBi6XIb5++N+ND+PzO57FwLDO5AVW4EWqLFbUVolzF1MFYM1hqgz7huMbqpR+c9/LeGz69bBQMv1JlZ6y8lJxnhhAQ3YrJS+DombFZ7c/jU9vewp9whPI1hRjx5F9ooJ/D+XHGO8gVJjqUEDPmvMV8w55jNyMGx/oaB0527RLQdqbnYZdOWnoERaLQSQQzEX9RiLaJwhHyeM4RMfrE7QeO+WVKd0H4KYJM0UT3dWjp4s2dc5Iu9IPS2c1zv6co9iXn46+kfEYyM2B9FsX9R+JCDJ0aRUF5D2li+upyWW+lDwjN6Ua321YLJrWmC9XL4CKvjS2Wx8EknCya33L5Dn4+YHX8dYND+MCitfQhG6I9gsUtW/ueD0Oyuj9ojrixtEXCc/pyjEXiWY3Nmc7yZvgzuyLB41FRECIOH1wQiIuHTpeGKrMolxkVBYjlGp/D1x0jei/mUa17evHXkKGSkfemlSQiAsoXb64+0UqSM/g0mETMKp7P9F84KF1E+edOBiBjfLLV96FmyZeijsoQ2tIEL4iIeERXRHkST14yXUYSyJ914VzcOvE2Wx5xPe4GTAjLwt7UlNEJeKaMdMxleLETYd30m8F6bzx46ZlKJcKnzNwrbNLVAIennmj8BpmD52AHtEd6aIq1Jkcz2Ph7g3YTemmoadyFeUDbg6aRNd+ZuYteG32HWRQJx/X3HoinF78nDJLCzBv+0r8sWuteP22e62ouFD113GixGLyct9e8B0qzXpM7NIPj8y8CT5U228ICzSjk9KoJYwmMwmSnowFCXwj3kA9YX7+ZMTVoIqzELzGYO+SjQ7TUBAKKkrw7E8fkdA+j5tYeN9/FreQWM/bsFQcr+93sFHt+VKqud9H3sXdU69CMHncP61eJAacBHh449FZN4tmxosHjaFa9u2iIrc/JwOfrvhdfN9Z+D78qXJ368RZuIR+d/qg0Xjk4uvgR+KYTGKX28SABL59TjcWQG0zz7chf5PnumzvNiHON0+aTfllmmgWvJfKUq+4LlQGLKKZzthABLUqLW6j8jVtwCjMGDwWl1HZtFECcysB9/ON7zOUXsPg7+aFGpsRuSTe9XDzujuJ7i10rVnDJ9FvXCA8qCBvP2TQeTmFeeK8/uQx/nj/a/j83hcxnrzKCxL7oktIlLhHvr+yqgpxHsO2r2tYDO6+8DLRHTBz2ETRhMiPvJoqFwaqWPYhO9o5Mk70J+46lExl3QSj0YgtafthozPvmXi548fOMu1OkGopAXdRTddEXgEbn5X7tolO5iNUw9RQrV1BArNx3/Z/5mM0ZGjnnsKwMmz0g8ioW+gJFuprRFhjFBQXYdX2DbBShrKRIVqxd4u4XlpRnmha4xywcd8O0SzH3DH1Snh7eolmtRQSOn6oi6gWxF7FdSQoDNfyRnbrD3fKKM/+9D4ufvkeXPL6A/h951pRu5L04R/sdO2R3foijASmHuFt0L8ac50QVYYFgqmfI8M19QLy3uxk9LmW2Tna0W/DdAyLRv+YTqI2WW+o4kOjMJLS6DcSgzlvPoxpL9yBmz95URSYeoN1HBTPf9rsKT4sWNvZ26R4hFMN1M3d03GI7r0PD0OnePC1uIaaUVaEvMoSjjRe++MLzH79Qcx67QG8Mf8blFJt/khpPvROj+aiSNLvc/+Rm9Q0xf0zPh6OeHA6MKnFOTApbIgiL9fPy0eEMRcNHYPrx8/EnJFTxPeagtOVRYCNxU/3vvbP68c7X8aDM64X+bKeo2R4/++vb5BDtXcfnQduvfByMYjhRLjJl6m1GMTfltCQwLJHSM6CaCZtiqNVpaijZ8zC3xRenD70LPnZ1Asjw17i7owj2ECe83oyUmsP7cH6o/twOD9LOsOBQqlA55h4um9KMynvbsvg5lILRkYlokODARAJkR3QgTx5js0i8jBPQsqLzcGezlCqGCY0+N0LegwQIx65qlBQUiju5UREP6FGJ8SlthkPuCFb0w6gip5JhE8wutI91qOl8jQ8qR80VPnMpzQ2SJVPRkXPvydXggiORxw3PdO1vag8RAQ5mqHVCvYuvSj4eBPLXmy4uy+iAo81Vw/s1kuMzuQyuHL7ZliofCdGJyCJRGbe1hW49NX7MfHZW/Df796Fgr4vKpgNbQi9T6Dyzt5ZPVwp5FNsZEfrbeKYTr3ho3LDj5uXi37B1OxUcS0vKkuTqcLYHmh3grSVFPsPckkVZMgO5GZQzfNbPPvDB3hnwffILMmjcOD3HWupdudwWRvCAwEaUl/DY4PZFLsyD2LZ/q2ieW8feUpvkXHh63FbL4/yUlBteN7WVSisLBfn+5CBG9O1D1RULVlKbvWizStQY6wVGaqf1KnO4vXEl2/htrmvYP6W1Yjx8cNUqjENjO8uMm59vBri4eHhcL9P4OQzj8G1LVEw+ST6XWuDIfHchs3HG/7AQorvTBKFV3//ErmFOegeHotrR01BiK+/6GNp7GJuUucnw6N1hNGn8/j9cfDHBkEGq5leFjISSgRSzTbG2xeR5DX0iIjFTeSh3Dhkomi+cBq6hpY8gmOQiTohKjxYg3M2Nx02vCdlI+nbFGzc4qlGyt52/WsC1VTZUHBaM4Ukum/++RV2UcEOcffCi5ffgYGcB6TjDekZ1UH8Zmp+thRyPDlUsbjmnUfxw6q/hAB5eXghgPIN3+/RvEyU8QCSRuC+1jqLUTxLndQ0eyI8r8hT6yH6WP5qMGUgKjAUH9z2BBY+/j7Vxl/FJKmT/0TvkQ2gmiqDDTFRxDjveZPY1VeUGK6B67R0LiUBC8tx0O80fFTc18pid1zGIfiTO5XlhqnI11eKcymf2xtvmuR4d4+IFv0y2SUne1FWqlB9u3I+Hpz7KpJJiEQYG3iqbHGrRn1LQj3eDZoYLQ3KFp/niLcjrlzWGCE+J/zGiXAKKCieJ5Yf/hanp5ZsFf/+xj1bcAXlh/f//gEqiveorr1xFVWk7NJ1T7wKV6COsx8nFgpi+pCxCCGP+mBJjhj48MOGZagzGXBJnxHw8nRU6s427UqQODPzwIQSQ43ogI0LjkBsUIRoqooKCBUz5PmBlZF3som8JJ5b0ZDGak3NwR2xqVTYa+wmeFDNij2I6ICwf64XTTUfLRUEjs/mAztgJjeXuW7MRaLD/5fta/D6399SIipw+3ie/EiCSHHIJSH7Yj33kZjxv+sfxLNX34tbJ1+OXlyDUVFmPinT0meKesuxd3xPIwksZ0Lu6+LCwZ5aw6aM4qpK7CRjxYVUNPlQTWgxCf2uwqO4Ydwl+O7B1/Ho5bfhpvGXItCLDB9RP7+mHjagDePKTQXRwY6hxeXVlVKogxryQu3SvXETQJi7D4LdvIXxuGrsxXjmmnvx7DX3ic7YR2bfgufofRAJoWucmH4O6p+/uB+zFTmVpdA3yCNLNqzCtW8/ioe/eosqDdKAhWao7yNsDG6X/3z575i/ez3MsOKWCbNxOYk7e8eNMaXPcGEjOG98tfQXKdQBe54v/vwpFu/dhK9XzUdRaRECvAPQITJOPNvVh3bijy0rpLOP8fP6xdh8OFkYqUm9h4hRXY3Bcbq492BY6Lks2bUR+1Mdxpg9MB4EwgNeBnfqDh3llcZTljjhQA+qvbuTAK5L30/5/phY8TNIK8gRZYJHqUmhjv/zwIcG+clClZaTKjYEj1pbT3H8/3auBLzGKw2/kVhCRCRkEZGEyILYEhVr7I2iirZaSnedUjqjpQum2lFKq7W042lVxxTVopaOtTM6VbuxlVZiqT0iCSIJEREx73tuLjcR1Xqmesfzv8+DuLn//5/znW95v+9858+wN5UQKQzYyi6kX96e3oWfFkUFZjV3Uw6Sx86fErFq69rC39igfc4pyz7D7I0rsWbPdvNZgPaKSTqTs07hfG7R7HUjZatyp4Z43VETh3n8GijAHc9MM4TNjvM52VerIPXCIky1ZdySmfgx+RCebNUVk54ZiRd6PokHWyWY4GlQzFaFm7k/P19/+Glvjd+btnI+lmxbQ1uFKbeWRJJ/DzhVQNKm+vpdW+UJ0aNpeywY/q7pMps99C3z75KXp6BRaJTRhUkr5iI541ThlbeGI6nJpvwna9OeyhcvTMCsoeOuPm/xy5MRHVJbw8EkZkwnM2wsNSaCqS+N/wSztH0nj9Hgy+LRDr3M7zS4XAaHPC61G3/2oDMQQ9WmpdqYTVmrBCP8JbDr4softyNXnYQ02CC/avAq44EUMuhXP3sfm3dswcot32Lk3KmGOau8ICNWW+e5nBzjMDSmIN9As8+hjfhD6cw8pc03GZbeEPF4y66mZq3scdHaFeZzdT4q61I2KciI64aEIyIoFAVupbCeMhbDrMQs6YNV83Hf2y/ijbkflFh2/V+gd7OOiAoIpdHnYQ6DRvqZdKSlpWDyqrlYsXMDvt39n6sM91axfMd6fMaAoE4w3wqVyehLY9PuzVjL+1/9Q+e/PWknWXg+OsbGo3oVf1wi6Rq/+O+Yzsw/6VAS1pEJPzF1FP6xfY2oNry9vBFIIibL7ETn2jQoHFlkse98NRtTF89EIpn9/iP7MHXhTIybPx2nzp2Fe6ky6HRXG1OuKgnaTH8q4SGjezqwO/DjtzCLQXHv4X0mOM39Zgn6Thlh2sLlmEoOxEXl1TW2tQl0RzNS8acPJxgZa6N9/Bcfmj0LNTAM6/KI+a5nBU+jW+lZGdikPThic+IOzNQeU/71SqdSeUp2BmaumodU6tlF6vp4ZqKnSbJUFlWH5PWkzlYW7cBxeZZxN4eqxyz4CPMY4A+SmC3kWr00a7I5ZxjA9QpnRin0bt4JdRj4c0lcPqKNHzh6UKkbFn63zDQEqMPvxYQ+NyQavxYihxcL8vEpA8Lxk8nI59qOmT8DqWfPgNQR4cG2sttB+kLNsEzpUgio4mfa3ud9u7SwLK3f3MRYb4D+cQmozGz58w2rzBEHEda6NSNKlOfvgV9ew7gN2ENG8K9921GOQmpcMwrVS2hPjY9ugh2H9+Jo9mnsP/aT6SbLo8GLlasbzRHaaxH7vFH30Z6Uw/j3wV3wuFIascFRJdb+W0Y2xveH9+Pg2VTsTz5Ip+JnFm9Qh54YSYVnAk722ZxBx5ZlCN5eXih7xRWp5zIxeOZEVFow3XRMpWeeRYFrAQPDeeTTANyo5BrbZd6luBPQ2DUnx7HXYwanttg1STvQ4bUBGMNMI75xS4zp/QcMmjURX/+wBVsPJtLpXTY15Gpkf6ez+Eyyr9Jkj77qVKQeT1+9GIu3fmfueSIj3bSzKnAcTTuOuDoN+dQr5vnFx+Rayg3tGjdHh80N8c+k7Rg+ZyrGf/UpzuacMwdK3cjajLwZfCp4eCC+flOsTtyGORtXmQ5IOcYjZLp6Zc3T7e41NfcbQR1Dmr99v0zQ+haXiQKsXYb20lEkjTohpjmSlh7GnPV69jZ9Eccz0vgtF7z76AvwUGfmDWDTm/wipajiSNGbJOhEFJxT+fNYBmRlrkXcBPUkPKAGPh820ZS2Frw0Ed3fHEJnexpvMih5fv2lGbuCili9Gmr+SjZs36OKDKqFV3s9hVc+nYQf0o9hwlezzNqJZZ/JzjLt5eqGnPHcaGY64cVjRhHUIUFY+PJ7ePDtYaaD7c/zP4KnuwfFUmD2E7LUEKK9Ef8QPBDX3lyj+Rs5OMjWjig6Me0vzl63HHM3LMe6fdvM43UuR7Ie1rUvogtfbyXyVo0ZXwoz1hFfTMM7zFKymFGLJKnFWs8oWt2wbfzPJOFZ9v0mozd6e8ZlJvqvdOnHcd9YbyICa+Ljga+j/+QRpk391c+nwYPB8fzFCzibq4zLxTQT2M8C1goMxjPte2DUvGlYxIxhw/7dZj9WwVMy6R7dDE936W2yFo3RrpOO45V9SUb63A6Vy/V/m1+6Jjtd5+5aFvNJGlfTlpWlJjOYa89z5D394FPoR7rVj8OM9SvwCQPjctp1bl6eke1lZlYXOC75EMH+bEebEK7ZBP92GGv3lh0xZfU8JJ44YnR3oJqffoMXDdwqnOZNDTIMMayyFGDPJm3R+a74Eh1WVPVQeLuVQYSPP4K9/U1Z4zKVO7JqIFrUiSV7qlYY7blIDALRdAgtoxqiduFBTTsucYFT006goosretEAO8W24sJc/zyxJx8qTSSfF8F7BFYJMA5BP7uS3cQG10a/Dj3o7K+1mWpvpA0D2elTaTjBoORJ5/dE23sxoFMv+JK9hTHw+fv4wcujEi7RSPzcyqEtFTCEY7UzlXw6+XBvP7SKaoyoGmHGICJpbEkHDxhHJEW+jw6hWtUAU3ZpUaseQrx8EBkQhL6tu2LA3ffj0PFD2Jd6HB1570a1okzXkA8ZptrmT+dko1FgKMY/NhQtw+ujZiVvU7IMEXOkApfnOJqERiC+QbMipTydP9GbCsqTze1lhlme41Bwfu6ePggoXxExdFQNwuqiPJU8kmvVoV4sLuTmkpmmGhZ6Fxn/672fRQLH/nOs8zLlEs6MokVYNOLqxmhIKLjEbISybRXVCFGF541kbC4Mgn6lKcPopqjhX93IMKZmHcQEhZlOPrPf6OqChKgYjOs7BM3qNL5W+igGlY1dGFxjQsLQPKI+HVZI4W+KooBzqUrHFcu1aVozEvUpy2h+1/FPXcqyIQOF9pXE+it7eJrMIqRSFaSkn0JmXo4J8o1CwzGs88N4vvtjphHHDs2jGvWkfYM4RHgHIJM6kcJMO4/OJqpaEB5v3RmjHx6Eprx/8XJrceheeiFst5hWCPb0Ma80OimyQgdd1cPLtGuPuv9JDGQg0VsatB9SQLl6kdhEVPY13Z9VHQ4zywaa065aUXfcee8jXF8RoXaU7dg+Q3BP07bm7IygANKE63GWATyFjt6XTvfFro+gf5tuqEp7aBYRjTrUNZ0t3MAsbQ3JS/uw+niNhCszKxs/nUpGo+phGP3AAHRv0em6vWJHaJ4iqTrE7cN7J6enIZsZWzn+nECCNOahZ9Gzxd0m47AjjHralITUndnLiawzOHuefoPrN6hDLwzqxiDBrNWAunYpOxPNSBxa1GtytZOy4FI+3Bl84mmrDWvXs33G/1cgyQj39jVdtsHUy+3MbnUuMpC+YkyfQahUrhz2MjD4V/DG8M590K9TTyMDzaEBdcqF407OPMMAlIe24Q0xtv/ziKVOB1euwiw6AEHMFHX+rdzFS6Ypqm5opFkXIZ86XMW1DNrQJmpVD6H/sOUepdxckXTsAH48ckAJOaYOGAGfitS5nyEztxNO9aYGlXrEmtQBpbq0FqYk6IyGWIdp76RT0yawyQJ4jemMK4S+p8/1mWOd2w49T10mcvY3f95l8x3H++SSWSqb0BsYrruWUtWBRHUiaXNdZ6XEoFXOEDRupe8au8Yg43W8t32OSqlNx0zh/bPOZxvDlwOqSKevc0jvL52DdrUaIDI8AhUreBpGmcjsUaWg1IwzGNtvMB6O72quV/ehshkxt3L8njpsNDdlNmrn1rVSCY1Lc9O72kqC5q5OJlcaneYmGWvMGqfm5iiPcxdyTGlLBi0ZiGjYDedG0DjVISTHaM4fEdf0w+2qQ9FY1cSgd8PpuZKVHbr+HOeqazQebfqbE+rF18oBup85H8V/da+S9EbQZrjGc7Pyq9ZJDtSxRq+xirGbzXBeLn3XuBx1tzh0jTaglbVqjOpkFJPXnH8ttLbqsLNnwBqbZKP7OQZq6YWeqy4tlcNkJ8UhIqkMO5ffE6Q/msv19nDFHFhX+7RNB8pTNrbytqP9vbN4JsZ9+TEeim2D0f2ehzt1RbogGekasx/6C6FzROrklK5rlvb1v25shG3d+X06f62pXb6O62//juQludt1WLogmer/9m5K2zEK3qvgmh7pjTJvMEMM9PHFjMFvkAAGmTXVfpvGVXwtL1BHNB5B5xVFBq/5LJsN6NmyO/sz7HMztiJZF/MrwuNT/4zl274z57yWjfqAfsQ5GhoEp37bt4WbQ3Xg5i89YhQzhqzqtV5PMVDkYtHmb/A3pvxxIVGY5PAqHwsWnBlXA1ITBaQ/mrN2dwrsAUln+D4Z8hfUrWHL8m8HjqUm40T6SWzd+z3eX70I6TlZ+PCJ4ejRsvNNyeHthPOMxMItwcvdA4Pb9UJOQR7WJu1ElwlD8eB7r2DWupXmbEozpvJWMLLw/wI7P75TebLm9XvMbfe+RAyaPg5jl8/G6fNZ8K/ojZbRcU4VjAQrQ7oDoMOOG3/YhqW7NyFNnYAuVxBaJQDdmrRG49r1f65CZcGCU2HL/l3YkLjL7L+1qBdj9iLvFOw8lIT1e3bCk3PSW0uqVCq5ff23QPa5LHOm88DJZET4V8fTCQ/A18v5sk8rIFmwYMGCBaeAVbKzYMGCBQtOASsgWbBgwYIFp4AVkCxYsGDBglPACkgWLFiwYMEpYAUkCxYsWLDgBAD+Cz9dyUaW9Vx8AAAAAElFTkSuQmCC",
                      width: 100

                    }

                  ],
                },
                {
                  text: 'Service Report',
                  fontSize: 16,
                  alignment: 'center',
                  color: '#000',
                  decoration: 'underline',
                },
                {
                  text: 'Service Report',
                  fontSize: 16,
                  alignment: 'center',
                  color: '#fff'
                },
                {
                  table: {
                    widths: ['15%', '25%', '20%', '40%'],
                    body: [
                      [
                        {text: 'Customer', bold: true, fillColor: "#00573F", color: '#fff'},
                        {text: data.customer},
                        {text: 'OF', bold: true, fillColor: "#00573F", color: '#fff'},
                        {text: data.srof},
                      ],
                      [
                        {text: 'Department', bold: true, fillColor: "#00573F", color: '#fff'},
                        {text: data.department},
                        {text: 'Country', bold: true, fillColor: "#00573F", color: '#fff'},
                        {text: data.country},
                      ],
                      [
                        {text: 'Town', bold: true, fillColor: "#00573F", color: '#fff'},
                        {text: data.town},
                        {text: 'Resp. for Instrument', bold: true, fillColor: "#00573F", color: '#fff'},
                        {text: data.respInstrumentFName + " " + data.respInstrumentLName},
                      ],
                      [
                        {text: 'Lab Chief', bold: true, fillColor: "#00573F", color: '#fff'},
                        {text: data.labChief},
                        {text: 'Computer ARL S/N', bold: true, fillColor: "#00573F", color: '#fff'},
                        {text: data.computerarlsn},
                      ],
                      [
                        {text: 'Instrument', bold: true, fillColor: "#00573F", color: '#fff'},
                        {text: data.instrument},
                        {text: 'Software', bold: true, fillColor: "#00573F", color: '#fff'},
                        {text: data.software},
                      ],
                      [
                        {text: 'Brand Name', bold: true, fillColor: "#00573F", color: '#fff'},
                        {text: data.brandName},
                        {text: 'Firmware', bold: true, fillColor: "#00573F", color: '#fff'},
                        {text: data.firmaware},
                      ],
                    ]
                  }
                },
                {
                  text: 'Service Report',
                  fontSize: 16,
                  alignment: 'center',
                  color: '#fff'
                },
                {
                  table: {
                    widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', '*', 'auto', '*', 'auto'],

                    body: [
                      [
                        {text: 'Installation', bold: true, fillColor: "#00573F", color: '#fff'},
                        {
                          image: data.installation,
                          width: 10,
                          height: 10
                        },

                        {text: 'Analytical Assistance', bold: true, fillColor: "#00573F", color: '#fff'},
                        {
                          image: data.analyticalassit,
                          width: 10,
                          height: 10
                        },

                        {text: 'Rework', bold: true, fillColor: "#00573F", color: '#fff'},
                        {
                          image: data.rework,
                          width: 10,
                          height: 10
                        },

                        {text: 'Prev. Maintenance', bold: true, fillColor: "#00573F", color: '#fff'},
                        {
                          image: data.prevmaintenance,
                          width: 10,
                          height: 10
                        },

                        {text: 'Corr. Maintenance', bold: true, fillColor: "#00573F", color: '#fff'},
                        {
                          image: data.corrmaintenance,
                          width: 10,
                          height: 10
                        },

                      ],
                    ]
                  }
                },
                {
                  text: 'Service Report',
                  fontSize: 16,
                  alignment: 'center',
                  color: '#fff'
                },
                {
                  table: {
                    widths: ['*'],
                    body: [
                      [
                        {text: 'Problems:', bold: true, fillColor: "#00573F", color: '#fff'}
                      ],
                      [
                        {text: data.problem}
                      ],
                    ]
                  }
                },
                {
                  text: 'Service Report',
                  fontSize: 16,
                  alignment: 'center',
                  color: '#fff'
                },
                {
                  table: {
                    widths: ['*'],
                    body: [
                      [
                        {text: 'Work Done:', bold: true, fillColor: "#00573F", color: '#fff'},
                      ],
                      [
                        {
                          ul: [...data.workDone.map(p => ([p.workdone]))]
                        }
                      ]
                    ]
                  }
                },
                {
                  text: 'Service Report',
                  fontSize: 16,
                  alignment: 'center',
                  color: '#fff'
                },
                {
                  text: 'Service Report',
                  fontSize: 16,
                  alignment: 'center',
                  color: '#fff'
                },
                {
                  table: {
                    widths: ['*', '*', '*', '*', '*', '*'],
                    body: [
                      [
                        {text: 'Service Type', bold: true, fillColor: "#00573F", color: '#fff'},
                        {text: data.requestType},


                        {text: 'Attachment', bold: true, fillColor: "#00573F", color: '#fff'},
                        {
                          image: data.attachment,
                          width: 10,
                          height: 10
                        },

                        {text: 'Work Completed', bold: true, fillColor: "#00573F", color: '#fff'},
                        {
                          image: data.isworkdone,
                          width: 10,
                          height: 10
                        },
                      ]
                    ]
                  }
                },
                {
                  text: 'Service Report',
                  fontSize: 16,
                  alignment: 'center',
                  color: '#fff'
                },

                {
                  columns: [
                    [
                      {
                        columns: [
                          {text: 'Work Finished', width: 65},
                          {
                            image: data.workfinished,
                            height: 10,
                            width: 10
                          },
                          {text: 'Interrupted', width: 55},
                          {
                            image: data.interrupted,
                            height: 10,
                            width: 10
                          },
                        ]
                      },
                      {
                        text: 'Service Report',
                        fontSize: 16,
                        alignment: 'center',
                        color: '#fff'
                      },
                      {
                        table: {
                          widths: [55, '*'],
                          body: [
                            [
                              {
                                text: 'Reason',
                                bold: true,
                                fillColor: "#00573F",
                                color: '#fff'
                              },
                              {
                                text: data.reason,
                              },
                            ]
                          ]
                        }
                      },

                      {
                        text: 'Service Report',
                        fontSize: 16,
                        alignment: 'center',
                        color: '#fff'
                      },
                      {
                        table: {
                          widths: ['*', '*'],

                          body: [
                            [
                              {
                                text: 'Next Scheduled Visit',
                                bold: true,
                                fillColor: "#00573F",
                                color: '#fff'
                              },
                              {
                                text: data.nextvisitscheduled,
                              },
                            ]
                          ]
                        }
                      },

                      {
                        text: 'Service Report',
                        fontSize: 16,
                        alignment: 'center',
                        color: '#fff'
                      },
                      {
                        table: {
                          body: [
                            [
                              {text: "Customer Name & Signature", bold: true, fillColor: "#00573F", color: '#fff'}
                            ],
                            [
                              {
                                image: data.custsignature,
                                width: 150,
                                height: 60
                              }
                            ],
                            [
                              {text: data.signcustname}
                            ],
                          ],
                        }
                      },
                      {
                        text: 'Service Report',
                        fontSize: 16,
                        alignment: 'center',
                        color: '#fff'
                      },

                      {
                        table: {
                          body: [

                            [
                              {text: "Engineer Name & Signature", bold: true, fillColor: "#00573F", color: '#fff'}
                            ],
                            [
                              {
                                image: data.engsignature,
                                width: 150,
                                height: 60
                              }
                            ],
                            [
                              {text: data.signengname}
                            ],

                          ]
                        }
                      },
                      {
                        text: 'Service Report',
                        fontSize: 16,
                        alignment: 'center',
                        color: '#fff'
                      },
                      {
                        table: {
                          body: [
                            [
                              {text: "Date:", bold: true, fillColor: "#00573F", color: '#fff'},
                              {text: this.datepipe.transform(Date.now(), "dd-MMM-yy"), width: 150},
                            ]
                          ]
                        }
                      }
                    ],
                    [
                      {
                        table: {
                          widths: ['95%'],
                          body: [
                            [
                              {text: "Working Time", bold: true, fillColor: "#00573F", color: '#fff'},
                            ],
                          ]
                        }
                      },
                      {
                        table: {
                          headerRows: 1,
                          widths: ['auto', 'auto', 'auto', 'auto',],
                          body: [
                            [
                              {text: "Date:", fillColor: "lightgrey", fontSize: 10},
                              {text: "Start Time:", fillColor: "lightgrey", fontSize: 10},
                              {text: "End Time:", fillColor: "lightgrey", fontSize: 10},
                              {text: "Total Hours:", fillColor: "lightgrey", fontSize: 10},
                            ],
                            ...data.workTime.map(t => (
                              [t.worktimedate, t.starttime, t.endtime, t.perdayhrs]
                            )),
                            [
                              {text: "Total Days", fontSize: 10},
                              {text: ""},
                              {text: "Total Hours", fontSize: 10},
                              {text: totalHrs},
                            ]
                          ]
                        }
                      },
                    ]
                  ]
                },

                {
                  text: 'Service Report',
                  fontSize: 16,
                  alignment: 'center',
                  color: '#fff'
                },
                {
                  text: 'Service Report',
                  fontSize: 16,
                  alignment: 'center',
                  color: '#fff'
                },
                {
                  text: 'Service Report',
                  fontSize: 16,
                  alignment: 'center',
                  color: '#fff'
                },
                {
                  table: {
                    widths: ['auto', '*'],
                    body: [
                      [
                        {text: "Engineer's Comments:", fillColor: "#00573F", color: '#fff'},
                        {
                          ul: [...data.engComments.map(p => ([p.comments]))]
                        }
                      ]
                    ]
                  }
                },
                {
                  text: 'Service Report',
                  fontSize: 16,
                  alignment: 'center',
                  color: '#fff'
                },
                {
                  table: {
                    widths: ['*'],
                    body: [
                      [
                        {text: "Spare Parts Consumed:", fillColor: "#00573F", color: '#fff'},
                      ],
                      ...data.spConsumed.map(p => ([p.partno + "-" + p.hsccode]))
                    ]
                  }
                },
                {
                  text: 'Service Report',
                  fontSize: 16,
                  alignment: 'center',
                  color: '#fff'
                },
                {
                  table: {
                    widths: ['*'],
                    body: [
                      [
                        {text: "Spare Parts Recommended:", fillColor: "#00573F", color: '#fff'},
                      ],
                      ...data.spRecomm.map(p => ([p.partno + "-" + p.hsccode]))
                    ]
                  }
                },
              ],
              defaultStyle: {
                columnGap: 10,
                fontSize: 9,
                // background:#00573F

                pageSize: 'A4'
              }
            }
            pdfMake.createPdf(docDefinition).open()
          }
        }
      )
  }

}
