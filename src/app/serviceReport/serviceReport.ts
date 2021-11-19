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
    private srInventoryservice: InventoryService
  ) {
    this.notificationService.listen().subscribe((m: any) => {
      if (this.ServiceReportId != null) {
        this.ServiceReportService.getById(this.ServiceReportId).pipe(first())
          .subscribe({
            next: (data: any) => {
              this.workdonelist = data.object.lstWorkdone;
              this.workTime = data.object.lstWorktime;
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
        : this.sparepartlist.filter(v => v.partNo.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
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

    this.srInventoryservice.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.sparepartinvontorylist = data.object;
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
          this.sparepartlist = data.object;
        },
        error: error => {
          //  this.alertService.error(error);
          this.notificationService.showSuccess(error, "Error");
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
            console.log(data);
            this.ServiceReportform.patchValue(data.object);
            this.ServiceReportform.patchValue({"workCompletedstr": data.object.workCompleted == true ? "0" : "1"});
            this.ServiceReportform.patchValue({"workfinishedstr": data.object.workfinished == true ? "0" : "1"});
            this.ServiceReportform.patchValue({"interruptedstr": data.object.interrupted == true ? "0" : "1"});
            this.ServiceReportform.controls['instrument'].setValue({serialnos: data.object.instrument});
            this.workdonelist = data.object.lstWorkdone;
            this.workTime = data.object.lstWorktime;

            let datepipe = new DatePipe("en-US");
            this.workTime.filter((value, index) => {
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
                  this.servicerequest = data.object;
                  this.customerService.getallcontact(data.object.custid)
                    .pipe(first())
                    .subscribe({
                      next: (data: any) => {
                        this.allcontactlist = data.object;
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
    this.ServiceReport.workCompleted = this.ServiceReport.workCompletedstr == "0" ? true : false;
    this.ServiceReport.workfinished = this.ServiceReport.workfinishedstr == "0" ? true : false;
    this.ServiceReport.interrupted = this.ServiceReport.interruptedstr == "0" ? true : false;
    if (this.signaturePad.toDataURL() == "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAABkCAYAAABwx8J9AAAAAXNSR0IArs4c6QAABEZJREFUeF7t1QENAAAIwzDwbxodLMXBe5LvOAIECBAgQOC9wL5PIAABAgQIECAwBt0TECBAgACBgIBBD5QoAgECBAgQMOh+gAABAgQIBAQMeqBEEQgQIECAgEH3AwQIECBAICBg0AMlikCAAAECBAy6HyBAgAABAgEBgx4oUQQCBAgQIGDQ/QABAgQIEAgIGPRAiSIQIECAAAGD7gcIECBAgEBAwKAHShSBAAECBAgYdD9AgAABAgQCAgY9UKIIBAgQIEDAoPsBAgQIECAQEDDogRJFIECAAAECBt0PECBAgACBgIBBD5QoAgECBAgQMOh+gAABAgQIBAQMeqBEEQgQIECAgEH3AwQIECBAICBg0AMlikCAAAECBAy6HyBAgAABAgEBgx4oUQQCBAgQIGDQ/QABAgQIEAgIGPRAiSIQIECAAAGD7gcIECBAgEBAwKAHShSBAAECBAgYdD9AgAABAgQCAgY9UKIIBAgQIEDAoPsBAgQIECAQEDDogRJFIECAAAECBt0PECBAgACBgIBBD5QoAgECBAgQMOh+gAABAgQIBAQMeqBEEQgQIECAgEH3AwQIECBAICBg0AMlikCAAAECBAy6HyBAgAABAgEBgx4oUQQCBAgQIGDQ/QABAgQIEAgIGPRAiSIQIECAAAGD7gcIECBAgEBAwKAHShSBAAECBAgYdD9AgAABAgQCAgY9UKIIBAgQIEDAoPsBAgQIECAQEDDogRJFIECAAAECBt0PECBAgACBgIBBD5QoAgECBAgQMOh+gAABAgQIBAQMeqBEEQgQIECAgEH3AwQIECBAICBg0AMlikCAAAECBAy6HyBAgAABAgEBgx4oUQQCBAgQIGDQ/QABAgQIEAgIGPRAiSIQIECAAAGD7gcIECBAgEBAwKAHShSBAAECBAgYdD9AgAABAgQCAgY9UKIIBAgQIEDAoPsBAgQIECAQEDDogRJFIECAAAECBt0PECBAgACBgIBBD5QoAgECBAgQMOh+gAABAgQIBAQMeqBEEQgQIECAgEH3AwQIECBAICBg0AMlikCAAAECBAy6HyBAgAABAgEBgx4oUQQCBAgQIGDQ/QABAgQIEAgIGPRAiSIQIECAAAGD7gcIECBAgEBAwKAHShSBAAECBAgYdD9AgAABAgQCAgY9UKIIBAgQIEDAoPsBAgQIECAQEDDogRJFIECAAAECBt0PECBAgACBgIBBD5QoAgECBAgQMOh+gAABAgQIBAQMeqBEEQgQIECAgEH3AwQIECBAICBg0AMlikCAAAECBAy6HyBAgAABAgEBgx4oUQQCBAgQIGDQ/QABAgQIEAgIGPRAiSIQIECAAAGD7gcIECBAgEBAwKAHShSBAAECBAgYdD9AgAABAgQCAgY9UKIIBAgQIEDAoPsBAgQIECAQEDDogRJFIECAAAECBt0PECBAgACBgIBBD5QoAgECBAgQOEexAGVgyV5WAAAAAElFTkSuQmCC") {
      if (this.custsign != null) {
        this.ServiceReport.custsignature = this.custsign;
      }
    }
    else {
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

    this.ServiceReport.instrument = this.ServiceReportform.get('instrument').value.serialnos;
    if (this.ServiceReportId == null) {

      this.ServiceReportService.save(this.ServiceReport)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.result) {
              this.saveFileShare(data.object.id);
              if (this.file != null) {
                this.uploadPdfFile(this.file)
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
      //this.ServiceReport = this.ServiceReportform.value;
      this.ServiceReport.id = this.ServiceReportId;
      this.ServiceReportService.update(this.ServiceReportId, this.ServiceReport)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.result) {
              this.saveFileShare(this.ServiceReportId);

              if (this.file != null) {
                this.uploadPdfFile(this.file)
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
            this.notificationService.showSuccess(error, "Error");
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

      console.log(node, document.getElementById("demo"))
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
                error: error => {
                  this.notificationService.showError(error, "Error");
                  this.loading = false;
                }
              });
          }
        case "edit":
          let sprec: sparePartsConsume;
          sprec = data;
          this.srConsumedservice.update(sprec.id, sprec)
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

  uploadPdfFile(files) {
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
    this.fileshareService.upload(formData, this.ServiceReportId).subscribe((event) => {
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
        template:
          `<button class="btn btn-link" type="button" (click)="delete(params)"><i class="fas fa-trash-alt" data-action-type="remove" title="Delete"></i></button>
<button type="button" class="btn btn-link" data-action-type="edit" ><i class="fas fas fa-pen" title="Edit Value" data-action-type="edit"></i></button>`
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
        template:
          `<button class="btn btn-link" type="button" (click)="delete(params)"><i class="fas fa-trash-alt" data-action-type="remove" title="Delete"></i></button>
<button type="button" class="btn btn-link" data-action-type="edit" ><i class="fas fas fa-pen" title="Edit Value" data-action-type="edit"></i></button>`
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
    this.srConsumedModel.hsccode = v.hsCode;
    this.srConsumedModel.servicereportid = this.ServiceReportId;
    this.srConsumedservice.save(this.srConsumedModel)
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

  private createColumnspDefs() {
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
          <button type="button" class="btn btn-link" data-action-type="edit" ><i class="far fa-save" title="Save Qty" data-action-type="edit"></i></button>`
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
        headerName: 'Qty',
        field: 'qtyconsumed',
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

  private createColumnspreDefs() {
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
            <button type="button" class="btn btn-link" data-action-type="edit" ><i class="far fa-save" title="Save Qty" data-action-type="edit"></i></button>`
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

}
