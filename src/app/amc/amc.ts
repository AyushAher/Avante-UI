import { DatePipe } from "@angular/common";
import { HttpEventType } from "@angular/common/http";
import { Component, EventEmitter, OnInit, Output, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ColumnApi, GridApi } from "ag-grid-community";
import { Guid } from "guid-typescript";
import { first } from "rxjs/operators";
import { GetParsedDate } from "../_helpers/Providers";

import { Currency, Customer, ListTypeItem, ResultMsg, User } from "../_models";
import { AmcInstrument } from "../_models/Amcinstrument";
import {
  AccountService,
  AlertService,
  AmcService,
  ContactService,
  CurrencyService,
  CustomerService,
  FileshareService,
  InstrumentService,
  ListTypeService,
  NotificationService,
  ProfileService,
  ServiceRequestService
} from "../_services";
import { AmcinstrumentService } from "../_services/amcinstrument.service";
import { AmcstagesService } from "../_services/amcstages.service";
import { EnvService } from "../_services/env/env.service";
import { AmcInstrumentRendererComponent } from "./amc-instrument-renderer.component";
import { BrandService } from "../_services/brand.service";
import { AmcItemsService } from "../_services/amc-items.service";

@Component({
  selector: "app-Amc",
  templateUrl: "./Amc.html",
})
export class AmcComponent implements OnInit {
  form: FormGroup;
  model: any;
  loading = false;
  submitted = false;
  isSave = false;
  type: string;
  id: any;
  user: User;

  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  hasInternalAccess: boolean = false;
  hasCommercial: boolean = false;
  profilePermission: any;

  customersList: Customer[];
  currencyList: Currency[];
  serviceType: ListTypeItem[];
  instrumentserialno: any;
  instrumentAutoComplete: any[];
  instrumentList: AmcInstrument[] = []
  supplierList: any[];
  custSiteList: any;

  public columnDefs: any;
  private columnApi: ColumnApi;
  private api: GridApi;
  hasId: boolean = false;

