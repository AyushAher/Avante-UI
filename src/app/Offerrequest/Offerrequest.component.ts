import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ColumnApi, GridApi } from 'ag-grid-community';
import { Guid } from 'guid-typescript';
import { first } from 'rxjs/operators';
import { Currency, Distributor, ResultMsg, User } from '../_models';
import { Offerrequest } from '../_models/Offerrequest.model';
import {
  AccountService,
  AlertService,
  CountryService,
  CurrencyService,
  CustomerService,
  DistributorService,
  FileshareService,
  InstrumentService,
  ListTypeService,
  NotificationService,
  ProfileService
} from '../_services';
import { OfferrequestService } from '../_services/Offerrequest.service';
import { SparePartsOfferRequestService } from '../_services/sparepartsofferrequest.service';
import { FilerendercomponentComponent } from './filerendercomponent.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SparequotedetComponent } from './sparequotedet.component';
import { SparequotedetService } from '../_services/sparequotedet.service';
import { OfferRequestProcessesService } from '../_services/offer-request-processes.service';
import { EnvService } from '../_services/env/env.service';
import { AgRendererComponent } from 'ag-grid-angular';
import { GetParsedDate } from '../_helpers/Providers';

@Component({
  selector: 'app-Offerrequest',
  templateUrl: './Offerrequest.component.html',
})
export class OfferrequestComponent implements OnInit {
  form: FormGroup;
  model: Offerrequest;
  submitted = false;
  id: any;
  user: User;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasCommercial: boolean = false;
  hasAddAccess: boolean = false;
  hasInternalAccess: boolean = false;
  profilePermission: any;

  currencyList: Currency[];
  public columnDefs: any[];
  public columnDefsAttachments: any[];
  private columnApi: ColumnApi;
  private api: GridApi;
  hasId: boolean;
  distributorList: Distributor[];
  sparePartPartNo: any;
  sparePartsAutoComplete: any;
  sparePartsList: any[] = [];

  file: any;
  attachments: any;
  fileList: [] = [];
  transaction: number;
  hastransaction: boolean;
  bsModalRef: BsModalRef;
  SpareQuotationDetailsList = [];
  SpareQuotationDetails: any[] = [];
  datepipie = new DatePipe('en-US');
  ColumnDefsSPDet: any[];
  prevNotCompleted: boolean = false;

  CompletedId = 'COMP';
  statusList: any;
  zohocode: any;
  role: any;
  hasQuoteDet: boolean = false;
  @ViewChild('sparePartsSearch') sparePartsSearch: any
  processList: any;
  processFile: any
  isDist: boolean = false;
  hasOfferRaised: boolean = false;
  paymentTypes: any;
  payTypes: any;

