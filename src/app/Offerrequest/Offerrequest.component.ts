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
  isDist: boolean = false;
  // stages = ["offer", "upload_po", "pfi", "payment_revision", "payment_done", "payment_received", "under_process", "shipped"]
  stages = ["offer", "upload_po", "pfi", "pay_terms", "mode_of_payment", "payment_done", "incase_of_lc", "inspection", "shipment", "shipping_documents_for_lc"]
  roleBasedStatusList = [
    { stage: "offer", user: environment.distRoleCode },
    { stage: "upload_po", user: environment.custRoleCode },
    { stage: "pfi", user: environment.distRoleCode },
    { stage: "pay_terms", user: environment.custRoleCode },
    { stage: "mode_of_payment", user: environment.custRoleCode },
    { stage: "payment_done", user: environment.distRoleCode },
    { stage: "incase_of_lc", user: environment.distRoleCode },
    { stage: "inspection", user: environment.distRoleCode },
    { stage: "shipment", user: environment.distRoleCode },
    { stage: "shipping_documents_for_lc", user: environment.distRoleCode },
  ]
  activeStage: any;
  addPayRev = false
  list = []
  hasOfferRaised: boolean = false;
  paymentTypes: any;
  dropdownSettings: IDropdownSettings = {};
  tempActiveStage: string
  payTypes: any;

  customerList: any[];
  instruments
  vScroll: boolean = true;

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
        this.stages.forEach(x => {
          var selectedfiles = document.getElementById(x + "_selectedfiles");

        })

        this.getAllOfferRequestProcess(true);
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


    this.dropdownSettings = {
      idField: 'listTypeItemId',
      textField: 'itemname',
    };

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
      instrumentsList: ['', Validators.required]
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


    if (this.role == environment.distRoleCode) {
      this.DistributorService.getByConId(this.user.contactId).pipe(first())
        .subscribe((data: any) => {
          this.form.get('distributorid').setValue(data.object[0]?.id)
          this.form.get('distributorid').disable()
          this.form.get('distributorid').clearValidators()
          this.form.get('distributorid').updateValueAndValidity()
        })
    }

    if (this.role == environment.distRoleCode) this.isDist = true;

    if (this.id != null) {
      localStorage.setItem('offerrequestid', this.id)
      this.Service.getById(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.listTypeService.getById("ORQPT")
              .pipe(first())
              .subscribe((mstData: any) => {

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

                this.form.patchValue(data.object);
                this.getAllOfferRequestProcess();
              })
          },
          error: (error) => {
            this.notificationService.showError('Error', 'Error');
            this.loading = false;
          },
        });

      // if (this.role == environment.distRoleCode || this.user.username == 'admin') {
      //   this.hasQuoteDet = true;
      //   let tokn = localStorage.getItem('zohotoken');
      //   if (tokn != null && tokn != '') {
      //     this.form.get('authtoken').setValue(tokn);
      //   }
      // }

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
      this.listTypeService.getById("ORQPT")
        .pipe(first())
        .subscribe((mstData: any) => {
          this.payTypes = mstData;
        })
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

  refreshStages() {
    this.notificationService.filter("itemadded");
  }

  disableRows(stage, disable = true) {
    let disabledStagesList = <any>document.getElementsByClassName(stage)
    for (let index = 0; index < disabledStagesList.length; index++) {
      const item = disabledStagesList[index];
      item.disabled = disable;

    }
  }
  getAllOfferRequestProcess(reRendered = false) {
    this.offerRequestProcess.getAll(this.id)
      .pipe(first())
      .subscribe((data: any) => {
        let isPayRevStageDone = false;
        this.activeStage = data.object.find(x => x.isactive == true)?.stage;

        data.object.forEach(element => {
          switch (element.stage) {
            case 'offer':
              if (isPayRevStageDone) {
                break;
              }

              let lstRevision = data.object.filter(x => x.stage == 'offer');
              for (let index = 0; index < lstRevision.length; index++) {
                if (!reRendered) {
                  this.onOfferAdd();
                }
              }

              if (data.object.find(x => x.stage == 'offer' && x.isactive == true) != null || data.object.find(x => x.stage == 'upload_po')?.isactive) {
                let lntOffer = data.object.filter(x => x.stage == "offer" && x.isCompleted == true).length
                this.addPayRev = true;
                if (this.role == environment.custRoleCode && lntOffer < 1) {
                  this.addPayRev = false;
                }
              }

              setTimeout(() => {
                for (let index = 0; index < lstRevision.length; index++) {
                  var ele = <HTMLInputElement>document.getElementById(element.stage + '_Comment' + index.toString());
                  ele.value = lstRevision[index].comments;
                  this.disableRows(element.stage + index.toString());
                }
              }, 10);

              isPayRevStageDone = true;
              break;

            default:
              if (element.isactive != true) {
                this.disableRows(element.stage);
              }

              if (element.stage == "pay_terms") {
                this.form.get('payterms').setValue(element.paymentTypeId)
              }

              var ele = <HTMLInputElement>document.getElementById(element.stage + '_Comment');
              ele.value = element.comments;
              break;
          }

          if (data.object.filter(x => x.stage == "offer" && x.isCompleted == true).length > 0) {
            this.hasOfferRaised == true;
          }

          this.enableLastRows()

          this.FileShareService.list(element.id)
            .pipe(first())
            .subscribe({
              next: (files: any) => {
                switch (element.stage) {
                  case 'offer':

                    var selectedfiles = document.getElementById(element.stage + '_selectedfiles' + element.index.toString());
                    selectedfiles.innerHTML = '';
                    break;

                  default:
                    document.getElementById(element.stage + '_selectedfiles').style.display = 'block';
                    var selectedfiles = document.getElementById(element.stage + '_selectedfiles');
                    selectedfiles.innerHTML = '';
                    break;
                }
                var ulist = document.createElement('ul');
                ulist.id = element.stage + '_demo';
                ulist.style.width = 'max-content';
                ulist.style.padding = '0';
                ulist.style.listStyle = 'none';

                if (files.object == null && element.isCompleted) {
                  if (element.stage == "offer") {
                    let checkBox = <HTMLInputElement>document.getElementById(element.stage + element.index + `_Attachment`)
                    checkBox.checked = true;

                  } else {
                    let checkBox = <HTMLInputElement>document.getElementById(element.stage + `_Attachment`)
                    checkBox.checked = true;
                  }
                }

                files.object?.forEach(element => {

                  this.FileShareService.download(element.id).subscribe((event) => {
                    if (event.type === HttpEventType.Response) {

                      const downloadedFile = new Blob([event.body], { type: event.body.type });
                      const a = document.createElement('a');
                      a.setAttribute('style', 'display:block;');
                      a.download = element.id;
                      a.href = URL.createObjectURL(downloadedFile);
                      a.innerHTML = '- ' + element.displayName;
                      a.target = '_blank';

                      var node = document.createElement('li');
                      node.appendChild(a);
                      ulist.appendChild(node);

                    }
                  });

                });

                selectedfiles.appendChild(ulist);

              },
              error: (err: any) => {
                this.notificationService.showError(err, 'Error');
              },
            });

        });
        setTimeout(() => {
          this.ProcessAccordingToRoles();
        }, 50);
      })
  }


  enableLastRows() {
    setTimeout(() => {
      if (this.tempActiveStage == undefined || this.tempActiveStage == null) {
        this.tempActiveStage = this.activeStage
      }

      let currentStage = this.roleBasedStatusList.find(x => x.stage == this.tempActiveStage)
      let currentStageIndex = this.roleBasedStatusList.indexOf(currentStage);

      if (currentStageIndex >= 5 && this.isDist) {
        currentStageIndex
        currentStageIndex++
        this.tempActiveStage = this.roleBasedStatusList[currentStageIndex]?.stage
        this.disableRows(this.tempActiveStage, false)
      }

    }, 500);
  }


  onOfferAdd() {
    this.list.push(1)
  }


  ProcessAccordingToRoles() {
    let activeStageUserc = this.roleBasedStatusList.find(x => x.stage == this.activeStage);
    let activeStageUser = activeStageUserc?.user;

    if (activeStageUser != null) {
      if (activeStageUser != this.role) {
        let disabledStagesList = <any>document.getElementsByClassName(this.activeStage);
        for (let index = 0; index < disabledStagesList.length; index++) {
          const item = disabledStagesList[index];
          item.disabled = true;
        }
      } else {
        let disabledStagesList = <any>document.getElementsByClassName(this.activeStage);
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
    }

    if (this.activeStage == "offer" && this.role == environment.custRoleCode && this.hasOfferRaised) {
      let currentIndex = this.stages.indexOf(this.stages.find(x => x == this.activeStage))
      if (currentIndex >= 0) {
        currentIndex++;
        let stage = this.stages[currentIndex]
        this.disableRows(stage, false)
      }
    }

    this.enableLastRows()

  }

  DisableChoseFile(className) {
    let ofer = <HTMLInputElement>document.querySelector(`input[type="file"].` + className)
    ofer.disabled = !ofer.disabled
  }


  onProcessSubmit(comments, stage, index = 0) {
    let hasNoAttachment = false;
    let payment_type = null;

    let Attachment = <HTMLInputElement>document.getElementById(stage + "_Attachment")
    hasNoAttachment = Attachment?.checked

    switch (stage) {
      case 'offer':
        let element: any = document.getElementById('offer_Comment' + index)
        comments = element.value
        let Attachment = <HTMLInputElement>document.getElementById(stage + index + "_Attachment")
        hasNoAttachment = Attachment.checked
        break;

      case "pay_terms":
        let ele: any = document.getElementById('payment_type')
        payment_type = ele.value
        break;
    }

    if (!hasNoAttachment && this.processFile == null) {
      this.notificationService.showInfo("No Attachments Selected.", "Error")
      return;
    }

    let offerProcess = {
      isactive: false,
      comments,
      parentId: this.id,
      stage,
      index,
      paymentTypeId: payment_type,
    }

    this.offerRequestProcess.update(offerProcess).pipe(first())
      .subscribe((data: any) => {
        if (offerProcess.stage == "pfi")
          this.notificationService.showInfo('Please select payment terms for Customer', "");
        let currentIndex = this.stages.indexOf(this.stages.find(x => x == stage))
        if (currentIndex >= 0) {
          let stage = this.stages[currentIndex]

          if (stage == "offer") {
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
          offerProcess.paymentTypeId = null;
          this.ProcessAccordingToRoles()
          this.offerRequestProcess.update(offerProcess).pipe(first())
            .subscribe((data1: any) => {
              this.enableLastRows()
              if (this.processFile != null && !hasNoAttachment) {
                this.uploadFile(this.processFile, data.extraObject);
              }
              this.processFile = null;
              this.notificationService.filter("itemadded");
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

    for (let i = 0; i < x.length; i++) {
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
