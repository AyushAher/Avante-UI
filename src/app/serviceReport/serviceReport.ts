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
            {
              data.analyticalassit == true ? data.analyticalassit = this.checkedImg : data.analyticalassit = this.unCheckedImg;
              data.installation == true ? data.installation = this.checkedImg : data.installation = this.unCheckedImg;
              data.rework == true ? data.rework = this.checkedImg : data.rework = this.unCheckedImg;
              data.prevmaintenance == true ? data.prevmaintenance = this.checkedImg : data.prevmaintenance = this.unCheckedImg;
              data.corrmaintenance == true ? data.corrmaintenance = this.checkedImg : data.corrmaintenance = this.unCheckedImg;
              data.workfinished == true ? data.workfinished = this.checkedImg : data.workfinished = this.unCheckedImg;
              data.attachment == true ? data.attachment = this.checkedImg : data.attachment = this.unCheckedImg;
              data.interrupted == true ? data.interrupted = this.checkedImg : data.interrupted = this.unCheckedImg;

              data.workTime.forEach(x => {
                x.worktimedate = this.datepipe.transform(x.worktimedate, "dd-MMM-yy")
              })
              data.nextvisitscheduled = this.datepipe.transform(data.nextvisitscheduled, "dd-MMM-yy")
            }

            let docDefinition = {
              content: [
                {
                  text: 'Service Report',
                  fontSize: 16,
                  alignment: 'center',
                  color: '#047886'
                },
                {
                  table: {
                    widths: ['*', '*', '*', '*'],
                    body: [
                      [
                        {text: 'Customer', bold: true},
                        {text: data.customer},
                        {text: 'OF', bold: true},
                        {text: data.srof},
                      ],
                      [
                        {text: 'Department', bold: true},
                        {text: data.department},
                        {text: 'Country', bold: true},
                        {text: data.country},
                      ],
                      [
                        {text: 'Town', bold: true},
                        {text: data.town},
                        {text: 'Resp. for Instrument', bold: true},
                        {text: data.respInstrumentFName + " " + data.respInstrumentLName},
                      ],
                      [
                        {text: 'Lab Chief', bold: true},
                        {text: data.labChief},
                        {text: 'Computer ARL S/N', bold: true},
                        {text: data.computerarlsn},
                      ],
                      [
                        {text: 'Instrument', bold: true},
                        {text: data.instrument},
                        {text: 'Software', bold: true},
                        {text: data.software},
                      ],
                      [
                        {text: 'Brand Name', bold: true},
                        {text: data.brandName},
                        {text: 'Firmware', bold: true},
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
                    body: [
                      [
                        {text: 'Installation', bold: true},
                        {
                          image: data.installation,
                          width: 10,
                          height: 10
                        },

                        {text: 'Analytical Assistance', bold: true},
                        {
                          image: data.analyticalassit,
                          width: 10,
                          height: 10
                        },

                        {text: 'Rework', bold: true},
                        {
                          image: data.rework,
                          width: 10,
                          height: 10
                        },

                        {text: 'Prev. Maintenance', bold: true},
                        {
                          image: data.prevmaintenance,
                          width: 10,
                          height: 10
                        },

                        {text: 'Corr. Maintenance', bold: true},
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
                {text: 'Problems:', bold: true},
                {text: data.problem},
                {
                  text: 'Service Report',
                  fontSize: 16,
                  alignment: 'center',
                  color: '#fff'
                },
                {text: 'Work Done:', bold: true},
                {
                  table: {
                    widths: ['*'],
                    body: [
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
                        {text: 'Service Type', bold: true},
                        {text: data.requestType},


                        {text: 'Attachment', bold: true},
                        {
                          image: data.attachment,
                          width: 10,
                          height: 10
                        },

                        {text: 'Work Done', bold: true},
                        {
                          image: data.workfinished,
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
                          {text: 'Work Finished'},
                          {
                            image: data.workfinished,
                            height: 10,
                            width: 10
                          },
                          {text: 'Interrupted'},
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
                        columns: [
                          {
                            width: 55,
                            text: 'Reason',
                            bold: true
                          },
                          {
                            width: 90,
                            text: data.reason,
                          },
                        ]
                      },
                      {
                        columns: [
                          {
                            width: '*',
                            text: 'Next Scheduled Visit',
                            bold: true
                          },
                          {
                            width: '*',
                            text: data.nextvisitscheduled,
                          },
                        ]
                      },

                      {
                        text: 'Service Report',
                        fontSize: 16,
                        alignment: 'center',
                        color: '#fff'
                      },

                      {text: "Customer Name & Signature", bold: true},
                      {
                        image: data.custsignature,
                        width: 50,
                        height: 30
                      },
                      {text: data.signcustname},

                      {
                        text: 'Service Report',
                        fontSize: 16,
                        alignment: 'center',
                        color: '#fff'
                      },
                      {text: data.signengname},
                      {
                        image: data.engsignature,
                        width: 50,
                        height: 30
                      },
                      {text: "Engineer Name & Signature", bold: true},
                      {
                        text: 'Service Report',
                        fontSize: 16,
                        alignment: 'center',
                        color: '#fff'
                      },
                      {
                        columns: [
                          {text: "Date", bold: true},
                          {text: "Date"},
                        ]
                      }
                    ],
                    [
                      {text: "Working Time"},
                      {
                        table: {
                          headerRows: 1,
                          body: [
                            [
                              {text: "Date:", bold: true},
                              {text: "Start Time:", bold: true},
                              {text: "End Time:", bold: true},
                              {text: "Total Hours:", bold: true},
                            ],
                            ...data.workTime.map(t => (
                              [t.worktimedate, t.starttime, t.endtime, t.perdayhrs]
                            )),
                            [
                              {text: "Total Days"},
                              {text: ""},
                              {text: "Total Hours"},
                              {text: ""},
                            ]
                          ]
                        }
                      }
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
                        {text: "Engineer's Comments:"},
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
                        {text: "Spare Parts Consumed:"},
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
                        {text: "Spare Parts Recommended:"},
                      ],
                      [
                        {text: "Given Mail"}
                      ]
                    ]
                  }
                },


              ],
              defaultStyle: {
                columnGap: 20
              }
            }
            pdfMake.createPdf(docDefinition).open()
          }
        }
      )
  }

}
