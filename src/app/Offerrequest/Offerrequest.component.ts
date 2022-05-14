import { DatePipe } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';
import { Guid } from 'guid-typescript';
import { first } from 'rxjs/operators';
import { Currency, Distributor, ResultMsg, User } from '../_models';
import { Offerrequest } from '../_models/Offerrequest.model';
import {
  AccountService,
  AlertService,
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
import { environment } from '../../environments/environment';
import { OfferRequestProcessesService } from '../_services/offer-request-processes.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { OfferRequeestProcessFileRenderer } from './OfferRequeestProcessFileRenderer';

@Component({
  selector: 'app-Offerrequest',
  templateUrl: './Offerrequest.component.html',
})
export class OfferrequestComponent implements OnInit {
  form: FormGroup;
  model: Offerrequest;
  loading = false;
  submitted = false;
  isSave = false;
  type: string;
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
  public columnDefs: ColDef[];
  public columnDefsAttachments: ColDef[];
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
  public progress: number;
  public message: string;

  @Output() public onUploadFinished = new EventEmitter();
  bsModalRef: BsModalRef;
  SpareQuotationDetailsList = [];
  SpareQuotationDetails: any[] = [];
  datepipie = new DatePipe('en-US');
  ColumnDefsSPDet: ColDef[];
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
  vScroll: boolean = true;
  isLocked: boolean;
  processGridDefs: ColDef[];
  stagesList: any;
  isPaymentTerms: boolean;
  datepipe = new DatePipe('en-US')
  @ViewChild('stageFiles') stageFiles;
  isPaymentAmt: any;
  isCompleted: any;

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
    private instrumentService: InstrumentService
  ) {
    this.notificationService.listen().subscribe((m: any) => {
      if (this.id != null) {
        this.SpareQuoteDetService.getAll(this.id).pipe(first())
          .subscribe({
            next: (data: any) => {
              this.SpareQuotationDetailsList = data.object;
              this.SpareQuotationDetailsList.forEach(value => {
                value.zohoPORaisedDate = this.datepipie.transform(value.zohoPORaisedDate, "MM/dd/yyyy");
                value.deliveredOn = this.datepipie.transform(value.deliveredOn, "MM/dd/yyyy");
                value.custResponseDate = this.datepipie.transform(value.custResponseDate, "MM/dd/yyyy");
                value.raisedDate = this.datepipie.transform(value.raisedDate, "MM/dd/yyyy");
              })
            },
            error: error => {
              // this.alertService.error(error);
              this.notificationService.showSuccess(error, "Error");
              this.loading = false;
            }
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
              element.createdOn = this.datepipe.transform(element.createdOn, 'MM/dd/yyyy')
            });
            this.rowData = stageData.object;
            this.form.get('stageName').reset()
            this.form.get('stageComments').reset()
            this.form.get('payterms').reset()
            this.form.get('payAmt').reset()
            this.stageFiles.nativeElement.value = "";
            var selectedfiles = document.getElementById("stageFilesList");
            selectedfiles.innerHTML = '';
            this.isPaymentAmt = false;
          })

      }
    });

  }

  ngOnInit() {
    this.transaction = 0;
    this.user = this.accountService.userValue;
    let role = JSON.parse(localStorage.getItem('roles'));
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

    if (this.user.username == 'admin') {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
      this.hasUpdateAccess = true;
      this.hasReadAccess = true;
    } else {
      this.role = role[0]?.itemCode;
    }


    this.form = this.formBuilder.group({
      isactive: [true],
      offReqNo: [''],
      distributorid: ['', Validators.required],
      totalamount: [0],
      currencyId: [''],
      authtoken: [''],
      status: [''],
      otherSpareDesc: [''],
      podate: ['', Validators.required],
      spareQuoteNo: [{ value: '', disabled: true }],
      payterms: [''],
      paymentTerms: [""],
      customerId: ["", Validators.required],
      instrumentsList: ['', Validators.required],
      payAmt: [0],
      payAmtCurrencyId: [""],
      stageName: ['', Validators.required],
      stageComments: ['', Validators.required],
      stagePaymentType: []
    })

    this.id = this.route.snapshot.paramMap.get('id');
    this.columnDefs = this.createColumnDefs();
    this.columnDefsAttachments = this.createColumnDefsAttachments();
    this.ColumnDefsSPDet = this.createColumnDefsSPDet()
    this.form.get('podate').setValue(this.datepipie.transform(new Date, "MM/dd/yyyy"))

    this.instrumentService.getAll(this.user.userId)
      .pipe(first())
      .subscribe((data: any) => {
        this.instruments = data.object
      })

    this.custService.getAll().pipe(first())
      .subscribe((data: any) => {
        let custList = []
        if (this.role == environment.distRoleCode) {
          let regions = this.user.distRegionsId.split(',')

          data.object.forEach(element => {
            if (regions.includes(element.defdistregionid)) {
              custList.push(element)
            }
          });

        }

        else if (this.role == environment.custRoleCode) {
          this.custService.getAllByConId(this.user.contactId)
            .pipe(first())
            .subscribe((custData: any) => {
              custData.object.forEach(element => {
                custList.push(element)
              });

              this.form.get('customerId').setValue(custData.object[0]?.id)
              this.form.get('customerId').disable()
              this.form.get('customerId').updateValueAndValidity()
            })
        }

        this.customerList = custList
      })

    this.listTypeService.getById("OFRQP").pipe(first())
      .subscribe((data: any) => this.stagesList = data)

    if (this.role == environment.distRoleCode) {
      this.DistributorService.getByConId(this.user.contactId).pipe(first())
        .subscribe((data: any) => {
          this.form.get('distributorid').setValue(data.object[0]?.id)
          this.form.get('distributorid').disable()
          this.form.get('distributorid').clearValidators()
          this.form.get('distributorid').updateValueAndValidity()
        })
    }

    if (this.role == environment.distRoleCode) {
      this.isDist = true;
      this.form.get('podate').enable();
    }
    else this.form.get('podate').disable();

    if (this.id != null) {
      localStorage.setItem('offerrequestid', this.id)
      this.Service.getById(this.id)
        .pipe(first())
        .subscribe((data: any) => {
          this.listTypeService.getById("ORQPT")
            .pipe(first())
            .subscribe((mstData: any) => {
              console.log(data.object);

              this.isCompleted = data.object.isCompleted
              data.object.paymentTerms = data.object.paymentTerms?.split(',').filter(x => x != "");
              data.object.instrumentsList = data.object.instrumentsList.split(',').filter(x => x != "")
              this.paymentTypes = []
              this.payTypes = mstData;

              data.object.paymentTerms?.forEach(y => {
                mstData.forEach(x => {
                  if (y == x.listTypeItemId) {
                    this.paymentTypes.push(x)
                  }
                });
              });

              this.offerRequestProcess.getAll(this.id).pipe(first())
                .subscribe((stageData: any) => {
                  stageData.object.forEach(element => {
                    element.createdOn = this.datepipe.transform(element.createdOn, 'MM/dd/yyyy')
                  });

                  this.rowData = stageData.object
                  this.form.patchValue(data.object);
                  this.form.get('stageName').reset()
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
          this.api.setRowData(this.sparePartsList);
        });

      this.hasId = true;
    }

    else {
      this.hasId = false;
      this.id = Guid.create();
      this.id = this.id.value;
      this.listTypeService.getById("ORQPT")
        .pipe(first())
        .subscribe((mstData: any) => {
          this.payTypes = mstData;
        })
    }


    this.currencyService.getAll().pipe(first())
      .subscribe((data: any) => this.currencyList = data.object)

    this.DistributorService.getAll().pipe(first())
      .subscribe((data: any) => this.distributorList = data.object)

    this.SpareQuoteDetService.getAll(this.id)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.SpareQuotationDetailsList = data.object;
          this.SpareQuotationDetailsList.forEach(value => {
            value.zohoPORaisedDate = this.datepipie.transform(value.zohoPORaisedDate, "MM/dd/yyyy");
            value.deliveredOn = this.datepipie.transform(value.deliveredOn, "MM/dd/yyyy");
            value.custResponseDate = this.datepipie.transform(value.custResponseDate, "MM/dd/yyyy");
            value.raisedDate = this.datepipie.transform(value.raisedDate, "MM/dd/yyyy");
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

    if (this.f.stageName.errors) return this.notificationService.showInfo("Stage Name cannot be empty", "Info")

    if (this.f.stageComments.errors) return this.notificationService.showInfo("Comments cannot be empty", "Info")

    let hasNoAttachment = false;

    let Attachment = <HTMLInputElement>document.getElementById("stageFilesList_Attachment")
    hasNoAttachment = Attachment?.checked


    let comments = this.form.get('stageComments').value;

    if (!hasNoAttachment && this.processFile == null) return this.notificationService.showInfo("No Attachments Selected.", "Error")


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
      paymentTypeId: paymentTerms,
      payAmtCurrencyId,
    }

    this.offerRequestProcess.save(offerProcess).pipe(first())
      .subscribe((data: any) => {
        if (offerProcess.stage == this.stagesList.find(x => x.itemCode == "PFI")?.listTypeItemId)
          this.notificationService.showInfo('Please select payment terms for Customer', "");

        if (this.processFile != null && !hasNoAttachment)
          this.uploadFile(this.processFile, data.extraObject);

        this.processFile = null;
        this.notificationService.filter("itemadded");
        data.object.forEach(element => {
          element.createdOn = this.datepipe.transform(element.createdOn, 'MM/dd/yyyy')
        });
        this.rowData = data.object
      })
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
          element.createdOn = this.datepipe.transform(element.createdOn, 'MM/dd/yyyy')
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
        this.api.setRowData(this.sparePartsList);
      }
      else {
        this.SparePartsService
          .delete(cellValue)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (data.result) {
                this.notificationService.showSuccess(
                  data.resultMessage,
                  "Success"
                );
                const selectedData = event.api.getSelectedRows();
                event.api.applyTransaction({ remove: selectedData });
              } else {

              }
            },
            error: (error) => {
              // this.alertService.error(error);

            },
          });
      }
    }

  }

  SparePartsSearch = (searchtext) => {
    this.sparePartPartNo = searchtext;

    this.Service
      .searchByKeyword(this.sparePartPartNo)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.sparePartsAutoComplete = data.object;
        },
        error: (error) => {

          this.loading = false;
        },
      });
  }

  AddSpareParts(instrument: any) {

    this.Service
      .searchByKeyword(instrument)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.sparePartsList = this.sparePartsList || [];
          var data = data.object[0];

          data.id = Guid.create();
          data.id = data.id.value;

          data.amount = Number(data.price) * Number(data.qty)

          if (this.sparePartsList.filter(x => x.partno == data.partno).length == 0) {
            this.sparePartsList.push(data);
            this.api.setRowData(this.sparePartsList)
          } else {
            this.notificationService.showError("Spare Part already exists", "Error");
          }
          this.sparePartsSearch.nativeElement.value = ""

        },
        error: (error) => {

          this.loading = false;
        },
      });

  }

  private createColumnDefs() {
    return [{
      headerName: 'Action',
      field: 'id',
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
    }, {
      headerName: 'HSC Code',
      field: 'hscode',
      filter: true,
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
      hide: this.role == environment.custRoleCode || !this.hasCommercial,
    },
    {
      headerName: 'Amount',
      field: 'amount',
      filter: true,
      sortable: true,
      hide: this.role == environment.custRoleCode || !this.hasCommercial,
    },
    {
      headerName: 'Currency',
      field: 'currency',
      hide: this.role == environment.custRoleCode || !this.hasCommercial,
      // hide: true,
      filter: true,
      sortable: true
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
    var data = event.data;
    event.data.modified = true;

    if (this.sparePartsList.filter(x => x.id == data.id).length > 0) {
      var d = this.sparePartsList.filter(x => x.id == data.id);
      var rowAmount = (Number(data.qty) * Number(data.price));
      d[0].amount = rowAmount;
      d[0].price = Number(data.price)
      d[0].qty = Number(data.qty)
      this.api.setRowData(this.sparePartsList)
    }
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
        cellRendererFramework: FilerendercomponentComponent,
        cellRendererParams: {
          deleteaccess: this.hasDeleteAccess,
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
      if (event.type === HttpEventType.UploadProgress) {
        this.progress = Math.round((100 * event.loaded) / event.total);
        if (this.progress == 100)
          this.notificationService.filter("itemadded");
      }
      else if (event.type === HttpEventType.Response) {
        this.message = "Upload success.";
        this.notificationService.filter("itemadded");
        this.onUploadFinished.emit(event.body);
      }
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
              //this.instrumentService.deleteConfig(data.configTypeid, data.configValueid)
              this.SpareQuoteDetService.delete(data.id)
                .pipe(first())
                .subscribe({
                  next: (d: any) => {
                    if (d.result) {
                      this.notificationService.filter("itemadded");
                    } else {
                    }
                  },
                  error: error => {

                    this.loading = false;
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

    // reset alerts on submit
    this.alertService.clear();
    // stop here if form is invalid
    if (this.form.invalid) return

    if (this.sparePartsList != [] && this.sparePartsList != null) {

      this.sparePartsList.forEach(instrument => {
        instrument.offerRequest = this.id;
        instrument.offerRequestId = this.id;
      })
    }

    this.model = this.form.value;
    this.model.customerId = this.form.get('customerId').value
    this.model.distributorid = this.form.get('distributorid').value
    const datepipie = new DatePipe("en-US");
    this.model.podate = datepipie.transform(
      this.model.podate,
      "MM/dd/yyyy"
    );


    if (this.form.get('paymentTerms').value.length > 0) {
      var selectarray = this.form.get('paymentTerms').value;
      this.model.paymentTerms = selectarray.toString();
    }

    else if (this.form.get('paymentTerms').value.length == 0) {
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
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (this.file != null) {
              this.uploadFile(this.file, data.object.id);
            }
            this.notificationService.showSuccess(
              data.resultMessage,
              "Success"
            );

            this.router.navigate(["offerrequestlist"]);

          },
          error: (error) => {

            this.loading = false;
          },
        });
      if (!(this.sparePartsList == null)) {

        this.SparePartsService.SaveSpareParts(this.sparePartsList)
          .pipe(first())
          .subscribe({
            error: (error) => {

              this.loading = false;
            },
          });

      }
    } else if (this.hasUpdateAccess) {
      // this.model = this.form.value;
      this.model.id = this.id;
      this.Service.update(this.id, this.model)
        .pipe(first())
        .subscribe({
          next: (data: ResultMsg) => {

            if (this.file != null) {
              this.uploadFile(this.file, this.id);
            }
            this.notificationService.showSuccess(
              data.resultMessage,
              "Success"
            );
            this.router.navigate(["offerrequestlist"]);

          },
          error: (error) => {

            this.loading = false;
          },
        });

      if (!(this.sparePartsList == null)) {
        this.SparePartsService.SaveSpareParts(this.sparePartsList)
          .pipe(first())
          .subscribe({
            error: (error) => {

              this.loading = false;
            },
          });
      }
    }
  }
}