  customerList: any[];
  rowData: any[] = [];
  instruments = []
  instrumentslst = []
  vScroll: boolean = true;
  isLocked: boolean;
  processGridDefs: any[];
  stagesList: any;
  isPaymentTerms: boolean;
  datepipe = new DatePipe('en-US')
  @ViewChild('stageFiles') stageFiles;
  isPaymentAmt: any;
  isCompleted: any;
  isEditMode: any;
  isNewMode: any;
  @ViewChild('baseAmt') baseAmt
  baseCurrId: any;
  mainCurrencyId: any
  costUsd
  customerId: any;
  siteList: any[]
  totalStages = 0;
  formData: any;
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private notificationService: NotificationService,
    private Service: OfferrequestService,
    private currencyService: CurrencyService,
    private DistributorService: DistributorService,
    private profileService: ProfileService,
    private FileShareService: FileshareService,
    private SparePartsService: SparePartsOfferRequestService,
    private modalService: BsModalService,
    private SpareQuoteDetService: SparequotedetService,
    private listTypeService: ListTypeService,
    private offerRequestProcess: OfferRequestProcessesService,
    private custService: CustomerService,
    private instrumentService: InstrumentService,
    private environment: EnvService,
  ) {
    this.notificationService.listen().subscribe((m: any) => {
      if (this.id != null) {
        this.SpareQuoteDetService.getAll(this.id).pipe(first())
          .subscribe({
            next: (data: any) => {
              this.SpareQuotationDetailsList = data.object;
              this.SpareQuotationDetailsList.forEach(value => {
                value.zohoPORaisedDate = this.datepipie.transform(GetParsedDate(value.zohoPORaisedDate), "dd/MM/YYYY");
                value.deliveredOn = this.datepipie.transform(GetParsedDate(value.deliveredOn), "dd/MM/YYYY");
                value.custResponseDate = this.datepipie.transform(GetParsedDate(value.custResponseDate), "dd/MM/YYYY");
                value.raisedDate = this.datepipie.transform(GetParsedDate(value.raisedDate), "dd/MM/YYYY");
              })
            },
          });
        this.SpareQuoteDetService.getPrev(this.id)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              this.listTypeService.getById("SQDTS")
                .pipe(first())
                .subscribe({
                  next: (stat: any) => {
                    this.statusList = stat;
                    let compStatus = this.statusList.filter(x => x.listTypeItemId == data.object.status)[0]?.itemCode;
                    if (compStatus != null) {
                      this.prevNotCompleted = compStatus != this.CompletedId && compStatus != null;
                    } else {
                      this.prevNotCompleted = false
                    }
                  }
                });
            }
          })

        this.offerRequestProcess.getAll(this.id).pipe(first())
          .subscribe((stageData: any) => {
            stageData.object.forEach(element => {
              element.createdOn = this.datepipe.transform(GetParsedDate(element.createdOn), 'dd/MM/YYYY')
            });
            this.rowData = stageData.object;
            this.rowData?.sort((a, b) => a.stageIndex - b.stageIndex);
            this.totalStages = this.rowData?.length | 0;
            this.form.get('stageName').reset()
            this.form.get('stageComments').reset()
            this.form.get('payterms').reset()
            this.form.get('payAmt').setValue(0)
            this.stageFiles.nativeElement.value = "";
            var selectedfiles = document.getElementById("stageFilesList");
            selectedfiles.innerHTML = '';
            this.isPaymentAmt = false;
          })

      }
    });

  }

  async ngOnInit() {
    this.transaction = 0;
    this.user = this.accountService.userValue;
    let role = JSON.parse(sessionStorage.getItem('roles'));
    this.profilePermission = this.profileService.userProfileValue;

    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "OFREQ");
      if (profilePermission.length > 0) {
        this.hasReadAccess = profilePermission[0].read;
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
        this.hasUpdateAccess = profilePermission[0].update;
        this.hasCommercial = profilePermission[0].commercial;
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
      this.role = role[0]?.itemCode;
    }


    this.form = this.formBuilder.group({
      isactive: [true],
      offReqNo: [''],
      distributorid: ['', Validators.required],
      totalamount: [0],
      currencyId: ['', Validators.required],
      authtoken: [''],
      status: [''],
      otherSpareDesc: [''],
      podate: [this.datepipe.transform(new Date, "dd/MM/YYYY"), Validators.required],
      spareQuoteNo: [{ value: '', disabled: true }],
      payterms: [''],
      paymentTerms: [""],
      customerId: ["", Validators.required],
      instrumentsList: ['', Validators.required],
      payAmt: [0],
      payAmtCurrencyId: [""],
      stageName: [''],
      baseCurrencyAmt: [1.00, Validators.required],
      baseCurrencyId: ["", Validators.required],
      stageComments: [''],
      stagePaymentType: [],

      airFreightChargesAmt: [0],
      airFreightChargesCurr: [""],
      customerSiteId: ["", Validators.required],

      lcadministrativeChargesAmt: [0],
      lcadministrativeChargesCurr: [""],

      inspectionChargesCurr: [""],
      inspectionChargesAmt: [0],

      totalAmt: [0],
      totalCurr: [""],
      mainCurrencyId: [""],
      basePCurrencyAmt: [1],

    })


    this.form.get("airFreightChargesAmt").valueChanges
      .subscribe(() => this.GetSparePartTotal())

    this.form.get("airFreightChargesAmt").valueChanges
      .subscribe(() => this.GetSparePartTotal())

    this.form.get("inspectionChargesAmt").valueChanges
      .subscribe(() => this.GetSparePartTotal())

    this.form.get("lcadministrativeChargesAmt").valueChanges
      .subscribe(() => this.GetSparePartTotal())

    this.form.get("basePCurrencyAmt").valueChanges
      .subscribe(() => this.GetSparePartTotal())

    this.form.get("customerSiteId").valueChanges
      .subscribe((value) => {
        this.instrumentslst = this.instruments.filter(x => x.custSiteId == value)
      })

    this.form.get("mainCurrencyId").valueChanges
      .subscribe((data) => {
        this.mainCurrencyId = data
        this.f.totalCurr.setValue(data)
        this.f.inspectionChargesCurr.setValue(data)
        this.f.lcadministrativeChargesCurr.setValue(data)
        this.f.airFreightChargesCurr.setValue(data)
        this.f.payAmtCurrencyId.setValue(data)
        this.f.currencyId.setValue(data)
      })

    this.id = this.route.snapshot.paramMap.get('id');

    var data: any = await this.instrumentService.getAll(this.user.userId).toPromise()
    this.instruments = data.object

    await this.SetCustomer(true)

    this.listTypeService.getById("OFRQP").pipe(first())
      .subscribe((data: any) => this.stagesList = data)

    if (this.role == this.environment.distRoleCode) {
      this.DistributorService.getByConId(this.user.contactId).pipe(first())
        .subscribe((data: any) => {
          this.form.get('distributorid').setValue(data.object[0]?.id)
          this.form.get('distributorid').clearValidators()
          this.form.get('distributorid').updateValueAndValidity()
        })
    }

    if (this.role == this.environment.distRoleCode) this.isDist = true

    if (this.id != null) {
      this.Service.getById(this.id)
        .pipe(first())
        .subscribe((data: any) => {
          this.listTypeService.getById("ORQPT")
            .pipe(first())
            .subscribe((mstData: any) => {
              this.f.mainCurrencyId.setValue(data.object.airFreightChargesCurr)

              this.isCompleted = data.object.isCompleted
              data.object.paymentTerms = data.object.paymentTerms?.split(',').filter(x => x != "");

              this.paymentTypes = []
              this.payTypes = mstData;


              data.object.paymentTerms?.forEach(y => {
                mstData.forEach(x => {
                  if (y == x.listTypeItemId) {
                    this.paymentTypes.push(x)
                  }
                });
              });

              this.customerId = data.object.customerId;
              this.siteList = this.customerList.find(x => x.id == this.customerId)?.sites;

              this.offerRequestProcess.getAll(this.id).pipe(first())
                .subscribe((stageData: any) => {
                  stageData.object.forEach(element => {
                    element.createdOn = this.datepipe.transform(GetParsedDate(element.createdOn), 'dd/MM/YYYY')
                  });

                  this.formData = data.object;
                  this.form.patchValue(this.formData);

                  setTimeout(() => {
                    var instrumentLst = []
                    data.object.instrumentsList = data.object.instrumentsList.split(',').filter(x => x != "")
                    data.object.instrumentsList.forEach(ins => {
                      if (this.instrumentslst.find(x => x.id == ins) != null) instrumentLst.push(ins)
                    });
                    data.object.instrumentsList = instrumentLst;

                    this.formData = data.object;
                    this.form.patchValue(this.formData);
                  }, 500);

                  this.rowData = stageData.object;
                  this.rowData?.sort((a, b) => a.stageIndex - b.stageIndex);
                  this.totalStages = this.rowData?.length | 0;
                  this.GetSparePartTotal()
                  setTimeout(() => this.form.get('stageName').reset(), 200);
                })
            })
        });

      this.Service.GetSpareQuoteDetailsByParentId(this.id)
        .pipe(first())
        .subscribe((data: any) => {
          this.SpareQuotationDetails = data.object;
        });


      this.SparePartsService.getSparePartsByOfferRequestId(this.id)
        .pipe(first())
        .subscribe((data: any) => {
          this.sparePartsList = data.object;
          this.GetSparePartTotal()
          this.api.setRowData(this.sparePartsList);
        });

      this.hasId = true;
      this.form.disable();

      this.columnDefs = this.createColumnDefsRO();
      this.columnDefsAttachments = this.createColumnDefsAttachmentsRO();
    }

    else {
      this.FormControlDisable()
      this.isNewMode = true
      this.columnDefs = this.createColumnDefs();
      this.columnDefsAttachments = this.createColumnDefsAttachments();
      this.hasId = false;
      this.id = Guid.create();
      this.id = this.id.value;
      this.listTypeService.getById("ORQPT").pipe(first())
        .subscribe((mstData: any) => {
          this.payTypes = mstData;
        })
    }


    this.currencyService.getAll().pipe(first())
      .subscribe((data: any) => {
        this.currencyList = data.object
        this.baseCurrId = data.object.find(x => x.code == this.environment.baseCurrencyCode)?.id
        this.form.get("baseCurrencyId").setValue(this.baseCurrId)
      })

    this.form.get('baseCurrencyAmt').valueChanges
      .subscribe(value => {
        if (value >= 1000) this.form.get('baseCurrencyAmt').setValue(1.0)
      });

    this.form.get('payAmtCurrencyId').valueChanges
      .subscribe(value => {
        if (this.isPaymentAmt) {
          if (value == this.form.get('baseCurrencyId').value) {
            this.form.get('baseCurrencyAmt').setValue(1.00)
            this.baseAmt.nativeElement.disabled = true
          }
          else this.baseAmt.nativeElement.disabled = false
        }
      });

    this.DistributorService.getAll().pipe(first())
      .subscribe((data: any) => this.distributorList = data.object)

    this.SpareQuoteDetService.getAll(this.id).pipe(first())
      .subscribe({
        next: (data: any) => {
          this.SpareQuotationDetailsList = data.object;
          this.SpareQuotationDetailsList.forEach(value => {
            value.zohoPORaisedDate = this.datepipie.transform(GetParsedDate(value.zohoPORaisedDate), 'dd/MM/YYYY');
            value.deliveredOn = this.datepipie.transform(GetParsedDate(value.deliveredOn), 'dd/MM/YYYY');
            value.custResponseDate = this.datepipie.transform(GetParsedDate(value.custResponseDate), 'dd/MM/YYYY');
            value.raisedDate = this.datepipie.transform(GetParsedDate(value.raisedDate), 'dd/MM/YYYY');
          })

        }
      })

    if (this.hasId) {
      this.SpareQuoteDetService.getPrev(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.listTypeService.getById("SQDTS")
              .pipe(first())
              .subscribe({
                next: (stat: any) => {
                  this.statusList = stat;
                  let compStatus = this.statusList.filter(x => x.listTypeItemId == data.object.status)[0]?.itemCode;
                  if (compStatus != null) {
                    this.prevNotCompleted = compStatus != this.CompletedId && compStatus != null;
                  } else {
                    this.prevNotCompleted = false
                  }
                }
              });
          }
        })
    }
    this.GetFileList(this.id);


    if (this.isCompleted) {
      setInterval(() => this.form.disable(), 10);
    }
    this.GetSparePartTotal()

  }

  async CustomerChange() {
    await this.SetCustomer();
    this.customerId = this.f.customerId.value;
    this.siteList = this.customerList.find(x => x.id == this.customerId)?.sites;
    setTimeout(() => { this.f.customerSiteId.setValue(""); }, 0);
  }

  async SetCustomer(setCustomer = false) {
    var data: any = await this.custService.getAllByConId(this.user.contactId).toPromise()

    let custList = []
    if (this.role == this.environment.distRoleCode) {
      let regions = this.user.distRegionsId.split(',')

      data.object.forEach(element => {
        if (regions.includes(element.defdistregionid)) {
          custList.push(element)
        }
      });

    }

    else if (this.role == this.environment.custRoleCode) {
      var custData: any = await this.custService.getAllByConId(this.user.contactId).toPromise();
      custData.object?.forEach(element => {
        custList.push(element)
      });

      this.form.get('customerId').setValue(custData.object[0]?.id)
      this.form.get('customerId').updateValueAndValidity()
      this.siteList = custData.object[0]?.sites;
      this.form.get('distributorid').setValue(custData.object[0]?.defdistid)
      this.form.get('distributorid').updateValueAndValidity()
    }

    if (setCustomer) this.customerList = data.object;
  }

  GetSparePartTotal() {
    let total = 0;
    this.sparePartsList?.forEach((x) => {
      total += (x.price * x.qty)
    })

    total += this.form.get("inspectionChargesAmt").value;
    total += this.form.get("lcadministrativeChargesAmt").value;
    total += this.form.get("airFreightChargesAmt").value;

    this.form.get("totalAmt").setValue(total);
    this.costUsd = total * this.form.get("basePCurrencyAmt").value;
    this.costUsd = Math.round(this.costUsd * 100) / 100
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

      this.form.enable();
      this.api.redrawRows()
      this.columnDefs = this.createColumnDefs();
      this.columnDefsAttachments = this.createColumnDefsAttachments();
      this.FormControlDisable();
      let curr = this.form.get('payAmtCurrencyId')
      curr.setValue(curr.value)
    }
  }

  Back() {
    this.router.navigate(["offerrequestlist"]);
  }

  CancelEdit() {
    if (!confirm("Are you sure you want to discard changes?")) return;
    if (this.id != null) this.form.patchValue(this.formData);
    else this.form.reset();
    this.form.disable();
    this.columnDefs = this.createColumnDefsRO();
    this.columnDefsAttachments = this.createColumnDefsAttachmentsRO();
    this.isEditMode = false;
    this.isNewMode = false;
    this.api.redrawRows();
    this.notificationService.SetNavParam();
  }

  FormControlDisable() {
    this.form.get('podate').disable();
    this.form.get('baseCurrencyId').disable()

    if (this.role == this.environment.distRoleCode) {
      this.form.get('distributorid').disable()
      this.form.get('podate').enable();
    }

    else if (this.role == this.environment.custRoleCode)
      this.form.get('customerId').disable()


  }

  DeleteRecord() {
    if (confirm("Are you sure you want to delete the record?")) {

      this.Service.delete(this.id).pipe(first())
        .subscribe((data: any) => {
          if (data.result)
            this.router.navigate(["offerrequestlist"], {
              //relativeTo: this.activeRoute,
              queryParams: { isNSNav: true },
              //queryParamsHandling: 'merge'
            })
        })
    }
  }

  refreshStages() {
    this.notificationService.filter("itemadded");
  }

  DisableChoseFile(className) {
    let ofer = <HTMLInputElement>document.querySelector(`input[type="file"].` + className)
    ofer.disabled = !ofer.disabled
  }


  submitStageData() {

    if (this.isPaymentTerms) {
      this.form.get('payterms').setValidators([Validators.required])
      this.form.get('payterms').updateValueAndValidity();

      if (this.f.payterms.errors) return this.notificationService.showInfo("Payterms is required", "Info")
    }

    if (this.isPaymentAmt) {
      this.form.get('payAmt').setValidators([Validators.required])
      this.form.get('payAmt').updateValueAndValidity();

      if (this.f.payAmt.errors || !this.f.payAmtCurrencyId.value) return this.notificationService.showInfo("Payment Amount is required", "Info")
    }

    if (this.f.stageName.errors || !this.f.stageName.value) return this.notificationService.showInfo("Stage Name cannot be empty", "Info")

    if (this.f.stageComments.errors || !this.f.stageComments.value) return this.notificationService.showInfo("Comments cannot be empty", "Info")

    let hasNoAttachment = false;

    let Attachment = <HTMLInputElement>document.getElementById("stageFilesList_Attachment")
    if (Attachment) hasNoAttachment = Attachment.checked


    let comments = this.form.get('stageComments').value;

    if (!hasNoAttachment && this.processFile == null) return this.notificationService.showInfo("No Attachments Selected.", "Error")

    this.submitted = true;
    let stage = this.form.get('stageName').value
    let index = 0;
    let paymentTerms = this.form.get('payterms').value;
    let payAmt = this.form.get('payAmt').value
    let payAmtCurrencyId = this.form.get('payAmtCurrencyId').value

    let offerProcess = {
      isactive: false,
      comments,
      IsCompleted: true,
      parentId: this.id,
      stage,
      index,
      payAmt,
      stageIndex: this.totalStages + 1,
      paymentTypeId: paymentTerms,
      payAmtCurrencyId,
      baseCurrencyId: this.baseCurrId,
      baseCurrencyAmt: this.form.get('baseCurrencyAmt').value
    }

    this.offerRequestProcess.save(offerProcess).pipe(first())
      .subscribe((data: any) => {
        this.submitted = false;
        if (offerProcess.stage == this.stagesList.find(x => x.itemCode == "PFI")?.listTypeItemId)
          this.notificationService.showInfo('Please select payment terms for Customer', "");

        if (this.processFile != null && !hasNoAttachment)
          this.uploadFile(this.processFile, data.extraObject);

        this.processFile = null;
        this.notificationService.filter("itemadded");
        data.object.forEach(element => {
          element.createdOn = this.datepipe.transform(GetParsedDate(element.createdOn), 'dd/MM/YYYY')
        });
        this.rowData = data.object
        this.totalStages = this.rowData?.length | 0;

        if (Attachment && hasNoAttachment) {
          this.DisableChoseFile('stageFilesList_class')
          Attachment.checked = false;
        }
      })
  }
  StageMoveUp(initialIndex) {
    var rd = this.rowData;
    var initial = rd.find(x => x.stageIndex == initialIndex);
    var beforeInitial = rd.find(x => x.stageIndex == initialIndex - 1);

    initial.stageIndex = initialIndex - 1;
    beforeInitial.stageIndex = initialIndex;
    this.rowData.sort((a, b) => a.stageIndex - b.stageIndex);

  }

  StageMoveDown(initialIndex) {
    var rd = this.rowData;
    var initial = rd.find(x => x.stageIndex == initialIndex);
    var beforeInitial = rd.find(x => x.stageIndex == initialIndex + 1);

    initial.stageIndex = initialIndex + 1;
    beforeInitial.stageIndex = initialIndex;
    this.rowData.sort((a, b) => a.stageIndex - b.stageIndex);

  }

  onstageNameChanged(stage) {
    stage = this.stagesList.find(x => x.listTypeItemId == stage)?.itemCode
    this.isPaymentTerms = stage == "PYTMS";
    this.isPaymentAmt = stage == "PYRCT";
  }

  deleteProcess(id) {
    this.offerRequestProcess.delete(id).pipe(first())
      .subscribe((data: any) => {
        data.object.forEach(element => {
          element.createdOn = this.datepipe.transform(GetParsedDate(element.createdOn), 'dd/MM/YYYY')
        });

        this.rowData = data.object
      })
  }


  RemoveSpareParts(event) {
    var cellValue = event.value;
    var rowData = event.data;
    var indexOfSelectedRow = this.sparePartsList.indexOf(rowData);

    if (cellValue == rowData.id && this.hasDeleteAccess) {
      this.sparePartsList.splice(indexOfSelectedRow, 1);
      if (rowData.offerRequestId == null && cellValue == rowData.id) {
        this.api.setRowData(this.sparePartsList)
        this.GetSparePartTotal()
      }

      else {
        this.SparePartsService
          .delete(cellValue)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (data.result) {
                this.notificationService.showSuccess(data.resultMessage, "Success");
                const selectedData = event.api.getSelectedRows();
                event.api.applyTransaction({ remove: selectedData });
                this.GetSparePartTotal()

              }
            },
          });
      }
    }

  }

  SparePartsSearch = (searchtext) => {
    this.sparePartPartNo = searchtext;
    if (searchtext) {
      if (!this.form.get("instrumentsList").value.toString()) return this.notificationService.showError("Please Select Instrument", "Error");
      this.Service.searchByKeyword(this.sparePartPartNo, this.form.get("instrumentsList").value.toString())
        .pipe(first()).subscribe((data: any) => this.sparePartsAutoComplete = data.object);
    }
  }

  AddSpareParts(instrument: any) {
    this.Service.searchByKeyword(instrument, this.form.get("instrumentsList").value.toString())
      .pipe(first()).subscribe({
        next: (data: any) => {
          this.sparePartsList = this.sparePartsList || [];
          var data = data.object[0];

          if (this.sparePartsList.find(x => x.partno == data.partno)) {
            return this.notificationService.showError("Spare Part already exists", "Error");
          }

          data.id = Guid.create();
          data.id = data.id.value;

          data.amount = Number(data.price) * Number(data.qty)

          this.sparePartsList.push(data);
          var spares = this.sparePartsList;
          this.sparePartsList = [];

          setTimeout(() => {
            this.sparePartsList = spares;
            this.sparePartsSearch.nativeElement.value = ""
            this.GetSparePartTotal();

          }, 200);
        },
      });

  }

  private createColumnDefs() {
    return [{
      headerName: 'Action',
      field: 'id',
      lockPosition: "left",
      cellRenderer: (params) => {
        return `
        <button class="btn btn-link" [disabled]="!params.deleteaccess" type="button">
        <i class="fas fa-trash-alt" title="Delete"></i>
      </button>
        `
      },

    }, {
      headerName: 'Part No',
      field: 'partno',
      filter: true,
      enableSorting: true,
      sortable: true,
      tooltipField: 'instrument',
    },
    {
      headerName: 'HSN Code',
      field: 'hscode',
      filter: true,
      editable: true,
    },
    {
      headerName: 'Qty',
      field: 'qty',
      filter: true,
      editable: true,
      sortable: true,
      defaultValue: 0
    },
    {
      headerName: 'Price',
      field: 'price',
      filter: true,
      editable: true,
      sortable: true,
      default: 0,
      hide: this.role == this.environment.custRoleCode || !this.hasCommercial,
    },
    {
      headerName: 'Amount',
      field: 'amount',
      filter: true,
      sortable: true,
      hide: this.role == this.environment.custRoleCode || !this.hasCommercial,
    },
    {
      cellRendererFramework: OfferrequestCountryComponent,
      headerName: 'Country Of Origin',
      field: 'country',
      hide: this.role == this.environment.custRoleCode || !this.hasCommercial,
      // hide: true,
      filter: true,
      sortable: true,
      cellRendererParams: {
        readonly: false
      },
    },
    {
      headerName: 'Description',
      field: 'itemDescription',
      filter: true,
      sortable: true,
      tooltipField: 'itemDescription'
    }
    ]
  }

  private createColumnDefsRO() {
    return [
      {
        headerName: 'Part No',
        field: 'partno',
        filter: true,
        enableSorting: true,
        sortable: true,
        tooltipField: 'instrument',
      }, {
        headerName: 'HSN Code',
        field: 'hscode',
        filter: true,
      },
      {
        headerName: 'Qty',
        field: 'qty',
        filter: true,
        sortable: true,
        defaultValue: 0
      },
      {
        headerName: 'Price',
        field: 'price',
        filter: true,
        sortable: true,
        default: 0,
        hide: this.role == this.environment.custRoleCode || !this.hasCommercial,
      },
      {
        headerName: 'Amount',
        field: 'amount',
        filter: true,
        sortable: true,
        hide: this.role == this.environment.custRoleCode || !this.hasCommercial,
      },
      {
        cellRendererFramework: OfferrequestCountryComponent,
        headerName: 'Country Of Origin',
        field: 'country',
        hide: this.role == this.environment.custRoleCode || !this.hasCommercial,
        // hide: true,
        filter: true,
        sortable: true,
        cellRendererParams: {
          readonly: true
        },
      },
      {
        headerName: 'Description',
        field: 'itemDescription',
        filter: true,
        sortable: true,
        tooltipField: 'itemDescription'
      }
    ]
  }

  onCellValueChanged(event) {
    debugger;
    var data = event.data;
    var d = this.sparePartsList.findIndex(x => x.id == data.id);
    var spare = this.sparePartsList;

    if (d === -1) return;

    data.modified = true;
    spare[d].price = Number(data.price)
    spare[d].qty = Number(data.qty)
    spare[d].hscode = data.hscode;
    spare[d].amount = spare[d].qty * spare[d].price;
    this.sparePartsList = [];

    setTimeout(() => {
      this.sparePartsList = spare;
      this.GetSparePartTotal()
    }, 200);
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
  }

  onGridReadyAttachments(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }

  onProcessGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    // this.api.sizeColumnsToFit();
  }

  get f() {
    return this.form.controls
  }

  getfil(x, isParentAttachment = false) {
    if (isParentAttachment) this.file = x;
    else this.processFile = x;
  }

  listfile = (x, lstId = "selectedfiles") => {
    document.getElementById(lstId).style.display = "block";

    var selectedfiles = document.getElementById(lstId);
    var ulist = document.createElement("ul");
    ulist.id = "demo";
    ulist.style.width = "max-content"
    selectedfiles.appendChild(ulist);

    if (this.transaction != 0) {
      document.getElementById("demo").remove();
    }

    this.transaction++;
    this.hastransaction = true;

    for (let i = 0; i < x.length; i++) {
      var name = x[i].name;
      var ul = document.getElementById("demo");
      ul.style.marginTop = "5px"
      var node = document.createElement("li");
      node.style.wordBreak = "break-word";
      node.style.width = "300px"
      node.appendChild(document.createTextNode(name));
      ul.appendChild(node);
    }
  };

  createColumnDefsAttachments() {
    return [
      {
        headerName: "Action",
        field: "id",
        filter: false,
        editable: false,
        sortable: false,
        lockPosition: "left",
        cellRendererFramework: FilerendercomponentComponent,
        cellRendererParams: {
          deleteaccess: this.hasDeleteAccess && this.isEditMode,
          id: this.id
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

  createColumnDefsAttachmentsRO() {
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

  uploadFile = (files, id, code = "OFREQ") => {
    if (files.length === 0) {
      return;
    }
    let filesToUpload: File[] = files;
    const formData = new FormData();

    Array.from(filesToUpload).map((file, index) => {
      return formData.append("file" + index, file, file.name);
    });

    this.FileShareService.upload(formData, id, code).subscribe((event) => {
      this.notificationService.filter("itemadded");
    });
  };

  GetFileList(id: string) {
    this.FileShareService.list(id)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.attachments = data.object;
        },
      });
  }


  open(parentId: string, id: string = null) {
    const initialState = {
      parentId: parentId,
      id: id
    };
    this.bsModalRef = this.modalService.show(SparequotedetComponent, { initialState });
  }

  onGridReadySPDet(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    // this.api.sizeColumnsToFit();
  }

  public onRowClicked(e) {
    if (e.event.target !== undefined) {
      let data = e.data;
      let actionType = e.event.target.getAttribute("data-action-type");
      //this.serviceRequestId = this.route.snapshot.paramMap.get('id');
      switch (actionType) {
        case "remove":
          if (this.hasDeleteAccess) {
            if (confirm("Are you sure, you want to remove the Spare Quotation Details?") == true) {
              this.SpareQuoteDetService.delete(data.id)
                .pipe(first()).subscribe({
                  next: (d: any) => {
                    if (d.result) this.notificationService.filter("itemadded");
                  }
                });
            }
          }
          break
        case "edit":
          if (this.hasUpdateAccess) {
            this.open(this.id, data.id);
          }
          break
      }
    }
  }

  createColumnDefsSPDet() {
    return [
      {
        headerName: 'Sales Order Number',
        field: 'salesorder_number',
        filter: true,
        tooltipField: 'Status',
        enableSorting: true,
        editable: false,
        sortable: true,
      },
      {
        headerName: 'Customer Name',
        field: 'customer_name',
        filter: true,
        tooltipField: 'raisedbyId',
        enableSorting: true,
        editable: false,
        sortable: true,
      },
      {
        headerName: 'Status',
        field: 'status',
        filter: true,
        tooltipField: 'Status',
        enableSorting: true,
        editable: false,
        sortable: true,
      },
      {
        headerName: 'Total Amount',
        field: 'total',
        filter: true,
        tooltipField: 'Comments',
        enableSorting: true,
        editable: false,
        sortable: true,
      },
    ]
  }

  onSubmit() {
    this.submitted = true;
    this.form.markAllAsTouched()
    // reset alerts on submit
    this.alertService.clear();
    // stop here if form is invalid
    if (this.form.invalid) return

    if (this.sparePartsList?.length > 0 && this.sparePartsList != null) {
      this.sparePartsList.forEach(instrument => {
        instrument.offerRequest = this.id;
        instrument.offerRequestId = this.id;
      })

    }

    this.model = this.form.value;
    this.model.customerId = this.form.get('customerId').value
    this.model.distributorid = this.form.get('distributorid').value
    const datepipie = new DatePipe("en-US");
    this.model.podate = datepipie.transform(new Date, 'dd/MM/YYYY');


    if (this.form.get('paymentTerms').value?.length > 0) {
      var selectarray = this.form.get('paymentTerms').value;
      this.model.paymentTerms = selectarray.toString();
    }

    else if (this.form.get('paymentTerms').value?.length == 0) {
      this.model.paymentTerms = ""
    }

    if (this.form.get('instrumentsList').value.length > 0) {
      var selectarray = this.form.get('instrumentsList').value;
      this.model.instrumentsList = selectarray.toString();
    }

    else if (this.form.get('instrumentsList').value.length == 0) {
      this.model.instrumentsList = ""
    }

    if (!this.hasId && this.hasAddAccess) {
      // this.model = this.form.value;
      this.model.id = this.id;

      this.Service.save(this.model)
        .pipe(first()).subscribe({
          next: (data: any) => {
            if (this.file != null) this.uploadFile(this.file, data.object.id);
            this.notificationService.showSuccess(data.resultMessage, "Success");
            this.router.navigate(["offerrequestlist"], {
              //relativeTo: this.activeRoute,
              queryParams: { isNSNav: true },
              //queryParamsHandling: 'merge'
            });

            if (this.sparePartsList != null)
              this.SparePartsService.SaveSpareParts(this.sparePartsList)
                .pipe(first()).subscribe();
          },
        });

    }
    else if (this.hasUpdateAccess) {
      this.model.id = this.id;
      this.Service.update(this.id, this.model)
        .pipe(first())
        .subscribe({
          next: (data: ResultMsg) => {
            if (this.file != null) this.uploadFile(this.file, this.id);
            this.notificationService.showSuccess(data.resultMessage, "Success");
            this.router.navigate(["offerrequestlist"], {
              //relativeTo: this.activeRoute,
              queryParams: { isNSNav: true },
              //queryParamsHandling: 'merge'
            });

            this.rowData?.forEach((x) => {
              x.createdOn = new Date()
              this.offerRequestProcess.update(x).subscribe();
            })

          },
        });

      if (!(this.sparePartsList == null)) {
        this.SparePartsService.SaveSpareParts(this.sparePartsList)
          .pipe(first()).subscribe();
      }
    }
  }
}


@Component({
  template: `
  <form [formGroup]="form">
    <select formControlName="currency" class="form-select">
      <option *ngFor="let c of lstCurrency" value={{c.id}}> {{c.code}}</option>
    </select>
  </form>
  `
})
export class OfferrequestCurrencyComponent implements AgRendererComponent {

  lstCurrency: any[] = []
  form: FormGroup
  params: any;

  constructor(private currencyService: CurrencyService, private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      currency: ['', Validators.required]
    })

    this.form.get("currency").valueChanges.subscribe((data: any) => this.params.data.currency = data)

    this.currencyService.getAll()
      .pipe(first()).subscribe((data: any) => this.lstCurrency = data.object)
  }

  agInit(params: any): void {
    this.params = params;
    this.form.get("currency").setValue(params.value)
    if (params.readonly) this.form.get("currency").disable()
    else this.form.get("currency").enable()
  }

  refresh(params: any): boolean {
    return false;
  }
}

@Component({
  template: `
  <form [formGroup]="form">
    <select formControlName="country" class="form-select">
      <option *ngFor="let c of lstCountry" value={{c.id}}> {{c.name}}</option>
    </select>
  </form>
  `
})
export class OfferrequestCountryComponent implements AgRendererComponent {

  lstCountry: any[] = []
  form: FormGroup
  params: any;

  constructor(private countryService: CountryService, private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      country: ['', Validators.required]
    })

    this.form.get("country").valueChanges.subscribe((data: any) => this.params.data.country = data)

    this.countryService.getAll()
      .pipe(first()).subscribe((data: any) => this.lstCountry = data.object)
  }

  agInit(params: any): void {
    this.params = params;
    this.form.get("country").setValue(params.value)

    if (params.readonly) this.form.get("country").disable()
    else this.form.get("country").enable()
  }

  refresh(params: any): boolean {
    return false;
  }
}
