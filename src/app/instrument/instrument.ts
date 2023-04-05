import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import {
  ConfigTypeValue,
  Contact,
  CustomerSite,
  Distributor,
  FileShare,
  Instrument,
  instrumentConfig,
  ListTypeItem,
  ProfileReadOnly,
  ResultMsg,
  SparePart,
  User
} from '../_models';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColumnApi, GridApi } from 'ag-grid-community';

import {
  AccountService,
  AlertService,
  ConfigTypeValueService,
  CurrencyService,
  CustomerService,
  CustomerSiteService,
  DistributorService,
  FileshareService,
  InstrumentService,
  ListTypeService,
  NotificationService,
  ProfileService,
  SparePartService,
  UploadService
} from '../_services';
import { FilerendercomponentComponent } from "../Offerrequest/filerendercomponent.component";
import { DomSanitizer } from "@angular/platform-browser";
import { DatePipe } from "@angular/common";
import { EnvService } from '../_services/env/env.service';
import { BusinessUnitService } from '../_services/businessunit.service';
import { BrandService } from '../_services/brand.service';
import { GetParsedDate } from '../_helpers/Providers';
import { Accessories } from './Accessories.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { InstrumentAccessoryService } from '../_services/InstrumentAccessory.Service';


@Component({
  selector: 'app-instrument',
  templateUrl: './instrument.html',
})
export class InstrumentComponent implements OnInit {
  user: User;
  instrumentform: FormGroup;
  instrument: Instrument;
  customersite: CustomerSite[] = [];
  loading = false;
  submitted = false;
  isSave = false;
  id: string;
  code: string = "CONTY";
  listTypeItems: ListTypeItem[];
  config: instrumentConfig;
  sparePartDetails: SparePart[] = [];
  recomandedFilter: SparePart[] = [];
  consumfilter: SparePart[] = [];
  fullsparefilter: SparePart[] = [];
  othersparefilter: SparePart[] = [];
  distibutorList: Distributor[];
  configValueList: ConfigTypeValue[];
  selectedConfigType: ConfigTypeValue[] = [];
  imagePath: any;
  pdfPath: any;
  pdfFileName: string;
  instuType: ListTypeItem[];
  contactList: Contact[];
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  hasCommercial: boolean = false;
  noimageData: any = "data:image/jpeg;base64,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";
  public columnDefs: any[];
  private columnApi: ColumnApi;
  private api: GridApi;
  PdffileData: FileShare[];
  pdfBase64: string;
  public pdfcolumnDefs: any[];
  private pdfcolumnApi: ColumnApi;
  private pdfapi: GridApi;