  IsCustomerView: boolean = false;
  IsDistributorView: boolean = false;
  IsEngineerView: boolean = false;
  @ViewChild('instrumentSearch') instrumentSearch
  role: any;
  datepipe = new DatePipe('en-US')
  rowData: any;
  stagesList: any;
  processFile: any;
  isPaymentTerms: boolean = false;
  attachments: any;
  file: any;
  fileList: [] = [];
  transaction: number;
  hastransaction: boolean;
  public progress: number;
  public message: string;
  @ViewChild('stageFiles') stageFiles;
  @Output() public onUploadFinished = new EventEmitter();
  vScroll: boolean = true;
  paymentTypes: any;
  payTypes: any;
  isPaymentAmt: boolean = false;
  isCompleted: boolean = false;
  isNewMode: any;
  isEditMode: any;
  isDisableSite: any;
  defaultSiteId: any;
  defaultCustomerId: any;
  baseCurrId: any;
  @ViewChild('baseAmt') baseAmt
  isOnCall: any = false;
  totalStages = 0;
  formData: any;
  ffsDateError: boolean;
  sfsDateError: boolean;
  stsDateError: boolean;
  steDateError: boolean;
  sfeDateError: boolean;
  ftsDateError: any;
  fteDateError: any;
  ffeDateError: any;
  seDateError: boolean;
  sqDateError: boolean;
  amcItems: any[] = [];
  itemStatus: any[];
  lstServiceRequest: any[] = []

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private notificationService: NotificationService,
    private listTypeService: ListTypeService,
    private Service: AmcService,
    private profileService: ProfileService,
    private customerService: CustomerService,
    private currencyService: CurrencyService,
    private AmcInstrumentService: AmcinstrumentService,
    private contactService: ContactService,
    private amcStagesService: AmcstagesService,
    private FileShareService: FileshareService,
    private environment: EnvService,
    private instrumentService: InstrumentService,
    private brandService: BrandService,
    private amcItemsService: AmcItemsService,
    private serviceRequestService: ServiceRequestService
  ) {

    this.notificationService.listen().subscribe((m: any) => {
      if (this.id != null) {
        this.AmcInstrumentService.getAmcInstrumentsByAmcId(this.id)
          .pipe(first())
          .subscribe((data: any) => {
            this.instrumentList = data.object;
          });


        this.amcStagesService.getAll(this.id).pipe(first())
          .subscribe((stageData: any) => {
            stageData.object.forEach(element => {
              element.createdOn = this.datepipe.transform(GetParsedDate(element.createdOn), 'dd/MM/YYYY')
            });
           
            this.rowData = stageData.object;
            this.totalStages = this.rowData?.length | 0;
            this.form.get('stageName').reset()
            this.form.get('stageComments').reset()
            this.form.get('payterms').reset()
            this.form.get('payAmt').setValue(0)
            this.isPaymentAmt = false;
            this.stageFiles.nativeElement.value = "";
            var selectedfiles = document.getElementById("stageFilesList");
            selectedfiles.innerHTML = '';
          })
      }
    });
  }

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SAMC");
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

    this.form = this.formBuilder.group({
      isactive: [true],
      isdeleted: [false],
      billtoid: ["", Validators.required],
      servicequote: ["", Validators.required],
      sqdate: ["", Validators.required],
      sdate: ["", Validators.required],
      edate: ["", Validators.required],
      project: ["", Validators.required],
      brand: [""],
      currency: [""],
      zerorate: [0],
      tnc: ["", Validators.required],
      custSite: ["", Validators.required],

      payterms: [''],
      paymentTerms: ["", Validators.required],
      stageName: [''],
      stageComments: [''],
      stagePaymentType: [],
      baseCurrencyAmt: [1.00, Validators.required],
      baseCurrencyId: ["", Validators.required],
      payAmt: [0],
      payAmtCurrencyId: [''],
      amcItemsForm: this.formBuilder.group({
        serviceType: [""],
        date: [""],
        estStartDate: [""],
        estEndDate: [""],
        status: [""],
        serviceRequestId: [""],
        sqNo: []
      })
    });



    this.id = this.route.snapshot.paramMap.get("id");
    this.isEditMode = false;
        
    this.form.get("sqdate").valueChanges
    .subscribe(() => this.CheckDates())

    this.form.get("edate").valueChanges
    .subscribe(() => this.CheckDates())

    this.form.get("sdate").valueChanges
    .subscribe(() => this.CheckDates())

    this.form.get('custSite').valueChanges
      .subscribe(() => this.InstrumentSearch())


    this.listTypeService.getById("AMCSG")
      .subscribe((data: any) => this.stagesList = data)

    this.listTypeService.getById("AISTA")
      .subscribe((data: any) => {
        this.itemStatus = data
        this.item.status.setValue(this.itemStatus.find(x => x.itemCode == "AINCO")?.listTypeItemId)
      })

    this.serviceRequestService.getAll(this.user.userId)
      .subscribe((data: any) => {
        this.lstServiceRequest = data.object.filter(x => x.isReportGenerated)
      });

    // this.serviceRequestService.GetServiceRequestByConId(this.user.contactId)
    //   .subscribe((data: any) => this.lstServiceRequest = data.object)

    this.contactService.getCustomerSiteByContact(this.user.contactId)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          if (this.IsCustomerView) {
            this.form.get('billtoid').setValue(data.object?.id)
            this.defaultCustomerId = data.object.id
            this.custSiteList = [];
            let siteLst = this.user.custSites?.split(",")
            data.object?.sites.forEach(element => {
              if (siteLst?.length > 0 && this.user.userType?.toLocaleLowerCase() == "customer" && siteLst?.find(x => x == element.id) == null) return;
              this.custSiteList.push(element);
              element?.contacts.forEach(con => {
                if (con?.id == this.user.contactId) {
                  this.isDisableSite = true
                  if (this.id == null) this.form.get('custSite').disable()
                  this.form.get('custSite').setValue(element?.id)
                  this.defaultSiteId = element.id
                }
              });
            });
          }
        },
      });

    this.customerService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.customersList = data.object
        },
      })

    this.currencyService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.currencyList = data.object

          this.baseCurrId = data.object.find(x => x.code == this.environment.baseCurrencyCode)?.id
          this.form.get("baseCurrencyId").setValue(this.baseCurrId)
        },
      })


    this.listTypeService.getById("SERTY")
      .subscribe((data: ListTypeItem[]) =>
        this.serviceType = data?.filter(x => x.itemCode != "RENEW" && x.itemCode != "AMC"));

        this.listTypeService.getById("GPAYT")
        .pipe(first())
        .subscribe((mstData: any) => {                   
          // this.paymentTypes = []
           this.payTypes = mstData;
        });


    this.brandService.GetByCompanyId()
      .subscribe((data: any) => {
        this.supplierList = data.object;

        if (role != this.environment.distRoleCode) return;
        var brand = this.supplierList.find(x => x.brandName == this.user.brand);
        if (!brand) return;

        setTimeout(() => this.form.get("brand").setValue(brand.id), 1500);
      });


    this.form.get('baseCurrencyAmt').valueChanges
      .subscribe(value => {
        if (value >= 1000) this.form.get('baseCurrencyAmt').setValue(1.0)
      });

    this.form.get('currency').valueChanges
      .subscribe(value => {
        if (this.baseAmt)
          if (value == this.form.get('baseCurrencyId').value) {
            this.form.get('baseCurrencyAmt').setValue(1.00)
            this.baseAmt.nativeElement.disabled = true
          }
          else this.baseAmt.nativeElement.disabled = false
      });


    this.form.get("amcItemsForm").get("serviceType").valueChanges
      .subscribe(value => {
        let isPreventive = this.serviceType?.find(x => x.listTypeItemId == value)

        if (!isPreventive || isPreventive?.itemCode != "PREV") {
          this.item.estStartDate.disable();
          this.item.estEndDate.disable();
          this.item.status.disable();
          this.item.serviceRequestId.disable();

          this.item.estStartDate.clearValidators();
          this.item.estEndDate.clearValidators();
          return;
        }

        this.item.estStartDate.enable();
        this.item.estEndDate.enable();

        this.item.estStartDate.setValidators([Validators.required]);
        this.item.estEndDate.setValidators([Validators.required]);
        this.item.estStartDate.updateValueAndValidity();
        this.item.estEndDate.updateValueAndValidity();
      })

    if (this.id != null) {
      this.amcItemsService.GetByAmcId(this.id)
        .subscribe((data: any) => {
          this.amcItems = data.object;         
        })

      this.Service.getById(this.id)
        .pipe(first())
        .subscribe((data: any) => {
          this.isCompleted = data.object?.isCompleted

              if (this.isCompleted) {
                setInterval(() => this.form.disable(), 10);
              }

         
          // this.listTypeService.getById("ORQPT")
          //   .pipe(first())
          //   .subscribe((mstData: any) => {
              // this.isCompleted = data.object?.isCompleted

              // if (this.isCompleted) {
              //   setInterval(() => this.form.disable(), 10);
              // }

               data.object.paymentTerms = data.object.paymentTerms?.split(',').filter(x => x != "");
              // this.paymentTypes = []
              // this.payTypes = mstData;
              data.object.edate = GetParsedDate(data.object.edate)
              data.object.sdate = GetParsedDate(data.object.sdate)

              // data.object.paymentTerms?.forEach(y => {
              //   mstData.forEach(x => {
              //     if (y == x.listTypeItemId) {
              //       this.paymentTypes.push(x)
              //     }
              //   });
              // });

              this.amcStagesService.getAll(this.id).pipe(first())
                .subscribe((stageData: any) => {

                  stageData.object?.forEach(element => {
                    element.createdOn = this.datepipe.transform(GetParsedDate(element.createdOn), 'dd/MM/YYYY')
                  });
                  
                  stageData.object?.sort((a, b) => a.stageIndex - b.stageIndex);
                  this.rowData = stageData.object;

                  this.totalStages = this.rowData?.length | 0;
                  this.GetSites(data.object.billtoid);
                  setTimeout(() => {
                    this.formData = data.object;
                    this.form.patchValue(this.formData);
                    this.form.get('stageName').reset()
                    this.InstrumentSearch();
                  }, 500);
                })
            //})
        });

      this.AmcInstrumentService.getAmcInstrumentsByAmcId(this.id)
        .pipe(first())
        .subscribe((data: any) => {
          this.instrumentList = data.object;
        });

      this.hasId = true;
      this.form.disable()
      this.columnDefs = this.createColumnDefsRO();
    }
    else {
      this.isNewMode = true;
      this.columnDefs = this.createColumnDefs();
      this.hasId = false;
      this.id = Guid.create();
      this.id = this.id.value;
      setTimeout(() => this.FormControlDisable(), 1000);
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
        
        if(this.rowData.filter(x=>x.stage == this.stagesList.filter(x=>x.itemCode == "CONAG")[0].listTypeItemId).length > 0)
        {
          this.isCompleted = true;
        }

      this.form.enable();
      this.FormControlDisable()
      this.columnDefs = this.createColumnDefs();

      let curr = this.form.get('currency')
      curr.setValue(curr.value)
    }
  }

  FormControlDisable() {    
    this.form.get('baseCurrencyId').disable()
    this.form.get('zerorate').disable()

    if (this.isDisableSite)
      this.form.get('custSite').disable()

    if (this.IsCustomerView)
      this.form.get('billtoid').disable()

    if (this.IsDistributorView)
      this.form.get("brand").disable();


    this.form.get('isactive').disable();
    this.item.estStartDate.disable();
    this.item.estEndDate.disable();
    this.item.status.disable();
    this.item.serviceRequestId.disable();

    this.item.estStartDate.clearValidators();
    this.item.estEndDate.clearValidators();
  }

  Back() {
    this.router.navigate(["amclist"]);

  }

  CancelEdit() {
    if (!confirm("Are you sure you want to discard changes?")) return;
    if (this.hasId) {

      this.totalStages = this.rowData?.length | 0;
      this.form.get('stageName').setValue("")
      this.form.get('stageComments').setValue("")
      this.form.get('payterms').setValue("")
      this.form.get('payAmt').setValue(0)
      this.isPaymentAmt = false;
      this.form.patchValue(this.formData);

      let fileInp = <HTMLInputElement>document.getElementById("fileList")
      fileInp.value = "";
    }
    else {
      this.instrumentList = []
      this.form.reset();
    }
    this.form.disable()
    this.columnDefs = this.createColumnDefsRO();
    this.isEditMode = false;
    this.isNewMode = false;
    this.notificationService.SetNavParam();
  }

  DeleteRecord() {
    if (confirm("Are you sure you want to delete the record?")) {
      this.Service.delete(this.id).pipe(first())
        .subscribe((data: any) => {
          if (data.result) {
            this.notificationService.showSuccess('Record deleted successfully!', "Success")
            this.router.navigate(["amclist"], {
              //relativeTo: this.activeRoute,
              queryParams: { isNSNav: true },
              //queryParamsHandling: 'merge'
            });
          }
          else this.notificationService.showInfo(data.result, "Info")
        })
    }
  }

  get f() {
    return this.form.controls;
  }

  get item() {
    return (<FormGroup>this.form.get("amcItemsForm")).controls;
  }

  DisableChoseFile(className) {
    let ofer = <HTMLInputElement>document.querySelector(`input[type="file"].` + className)
    ofer.disabled = !ofer.disabled
  }


  submitStageData() {
    if (this.isPaymentTerms && !this.f.payterms.value) return this.notificationService.showInfo("Payterms is required", "Info")
    if (this.isPaymentAmt && !this.f.payAmt.value && !this.f.payAmtCurrencyId.value) return this.notificationService.showInfo("Payment Amount cannot be empty", "Info")
    if (!this.f.stageName.value) return this.notificationService.showInfo("Stage Name cannot be empty", "Info")

    if (!this.f.stageComments.value) return this.notificationService.showInfo("Comments cannot be empty", "Info")

    let hasNoAttachment = false;

    let Attachment = <HTMLInputElement>document.getElementById("stageFilesList_Attachment")
    if (Attachment) hasNoAttachment = Attachment.checked

    let comments = this.form.get('stageComments').value;

    if (!hasNoAttachment && this.processFile == null) {
      this.notificationService.showInfo("No Attachments Selected.", "Error")
      return;
    }

    this.submitted = true;
    let stage = this.form.get('stageName').value
    let index = 0;
    let paymentTerms = this.form.get('payterms').value
    let payAmt = this.form.get('payAmt').value
    let payAmtCurrencyId = this.form.get('payAmtCurrencyId').value

    let offerProcess = {
      isactive: false,
      comments,
      IsCompleted: true,
      stageIndex: this.totalStages + 1,
      parentId: this.id,
      stage,
      index,
      payAmt,
      paymentTypeId: paymentTerms,
      payAmtCurrencyId,
    }

    this.amcStagesService.save(offerProcess).pipe(first())
      .subscribe((data: any) => {
        this.submitted = false;
        if (offerProcess.stage == this.stagesList.find(x => x.itemCode == "AMPFI")?.listTypeItemId)
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
        this.form.get("stageName").reset()
        this.form.get("stageComments").reset()
        this.form.get("stagePaymentType").reset()

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

  CheckDates() {
    let seDate = this.DateDiff(this.f.sdate.value, this.f.edate.value)   ;
    this.seDateError = seDate < 0   ;
  
    let sqqDateCnt = this.DateDiff(this.f.sqdate.value, new Date)   ;    
    this.sqDateError = sqqDateCnt < 0   ;    
  }

  onstageNameChanged(stage) {
    stage = this.stagesList.find(x => x.listTypeItemId == stage)?.itemCode
    this.isPaymentTerms = stage == "PYTMS";
    this.isPaymentAmt = stage == "PYRCT";
  }

  deleteProcess(id) {
    this.amcStagesService.delete(id).pipe(first())
      .subscribe((data: any) => {
        data.object.forEach(element => {
          element.createdOn = this.datepipe.transform(GetParsedDate(element.createdOn), 'dd/MM/YYYY')
        });

        this.rowData = data.object
      })
  }

  GetSites(customerId) {
    this.customerService.getById(customerId)
      .pipe(first())
      .subscribe((data: any) => {
        this.custSiteList = [];
        let siteLst = this.user.custSites?.split(",")
        data.object?.sites.forEach(element => {
          if (siteLst?.length > 0 && this.user.userType?.toLocaleLowerCase() == "customer" && siteLst?.find(x => x == element.id) == null) return;
          this.custSiteList.push(element);
        })
      });
  }

  getfil(x, isParentAttachment = false) {
    isParentAttachment ? this.file = x : this.processFile = x;
  }

  listfile = (x, lstId = "selectedfiles") => {
    document.getElementById(lstId).style.display = "block";

    var selectedfiles = document.getElementById(lstId);
    var ulist = document.createElement("ul");
    ulist.id = "demo";
    ulist.style.width = "max-content"
    selectedfiles.appendChild(ulist);

    this.transaction++;
    this.hastransaction = true;

    for (let i = 0; i < x.length; i++) {
      var name = x[i]?.name;
      ulist.style.marginTop = "5px"
      var node = document.createElement("li");
      node.style.wordBreak = "break-word";
      node.style.width = "300px"
      node.appendChild(document.createTextNode(name));
      ulist.appendChild(node);
    }
  };

  uploadFile = (files, id, code = "AMC") => {
    if (files.length === 0) {
      return;
    }

    let filesToUpload: File[] = files;
    const formData = new FormData();

    Array.from(filesToUpload).map((file, index) => {
      return formData.append("file" + index, file, file.name);
    });

    this.FileShareService.upload(formData, id, code).subscribe((event) => {
      if (event.type === HttpEventType.UploadProgress) {
        this.progress = Math.round((100 * event.loaded) / event.total);
        if (this.progress == 100)
          this.notificationService.filter("itemadded");
      }
      else if (event.type === HttpEventType.Response) {
        this.message = "Upload success.";
        this.onUploadFinished.emit(event.body);
      }
      this.notificationService.filter("itemadded");
    });
  }

  GetFileList(id: string) {
    this.FileShareService.list(id)
      .subscribe((data: any) => this.attachments = data.object);
  }

  RemoveInnstrument(event) {
    var cellValue = event.value;
    var rowData = event.data;
    if (this.hasDeleteAccess) {
    
      if (cellValue == rowData.id) {
        if(!this.isNewMode && this.instrumentList.length == 1)
        {
          return this.notificationService.showError("You cannot delete the Instrument. AMC should have minimum of 1 Instrument added.", "Error");
        }
        var indexOfSelectedRow = this.instrumentList.indexOf(rowData);
        this.instrumentList.splice(indexOfSelectedRow, 1)
        if (rowData.amcId == null && cellValue == rowData.id) {
          this.api.setRowData(this.instrumentList)
        }
        else {
          this.AmcInstrumentService
            .delete(cellValue)
            .pipe(first())
            .subscribe({
              next: (data: any) => {
                if (data.result) {
                  this.notificationService.showSuccess(data.resultMessage, "Success");
                  const selectedData = event.api.getSelectedRows();
                  event.api.applyTransaction({ remove: selectedData });

                  let zeroRate = 0;
                  this.instrumentList.forEach(x => zeroRate += x.amount);
                  this.form.get("zerorate").setValue(zeroRate);
                }
              },
            });
        }
      }

    }
  }

  InstrumentSearch = () => {

    this.instrumentService.getAll(this.user.userId)
      .pipe(first()).subscribe((data: any) => {
        this.instrumentAutoComplete = data.object?.filter(x => x.customerId == this.f.billtoid.value && x.custSiteId == this.f.custSite.value);
        if (this.instrumentSearch) this.instrumentSearch.value = ""
      });

  }


  AddInstrument(instrument: any) {
    if (!instrument || instrument == "")
      return this.notificationService.showError("Value Cannot be Empty. Select an option", "Error");

    if (!this.f.sdate.value || !this.f.edate.value)
      return this.notificationService.showError("Please enter Start Date and End Date", "Invalid Dates")

    let datepipe = new DatePipe('en-US')
    this.model = this.form.value;
    this.model.sdate = datepipe.transform(GetParsedDate(this.model.sdate), 'dd/MM/YYYY');
    this.model.edate = datepipe.transform(GetParsedDate(this.model.edate), 'dd/MM/YYYY');
    this.model.instrumentIds = instrument;
    this.model.paymentTerms = ""

    this.Service.InsInAMCExists(this.model)
      .subscribe((existsData: any) => {
        if (existsData.result)
          return this.notificationService.showError("AMC For the instrument exists for the given dates", "");

        let d = this.instrumentAutoComplete.find(x => x.id == instrument)

        if (this.instrumentList?.find(x => x.serialnos == d.serialnos))
          return this.notificationService.showError("Instrument already exists", "Error")

        var data = new AmcInstrument();
        data = {
          id: Guid.create().toString(),
          serialnos: d.serialnos,
          insTypeId: d.instype,
          insType: d.instypeName,
          insversion: d.insversion,
          qty: 0,
          rate: 0,
          amount: 0,
          instrumentId: d.id,
          modified: false,
          amcId: this.id,
        };

        this.instrumentList = this.instrumentList || [];
        this.instrumentList.push(data);
        this.api.setRowData(this.instrumentList)
      })

  }

  private createColumnDefs() {
    return [{
      headerName: 'Action',
      field: 'id',
      lockPosition: "left",
      hide: this.isCompleted,
      cellRendererFramework: AmcInstrumentRendererComponent,
      cellRendererParams: {
        deleteaccess: this.hasDeleteAccess,
        list: this.instrumentList
      },

    }, {
      headerName: 'Instrument',
      field: 'insType',
      filter: true,
      enableSorting: true,
      editable: false,
      sortable: true,
      tooltipField: 'instrument',
    }, {
      headerName: 'Serial No.',
      field: 'serialnos',
      filter: true,
      editable: true,
      sortable: true
    },
    {
      headerName: 'Version',
      field: 'insversion',
      filter: true,
      editable: false,
      sortable: true
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
      headerName: 'Rate',
      field: 'rate',
      filter: true,
      editable: true,
      hide: !this.hasCommercial,
      sortable: true,
      default: 0
    },
    {
      headerName: 'Amount',
      field: 'amount',
      hide: !this.hasCommercial,
      filter: true,
      editable: false,
      sortable: true
    }
    ]
  }

  private createColumnDefsRO() {
    return [{
      headerName: 'Instrument',
      field: 'insType',
      filter: true,
      enableSorting: true,
      editable: false,
      sortable: true,
      tooltipField: 'instrument',
    }, {
      headerName: 'Serial No.',
      field: 'serialnos',
      filter: true,
      editable: true,
      sortable: true
    },
    {
      headerName: 'Version',
      field: 'insversion',
      filter: true,
      editable: false,
      sortable: true
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
      headerName: 'Rate',
      field: 'rate',
      filter: true,
      editable: true,
      hide: !this.hasCommercial,
      sortable: true,
      default: 0
    },
    {
      headerName: 'Amount',
      field: 'amount',
      hide: !this.hasCommercial,
      filter: true,
      editable: false,
      sortable: true
    }
    ]
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
  }

  onCellValueChanged(event) {
    var data = event.data;
    event.data.modified = true;

    if (this.instrumentList.filter(x => x.id == data.id).length > 0) {
      var d = this.instrumentList.filter(x => x.id == data.id);
      
      if( data.qty.toString().indexOf(".") !== -1)
      {
        data.qty = 0;
        this.notificationService.showInfo("Qty cannot be in decimals.", "Info");
      }
      if(data.qty < 0)
      {
        data.qty = 0; 
       this.notificationService.showInfo("Qty cannot be less than 0.", "Info");
      }
      if(data.rate < 0)
      {
        data.rate = 0;
        this.notificationService.showInfo("Rate cannot be negative.", "Info");
      } 
     
      var rowAmount = (Number(data.qty) * Number(data.rate));
      d[0].amount = rowAmount;
      d[0].rate = Number(data.rate)
      d[0].qty = Number(data.qty)
      this.api.setRowData(this.instrumentList);

      let zeroRate = 0;
      this.instrumentList.forEach(x => zeroRate += x.amount);
      this.form.get("zerorate").setValue(zeroRate);
    }
  }

  DateDiff(date1, date2) {
    let dateSent = new Date((date1));//early
    let currentDate = new Date((date2));//later
    return Math.floor(
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

  }

  onSubmit() {
    this.submitted = true;
    this.form.markAllAsTouched();
    this.alertService.clear();

    if (this.instrumentList == null || this.instrumentList.length <= 0) {
      return this.notificationService.showInfo("Please add at least 1 instrument!", "Info");
    }

    var instrumentIds = "";

    this.instrumentList.forEach(instrument => {
      instrument.amcId = this.id;
      instrumentIds += instrument.instrumentId + ",";
    });


    if (this.form.invalid) return;

    this.form.get('billtoid').enable()
    this.model = this.form.getRawValue();
    this.form.get('billtoid').disable()

    if (this.IsCustomerView) {
      this.model.billtoid == this.defaultCustomerId
      if (!this.model.custSite) {
        this.model.custSite = this.defaultSiteId
      }
    }
    if (this.form.get('paymentTerms').value.length > 0) {
      var selectarray = this.form.get('paymentTerms').value;
      this.model.paymentTerms = selectarray.toString();
    }

    else if (this.form.get('paymentTerms').value.length == 0) {
      this.model.paymentTerms = ""
    }

    let calc = this.DateDiff(this.model.sdate, this.model.edate)

    if (calc <= 0) {
      this.notificationService.showInfo("End Date should not be greater than Start Date", "Info");
      return;
    }

    const datepipe = new DatePipe('en-US');

    this.model.sdate = datepipe.transform(GetParsedDate(this.model.sdate), 'dd/MM/YYYY');
    this.model.edate = datepipe.transform(GetParsedDate(this.model.edate), 'dd/MM/YYYY');
    this.model.sqdate = datepipe.transform(GetParsedDate(this.model.sqdate), 'dd/MM/YYYY');

    this.model.baseCurrencyId = this.baseCurrId
    this.model.instrumentIds = instrumentIds;
    if (!this.hasId && this.hasAddAccess) {
      this.model.id = this.id;

      this.Service.save(this.model)
        .pipe(first())
        .subscribe({
          next: (data: any) => {

            if (!data.result) return this.notificationService.showError(data.resultMessage, "Error");

            this.notificationService.showSuccess(data.resultMessage, "Success");

            if ((this.amcItems == null || this.amcItems.length <= 0) &&
              (this.instrumentList == null || this.instrumentList.length <= 0))
              this.router.navigate(["amclist"], {
                queryParams: { isNSNav: true },
              });


            if (this.amcItems != null && this.amcItems.length > 0) {
              this.amcItems.forEach(x => {
                x.amcId = this.id;                
                this.amcItemsService.SaveItem(x)
                  .subscribe((data: any) => {
                    if (!data || !data.result) return this.notificationService.showError(data.resultMessage, "Error");
                  })
              })
            }


            if (this.instrumentList != null && this.instrumentList.length > 0) {
              this.AmcInstrumentService.SaveAmcInstruments(this.instrumentList)
                .subscribe((data: ResultMsg) => {
                  if (!data.result) return this.notificationService.showError(data.resultMessage, "Error");

                  this.notificationService.showSuccess(data.resultMessage, "Success");
                  this.router.navigate(["amclist"], {
                    queryParams: { isNSNav: true },
                  });
                });
            }
          },
        });
    }
    else if (this.hasUpdateAccess) {
      this.model.id = this.id;

      this.Service.update(this.id, this.model)
        .pipe(first())
        .subscribe({
          next: (data: ResultMsg) => {
            if (data.result) {
              this.rowData?.forEach((x) => {
                x.createdOn = new Date()
                this.amcStagesService.update(x).subscribe();
              })

              this.notificationService.showSuccess(data.resultMessage, "Success");
              if (this.instrumentList == null || this.instrumentList.length <= 0) {
                this.router.navigate(["amclist"], {
                  //relativeTo: this.activeRoute,
                  queryParams: { isNSNav: true },
                  //queryParamsHandling: 'merge'
                });
              }
              if (this.instrumentList != null && this.instrumentList.length > 0) {
                this.AmcInstrumentService.SaveAmcInstruments(this.instrumentList)
                  .pipe(first()).subscribe({
                    next: (data: ResultMsg) => {
                      this.router.navigate(["amclist"], {
                        //relativeTo: this.activeRoute,
                        queryParams: { isNSNav: true },
                        //queryParamsHandling: 'merge'
                      });
                    },
                  });
              }
            }
            else this.notificationService.showError(data.resultMessage, "Error");
          }
        });
    }
  }

  onItemAdd() {    
    let amcItemForm = (<FormGroup>this.form.get("amcItemsForm"))
    let amcItem = amcItemForm.getRawValue();
    if (amcItemForm.invalid || !amcItem.serviceType) {
      return this.notificationService.showInfo("All fields are required!", "Invalid Fields")
    }

    amcItem.status = this.itemStatus.find(x => x.itemCode == "AINCO")?.listTypeItemId
    amcItem.amcId = this.id;
    if (amcItem.estEndDate < amcItem.estStartDate) return this.notificationService.showInfo("Est. End Date should not be before Est. Start Date", "Invalid Date");
    
    amcItem.estEndDate = this.datepipe.transform(amcItem.estEndDate, 'yyyy-MM-dd')
    amcItem.estStartDate = this.datepipe.transform(amcItem.estStartDate, 'yyyy-MM-dd')

    let stDate = this.datepipe.transform(this.form.get('sdate').value, 'yyyy-MM-dd');
    let edDate = this.datepipe.transform(this.form.get('edate').value, 'yyyy-MM-dd');

    if(amcItem.estStartDate < stDate) {
      return this.notificationService.showInfo("Est. Start date should be within the AMC Start and End Dates.", "Invalid Date");
    }
    if(amcItem.estStartDate > edDate) {return this.notificationService.showInfo("Est. Start date should be within the AMC Start and End Dates.", "Invalid Date");}
    if(amcItem.estEndDate < stDate) {return this.notificationService.showInfo("Est. End date should be within the AMC Start and End Dates.", "Invalid Date");}
    if(amcItem.estEndDate > edDate) {return this.notificationService.showInfo("Est. End date should be within the AMC Start and End Dates.", "Invalid Date");}

    
    amcItem.estEndDate = this.datepipe.transform(amcItem.estEndDate, "dd/MM/YYYY")
    amcItem.estStartDate = this.datepipe.transform(amcItem.estStartDate, "dd/MM/YYYY")

    amcItem.sqNo = this.amcItems.length + 1;

    if (!this.hasId) {
      this.amcItems.push(amcItem);
      this.form.get("amcItemsForm").reset();
      this.item.status.setValue(this.itemStatus.find(x => x.itemCode == "AINCO")?.listTypeItemId)
      return;
    }

    this.amcItemsService.SaveItem(amcItem)
      .subscribe((data: any) => {
        if (!data || !data.result) return this.notificationService.showError(data.resultMessage, "Error");

        //this.amcItems.push(amcItem);
        this.getAMCItems();
        this.form.get("amcItemsForm").reset();
        this.item.status.setValue(this.itemStatus.find(x => x.itemCode == "AINCO")?.listTypeItemId)
      })
  }

  DeleteItem(id) {
    this.amcItemsService.DeleteItem(id)
      .subscribe((data: any) => {
        if (data && data.result) {
          this.notificationService.showSuccess("Item Deleted Successfully", "Success");
          //this.amcItems = this.amcItems.filter(x => x.id != id);
          this.getAMCItems();
  
        }
        else this.notificationService.showError("Some Error Occurred", "Error");
      })
  }

  getAMCItems()
  {
    this.amcItemsService.GetByAmcId(this.id)
          .subscribe((data: any) => {
            this.amcItems = data.object;         
          });
  }

  getServiceType(id) {
    return this.serviceType.find(x => x.listTypeItemId == id)?.itemname;
  }

  getStatus(id) {
    return this.itemStatus.find(x => x.listTypeItemId == id)?.itemname;
  }

  getServiceRequest(id) {
    return this.lstServiceRequest.find(x => x.id == id)?.serreqno;
  }
}
