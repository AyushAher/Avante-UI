import { DatePipe } from '@angular/common';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';
import { Guid } from 'guid-typescript';
import { first } from 'rxjs/operators';
import { AmcInstrumentRendererComponent } from '../amc/amc-instrument-renderer.component';
import { Currency, Distributor, ResultMsg, User } from '../_models';
import { Offerrequest } from '../_models/Offerrequest.model';
import {
  AccountService,
  AlertService,
  CurrencyService,
  DistributorService,
  FileshareService,
  ListTypeService,
  NotificationService,
  ProfileService,
  zohoapiService
} from '../_services';
import { OfferrequestService } from '../_services/Offerrequest.service';
import { SparePartsOfferRequestService } from '../_services/sparepartsofferrequest.service';
import { FilerendercomponentComponent } from './filerendercomponent.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SparequotedetComponent } from './sparequotedet.component';
import { SparequotedetService } from '../_services/sparequotedet.service';
import { environment } from '../../environments/environment';
import { OfferRequestProcessesService } from '../_services/offer-request-processes.service';

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

  stages = ["offer", "upload_po", "pfi", "payment_revision", "payment_done", "payment_received", "under_process", "shipped"]
  roleBasedStatusList = [
    { stage: "offer", user: environment.distRoleCode },
    { stage: "upload_po", user: environment.custRoleCode },
    { stage: "pfi", user: environment.distRoleCode },
    { stage: "payment_revision" },
    { stage: "payment_done", user: environment.custRoleCode },
    { stage: "payment_received", user: environment.distRoleCode },
    { stage: "under_process", user: environment.distRoleCode },
    { stage: "shipped", user: environment.distRoleCode },
  ]
  activeStage: any;
  addPayRev = false
  list = []

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
    private zohoService: zohoapiService,
    private offerRequestProcess: OfferRequestProcessesService
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
        this.stages.forEach(x => {
          var selectedfiles = document.getElementById(x + "_selectedfiles");

        })

        this.getAllOfferRequestProcess()
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
      isdeleted: [false],
      spareQuoteNo: [{ value: '', disabled: true }]
    })

    this.id = this.route.snapshot.paramMap.get('id');
    this.route.queryParams.subscribe(params => {
      this.zohocode = params['code'];
    });

    if (this.zohocode != null) {
      this.getZohoData()
    }

    this.columnDefs = this.createColumnDefs();
    this.columnDefsAttachments = this.createColumnDefsAttachments();
    this.ColumnDefsSPDet = this.createColumnDefsSPDet()
    this.form.get('podate').setValue(this.datepipie.transform(new Date, "MM/dd/yyyy"))

    if (this.id != null) {
      localStorage.setItem('offerrequestid', this.id)
      this.Service.getById(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.form.patchValue(data.object);
            this.getAllOfferRequestProcess();
          },
          error: (error) => {
            this.notificationService.showError('Error', 'Error');
            this.loading = false;
          },
        });

      if (this.role == environment.distRoleCode || this.user.username == 'admin') {
        this.hasQuoteDet = true;
        let tokn = localStorage.getItem('zohotoken');
        if (tokn != null && tokn != '') {
          this.form.get('authtoken').setValue(tokn);
        }
      }

      this.Service.GetSpareQuoteDetailsByParentId(this.id)
        .pipe(first())
        .subscribe((data: any) => {
          this.SpareQuotationDetails = data.object;
        });


      this.SparePartsService.getSparePartsByOfferRequestId(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.sparePartsList = data.object;
            this.api.setRowData(this.sparePartsList);
          },
          error: (error) => {
            this.notificationService.showError("Error", "Error");
            this.loading = false;
          },
        });

      this.hasId = true;
    }

    else {
      this.hasId = false;
      this.id = Guid.create();
      this.id = this.id.value;
    }

    this.currencyService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.currencyList = data.object
        },
        error: (error) => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      })

    this.DistributorService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.distributorList = data.object

        },
        error: (error) => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      })
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
  }

  disableRows(stage, disable = true) {
    let disabledStagesList = <any>document.getElementsByClassName(stage)
    for (let index = 0; index < disabledStagesList.length; index++) {
      const item = disabledStagesList[index];
      item.disabled = disable;

    }
  }

  getAllOfferRequestProcess() {
    this.offerRequestProcess.getAll(this.id)
      .pipe(first())
      .subscribe((data: any) => {
        let lstRevision = data.object.filter(x => x.stage == "payment_revision").length
        for (let index = 0; index < lstRevision; index++) {
          this.onAddPaymentRevision();
        }
        if (data.object.find(x => x.stage == "payment_revision" && x.isactive == true) != null || data.object.find(x => x.stage == "payment_done")?.isactive) {
          this.addPayRev = true;
        }
        setTimeout(() => {
          data.object.filter(x => x.isactive != true).forEach(element => {
            if (element.stage == "payment_revision") {
              this.disableRows(element.stage + element.index.toString())
            } else {
              this.disableRows(element.stage)
            }
          });
        }, 10)

        setTimeout(() => {
          this.activeStage = data.object.find(x => x.isactive == true)?.stage
          data.object.forEach(element => {
            switch (element.stage) {
              case 'payment_revision':
                var ele = <HTMLInputElement>document.getElementById(element.stage + "_Comment" + element.index.toString())
                ele.value = element.comments
                break;

              default:
                var ele = <HTMLInputElement>document.getElementById(element.stage + "_Comment")
                ele.value = element.comments
                break;
            }

            this.FileShareService.list(element.id)
              .pipe(first())
              .subscribe({
                next: (files: any) => {
                  switch (element.stage) {
                    case 'payment_revision':
                      var selectedfiles = document.getElementById(element.stage + "_selectedfiles" + element.index);
                      selectedfiles.innerHTML = ""
                      break;

                    default:
                      document.getElementById(element.stage + "_selectedfiles").style.display = "block";
                      var selectedfiles = document.getElementById(element.stage + "_selectedfiles");
                      selectedfiles.innerHTML = ""
                      break;
                  }
                  var ulist = document.createElement("ul");
                  ulist.id = element.stage + "_demo";
                  ulist.style.width = "max-content"
                  ulist.style.padding = "0"
                  ulist.style.listStyle = "none"

                  files.object?.forEach(element => {

                    this.FileShareService.download(element.id).subscribe((event) => {
                      if (event.type === HttpEventType.Response) {

                        const downloadedFile = new Blob([event.body], { type: event.body.type });
                        const a = document.createElement("a");
                        a.setAttribute("style", "display:block;");
                        a.download = element.id;
                        a.href = URL.createObjectURL(downloadedFile);
                        a.innerHTML = "- " + element.displayName;
                        a.target = "_blank";

                        var node = document.createElement("li");
                        node.appendChild(a);
                        ulist.appendChild(node);

                      }
                    })

                  });

                  selectedfiles.appendChild(ulist);

                },
                error: (err: any) => {
                  this.notificationService.showError(err, "Error");
                },
              });

          });
          this.ProcessAccordingToRoles()
        }, 1000);

      })
  }


  onAddPaymentRevision() {
    this.list.push(1)
  }


  ProcessAccordingToRoles() {
    debugger;
    let activeStageUser = this.roleBasedStatusList.find(x => x.stage == this.activeStage)?.user
    if (activeStageUser != null) {
      if (activeStageUser != this.role) {
        let disabledStagesList = <any>document.getElementsByClassName(this.activeStage)
        for (let index = 0; index < disabledStagesList.length; index++) {
          const item = disabledStagesList[index];
          item.disabled = true;
        }
      }
      else {
        let disabledStagesList = <any>document.getElementsByClassName(this.activeStage)
        for (let index = 0; index < disabledStagesList.length; index++) {
          const item = disabledStagesList[index];
          item.disabled = false;
        }
      }
    } else {
      let disabledStagesList = <any>document.getElementsByClassName(this.activeStage)
      for (let index = 0; index < disabledStagesList.length; index++) {
        const item = disabledStagesList[index];
        item.disabled = false;
      }

      // this.addPayRev = true;


      if (this.role == environment.custRoleCode) {
        let currentIndex = this.stages.indexOf(this.stages.find(x => x == this.activeStage))
        if (currentIndex >= 0) {
          currentIndex++;
          let stage = this.stages[currentIndex]
          this.disableRows(stage, false)
        }
      }
    }
  }


  getZohoData() {
    let quoteno = this.form.get('spareQuoteNo').value;
    if (quoteno != null && quoteno != "") {
      localStorage.setItem('spquoteno', quoteno)
    } else {
      this.notificationService.showError("Spare Quote No. is required", "Error")
      return;
    }

    if (this.role == environment.distRoleCode || this.user.username == 'admin') {
      this.hasQuoteDet = true;
      if (this.accountService.zohoauthValue == null) {
        if (this.zohocode == null) {
          window.location.href = environment.commonzohocodeapi + 'offerrequestlist' + '&access_type=offline';
        } else {
          this.zohoService.authwithcode(this.zohocode, 'offerrequestlist').subscribe({
            next: (data: any) => {

              let code = localStorage.setItem('zCode', this.zohocode);
              localStorage.setItem('zohotoken', JSON.stringify(data.object));
              this.accountService.zohoauthSet(data.object);
              quoteno = localStorage.getItem('spquoteno')

              this.zohoService.GetSalesOrder(code, 1, quoteno, this.id)
                .pipe(first())
                .subscribe((data: any) => {
                  this.SpareQuotationDetails = data.object;
                });
            },
            error: error => {
              this.notificationService.showError(error, 'Error');
              this.loading = false;
            }
          });
        }
      } else {
        let quoteno = localStorage.getItem('spquoteno')
        this.zohoService.GetSalesOrder(this.zohocode, 1, quoteno, this.id)
          .pipe(first())
          .subscribe((data: any) => {
            this.SpareQuotationDetails = data.object;
          });
      }
    }
  }

  onProcessSubmit(comments, stage, index = 0) {
    debugger;
    switch (stage) {
      case 'payment_revision':
        let element: any = document.getElementById('payment_revision_Comment' + index)
        comments = element.value
        break;
    }

    let offerProcess = {
      isactive: false,
      comments,
      parentId: this.id,
      stage,
      index
    }

    if (stage == "payment_done") {
      this.addPayRev = false
    }

    this.offerRequestProcess.update(offerProcess).pipe(first())
      .subscribe((data: any) => {
        let currentIndex = this.stages.indexOf(this.stages.find(x => x == stage))
        if (currentIndex >= 0) {
          let stage = this.stages[currentIndex]

          if (stage == "payment_revision") {
            this.disableRows(stage + index.toString(), true)
          }
          else {
            this.disableRows(stage, true)
          }
          currentIndex++;
          stage = this.stages[currentIndex]
          this.activeStage = stage;
          this.disableRows(stage, false)
          offerProcess.isactive = true;
          offerProcess.comments = null;
          offerProcess.stage = stage;
          this.ProcessAccordingToRoles()
          this.offerRequestProcess.update(offerProcess).pipe(first())
            .subscribe((data1: any) => {
              if (this.processFile != null) {
                this.uploadFile(this.processFile, data.extraObject);
                this.notificationService.filter("itemadded");

              }
            })
        }
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
                this.notificationService.showError(data.resultMessage, "Error");
              }
            },
            error: (error) => {
              // this.alertService.error(error);
              this.notificationService.showError(error, "Error");
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
          this.notificationService.showError(error, "Error");
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
          this.notificationService.showError(error, "Error");
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
      hide: this.role == environment.custRoleCode,
    },
    {
      headerName: 'Amount',
      field: 'amount',
      filter: true,
      sortable: true,
      hide: this.role == environment.custRoleCode,
    },
    {
      headerName: 'Currency',
      field: 'currency',
      hide: this.role == environment.custRoleCode,
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

  get f() {
    return this.form.controls
  }

  getfil(x, isParentAttachment = false) {
    if (isParentAttachment) {
      this.file = x;
    } else {
      this.processFile = x;
    }

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

    for (let i = 0; i <= x.length; i++) {
      var name = x[i].name;
      var ul = document.getElementById("demo");
      var node = document.createElement("li");
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

  // offerrequestno_stage_filename

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
      if (event.type === HttpEventType.UploadProgress)
        this.progress = Math.round((100 * event.loaded) / event.total);
      else if (event.type === HttpEventType.Response) {
        this.message = "Upload success.";
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
        error: (err: any) => {
          this.notificationService.showError(err, "Error");
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
                      this.notificationService.showError(d.resultMessage, "Error");
                    }
                  },
                  error: error => {
                    this.notificationService.showError(error, "Error");
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
    const datepipie = new DatePipe("en-US");
    this.model.podate = datepipie.transform(
      this.model.podate,
      "MM/dd/yyyy"
    );

    if (!this.hasId && this.hasAddAccess) {
      this.model = this.form.value;
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
            this.notificationService.showError(error, "Error");
            this.loading = false;
          },
        });
      if (!(this.sparePartsList == null)) {

        this.SparePartsService.SaveSpareParts(this.sparePartsList)
          .pipe(first())
          .subscribe({
            error: (error) => {
              this.notificationService.showError(error, "Error");
              this.loading = false;
            },
          });

      }
    } else if (this.hasUpdateAccess) {
      this.model = this.form.value;
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
            this.notificationService.showError(error, "Error");
            this.loading = false;
          },
        });

      if (!(this.sparePartsList == null)) {
        this.SparePartsService.SaveSpareParts(this.sparePartsList)
          .pipe(first())
          .subscribe({
            error: (error) => {
              this.notificationService.showError(error, "Error");
              this.loading = false;
            },
          });
      }
    }
  }
}