  lstCurrency: any[]
  file: any;
  img: any
  attachments: any;
  fileList: [] = [];
  transaction: number;
  hastransaction: boolean;
  datepipie = new DatePipe("en-US");
  isEditMode;
  isNewMode: boolean;
  siteId: any;
  hasWarrenty: boolean;
  @ViewChild('baseAmt') baseAmt
  baseCurrId: any;
  businessUnitList: any[]
  brandList: any[];
  isAccessories: any;
  bsActionModalRef: BsModalRef;
  accessoriesData: any;
  formData: any;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private customerSiteService: CustomerSiteService,
    private instrumentService: InstrumentService,
    private listTypeService: ListTypeService,
    private sparePartService: SparePartService,
    private uploadService: UploadService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private configService: ConfigTypeValueService,
    private distributorService: DistributorService,
    private fileshareService: FileshareService,
    private currencyService: CurrencyService,
    private _sanitizer: DomSanitizer,
    private customerService: CustomerService,
    private businessUnitService: BusinessUnitService,
    private enviroment: EnvService,
    private modalService: BsModalService,
    private brandService: BrandService,
    private instrumentAccessoryService: InstrumentAccessoryService,
  ) {

    notificationService.listen().subscribe((data) => {

      this.instrumentAccessoryService.GetByInsId(this.id).subscribe((data: any) => this.accessoriesData = data.object)

    })

  }

  ngOnInit() {
    this.transaction = 0;
    this.user = this.accountService.userValue;
    let role = JSON.parse(sessionStorage.getItem('roles'));
    this.profilePermission = this.profileService.userProfileValue;

    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SINST");
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
      role = role[0]?.itemCode;
    }

    this.instrumentform = this.formBuilder.group({
      custSiteId: ['', Validators.required],
      serialnos: ['', Validators.required],
      insmfgdt: ['', Validators.required],
      instype: ['', [Validators.required]],
      insversion: ['', Validators.required],
      image: [''],
      shipdt: [''],
      installdt: ['', Validators.required],
      installby: ['', Validators.required],
      engname: [''],
      engcontact: [''],
      engemail: ['', [Validators.required, Validators.email]],
      warranty: false,
      isactive: true,
      isdeleted: [false],
      wrntystdt: [''],
      wrntyendt: [''],
      configtypeid: [''],
      configvalueid: [''],
      installbyOther: [''],
      operatorId: ['', Validators.required],
      dateOfPurchase: [],
      cost: [0],
      currencyId: [""],
      baseCurrencyAmt: [1.00, Validators.required],
      baseCurrencyId: ["", Validators.required],
      instruEngineerId: ['', Validators.required],
      businessUnitId: ["", Validators.required],
      brandId: ["", Validators.required],
    });
    this.imageUrl = this.noimageData;

    this.instrumentform.get('installby').valueChanges.subscribe((data) => {
      debugger;
      if (data && data == 0) {
        this.instrumentform.get('installbyOther').setValidators(Validators.required)
        this.instrumentform.get('installbyOther').updateValueAndValidity()
      }
      else {
        this.instrumentform.get('installbyOther').clearValidators
        this.instrumentform.get('installbyOther').updateValueAndValidity()
      }

    })


    this.instrumentform.get('warranty').valueChanges
      .subscribe(value => {
        //debugger;
        this.hasWarrenty = value
        if (value) {
          if (this.isEditMode || this.isNewMode) {
            this.instrumentform.get('wrntystdt').enable();
            this.instrumentform.get('wrntyendt').enable();
          }
          this.instrumentform.get('wrntystdt').setValidators([Validators.required]);
          this.instrumentform.get('wrntystdt').updateValueAndValidity();
          this.instrumentform.get('wrntyendt').setValidators([Validators.required]);
          this.instrumentform.get('wrntyendt').updateValueAndValidity();
          this.instrumentform.get('shipdt').setValidators([Validators.required]);
          this.instrumentform.get('shipdt').updateValueAndValidity();
          this.instrumentform.get('engname').setValidators([Validators.required]);
          this.instrumentform.get('engname').updateValueAndValidity();
          this.instrumentform.get('engcontact').setValidators([Validators.required]);
          this.instrumentform.get('engcontact').updateValueAndValidity();
        } else {
          this.instrumentform.get('wrntystdt').disable();
          this.instrumentform.get('wrntyendt').disable();
          this.instrumentform.get('wrntystdt').clearValidators();
          this.instrumentform.get('wrntystdt').updateValueAndValidity();
          this.instrumentform.get('wrntyendt').clearValidators();
          this.instrumentform.get('wrntyendt').updateValueAndValidity();
          this.instrumentform.get('shipdt').clearValidators();
          this.instrumentform.get('shipdt').updateValueAndValidity();
          this.instrumentform.get('engname').clearValidators();
          this.instrumentform.get('engname').updateValueAndValidity();
          this.instrumentform.get('engcontact').clearValidators();
          this.instrumentform.get('engcontact').updateValueAndValidity();
        }
      }
      );

    this.id = this.route.snapshot.paramMap.get('id');

    this.instrumentAccessoryService.GetByInsId(this.id).subscribe((data: any) => {
      this.accessoriesData = data.object;
    })

    this.instrumentform.get('baseCurrencyAmt').valueChanges
      .subscribe(value => {
        if (value >= 100000) this.instrumentform.get('baseCurrencyAmt').setValue(1.0)
      });

    this.instrumentform.get('currencyId').valueChanges
      .subscribe(value => {
        if (value == this.instrumentform.get('baseCurrencyId').value) {
          this.instrumentform.get('baseCurrencyAmt').setValue(1.00)
          this.baseAmt.nativeElement.disabled = true
        }
        else this.baseAmt.nativeElement.disabled = false
      });

    if (this.hasCommercial)
      this.instrumentform.get("cost").setValidators([Validators.required])
    else this.instrumentform.get("cost").clearValidators()

    if (this.hasCommercial)
      this.instrumentform.get("currencyId").setValidators([Validators.required])
    else this.instrumentform.get("currencyId").clearValidators()

    this.customerService.getAllByConId(this.user.contactId)
      .pipe(first()).subscribe((data: any) => {
        if (this.user.userType?.toLocaleLowerCase() == "customer") {
          this.customersite = [];
          let siteLst = this.user.custSites?.split(",")
          data.object[0].sites.forEach(element => {
            if (siteLst?.length > 0 && siteLst?.find(x => x == element.id) == null) return;
            this.customersite.push(element);
          })
        }
        else data.object.forEach(element => this.customersite.push(...element.sites));

        this.customerSiteService.GetCustomerSiteContacts().pipe(first())
          .subscribe((data1: any) => {
            this.siteId = data1.object.find(x => x.id == this.user.contactId)?.parentId
            if (this.id == null) this.instrumentform.get('custSiteId').setValue(this.siteId);

            if (this.siteId) {
              this.customerSiteService.getById(this.siteId)
                .pipe(first())
                .subscribe((dataa: any) => {
                  this.contactList = dataa.object.contacts;
                });
            }
          });
      })

    this.currencyService.getAll()
      .pipe(first()).subscribe((data: any) => {
        this.lstCurrency = data.object
        this.baseCurrId = data.object.find(x => x.code == this.enviroment.baseCurrencyCode)?.id
        this.instrumentform.get("baseCurrencyId").setValue(this.baseCurrId)
      })

    this.businessUnitService.GetByCompanyId()
      .pipe(first()).subscribe((data: any) => this.businessUnitList = data.object)

    this.brandService.GetByCompanyId()
      .pipe(first()).subscribe((data: any) => this.brandList = data.object)

    this.distributorService.getAll().pipe(first())
      .subscribe((data: any) => this.distibutorList = data.object);

    this.listTypeService.getById("INSTY").pipe(first())
      .subscribe((data: any) => this.instuType = data);

    this.listTypeService.getById(this.code).pipe(first())
      .subscribe((data: ListTypeItem[]) => this.listTypeItems = data);

    if (this.id != null) {
      this.instrumentService.getById(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.customerSiteService.getById(data.object.custSiteId)
              .pipe(first())
              .subscribe((dataa: any) => {
                this.contactList = dataa.object.contacts;
              });

            if (data.object.image == null) this.imageUrl = this.noimageData;
            else {
              this.imageUrl = "data:image/jpeg;base64, " + data.object.image;
              this.imageUrl = this._sanitizer.bypassSecurityTrustResourceUrl(this.imageUrl)
            }


            this.fileshareService.list(data.object.id)
              .pipe(first())
              .subscribe({
                next: (data: any) => {
                  this.attachments = data.object;
                },
              });

            this.hasWarrenty = data.object.warranty
            setTimeout(() => {
              this.formData = data.object;
              this.instrumentform.patchValue(this.formData);
            }, 700);

            this.sparePartDetails = data.object.spartParts;

            this.recomandFilter(this.sparePartDetails);
            for (let i = 0; i < data.object.spartParts.length; i++) {

              if (this.selectedConfigType.filter(x =>
                x.id == data.object.spartParts[i].configValueid
                && x.listTypeItemId == data.object.spartParts[i].configTypeid
                && x.sparePartId == data.object.spartParts[i].id).length == 0
              ) {
                let cnfig: ConfigTypeValue;
                cnfig = new ConfigTypeValue;
                cnfig.id = data.object.spartParts[i].configValueid;
                cnfig.listTypeItemId = data.object.spartParts[i].configTypeid;
                cnfig.sparePartId = data.object.spartParts[i].id;
                cnfig.insqty = data.object.spartParts[i].insQty;
                this.selectedConfigType.push(cnfig);
              }
            }
            this.instrumentform.setValue({
              shipdt: new Date(data.object?.shipdt)
            });

          }
        });


      this.fileshareService.getById(this.id).pipe(first())
        .subscribe({
          next: (data: any) =>
            this.PdffileData = data.object
        });
      setTimeout(() => this.instrumentform.disable(), 1000);
      this.pdfcolumnDefs = this.pdfcreateColumnDefsRO();
      this.columnDefs = this.createColumnDefsRO();
    }
    else {
      this.isNewMode = true
      setTimeout(() => this.FormControlDisable(), 1000);
      this.pdfcolumnDefs = this.pdfcreateColumnDefs();
      this.columnDefs = this.createColumnDefs();
    }

  }

  ChangeTab(isAccessories) {
    this.isAccessories = isAccessories;
    if (isAccessories)
      if (this.isEditMode)
        this.columnDefs = this.createColumnDefsAccessory();
      else this.columnDefs = this.createColumnDefsAccessoryRO();
    else
      if (this.isEditMode)
        this.columnDefs = this.createColumnDefs();
      else this.columnDefs = this.createColumnDefsRO();
  }

  openAccessoryModel() {
    if (this.isAccessories == true) {
      const modalOptions: any = {
        backdrop: 'static',
        ignoreBackdropClick: true,
        keyboard: false,
        initialState: {
          instrumentId: this.id
        },
      }
      if (this.id != null)
        this.bsActionModalRef = this.modalService.show(Accessories, modalOptions);
      else this.notificationService.showInfo("Please save the Instrument to add Accessory.", "Info")
    }
  }
  DeleteInstrumentAccessory(event) {
    var data = event.data;
    event.data.modified = true;
    this.instrumentAccessoryService.delete(data.id)
      .subscribe((data) => this.notificationService.filter("itemadded"))

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

      this.instrumentform.enable();
      this.FormControlDisable();
      this.pdfcolumnDefs = this.pdfcreateColumnDefs();

      if (!this.isAccessories)
        this.columnDefs = this.createColumnDefs();
      else this.columnDefs = this.createColumnDefsAccessory();

      let warrenty = this.instrumentform.get('warranty')
      warrenty.setValue(warrenty.value)

      let curr = this.instrumentform.get('currencyId')
      curr.setValue(curr.value)
    }
  }

  Back() {

    this.router.navigate(["instrumentlist"]);

  }

  CancelEdit() {
    if (!confirm("Are you sure you want to discard changes?")) return;
    if (this.id != null) this.instrumentform.patchValue(this.formData);
    else this.instrumentform.reset();
    this.instrumentform.disable()
    this.isEditMode = false;
    this.isNewMode = false;
    this.pdfcolumnDefs = this.pdfcreateColumnDefsRO();
    this.columnDefs = this.createColumnDefsRO();
    this.notificationService.SetNavParam();
  }

  FormControlDisable() {
    if (this.siteId != null || this.siteId != undefined) {
      this.instrumentform.get('custSiteId').disable()
    }
    this.instrumentform.get('baseCurrencyId').disable()

  }

  DeleteRecord() {
    if (confirm("Are you sure you want to delete the record?")) {
      this.instrumentService.delete(this.id).pipe(first())
        .subscribe((data: any) => {
          if (data.result) {
            this.notificationService.showSuccess("Record deleted successfully", "Success");
            this.router.navigate(["instrumentlist"], {
              queryParams: {
                isNSNav: true
              }
            })
          }
          else
            this.notificationService.showInfo(data.resultMessage, "Info");
        })
    }
  }


  @ViewChild('fileInput') el: ElementRef;
  imageUrl: any; //= 'https://i.pinimg.com/236x/d6/27/d9/d627d9cda385317de4812a4f7bd922e9--man--iron-man.jpg';
  editFile: boolean = true;
  removeUpload: boolean = false;

  // convenience getter for easy access to form fields
  get f() {
    return this.instrumentform.controls;
  }

  get c() {
    return this.instrumentform.controls.configuration;
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
      node.appendChild(document.createTextNode(name));
      ul.appendChild(node);
    }
  };


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

          },
          error: error => {

            // this.imageUrl = this.noimageData;
          }
        });
    }
  }

  download(fileData: any) {
    //debugger;
    const byteArray = new Uint8Array(atob(fileData).split('').map(char => char.charCodeAt(0)));
    let b = new Blob([byteArray], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(b);
    window.open(url);
    // i.e. display the PDF content via iframe
    // document.querySelector("iframe").src = url;
  }

  getInstrBySerialNo(serialNo: string) {
    //debugger;
    this.instrumentService.searchByKeyword(serialNo, this.instrumentform.get('custSiteId').value)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          data = data.object[0];
          this.formData = data.object;
          this.instrumentform.patchValue(this.formData);
          this.sparePartDetails = data?.spartParts;
          this.recomandFilter(this.sparePartDetails);
          for (let i = 0; i < data.spartParts.length; i++) {
            if (this.selectedConfigType?.filter(x => x.id == data.spartParts[i].configValueid && x.listTypeItemId == data.spartParts[i].configTypeid
              && x.sparePartId == data.spartParts[i].id).length == 0) {
              let cnfig: ConfigTypeValue;
              cnfig = new ConfigTypeValue;
              cnfig.id = data.spartParts[i].configValueid;
              cnfig.listTypeItemId = data.spartParts[i].configTypeid;
              cnfig.sparePartId = data.spartParts[i].id;
              cnfig.insqty = data.spartParts[i].insQty;
              this.selectedConfigType.push(cnfig);
            }
          }
          this.instrumentform.setValue({
            shipdt: new Date(data.object.shipdt)
          });
        },
        error: error => {

          this.loading = false;
        }
      });
  }

  onDropdownChange(value: string, configvalue: string) {
    // debugger;
    if (configvalue == "0") {
      configvalue = "";
    }
    if (this.selectedConfigType.length > 0 && this.selectedConfigType.filter(x => x.id == configvalue && x.listTypeItemId == value).length == 0) {
      // for (let i = 0; i < this.selectedConfigType.length; i++) {
      this.sparePartService.getByConfignValueId(value, configvalue)
        .pipe(first()).subscribe((data: any) => {
          if (data.object.length > 0) {
            this.sparePartDetails = this.sparePartDetails.concat(data.object);
            this.recomandFilter(this.sparePartDetails);
            for (let i = 0; i < data.object.length; i++) {
              let cnfig: ConfigTypeValue;
              cnfig = new ConfigTypeValue;
              cnfig.id = configvalue;
              cnfig.listTypeItemId = value;
              cnfig.sparePartId = data.object[i].id;
              this.selectedConfigType.push(cnfig);
            }
            this.notificationService.showInfo("Spare Parts Added", "Parts Added")
            this.instrumentform.get("configtypeid").reset();
            this.instrumentform.get("configvalueid").reset();
          }
        });
      // }
    }
    else {
      if (this.selectedConfigType.filter(x => x.id == configvalue && x.listTypeItemId == value).length == 0) {
        this.sparePartService.getByConfignValueId(value, configvalue)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (data.object.length > 0) {
                if (this.sparePartDetails != null) {
                  this.sparePartDetails = this.sparePartDetails.concat(data.object);
                  this.recomandFilter(this.sparePartDetails);
                }
                else {
                  this.sparePartDetails = data.object;
                  this.recomandFilter(this.sparePartDetails);
                }
                for (let i = 0; i < data.object.length; i++) {
                  let cnfig: ConfigTypeValue;
                  cnfig = new ConfigTypeValue;
                  cnfig.id = configvalue;
                  cnfig.listTypeItemId = value;
                  cnfig.sparePartId = data.object[i].id;
                  this.selectedConfigType.push(cnfig);
                }
                this.notificationService.showInfo("Spare Parts Added", "Parts Added")
                this.instrumentform.get("configtypeid").reset();
                this.instrumentform.get("configvalueid").reset();
              }
            },
            error: error => {

              this.loading = false;
            }
          });
      }
    }
  }

  uploadFile(files, id) {
    //debugger;
    this.img = files;
    let reader = new FileReader(); // HTML5 FileReader API
    let file = files[0];
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.imageUrl = reader.result as string;
      this.instrumentform.patchValue({
        imageUrl: reader.result as string
      });
    }

    if (files.length === 0 || id == null) {
      return;
    }
    let filesToUpload: File[] = files;
    const formData = new FormData();
    Array.from(filesToUpload).map((file, index) => {
      return formData.append("file" + index, file, file.name);
    });
    this.fileshareService.upload(formData, id, "INSTIMG", "INST").subscribe((event) => { });
  }

  uploadPdfFile(event) {
    //debugger;
    let file = event.target.files;
    if (event.target.files && event.target.files[0]) {
      //  this.uploadService.upload(file).subscribe(event => { //debugger; });;
      this.uploadService.uploadPdf(file)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            //debugger;
            this.notificationService.showSuccess("File Upload Successfully", "Success");
            this.pdfPath = data.path;
            //this.pdfFileName = file.name;
          },
          error: error => {

          }
        });
    }
  }

  saveFileShare(files, id) {
    if (files.length === 0) {
      return;
    }
    let filesToUpload: File[] = files;
    const formData = new FormData();

    Array.from(filesToUpload).map((file, index) => {
      return formData.append("file" + index, file, file.name);
    });
    this.fileshareService.upload(formData, id, "INST").subscribe((event) => { });
  }

  getfil(x) {
    this.file = x;
  }

  onSubmit() {
    this.submitted = true;
    this.alertService.clear();
    this.instrumentform.markAllAsTouched()
    // stop here if form is invalid
    if (this.instrumentform.invalid) {
      return;
    }
    this.isSave = true;
    this.loading = true;
    this.instrument = this.instrumentform.value;
    this.instrument.image = this.imagePath;
    this.instrument.engcontact = String(this.instrument.engcontact);
    this.instrument.configuration = [];
    this.instrument.baseCurrencyId = this.baseCurrId

    for (let i = 0; i < this.selectedConfigType.length; i++) {
      this.config = new instrumentConfig();
      this.config.configtypeid = this.selectedConfigType[i].listTypeItemId;
      this.config.configvalueid = this.selectedConfigType[i].id;
      this.config.sparepartid = this.selectedConfigType[i].sparePartId;
      if (this.selectedConfigType[i].insqty != null) {
        this.config.insqty = parseInt(this.selectedConfigType[i].insqty);
      }
      else {
        this.config.insqty = 0;
      }

      this.instrument.configuration.push(this.config);
    }
    this.instrument.custSiteId = this.instrumentform.get('custSiteId').value
    this.instrument.insmfgdt = this.datepipie.transform(GetParsedDate(this.instrument.insmfgdt), 'dd/MM/YYYY')

    if (this.instrument.dateOfPurchase)
      this.instrument.dateOfPurchase = this.datepipie.transform(GetParsedDate(this.instrument.dateOfPurchase), 'dd/MM/YYYY')

    if (this.instrument.shipdt)
      this.instrument.shipdt = this.datepipie.transform(GetParsedDate(this.instrument.shipdt), 'dd/MM/YYYY')
    this.instrument.installdt = this.datepipie.transform(GetParsedDate(this.instrument.installdt), 'dd/MM/YYYY')

    if (this.instrument.wrntyendt)
      this.instrument.wrntyendt = this.datepipie.transform(GetParsedDate(this.instrument.wrntyendt), 'dd/MM/YYYY')

    if (this.instrument.wrntystdt)
      this.instrument.wrntystdt = this.datepipie.transform(GetParsedDate(this.instrument.wrntystdt), 'dd/MM/YYYY')

    if (this.id == null) {
      //debugger;
      this.instrumentService.save(this.instrument)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.router.navigate(["instrumentlist"], {
                queryParams: {
                  isNSNav: true
                }
              });
              if (this.file != null) {
                this.saveFileShare(this.file, data.object.id)
              }
              if (this.img != null && this.img != "") this.uploadFile(this.img, this.id)
            }
            else this.notificationService.showError(data.resultMessage, "Error")

            this.loading = false;
          },
        });
    }
    else {
      this.instrument.id = this.id;
      this.instrumentService.update(this.id, this.instrument)
        .pipe(first())
        .subscribe({
          next: (data: ResultMsg) => {
            if (data.result) {
              if (this.file != null) {
                this.saveFileShare(this.file, this.id)
              }
              if (this.img != null && this.img != "") this.uploadFile(this.img, this.id)

              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.router.navigate(["instrumentlist"], {
                queryParams: {
                  isNSNav: true
                }
              });
            }

            else this.notificationService.showError(data.resultMessage, "Error")

            this.loading = false;

          },
        });
    }
  }

  private createColumnDefs() {
    return [
      {
        headerName: 'Action',
        field: 'configTypeid',
        filter: false,
        enableSorting: false,
        editable: false,
        width: 100,
        sortable: false,
        lockPosition: "left",
        cellRenderer: (params) => {
          if (this.hasDeleteAccess) {
            return `<button class="btn btn-link" type="button" (click)="delete(params)"><i class="fas fa-trash-alt" data-action-type="remove" title="Delete"></i></button>`
          }
        }
      },
      {
        headerName: 'Type',
        field: 'configTypeName',
        filter: false,
        resizable: true,
        enableSorting: false,
        editable: false,
        sortable: false,
        width: 100,
        tooltipField: 'configTypeName',
      },
      {
        headerName: 'Type',
        field: 'configValueid',
        filter: false,
        enableSorting: false,
        editable: false,
        resizable: true,
        sortable: false,
        width: 0,
        hide: true,
      },
      {
        headerName: 'Value',
        field: 'configValueName',
        resizable: true,
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        width: 100,
        tooltipField: 'configValueName',
      },
      {
        headerName: 'Part Number',
        field: 'partNo',
        filter: true,
        resizable: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'partNo',
      }, {
        headerName: 'Description',
        field: 'itemDesc',
        filter: true,
        resizable: true,
        editable: false,
        sortable: true,
        tooltipField: 'itemDesc',
      },
      {
        headerName: 'Sparepart Qty.',
        field: 'qty',
        filter: true,
        editable: false,
        sortable: true
      },
      {
        headerName: 'Instrument Qty.',
        field: 'insQty',
        filter: true,
        editable: true,
        sortable: true
      },
      {
        headerName: 'Desc. As Per Catlog',
        field: 'descCatalogue',
        resizable: true,
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: 'descCatalogue',
      }
    ]
  }

  private createColumnDefsAccessory() {
    return [
      {
        headerName: 'Action',
        field: 'id',
        filter: false,
        enableSorting: false,
        editable: false,
        width: 100,
        sortable: false,
        lockPosition: "left",
        cellRenderer: (params) => {
          if (this.hasDeleteAccess) {
            return `<button class="btn btn-link" type="button" (click)="delete(params)"><i class="fas fa-trash-alt" data-action-type="remove" title="Delete"></i></button>`
          }
        }
      },
      {
        headerName: 'Accessory Name',
        field: 'accessoryName',
        filter: true,
        sortable: true,
        resizable: true,
        tooltipField: 'accessoryName',
      },
      {
        headerName: 'Brand Name',
        field: 'brandName',
        filter: true,
        sortable: true,
        resizable: true,
        tooltipField: 'brandName',
      },
      {
        headerName: 'Model Name',
        field: 'modelName',
        filter: true,
        sortable: true,
        resizable: true,
        tooltipField: 'modelName',
      },
      {
        headerName: 'Model Number',
        field: 'modelNumber',
        filter: true,
        sortable: true,
        resizable: true,
        tooltipField: 'modelNumber',
      },
      {
        headerName: 'Serial Number',
        field: 'serialNumber',
        filter: true,
        sortable: true,
        resizable: true,
        tooltipField: 'serialNumber',
      },
      {
        headerName: 'Year Of Purchase',
        field: 'yearOfPurchase',
        filter: true,
        sortable: true,
        resizable: true,
        tooltipField: 'yearOfPurchase',
      },
      {
        headerName: 'Quantity',
        field: 'quantity',
        filter: true,
        sortable: true,
        resizable: true,
        tooltipField: 'quantity',
      },
      {
        headerName: 'Accessory Description',
        field: 'accessoryDescription',
        filter: true,
        sortable: true,
        resizable: true,
        tooltipField: 'accessoryDescription',
      },
    ]
  }

  private createColumnDefsAccessoryRO() {
    return [
      {
        headerName: 'Accessory Name',
        field: 'accessoryName',
        filter: true,
        sortable: true,
        resizable: true,
        tooltipField: 'accessoryName',
      },
      {
        headerName: 'Brand Name',
        field: 'brandName',
        filter: true,
        sortable: true,
        resizable: true,
        tooltipField: 'brandName',
      },
      {
        headerName: 'Model Name',
        field: 'modelName',
        filter: true,
        sortable: true,
        resizable: true,
        tooltipField: 'modelName',
      },
      {
        headerName: 'Model Number',
        field: 'modelNumber',
        filter: true,
        sortable: true,
        resizable: true,
        tooltipField: 'modelNumber',
      },
      {
        headerName: 'Serial Number',
        field: 'serialNumber',
        filter: true,
        sortable: true,
        resizable: true,
        tooltipField: 'serialNumber',
      },
      {
        headerName: 'Year Of Purchase',
        field: 'yearOfPurchase',
        filter: true,
        sortable: true,
        resizable: true,
        tooltipField: 'yearOfPurchase',
      },
      {
        headerName: 'Quantity',
        field: 'quantity',
        filter: true,
        sortable: true,
        resizable: true,
        tooltipField: 'quantity',
      },
      {
        headerName: 'Accessory Description',
        field: 'accessoryDescription',
        filter: true,
        sortable: true,
        resizable: true,
        tooltipField: 'accessoryDescription',
      },
    ]
  }

  private createColumnDefsRO() {
    return [
      {
        headerName: 'Type',
        field: 'configTypeName',
        filter: false,
        enableSorting: false,
        resizable: true,
        editable: false,
        sortable: false,
        width: 100,
        tooltipField: 'configTypeName',
      },
      {
        headerName: 'Type',
        field: 'configValueid',
        filter: false,
        resizable: true,
        enableSorting: false,
        editable: false,
        sortable: false,
        width: 0,
        hide: true,
      },
      {
        headerName: 'Value',
        field: 'configValueName',
        resizable: true,
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        width: 100,
        tooltipField: 'configValueName',
      },
      {
        headerName: 'Part Number',
        field: 'partNo',
        resizable: true,
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'partNo',
      }, {
        headerName: 'Description',
        resizable: true,
        field: 'itemDesc',
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: 'itemDesc',
      },
      {
        headerName: 'Sparepart Qty.',
        field: 'qty',
        filter: true,
        editable: false,

        sortable: true
      },
      {
        headerName: 'Instrument Qty.',
        field: 'insQty',
        filter: true,
        editable: true,
        sortable: true
      },
      {
        headerName: 'Desc. As Per Catlog',
        field: 'descCatalogue',
        filter: true,
        resizable: true,
        editable: false,
        sortable: true,
        tooltipField: 'descCatalogue',
      }
    ]
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
  }

  onConfigChange(param: string) {
    this.configService.getById(param)
      .pipe(first()).subscribe((data: any) => this.configValueList = data.object);
  }

  public onRowClicked(e) {
    //debugger;
    if (e.event.target !== undefined) {
      let data = e.data;
      let actionType = e.event.target.getAttribute("data-action-type");
      this.id = this.route.snapshot.paramMap.get('id');
      switch (actionType) {
        case "remove":
          if (confirm("Are you sure, you want to remove the config type?") == true) {
            this.config = new instrumentConfig();
            this.config.configtypeid = data.configTypeid;
            this.config.configvalueid = data.configValueid;
            this.config.instrumentid = this.id;
            this.config.sparepartid = data.id;
            debugger;
            if (this.id != null) {
              this.instrumentService.deleteConfig(this.config)
                .pipe(first())
                .subscribe(() => {
                  this.notificationService.showSuccess("Deleted Successfully", "Success");
                  this.selectedConfigType = this.selectedConfigType.filter(x => !(x.id == data.configValueid && x.listTypeItemId == data.configTypeid && x.sparePartId == data.id));
                  this.sparePartDetails = this.sparePartDetails.filter(x => !(x.configValueid == data.configValueid && x.configTypeid == data.configTypeid && x.id == data.id));
                  this.recomandFilter(this.sparePartDetails);
                });
            }
            else {
              this.notificationService.showSuccess("Deleted Successfully ", "Success");
              this.selectedConfigType = this.selectedConfigType.filter(x => !(x.id == data.configValueid && x.listTypeItemId == data.configTypeid && x.sparePartId == data.id));
              this.sparePartDetails = this.sparePartDetails.filter(x => !(x.configValueid == data.configValueid && x.configTypeid == data.configTypeid && x.id == data.id));
              this.recomandFilter(this.sparePartDetails);

            }
          }
      }
    }
  }

  onCellValueChanged(event) {
    //debugger;
    var data = event.data;
    event.data.modified = true;
    if (this.selectedConfigType.filter(x => x.id == data.configValueid && x.listTypeItemId == data.configTypeid
      && x.sparePartId == data.id).length > 0) {
      var d = this.selectedConfigType.filter(x => x.id == data.configValueid && x.listTypeItemId == data.configTypeid
        && x.sparePartId == data.id);
      d[0].insqty = event.newValue;
    }
  }

  recomandFilter(data: any) {
    this.recomandedFilter = this.sparePartDetails.filter(x => x.partTypeName == "Recommended");
    this.consumfilter = this.sparePartDetails.filter(x => x.partTypeName == "Consumables");
    this.fullsparefilter = this.sparePartDetails.filter(x => x.partTypeName == "Full Spare");
    this.othersparefilter = this.sparePartDetails.filter(x => x.partTypeName == "Other Spare");
  }

  private pdfcreateColumnDefs() {
    return [
      {
        headerName: 'Action',
        field: 'id',
        filter: false,
        enableSorting: false,
        editable: false,
        lockPosition: "left",
        sortable: false,
        cellRendererFramework: FilerendercomponentComponent,
        cellRendererParams: {
          deleteaccess: this.hasDeleteAccess,
          id: this.id
        },
      },
      {
        headerName: 'FileName',
        field: 'displayName',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        width: 100,
        tooltipField: 'fileName',
      },
    ]
  }

  private pdfcreateColumnDefsRO() {
    return [
      {
        headerName: 'FileName',
        field: 'displayName',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        width: 100,
        tooltipField: 'fileName',
      },
    ]
  }

  pdfonGridReady(params): void {
    this.pdfapi = params.api;
    this.pdfcolumnApi = params.columnApi;
  }

  public onPdfRowClicked(e) {
    //debugger;
    if (e.event.target !== undefined) {
      let data = e.data;
      let actionType = e.event.target.getAttribute("data-action-type");
      this.id = this.route.snapshot.paramMap.get('id');
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
                    this.fileshareService.getById(this.id)
                      .pipe(first())
                      .subscribe({
                        next: (data: any) => {
                          this.PdffileData = data.object;
                          //this.getPdffile(data.object.filePath);
                        },
                      });
                  }
                },
              });
          }
          break;
        case "download":
          this.getPdffile(data.filePath);
      }
    }
  }

  onSiteChange(custSite: any) {
    this.customerSiteService.getById(custSite)
      .pipe(first())
      .subscribe((dataa: any) => {
        this.contactList = dataa.object.contacts;

      });

  }


}
