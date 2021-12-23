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
      rework: [false],
      isactive: [true],
      isdeleted: [false],
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
    this.onSubmit();
    this.ServiceReportService.getView(this.ServiceReportId)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          console.log(data)
          data = data.object
          let totalHrs = 0;

          {
            if (data.custsignature == null) {

              data.custsignature = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAI8AAABSCAYAAABtw4diAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAADiSURBVHhe7dIxAcAgEMDAp/49A0MNkPluiYGsfQ0E3194Zh4y85CZh8w8ZOYhMw+ZecjMQ2YeMvOQmYfMPGTmITMPmXnIzENmHjLzkJmHzDxk5iEzD5l5yMxDZh4y85CZh8w8ZOYhMw+ZecjMQ2YeMvOQmYfMPGTmITMPmXnIzENmHjLzkJmHzDxk5iEzD5l5yMxDZh4y85CZh8w8ZOYhMw+ZecjMQ2YeMvOQmYfMPGTmITMPmXnIzENmHjLzkJmHzDxk5iEzD5l5yMxDZh4y85CZh8w8ZOYhMw+ZecjMQzRzAO/qBKDxFE3sAAAAAElFTkSuQmCC";
            }
            if (data.engsignature == null) {

              data.engsignature = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAI8AAABSCAYAAABtw4diAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAADiSURBVHhe7dIxAcAgEMDAp/49A0MNkPluiYGsfQ0E3194Zh4y85CZh8w8ZOYhMw+ZecjMQ2YeMvOQmYfMPGTmITMPmXnIzENmHjLzkJmHzDxk5iEzD5l5yMxDZh4y85CZh8w8ZOYhMw+ZecjMQ2YeMvOQmYfMPGTmITMPmXnIzENmHjLzkJmHzDxk5iEzD5l5yMxDZh4y85CZh8w8ZOYhMw+ZecjMQ2YeMvOQmYfMPGTmITMPmXnIzENmHjLzkJmHzDxk5iEzD5l5yMxDZh4y85CZh8w8ZOYhMw+ZecjMQzRzAO/qBKDxFE3sAAAAAElFTkSuQmCC";
            }
            data.analyticalassit == true ? data.analyticalassit = this.checkedImg : data.analyticalassit = this.unCheckedImg;
            data.installation == true ? data.installation = this.checkedImg : data.installation = this.unCheckedImg;
            data.rework == true ? data.rework = this.checkedImg : data.rework = this.unCheckedImg;
            data.prevmaintenance == true ? data.prevmaintenance = this.checkedImg : data.prevmaintenance = this.unCheckedImg;
            data.corrmaintenance == true ? data.corrmaintenance = this.checkedImg : data.corrmaintenance = this.unCheckedImg;
            data.workfinished == true ? data.workfinished = this.checkedImg : data.workfinished = this.unCheckedImg;
            data.attachment == true ? data.attachment = this.checkedImg : data.attachment = this.unCheckedImg;
            data.interrupted == true ? data.interrupted = this.checkedImg : data.interrupted = this.unCheckedImg;
            data.isworkdone == true ? data.isworkdone = this.checkedImg : data.isworkdone = this.unCheckedImg;

            (data.workTime == [] || data.workTime == null) ? data.workTime = [
              {
                worktimedate: 'No Data Avaliable',
                starttime: 'No Data Avaliable',
                endtime: 'No Data Avaliable',
                perdayhrs: 'No Data Avaliable'
              }

            ] : data.workTime.forEach(x => {
                x.worktimedate = this.datepipe.transform(x.worktimedate, "dd-MM-yy");
                totalHrs = totalHrs + Number(x.perdayhrs)
              })
              data.nextvisitscheduled = this.datepipe.transform(data.nextvisitscheduled, "dd-MMM-yy")
            }

            let docDefinition = {
              content: [
                {
                  image: "data:image/png;base64,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",
                  width: 500,
                  height: 100
                },
                {
                  text: 'Service Report',
                  fontSize: 14,
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
                              {text: data.totalDays},
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
              },
              pageMargins: [40, 0, 40, 60]

            }
            pdfMake.createPdf(docDefinition).open()
            // pdfMake.createPdf(docDefinition).download();
          }
        }
      )
  }

}
