/* tslint:disable:triple-equals */
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';

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
import { SignaturePad } from 'angular2-signaturepad';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, first, map } from 'rxjs/operators';
import { ColumnApi, GridApi } from 'ag-grid-community';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { WorkdoneContentComponent } from './workdonecontent';
import { WorkTimeContentComponent } from './workTime';
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
import { Observable, OperatorFunction } from 'rxjs';
import { DatePipe } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { FilerendercomponentComponent } from '../Offerrequest/filerendercomponent.component';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { CustspinventoryService } from '../_services/custspinventory.service';
import { PreventivemaintenancetableComponent } from '../preventivemaintenancetable/preventivemaintenancetable.component';
import { environment } from '../../environments/environment';
import { PreventivemaintenancesService } from '../_services/preventivemaintenances.service';
import { EnvService } from '../_services/env/env.service';
import { GetParsedDate } from '../_helpers/Providers';

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
  type = 'SR';
  ServiceReportId: string;
  countries: Country[];
  defaultdistributors: Distributor[];
  listTypeItems: ListTypeItem[];
  departmentList: ListTypeItem[];
  brandlist: ListTypeItem[];
  ServiceReport: ServiceReport;
  workdonelist: workDone[] = [];
  profilePermission: ProfileReadOnly;
  srRecomndModel: sparePartRecomanded;
  srConsumedModel: sparePartsConsume;
  hasReadAccess = false;
  hasUpdateAccess = false;
  hasDeleteAccess = false;
  hasAddAccess = false;
  pdfPath: any;
  // public defaultdistributors: any[] = [{ key: "1", value: "Ashish" }, { key: "2", value: "CEO" }];
  public columnDefs: any[];
  public columnworkdefs: any[];
  public spcolumnDefs: any[];
  public spRecomandDefs: any[];
  private columnApi: ColumnApi;
  private api: GridApi;
  workTime: workTime[] = [];
  servicerequest: ServiceRequest;
  sparePartsList: SparePart[] = [];
  sparePartRecomanded: sparePartRecomanded[] = [];
  configValueList: ConfigTypeValue[];
  spconsumedlist: any[] = [];
  selectedConfigType: ConfigTypeValue[] = [];
  signatureImg: string;
  @ViewChild('sigpad1') signaturePad: SignaturePad;
  @ViewChild('sigpad2') signaturePadcust: SignaturePad;
  bsModalRef: BsModalRef;
  bsActionModalRef: BsModalRef;
  allcontactlist: Contact[];
  instrumentlist: Instrument[];
  sparepartlist: any[] = [];
  sparepartinvontorylist: SparePart[];
  invlist: custSPInventory;
  PdffileData: FileShare[];
  pdfBase64: string;
  public pdfcolumnDefs: any[];
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

  datepipe = new DatePipe('en-US');
  checkedImg = 'data:image/png;base64,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';
  unCheckedImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAcAAAAIACAMAAAAi+0xoAAABnlBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///+WSgAsAAAAiHRSTlMAAQIDBAUGCwwNDg8QERMUFR0eHyAhLi8xMjM0NTY3ODk6QUJERkdISUpLTU5PUFFVV1haW1xeYGFiY2RlgIGCg4iLjI2OkZKTlJWZmpydoqeoqaq+v8DBxMXGyMnKzM3Oz9DR0tPU1dna29zd3uDk5ebo6err7O3u8PHy8/T19vf4+fr7/P3+w2NfOQAAAAFiS0dEiRxhJswAAAaoSURBVHja7dzpWxVlHMfhHxyUTdOyRXFDMyOxVHADN9QktxI0FwxXMJfQLELMLOFIwJ/dC0lRAVkcmcfr/rz3zfe+Rmc8M0+EJEmSJEmSJEmSJEmSJEmSJEmSJEl6T6taub3l9MXunofFUWVa8WFP18XTLdtXVr01vPINBy8PW/ad13Ni6+K561XvOf+vLeeroXN7queiV1LXPmDF+W2gva5klnyl9Vfsl4d+3lk2C76y5jumy0u3mwoz9Vt5yWx56vq6GfEtbnXbmbNGTi2dvt/mBwbLX32bp/uv3z6XXz4vwtaF0/H7uNNUee2nZdO4e+m1U37rX/smv88fWSnP/f3l1H5b/M9Lzis2TOXX4PYl9w1vm+Lvz0H75L+nGye9f3lsnRT6p3aS54c/bJNGvRM+TSy4aJlU6pzoif6IXdLp8Ot+m0bMkk4j37zqt8T/XydV3wevAP5gk7Q6+bLfak/wqT3Pv/QsUbhmkdTqHv+iTLM90mv3uAvwtjnS65cXl2CjNVLs+e8SJd3GSLGbpWOAdbZIs7oxwHZTpFnb2KdjT0yRZgOLIiJiryVSrTkiIs4bItXORkRUDhki1YaqIqLeDum2yQ+5aXc4Iq6bId2uRlT5ISnhhitjlRVSriZ2GCHlGqPFCCm3P84YIeXao8MIKXchbhgh5brinhFS7m70GyHl+sL5kUk3GLP4M9+tKXeC6tuvfO3RWVxNMwf89TNbZ9Xy+9kDDvLLsBXFzAFbrZxlxzIHXG3kLFubOWCFkbOsInNAG2cbQIAAAQogQIAAAQIUQIAAAQIEKIAAAQI0MUABBAgQoAAKIECAAAVQAAECBCiAAAECBAhQAAECBAgQoAACBAgQIEABBAgQoAAKIECAAAVQAAECBCiAAggQIEABBAgQIECAAggQIECAAAUQIECAAAEKIECAAAVQAAECBCiAAggQIEABFECAAAEKIECAAAECFECAAAECBCiAAAECBAhQAAECBCiAAggQIEABFECAAAEKIECAAAECFECAAAECBCiAAAECBAhQAAECBCiAAggQIEABFECAAAEKoAACBAhQAAECBAgQoAACBAgQIEABBAgQIECAAggQIEABFECAAAEKoAACBAhQAAUQIECAAggQIECAAAUQIECAAAEKIECAAAECFECAAAEKoAACBAhQAAUQIECAAggQIECAAAUQIECAAAEKIECAAAECFECAAAEKoAACBAhQAAUQIECAAiiAAAECFECAAAECBCiAAAECBAhQAAECBAgQoAACBAhQAAUQIECAAiiAAAECFEABBAgQoAACBAgQIEABBAgQIECAAggQIECAAAUQIECAAiiAAAECFEABBAgQoAAKIECAAAUQIECAAAEKIECAAAECFECAAAGaGKAAAgQIUAAFECBAgAIogAABAhRAgAABAgQogAABAgQIUAABAgQIEKAAAgQIUAAFECBAgAIogAABAhRAAQQIEKAAAgQIECBAAQQIECBAgAIIECBAgAAFECBAgAIogAABAhRAAQQIEKAACiBAgAAFEGBWgBU2zrKqzAHXGDnLajMHPGrkLDueOWBxuZWzq+Zp5oCj9wlm5/fbaPaAo8Vjte5kMqhi3fGnM9eI4qgSbjD6jZByfXHPCCl3N24YIeW6osMIKXchzhgh5dqjxQgptz92GCHlGmOVEVKuJqqGrZBuw5UR182Qblcj4ogZ0u1QRNSbId2+iojKITuk2lBVRMQ5Q6TajxERsdcQqdb07EWoJ5ZIs4FFz34KbjdFmrWN/ZZfZ4o0qxsDLOm2RYrdLP3/dZpGY6RYw/P3oQq3rJFedwov3mhrMkd67Rr3SmLhqj1S60ph/Eulq/yolFjDtS+/Fvy9SdLq5CvvdS95YJOU6vvg1TfzN41YJZ1Gvn7924pvzZJOhyb4OGaBV3yTqXPhRJ83Leu1TBr1fjTxB2qf/mmbFPprxWSfGK4ftE7+K34x+Uei2zzP5/8JfttUn/luGbBQzq+/hqk/1F7/yEZ57vHGNx6U4F40x/1e8+bDEj70PJjbLn0yneMuyva5lcllI60Lp3liSX2ftfJXX/30z5xZ3OoizNvld2rpzA596rRZnrq2bqYHPxV23zZbXrq1qzCLs7tK6y+bLg/d2Fk2y+PXSurafDcxzz1pqyuZyxF61c1nfT84bw2dbaqe+zGI5RsOXnZT+u7rObF10Vs7y7KypvFAe0dXT7/TKTOu2N/T1dF+oLGm0gmqkiRJkiRJkiRJkiRJkiRJkiRJkiS9r/0HWyxT9qD0o5gAAAAASUVORK5CYII=';
  ServiceRequestId: any;
  ServiceRequest: any;
  role: any;
  isEng = false;
  interrupted: boolean = false;
  finished: boolean = false;
  @ViewChild('file') fileInput: any
  isCompleted: boolean = false;
  isEditMode: boolean;
  isNewMode: boolean;
  isCust: boolean;

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
    private serviceRequestService: ServiceRequestService,
    private srrecomndservice: SrRecomandService,
    private srConsumedservice: SrConsumedService,
    private environment: EnvService,
    private preventivemaintenancesService: PreventivemaintenancesService,
    private CustSPInventoryService: CustspinventoryService
  ) {
    this.notificationService.listen().subscribe(() => {
      if (this.ServiceReportId != null) {
        this.ServiceReportService.getById(this.ServiceReportId).pipe(first())
          .subscribe({
            next: (data: any) => {
              this.workdonelist = data.object.lstWorkdone;
              this.workTime = data.object.lstWorktime;

              this.workTime.forEach((value) => {
                value.worktimedate = this.datepipe.transform(GetParsedDate(value.worktimedate), 'dd/MM/YYYY');
              });

              this.sparePartRecomanded = data.object.lstSPRecommend;
              this.spconsumedlist = data.object.lstSPConsumed;
            },
            error: error => {
              this.loading = false;
            }
          });
      }
    });
  }


  ngAfterViewInit() {
    // this.signaturePad is now available
    if (!this.isCompleted) {

      this.signaturePad?.set('minWidth', 2);
      this.signaturePad?.clear();
      this.signaturePadcust?.set('minWidth', 2);
      this.signaturePadcust?.clear();
    }
  }

  // formatter = (result: { name: string }) => result.name.toUpperCase();
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
        : this.sparepartrecmmlist.filter(v => v.partNoDesc.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )

  formatterpart = (x: any) => x.partNoDesc;

  searchpartcon: OperatorFunction<string, readonly SparePart[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term === '' ? []
        : this.sparepartlist.filter(v => v.partNoDesc.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )
  formatterpartcon = (x: any) => x.partNoDesc;

  ngOnInit() {
    this.ServiceReportId = this.route.snapshot.paramMap.get('id');

    var isShowPreview = this.route.snapshot.queryParams.showPdf == "true";
    if (isShowPreview) this.pdf(true, isShowPreview);

    this.transaction = 0;
    this.user = this.accountService.userValue;
    const role = JSON.parse(localStorage.getItem('roles'));

    if (this.user.username != "admin") {
      this.role = role[0]?.itemCode;
      this.role == this.environment.engRoleCode ? this.isEng = true : this.isEng = false;
      this.role == this.environment.custRoleCode ? this.isCust = true : this.isCust = false;
    }

    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      const profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == 'SRREP');
      if (profilePermission.length > 0) {
        this.hasReadAccess = profilePermission[0].read;
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
        this.hasUpdateAccess = profilePermission[0].update;
      }
    }

    if (this.user.username == "admin") {
      this.hasAddAccess = false;
      this.hasDeleteAccess = false;
      this.hasUpdateAccess = false;
      this.hasReadAccess = false;
      this.notificationService.RestrictAdmin()
      return;
    }

    this.ServiceReportform = this.formBuilder.group({
      customer: [''],
      srOf: [''],
      servicereportNo: [],
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
      interruptedstr: [''],
      reason: [''],
      nextvisitscheduled: [''],
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
      consumed: ['']
    });

    this.countryService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.countries = data.object;
        }
      });

    this.sparePartService.getAll()
      .pipe(first())
      .subscribe((data: any) =>
        this.sparepartrecmmlist = data.object
      );


    this.CustSPInventoryService.GetSPInvenrotyForServiceReport(this.ServiceReportId)
      .pipe(first())
      .subscribe((data: any) =>
        this.sparepartlist = data.object
      );

    this.distributorService.getAll()
      .pipe(first())
      .subscribe((data: any) =>
        this.defaultdistributors = data.object
      );

    this.listTypeService.getById('DPART')
      .pipe(first())
      .subscribe((data: ListTypeItem[]) =>
        this.departmentList = data
      );

    this.listTypeService.getById('SUPPL')
      .pipe(first())
      .subscribe((data: ListTypeItem[]) =>
        this.brandlist = data
      );

    this.listTypeService.getById('CONTY')
      .pipe(first())
      .subscribe((data: ListTypeItem[]) =>
        this.listTypeItems = data
      );


    if (this.ServiceReportId != null) {
      this.ServiceReportService.getById(this.ServiceReportId)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.ServiceReportform.patchValue(data.object);
            this.ServiceReportform.patchValue({ 'workCompletedstr': data.object.workCompleted == true ? '0' : '1' });
            this.ServiceReportform.patchValue({ 'workfinishedstr': data.object.workfinished == true ? '0' : '1' });
            this.ServiceReportform.patchValue({ 'interruptedstr': data.object.interrupted == true ? '0' : '1' });
            this.onInteruptedChange(this.ServiceReportform.get('interruptedstr').value)
            this.onWorkFinishedChange(this.ServiceReportform.get('workfinishedstr').value)
            this.ServiceReportform.get('instrument').setValue(data.object.instrumentName);
            this.workdonelist = data.object.lstWorkdone;
            this.workTime = data.object.lstWorktime;

            const datepipe = new DatePipe('en-US');
            this.workTime.forEach((value) => {
              value.worktimedate = datepipe.transform(GetParsedDate(value.worktimedate), 'dd/MM/YYYY');
            });
            this.spconsumedlist = data.object.lstSPConsumed;
            this.sparePartRecomanded = data.object.lstSPRecommend;
            this.custsign = data.object.custsignature;
            this.engsign = data.object.engsignature;
            this.ServiceRequestId = data.object.serviceRequestId;

            this.ServiceReportService.getSparePartRecomm(this.ServiceRequestId)
              .pipe(first()).subscribe((data: any) => setTimeout(() => this.sparepartrecmmlist = data.object, 500));

            this.serviceRequestService.getById(data.object.serviceRequestId)
              .pipe(first())
              .subscribe({
                next: (data: any) => {
                  this.ServiceRequest = data.object;

                  this.servicerequest = data.object;

                  this.customerService.getallcontact(data.object.custid)
                    .pipe(first())
                    .subscribe({
                      next: (data: any) => {
                        this.allcontactlist = data.object;
                      },
                    });
                },
              });

            this.isCompleted = data.object.isCompleted
            if (this.isCompleted) {
              this.ServiceReportform.disable()
              this.fileInput.nativeElement.disabled = true
              this.hasAddAccess = false;
              this.hasReadAccess = false;
              this.hasUpdateAccess = false;
              this.hasDeleteAccess = false
            }
          }
        });

      this.fileshareService.list(this.ServiceReportId)
        .pipe(first()).subscribe((data: any) => this.PdffileData = data.object);

      setTimeout(() => {
        this.ServiceReportform.disable()

        this.columnworkdefs = this.createworkdoneColumnDefsRO();
        this.columnDefs = this.createColumnDefsRO();
        this.spcolumnDefs = this.createColumnspDefsRO();
        this.spRecomandDefs = this.createColumnspreDefsRO();
        this.pdfcolumnDefs = this.pdfcreateColumnDefsRO();
      }, 100);
    }

    else {
      this.FormControlDisable()
      this.isNewMode = true
    }

  }

  // convenience getter for easy access to form fields
  get f() { return this.ServiceReportform.controls; }
  get a() { return this.ServiceReportform.controls.engineer; }



  EditMode() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.isEditMode = true;
      if (!this.isCust) {
        this.ServiceReportform.enable();
        this.FormControlDisable();

        this.columnworkdefs = this.createworkdoneColumnDefs();
        this.columnDefs = this.createColumnDefs();
        this.spcolumnDefs = this.createColumnspDefs();
        this.spRecomandDefs = this.createColumnspreDefs();
        this.pdfcolumnDefs = this.pdfcreateColumnDefs();
      }
    }
  }

  Back() {

    if ((this.isEditMode || this.isNewMode)) {
      if (confirm("Are you sure want to go back? All unsaved changes will be lost!"))
        this.router.navigate(["servicereportlist"])
    }

    else this.router.navigate(["servicereportlist"])

  }


  ToggleDropdown(id: string) {
    document.getElementById(id).classList.toggle("show")
  }

  CancelEdit() {
    this.ServiceReportform.disable()
    this.isEditMode = false;
    this.isNewMode = false;

    this.columnworkdefs = this.createworkdoneColumnDefsRO();
    this.columnDefs = this.createColumnDefsRO();
    this.spcolumnDefs = this.createColumnspDefsRO();
    this.spRecomandDefs = this.createColumnspreDefsRO();
    this.pdfcolumnDefs = this.pdfcreateColumnDefsRO();
  }

  FormControlDisable() {
    this.ServiceReportform.get('instrument').disable()
    if (!this.isEng && this.user.username != "admin") {
      this.ServiceReportform.get('analyticalassit').disable()
      this.ServiceReportform.get('prevmaintenance').disable()
      this.ServiceReportform.get('rework').disable()
      this.ServiceReportform.get('installation').disable()
      this.ServiceReportform.get('corrmaintenance').disable()
      this.ServiceReportform.get('problem').disable()
    }
    this.onWorkFinishedChange(this.ServiceReportform.get("workfinishedstr").value)
    this.onInteruptedChange(this.ServiceReportform.get("interruptedstr").value)

  }

  DeleteRecord() {
    if (confirm("Are you sure you want to edit the record?")) {

      this.ServiceReportService.delete(this.ServiceReportId).pipe(first())
        .subscribe((data: any) => {
          if (data.result)
            this.router.navigate(["servicereportlist"])
        })
    }
  }



  onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();
    if (this.isCompleted) return
    // stop here if form is invalid
    if (this.ServiceReportform.invalid) {
      return;
    }
    this.isSave = true;
    this.loading = true;
    this.ServiceReport = this.ServiceReportform.value;

    if (this.ServiceReport.nextvisitscheduled) {
      const nextvisitscheduled = new Date(GetParsedDate(this.ServiceReport.nextvisitscheduled));
      this.ServiceReport.nextvisitscheduled = this.datepipe.transform(nextvisitscheduled, 'dd/MM/YYYY');
    }

    this.ServiceReport.workCompleted = this.ServiceReport.workCompletedstr == '0' ? true : false;
    this.ServiceReport.workfinished = this.ServiceReport.workfinishedstr == '0' ? true : false;
    this.ServiceReport.interrupted = this.ServiceReport.interruptedstr == '0' ? true : false;
    if (this.signaturePad.toDataURL() == 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAABkCAYAAABwx8J9AAAAAXNSR0IArs4c6QAABEZJREFUeF7t1QENAAAIwzDwbxodLMXBe5LvOAIECBAgQOC9wL5PIAABAgQIECAwBt0TECBAgACBgIBBD5QoAgECBAgQMOh+gAABAgQIBAQMeqBEEQgQIECAgEH3AwQIECBAICBg0AMlikCAAAECBAy6HyBAgAABAgEBgx4oUQQCBAgQIGDQ/QABAgQIEAgIGPRAiSIQIECAAAGD7gcIECBAgEBAwKAHShSBAAECBAgYdD9AgAABAgQCAgY9UKIIBAgQIEDAoPsBAgQIECAQEDDogRJFIECAAAECBt0PECBAgACBgIBBD5QoAgECBAgQMOh+gAABAgQIBAQMeqBEEQgQIECAgEH3AwQIECBAICBg0AMlikCAAAECBAy6HyBAgAABAgEBgx4oUQQCBAgQIGDQ/QABAgQIEAgIGPRAiSIQIECAAAGD7gcIECBAgEBAwKAHShSBAAECBAgYdD9AgAABAgQCAgY9UKIIBAgQIEDAoPsBAgQIECAQEDDogRJFIECAAAECBt0PECBAgACBgIBBD5QoAgECBAgQMOh+gAABAgQIBAQMeqBEEQgQIECAgEH3AwQIECBAICBg0AMlikCAAAECBAy6HyBAgAABAgEBgx4oUQQCBAgQIGDQ/QABAgQIEAgIGPRAiSIQIECAAAGD7gcIECBAgEBAwKAHShSBAAECBAgYdD9AgAABAgQCAgY9UKIIBAgQIEDAoPsBAgQIECAQEDDogRJFIECAAAECBt0PECBAgACBgIBBD5QoAgECBAgQMOh+gAABAgQIBAQMeqBEEQgQIECAgEH3AwQIECBAICBg0AMlikCAAAECBAy6HyBAgAABAgEBgx4oUQQCBAgQIGDQ/QABAgQIEAgIGPRAiSIQIECAAAGD7gcIECBAgEBAwKAHShSBAAECBAgYdD9AgAABAgQCAgY9UKIIBAgQIEDAoPsBAgQIECAQEDDogRJFIECAAAECBt0PECBAgACBgIBBD5QoAgECBAgQMOh+gAABAgQIBAQMeqBEEQgQIECAgEH3AwQIECBAICBg0AMlikCAAAECBAy6HyBAgAABAgEBgx4oUQQCBAgQIGDQ/QABAgQIEAgIGPRAiSIQIECAAAGD7gcIECBAgEBAwKAHShSBAAECBAgYdD9AgAABAgQCAgY9UKIIBAgQIEDAoPsBAgQIECAQEDDogRJFIECAAAECBt0PECBAgACBgIBBD5QoAgECBAgQMOh+gAABAgQIBAQMeqBEEQgQIECAgEH3AwQIECBAICBg0AMlikCAAAECBAy6HyBAgAABAgEBgx4oUQQCBAgQIGDQ/QABAgQIEAgIGPRAiSIQIECAAAGD7gcIECBAgEBAwKAHShSBAAECBAgYdD9AgAABAgQCAgY9UKIIBAgQIEDAoPsBAgQIECAQEDDogRJFIECAAAECBt0PECBAgACBgIBBD5QoAgECBAgQOEexAGVgyV5WAAAAAElFTkSuQmCC') {
      if (this.custsign != null) {
        this.ServiceReport.custsignature = this.custsign;
      }
    } else {
      this.ServiceReport.custsignature = this.signaturePad.toDataURL();
      this.router.navigate(["customersatisfactionsurvey"], { queryParams: { servicereportid: this.ServiceReportId } })
    }

    if (this.signaturePadcust.toDataURL() == 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAABkCAYAAABwx8J9AAAAAXNSR0IArs4c6QAABEZJREFUeF7t1QENAAAIwzDwbxodLMXBe5LvOAIECBAgQOC9wL5PIAABAgQIECAwBt0TECBAgACBgIBBD5QoAgECBAgQMOh+gAABAgQIBAQMeqBEEQgQIECAgEH3AwQIECBAICBg0AMlikCAAAECBAy6HyBAgAABAgEBgx4oUQQCBAgQIGDQ/QABAgQIEAgIGPRAiSIQIECAAAGD7gcIECBAgEBAwKAHShSBAAECBAgYdD9AgAABAgQCAgY9UKIIBAgQIEDAoPsBAgQIECAQEDDogRJFIECAAAECBt0PECBAgACBgIBBD5QoAgECBAgQMOh+gAABAgQIBAQMeqBEEQgQIECAgEH3AwQIECBAICBg0AMlikCAAAECBAy6HyBAgAABAgEBgx4oUQQCBAgQIGDQ/QABAgQIEAgIGPRAiSIQIECAAAGD7gcIECBAgEBAwKAHShSBAAECBAgYdD9AgAABAgQCAgY9UKIIBAgQIEDAoPsBAgQIECAQEDDogRJFIECAAAECBt0PECBAgACBgIBBD5QoAgECBAgQMOh+gAABAgQIBAQMeqBEEQgQIECAgEH3AwQIECBAICBg0AMlikCAAAECBAy6HyBAgAABAgEBgx4oUQQCBAgQIGDQ/QABAgQIEAgIGPRAiSIQIECAAAGD7gcIECBAgEBAwKAHShSBAAECBAgYdD9AgAABAgQCAgY9UKIIBAgQIEDAoPsBAgQIECAQEDDogRJFIECAAAECBt0PECBAgACBgIBBD5QoAgECBAgQMOh+gAABAgQIBAQMeqBEEQgQIECAgEH3AwQIECBAICBg0AMlikCAAAECBAy6HyBAgAABAgEBgx4oUQQCBAgQIGDQ/QABAgQIEAgIGPRAiSIQIECAAAGD7gcIECBAgEBAwKAHShSBAAECBAgYdD9AgAABAgQCAgY9UKIIBAgQIEDAoPsBAgQIECAQEDDogRJFIECAAAECBt0PECBAgACBgIBBD5QoAgECBAgQMOh+gAABAgQIBAQMeqBEEQgQIECAgEH3AwQIECBAICBg0AMlikCAAAECBAy6HyBAgAABAgEBgx4oUQQCBAgQIGDQ/QABAgQIEAgIGPRAiSIQIECAAAGD7gcIECBAgEBAwKAHShSBAAECBAgYdD9AgAABAgQCAgY9UKIIBAgQIEDAoPsBAgQIECAQEDDogRJFIECAAAECBt0PECBAgACBgIBBD5QoAgECBAgQMOh+gAABAgQIBAQMeqBEEQgQIECAgEH3AwQIECBAICBg0AMlikCAAAECBAy6HyBAgAABAgEBgx4oUQQCBAgQIGDQ/QABAgQIEAgIGPRAiSIQIECAAAGD7gcIECBAgEBAwKAHShSBAAECBAgYdD9AgAABAgQCAgY9UKIIBAgQIEDAoPsBAgQIECAQEDDogRJFIECAAAECBt0PECBAgACBgIBBD5QoAgECBAgQOEexAGVgyV5WAAAAAElFTkSuQmCC') {
      if (this.engsign != null) {
        this.ServiceReport.engsignature = this.engsign;
      }
    } else {
      this.ServiceReport.engsignature = this.signaturePadcust.toDataURL();
    }


    if (this.ServiceReportId == null) {

      this.ServiceReportService.save(this.ServiceReport)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.result) {
              this.CancelEdit()
              this.saveFileShare(data.object.id);
              if (this.file != null) {
                this.uploadPdfFile(this.file, data.object.id);
                this.notificationService.filter("itemadded");
                document.getElementById('selectedfiles').style.display = 'none';

                this.fileshareService.list(this.ServiceReportId)
                  .pipe(first())
                  .subscribe({
                    next: (data: any) => {
                      this.PdffileData = data.object;
                    },
                  });
              }
              this.notificationService.showSuccess(data.resultMessage, 'Success');
            }
            this.loading = false;
          }
        });
    } else {
      this.ServiceReport = this.ServiceReportform.value;
      this.ServiceReport.id = this.ServiceReportId;
      this.ServiceReportService.update(this.ServiceReportId, this.ServiceReport)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.result) {
              this.CancelEdit()
              this.saveFileShare(this.ServiceReportId);

              if (this.file != null) {
                this.uploadPdfFile(this.file, this.ServiceReportId);
                this.notificationService.filter("itemadded");
                document.getElementById('selectedfiles').style.display = 'none';
                setTimeout(() => {

                  this.fileshareService.list(this.ServiceReportId)
                    .pipe(first())
                    .subscribe({
                      next: (data: any) => {
                        this.PdffileData = data.object;
                      },
                    });

                }, 3000);
              }

              this.notificationService.showSuccess(data.resultMessage, 'Success');
            }
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


  onInteruptedChange(interrupted: any) {
    if (!this.isCompleted) {
      if (interrupted == 0) {
        this.interrupted = true;
        this.ServiceReportform.get('reason').setValidators([Validators.required])
        if (this.isEditMode) this.ServiceReportform.get('reason').enable()
      } else {
        this.interrupted = false;
        this.ServiceReportform.get('reason').clearValidators()
        this.ServiceReportform.get('reason').disable()
        this.ServiceReportform.get('reason').setValue("")

      }

      this.ServiceReportform.get('reason').updateValueAndValidity()
    }
  }

  onWorkFinishedChange(finished: any) {
    if (!this.isCompleted) {
      this.ServiceReportform.get('reason').clearValidators()
      this.ServiceReportform.get('reason').disable()
      this.ServiceReportform.get('interruptedstr').disable()
      this.ServiceReportform.get('interruptedstr').setValue("1")

      if (finished == 1) {
        if (this.isEditMode) {
          this.ServiceReportform.get('reason').enable()
          this.ServiceReportform.get('interruptedstr').enable()
          this.ServiceReportform.get('reason').setValidators([Validators.required])
        }

        this.ServiceReportform.get('interruptedstr').setValue("0")
      }
      this.onInteruptedChange(this.ServiceReportform.get('interruptedstr').value)
      this.ServiceReportform.get('reason').updateValueAndValidity()
    }
  }


  clearSignature() {
    if (!this.isCompleted) {
      this.signaturePad.clear();
    }
  }

  savePad() {
    if (!this.isCompleted) {
      const base64Data = this.signaturePad.toDataURL();
      this.signatureImg = base64Data;
    }
  }

  getfil(x) {
    if (!this.isCompleted) {
      this.file = x;
    }
  }

  listfile = (x) => {
    if (!this.isCompleted) {
      document.getElementById('selectedfiles').style.display = 'block';

      const selectedfiles = document.getElementById('selectedfiles');
      const ulist = document.createElement('ul');
      ulist.id = 'demo';
      selectedfiles.appendChild(ulist);

      if (this.transaction != 0) {
        document.getElementById('demo').remove();
      }

      this.transaction++;
      this.hastransaction = true;

      for (let i = 0; i <= x.length; i++) {
        const name = x[i].name;
        const ul = document.getElementById('demo');
        const node = document.createElement('li');
        const textnode = document.createTextNode(name);
        node.appendChild(textnode);

        ul.appendChild(node);

      }
    }
  }

  public onRowClicked(e) {
    if (!this.isCompleted) {
      if (e.event.target !== undefined) {
        const data = e.data;
        const actionType = e.event.target.getAttribute('data-action-type');
        // this.serviceRequestId = this.route.snapshot.paramMap.get('id');
        switch (actionType) {
          case 'remove':
            if (confirm('Are you sure, you want to remove the engineer comment?') == true) {
              // this.instrumentService.deleteConfig(data.configTypeid, data.configValueid)
              this.workdoneservice.delete(data.id)
                .pipe(first())
                .subscribe({
                  next: (d: any) => {
                    if (d.result) this.notificationService.showSuccess(d.resultMessage, 'Success');
                  },
                  error: () => {


                    this.loading = false;
                  }
                });
            }
          case 'edit':
            this.open(this.ServiceReportId, data.id);
        }
      }
    }
  }

  public onRowClickedPre(e) {
    if (!this.isCompleted) {
      if (e.event.target !== undefined) {
        const data = e.data;
        const actionType = e.event.target.getAttribute('data-action-type');
        // this.serviceRequestId = this.route.snapshot.paramMap.get('id');
        switch (actionType) {
          case 'remove':
            if (confirm('Are you sure, you want to remove the sparepart?') == true) {
              // this.instrumentService.deleteConfig(data.configTypeid, data.configValueid)
              this.srrecomndservice.delete(data.id)
                .pipe(first())
                .subscribe({
                  next: (d: any) => {
                    if (d.result) {
                      this.notificationService.showSuccess(d.resultMessage, 'Success');
                      this.notificationService.filter('itemadded');
                    }
                  },
                  error: () => {


                    this.loading = false;
                  }
                });
            }
          case 'edit':
            let sprec: sparePartRecomanded;
            sprec = data;
            this.srrecomndservice.update(sprec.id, sprec)
              .pipe(first())
              .subscribe({
                next: (data: any) => {
                  if (data.result) {
                    this.notificationService.showSuccess(data.resultMessage, 'Success');
                    this.notificationService.filter('itemadded');
                    // this.configList = data.object;
                    // this.listvalue.get("configValue").setValue("");
                  }
                  this.loading = false;
                },
                error: () => {


                  this.loading = false;
                }
              });
          // this.open(this.ServiceReportId, data.id);
        }
      }
    }
  }

  public onRowClickedCon(e) {
    if (!this.isCompleted) {
      if (e.event.target !== undefined) {
        const data = e.data;
        const actionType = e.event.target.getAttribute('data-action-type');
        // this.serviceRequestId = this.route.snapshot.paramMap.get('id');
        switch (actionType) {
          case 'remove':
            if (confirm('Are you sure, you want to remove the sparepart?') == true) {
              // this.instrumentService.deleteConfig(data.configTypeid, data.configValueid)
              this.srConsumedservice.delete(data.id)
                .pipe(first())
                .subscribe({
                  next: (d: any) => {
                    if (d.result) {
                      this.notificationService.showSuccess(d.resultMessage, 'Success');
                      this.notificationService.filter('itemadded');
                    }
                  },
                });
            }
          case 'edit':
            let sprec: sparePartsConsume;
            sprec = data;
            if (Number(sprec.qtyconsumed) <= Number(sprec.qtyAvailable)) {
              this.srConsumedservice.update(sprec.id, sprec)
                .pipe(first())
                .subscribe({
                  next: (data: any) => {
                    if (data.result) {
                      const newQtyAvailable: number = Number(sprec.qtyAvailable) - Number(sprec.qtyconsumed);
                      this.CustSPInventoryService.updateqty(sprec.customerSPInventoryId, newQtyAvailable.toString()).pipe(first()).subscribe();
                      this.notificationService.filter('itemadded');
                      // this.configList = data.object;
                      // this.listvalue.get("configValue").setValue("");
                    }
                    this.loading = false;
                  },
                  error: () => {


                    this.loading = false;
                  }
                });
            } else {
              this.notificationService.showInfo('The Consumed Qty. is not Available. Please Recommend the Spare' +
                ' Parts', 'Error');
            }

          // this.open(this.ServiceReportId, data.id);
        }
      }
    }
  }

  public onworktimeRowClicked(e) {
    if (!this.isCompleted) {
      if (e.event.target !== undefined) {
        const data = e.data;
        const actionType = e.event.target.getAttribute('data-action-type');
        // this.serviceRequestId = this.route.snapshot.paramMap.get('id');
        switch (actionType) {
          case 'remove':
            if (confirm('Are you sure, you want to remove the worktime?') == true) {
              // this.instrumentService.deleteConfig(data.configTypeid, data.configValueid)
              this.worktimeservice.delete(data.id)
                .pipe(first())
                .subscribe({
                  next: (d: any) => {
                    if (d.result) {
                      this.notificationService.showSuccess(d.resultMessage, 'Success');
                      this.notificationService.filter('itemadded');
                    }
                  },
                  error: () => {


                    this.loading = false;
                  }
                });
            }
          case 'edit':
            this.opentime(this.ServiceReportId, data.id);
        }
      }
    }
  }

  onCellValueChanged(event) {
    if (!this.isCompleted) {
      event.data.modified = true;
    }
  }

  onCellValueChangedPre(event) {
    if (!this.isCompleted) {
      event.data.modified = true;
    }
  }

  updateSpareParts() {
  }

  addPartrecmm() {
    if (!this.isCompleted) {
      const v = this.ServiceReportform.get('recondad').value;
      if (v == "" || v == null) return;
      this.srRecomndModel = new sparePartRecomanded();
      this.srRecomndModel.partno = v.partNo;
      this.srRecomndModel.hsccode = v.hsCode;
      this.srRecomndModel.qtyrecommended = "0";
      this.srRecomndModel.servicereportid = this.ServiceReportId;
      this.srrecomndservice.save(this.srRecomndModel)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, 'Success');
              this.notificationService.filter('itemadded');
            }
            this.loading = false;
          },
          error: () => {


            this.loading = false;
          }
        });
      this.ServiceReportform.get('recondad').setValue("");
    }
  }


  uploadPdfFile(files, id) {
    if (!this.isCompleted) {
      if (files.length === 0) {
        return;
      }
      const filesToUpload: File[] = files;
      const formData = new FormData();

      Array.from(filesToUpload).map((file, index) => {
        return formData.append('file' + index, file, file.name);
      });
      this.fileshareService.upload(formData, id, 'SRREP').subscribe((event) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.fileUploadProgress = Math.round((100 * event.loaded) / event.total);
        } else if (event.type === HttpEventType.Response) {
          this.onUploadFinished.emit(event.body);
        }
      });
    }
  }

  private createworkdoneColumnDefs() {
    return [
      {
        headerName: 'Action',
        field: 'id',
        filter: false,
        lockPosition: "left",
        enableSorting: false,
        editable: false,
        sortable: false,
        width: 150,
        cellRenderer: () => {
          if (this.hasDeleteAccess && !this.hasUpdateAccess) {
            return `<button class="btn btn-link" type="button" (click)="delete(params)"><i class="fas fa-trash-alt" data-action-type="remove" title="Delete"></i></button>`;
          } else if (this.hasDeleteAccess && this.hasUpdateAccess) {
            return `<button class="btn btn-link" type="button" (click)="delete(params)"><i class="fas fa-trash-alt" data-action-type="remove" title="Delete"></i></button>
          <button type="button" class="btn btn-link" data-action-type="edit" ><i class="fas fas fa-pen" title="Edit Value" data-action-type="edit"></i></button>`;
          } else if (!this.hasDeleteAccess && this.hasUpdateAccess) {
            return `<button type="button" class="btn btn-link" data-action-type="edit" ><i class="fas fas fa-pen" title="Edit Value" data-action-type="edit"></i></button>`;
          }
        }
      },
      {
        headerName: 'Work Done',
        field: 'workdone',
        filter: false,
        width: 900,
        enableSorting: false,
        editable: false,
        sortable: false,
        tooltipField: 'Work Done',
      }
    ];
  }

  private createworkdoneColumnDefsRO() {
    return [
      {
        headerName: 'Work Done',
        field: 'workdone',
        filter: false,
        width: 900,
        enableSorting: false,
        editable: false,
        sortable: false,
        tooltipField: 'Work Done',
      }
    ];
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
        lockPosition: "left",

        cellRenderer: () => {
          if (this.hasDeleteAccess && !this.hasUpdateAccess) {
            return `<button class="btn btn-link" type="button" (click)="delete(params)"><i class="fas fa-trash-alt" data-action-type="remove" title="Delete"></i></button>`;
          } else if (this.hasDeleteAccess && this.hasUpdateAccess) {
            return `<button class="btn btn-link" type="button" (click)="delete(params)"><i class="fas fa-trash-alt" data-action-type="remove" title="Delete"></i></button>
          <button type="button" class="btn btn-link" data-action-type="edit" ><i class="fas fas fa-pen" title="Edit Value" data-action-type="edit"></i></button>`;
          } else if (!this.hasDeleteAccess && this.hasUpdateAccess) {
            return `<button type="button" class="btn btn-link" data-action-type="edit" ><i class="fas fas fa-pen" title="Edit Value" data-action-type="edit"></i></button>`;
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
    ];
  }

  private createColumnDefsRO() {
    return [
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
    ];
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    // this.api.sizeColumnsToFit();
  }

  onConfigChange(param: string) {
    if (!this.isCompleted) {
      this.configService.getById(param)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.configValueList = data.object;
          },
          error: () => {


            this.loading = false;
          }
        });
    }
  }

  open(param: string, param1: string) {
    if (!this.isCompleted) {
      const initialState = {
        itemId: param,
        id: param1
      };
      this.bsModalRef = this.modalService.show(WorkdoneContentComponent, { initialState });
    }
  }

  openPrev(param: string) {
    if (!this.isCompleted) {
      const initialState = {
        id: param
      };

      this.bsModalRef = this.modalService.show(PreventivemaintenancetableComponent, { initialState });
    }
  }
  // opentime
  opentime(param: string, param1: string) {
    if (!this.isCompleted) {
      const initialState = {
        itemId: param,
        id: param1
      };
      this.bsModalRef = this.modalService.show(WorkTimeContentComponent, { initialState });
    }
  }

  // addPartcons
  addPartcons() {
    if (!this.isCompleted) {
      const v = this.ServiceReportform.get('consumed').value;
      if (v == null || v == "") return;
      this.srConsumedModel = new sparePartsConsume();
      this.srConsumedModel.partno = v.partNo;
      this.srConsumedModel.hsccode = v.hscCode;
      this.srConsumedModel.qtyconsumed = "0";
      this.srConsumedModel.servicereportid = this.ServiceReportId;
      this.srConsumedModel.qtyAvailable = v.qtyAvailable?.toString();
      this.srConsumedModel.customerSPInventoryId = v.id;
      if (v.id != null && v.id != "" && v.id != undefined) {

        this.srConsumedservice.save(this.srConsumedModel)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (data.result) {
                this.notificationService.filter('itemadded');
              }
              this.loading = false;
            }
          });
      } else {
        this.notificationService.showInfo("Incorrect Value", "Error")
      }
      this.ServiceReportform.get('consumed').setValue("");
    }
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
        lockPosition: "left",

        cellRenderer: () => {
          if (this.hasDeleteAccess && !this.hasUpdateAccess) {
            return `<button class="btn btn-link" type="button" (click)="delete(params)"><i class="fas fa-trash-alt" data-action-type="remove" title="Delete"></i></button>`;
          } else if (this.hasDeleteAccess && this.hasUpdateAccess) {
            return `<button class="btn btn-link" type="button" (click)="delete(params)"><i class="fas fa-trash-alt" data-action-type="remove" title="Delete"></i></button>
          <button type="button" class="btn btn-link" data-action-type="edit" ><i class="fas fas fa-save" title="Edit Value" data-action-type="edit"></i></button>`;
          } else if (!this.hasDeleteAccess && this.hasUpdateAccess) {
            return `<button type="button" class="btn btn-link" data-action-type="edit" ><i class="fas fas fa-save" title="Edit Value" data-action-type="edit"></i></button>`;
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
        headerName: 'Qty Consumed',
        field: 'qtyconsumed',
        filter: false,
        enableSorting: false,
        editable: true,
        sortable: false
      },
      {
        headerName: 'Description',
        field: 'itemDesc',
        filter: false,
        enableSorting: false,
        editable: true,
        sortable: false
      },
    ];
  }
  private createColumnspDefsRO() {
    return [
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
        headerName: 'Qty Consumed',
        field: 'qtyconsumed',
        filter: false,
        enableSorting: false,
        editable: true,
        sortable: false
      },
      {
        headerName: 'Description',
        field: 'itemDesc',
        filter: false,
        enableSorting: false,
        editable: true,
        sortable: false
      },
    ];
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
        lockPosition: "left",
        cellRenderer: () => {
          if (this.hasDeleteAccess && !this.hasUpdateAccess) {
            return `<button class="btn btn-link" type="button" (click)="delete(params)"><i class="fas fa-trash-alt" data-action-type="remove" title="Delete"></i></button>`;
          } else if (this.hasDeleteAccess && this.hasUpdateAccess) {
            return `<button class="btn btn-link" type="button" (click)="delete(params)"><i class="fas fa-trash-alt" data-action-type="remove" title="Delete"></i></button>
          <button type="button" class="btn btn-link" data-action-type="edit" ><i class="fas fas fa-save" title="Edit Value" data-action-type="edit"></i></button>`;
          } else if (!this.hasDeleteAccess && this.hasUpdateAccess) {
            return `<button type="button" class="btn btn-link" data-action-type="edit" ><i class="fas fas fa-save" title="Edit Value" data-action-type="edit"></i></button>`;
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
      },
      {
        headerName: 'Description',
        field: 'itemDesc',
        filter: false,
        width: 350,
        enableSorting: false,
        editable: false,
        sortable: false
      }
    ];
  }

  private createColumnspreDefsRO() {
    return [
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
      },
      {
        headerName: 'Description',
        field: 'itemDesc',
        filter: false,
        width: 350,
        enableSorting: false,
        editable: false,
        sortable: false
      }
    ];
  }

  public onPdfRowClicked(e) {
    if (!this.isCompleted) {
      if (e.event.target !== undefined) {
        const data = e.data;
        const actionType = e.event.target.getAttribute('data-action-type');
        this.ServiceReportId = this.route.snapshot.paramMap.get('id');
        switch (actionType) {
          case 'remove':
            if (confirm('Are you sure, you want to remove the config type?') == true) {
              // this.instrumentService.deleteConfig(data.configTypeid, data.configValueid)
              this.fileshareService.delete(data.id)
                .pipe(first())
                .subscribe({
                  next: (d: any) => {
                    if (d.result) {
                      this.notificationService.showSuccess(d.resultMessage, 'Success');
                      this.fileshareService.getById(this.ServiceReportId)
                        .pipe(first())
                        .subscribe({
                          next: (data: any) => {
                            this.PdffileData = data.object;
                            // this.getPdffile(data.object.filePath);
                          },
                          error: () => {


                            this.loading = false;
                          }
                        });
                    }
                  },
                  error: () => {


                    this.loading = false;
                  }
                });
            }
            break;
          case 'download':
            this.getPdffile(data.filePath);
        }
      }
    }
  }

  getPdffile(filePath: string) {
    if (filePath != null && filePath != '') {
      this.uploadService.getFile(filePath)
        .pipe(first())
        .subscribe({
          next: (data: any) => this.download(data.data)
        });
    }
  }

  download(fileData: any) {
    const byteArray = new Uint8Array(atob(fileData).split('').map(char => char.charCodeAt(0)));
    const b = new Blob([byteArray], { type: 'application/pdf' });
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
        headerName: 'Action',
        field: 'id',
        filter: false,
        editable: false,
        sortable: false,
        lockPosition: "left",
        cellRendererFramework: FilerendercomponentComponent,
        cellRendererParams: {
          deleteaccess: this.hasDeleteAccess && this.isEditMode,
          id: this.ServiceReportId
        },
      },
      {
        headerName: 'File Name',
        field: 'displayName',
        filter: true,
        tooltipField: 'File Name',
        enableSorting: true,
        editable: false,
        sortable: true,
      },
    ];
  }

  private pdfcreateColumnDefsRO() {
    return [
      {
        headerName: 'File Name',
        field: 'displayName',
        filter: true,
        tooltipField: 'File Name',
        enableSorting: true,
        editable: false,
        sortable: true,
      },
    ];
  }

  saveFileShare(id: string) {
    // fileshare: FileShare;
    if (!this.isCompleted) {
      if (this.pdfPath != null) {
        for (let i = 0; i < this.pdfPath.length; i++) {
          const fileshare = new FileShare();
          fileshare.fileName = this.pdfPath[i].fileName;
          fileshare.filePath = this.pdfPath[i].filepath;
          fileshare.parentId = id;
          this.fileshareService.save(fileshare)
            .pipe(first())
            .subscribe({
              next: (data: ResultMsg) => {
                if (data.result) {
                  this.notificationService.showSuccess(data.resultMessage, 'Success');
                  this.notificationService.filter("itemadded");
                }
                this.loading = false;
              },
              error: () => {


                this.loading = false;
              }
            });
        }
      }
    }
  }

  GeneratePDF(preview: boolean) {
    if (!preview) {
      if (!this.isCompleted) {
        if (confirm(`Do you really want to send the service report to below customer emails:\n \t${this.ServiceRequest.operatoremail} \n\t ${this.ServiceRequest.email}`)) {
          this.pdf(preview);
        }
      }
    } else {
      this.pdf(preview);
    }
  }

  pdf(preview: boolean, currentWindow: boolean = false) {
    this.ServiceReportService.getView(this.ServiceReportId)
      .pipe(first()).subscribe({
        next: (data: any) => {
          data = data.object;
          let totalHrs = 0;

          this.preventivemaintenancesService.getById(this.ServiceReportId)
            .pipe(first()).subscribe({
              next: () => {
                this.serviceRequestService.getById(data.serviceRequestId)
                  .pipe(first()).subscribe((serReq: any) => {

                    {

                      if (data.custsignature == null) {

                        data.custsignature = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAI8AAABSCAYAAABtw4diAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAADiSURBVHhe7dIxAcAgEMDAp/49A0MNkPluiYGsfQ0E3194Zh4y85CZh8w8ZOYhMw+ZecjMQ2YeMvOQmYfMPGTmITMPmXnIzENmHjLzkJmHzDxk5iEzD5l5yMxDZh4y85CZh8w8ZOYhMw+ZecjMQ2YeMvOQmYfMPGTmITMPmXnIzENmHjLzkJmHzDxk5iEzD5l5yMxDZh4y85CZh8w8ZOYhMw+ZecjMQ2YeMvOQmYfMPGTmITMPmXnIzENmHjLzkJmHzDxk5iEzD5l5yMxDZh4y85CZh8w8ZOYhMw+ZecjMQzRzAO/qBKDxFE3sAAAAAElFTkSuQmCC';
                      }
                      if (data.engsignature == null) {

                        data.engsignature = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAI8AAABSCAYAAABtw4diAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAADiSURBVHhe7dIxAcAgEMDAp/49A0MNkPluiYGsfQ0E3194Zh4y85CZh8w8ZOYhMw+ZecjMQ2YeMvOQmYfMPGTmITMPmXnIzENmHjLzkJmHzDxk5iEzD5l5yMxDZh4y85CZh8w8ZOYhMw+ZecjMQ2YeMvOQmYfMPGTmITMPmXnIzENmHjLzkJmHzDxk5iEzD5l5yMxDZh4y85CZh8w8ZOYhMw+ZecjMQ2YeMvOQmYfMPGTmITMPmXnIzENmHjLzkJmHzDxk5iEzD5l5yMxDZh4y85CZh8w8ZOYhMw+ZecjMQzRzAO/qBKDxFE3sAAAAAElFTkSuQmCC';
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
                        x.worktimedate = this.datepipe.transform(GetParsedDate(x.worktimedate), 'dd/MM/YYYY');
                        totalHrs = totalHrs + Number(x.perdayhrs);
                      });
                      data.nextvisitscheduled = this.datepipe.transform(GetParsedDate(data.nextvisitscheduled), 'dd/MM/YYYY');
                      if (data.nextvisitscheduled == "" || data.nextvisitscheduled == null) data.nextvisitscheduled = "NIL";

                      serReq = serReq.object.engAction
                      serReq.forEach((value) => {
                        value.actiondate = this.datepipe.transform(GetParsedDate(value.actiondate), 'dd/MM/YYYY')
                      })

                    }

                    const docDefinition = {
                      footer: (currentPage, pageCount) => {
                        return [
                          {
                            columns: [
                              { text: `${this.datepipe.transform(new Date, "MM/dd/yyy")}`, alignment: 'left', margin: [15, 5, 15, 2] },
                              { text: `*This is a system generated PDF.`, alignment: 'center', margin: [15, 5, 15, 2] },
                              { text: `${currentPage.toString()} | ${pageCount}`, alignment: 'right', margin: [15, 5, 15, 2] },
                            ]
                          }
                        ];
                      },
                      content: [
                        {
                          image: 'data:image/png;base64,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',
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
                                { text: 'Customer', bold: true, fillColor: '#00573F', color: '#fff' },
                                { text: data.customer },
                                { text: 'OF', bold: true, fillColor: '#00573F', color: '#fff' },
                                { text: `${data.srof}/${data.serReqNo}` },
                              ],
                              [
                                { text: 'Department', bold: true, fillColor: '#00573F', color: '#fff' },
                                { text: data.department },
                                { text: 'Country', bold: true, fillColor: '#00573F', color: '#fff' },
                                { text: data.country },
                              ],
                              [
                                { text: 'Town', bold: true, fillColor: '#00573F', color: '#fff' },
                                { text: data.town },
                                { text: 'Resp. for Instrument', bold: true, fillColor: '#00573F', color: '#fff' },
                                { text: data.respInstrumentFName + ' ' + data.respInstrumentLName },
                              ],
                              [
                                { text: 'Lab Chief', bold: true, fillColor: '#00573F', color: '#fff' },
                                { text: data.labChief },
                                { text: 'Computer ARL S/N', bold: true, fillColor: '#00573F', color: '#fff' },
                                { text: data.computerarlsn },
                              ],
                              [
                                { text: 'Instrument', bold: true, fillColor: '#00573F', color: '#fff' },
                                { text: data.instrument },
                                { text: 'Software', bold: true, fillColor: '#00573F', color: '#fff' },
                                { text: data.software },
                              ],
                              [
                                { text: 'Brand Name', bold: true, fillColor: '#00573F', color: '#fff' },
                                { text: data.brandName },
                                { text: 'Firmware', bold: true, fillColor: '#00573F', color: '#fff' },
                                { text: data.firmaware },
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
                                { text: 'Installation', bold: true, fillColor: '#00573F', color: '#fff' },
                                {
                                  image: data.installation,
                                  width: 10,
                                  height: 10
                                },

                                { text: 'Analytical Assistance', bold: true, fillColor: '#00573F', color: '#fff' },
                                {
                                  image: data.analyticalassit,
                                  width: 10,
                                  height: 10
                                },

                                { text: 'Rework', bold: true, fillColor: '#00573F', color: '#fff' },
                                {
                                  image: data.rework,
                                  width: 10,
                                  height: 10
                                },

                                { text: 'Prev. Maintenance', bold: true, fillColor: '#00573F', color: '#fff' },
                                {
                                  image: data.prevmaintenance,
                                  width: 10,
                                  height: 10
                                },

                                { text: 'Corr. Maintenance', bold: true, fillColor: '#00573F', color: '#fff' },
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
                                { text: 'Problems:', bold: true, fillColor: '#00573F', color: '#fff' }
                              ],
                              [
                                { text: data.problem }
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
                                { text: 'Work Done:', bold: true, fillColor: '#00573F', color: '#fff' },
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
                                { text: 'Service Type', bold: true, fillColor: '#00573F', color: '#fff' },
                                { text: data.requestType },


                                { text: 'Attachment', bold: true, fillColor: '#00573F', color: '#fff' },
                                {
                                  image: data.attachment,
                                  width: 10,
                                  height: 10
                                },

                                { text: 'Work Completed', bold: true, fillColor: '#00573F', color: '#fff' },
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
                                  {
                                    image: data.workfinished,
                                    height: 10,
                                    width: 10
                                  },
                                  { text: 'Work Finished', width: 65 },
                                  {
                                    image: data.interrupted,
                                    height: 10,
                                    width: 10
                                  },
                                  { text: 'Interrupted', width: 55 },
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
                                        fillColor: '#00573F',
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
                                        fillColor: '#00573F',
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
                                      { text: 'Customer Name & Signature', bold: true, fillColor: '#00573F', color: '#fff' }
                                    ],
                                    [
                                      {
                                        image: data.custsignature,
                                        width: 105,
                                        height: 42
                                      }
                                    ],
                                    [
                                      { text: data.signcustname }
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
                                      { text: 'Engineer Name & Signature', bold: true, fillColor: '#00573F', color: '#fff' }
                                    ],
                                    [
                                      {
                                        image: data.engsignature,
                                        width: 105,
                                        height: 42
                                      }
                                    ],
                                    [
                                      { text: data.signengname }
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
                                      { text: 'Date:', bold: true, fillColor: '#00573F', color: '#fff' },
                                      { text: this.datepipe.transform(Date.now(), 'dd-MMM-yy'), width: 150 },
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
                                      { text: 'Working Time', bold: true, fillColor: '#00573F', color: '#fff' },
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
                                      { text: 'Date:', fillColor: 'lightgrey', fontSize: 10 },
                                      { text: 'Start Time:', fillColor: 'lightgrey', fontSize: 10 },
                                      { text: 'End Time:', fillColor: 'lightgrey', fontSize: 10 },
                                      { text: 'Total Hours:', fillColor: 'lightgrey', fontSize: 10 },
                                    ],
                                    ...data.workTime.map(t => (
                                      [t.worktimedate, t.starttime, t.endtime, t.perdayhrs]
                                    )),
                                    [
                                      { text: 'Total Days', fontSize: 10 },
                                      { text: data.totalDays },
                                      { text: 'Total Hours', fontSize: 10 },
                                      { text: totalHrs },
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
                          table: {
                            widths: ['auto', '*'],
                            body: [
                              [
                                { text: 'Engineer\'s Comments:', fillColor: '#00573F', color: '#fff' },
                                {
                                  text: data.engineercomments
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
                                { text: 'Spare Parts Consumed:', fillColor: '#00573F', color: '#fff' },
                              ],
                              ...data.spConsumed.map(p => ([p.partno + ' - ' + p.itemDesc + ' - ' + p.qtyAvailable]))
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
                                { text: 'Spare Parts Recommended:', fillColor: '#00573F', color: '#fff' },
                              ],
                              ...data.spRecomm.map(p => ([p.partno + ' - ' + p.itemDesc + ' - ' + p.qtyrecommended]))
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
                            widths: ['20%', '15%', '15%', '50%'],
                            body: [
                              [
                                { text: 'Engineer Name:', bold: true, fillColor: '#00573F', color: '#fff' },
                                { text: 'Action Taken:', bold: true, fillColor: '#00573F', color: '#fff' },
                                { text: 'Action Date:', bold: true, fillColor: '#00573F', color: '#fff' },
                                { text: 'Comments:', bold: true, fillColor: '#00573F', color: '#fff' },
                              ],

                              ...serReq.map(p => ([p.engineername, p.actiontakenId, p.actiondate, p.comments]))

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
                      pageMargins: [40, 10, 40, 60]
                    };

                    preview ? (currentWindow ? pdfMake.createPdf(docDefinition).open({}, window) : pdfMake.createPdf(docDefinition).open()) :
                      // preview ? pdfMake.createPdf(docDefinition).download(`${data.serReqNo}.pdf`) :
                      pdfMake.createPdf(docDefinition).getBase64(data => {
                        const obj = {
                          serReqId: this.ServiceRequestId,
                          pdf: data
                        };
                        this.ServiceReportService.GenerateServciesReport(obj).pipe(first()).subscribe((data: any) => {
                          if (data.result) {
                            this.notificationService.showSuccess(data.resultMessage, "Success")
                            this.router.navigate(['servicereportlist'])
                          }
                        });
                      });
                  })

              }
            });

        }
      }
      );
  }
}
