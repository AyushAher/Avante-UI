import { Component, OnInit } from '@angular/core';

import {
  User, Country, Distributor, Customer, ResultMsg, ProfileReadOnly, ServiceReport,
  FileShare, workTime, sparePartRecomanded, ConfigTypeValue, ListTypeItem, actionList, SparePart, sparePartsConsume, requestPO, instrumentList
} from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, GridApi, ColumnApi } from 'ag-grid-community';

import {
  AccountService, AlertService, CountryService, DistributorService, CustomerService,
  NotificationService, ProfileService, SparePartService,
  ServiceReportService, FileshareService,
  UploadService, requestpoService, ListTypeService, ConfigTypeValueService
} from '../_services';


@Component({
  selector: 'app-customer',
  templateUrl: './serviceReport.html',
})
export class RequestPOComponent implements OnInit {
  user: User;
  requestpoform: FormGroup;
  loading = false;
  submitted = false;
  isSave = false;
  type: string = "A";
  requestid: string;
  countries: Country[];
  defaultdistributors: Distributor[];
  requestpo: requestPO;
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  //public defaultdistributors: any[] = [{ key: "1", value: "Ashish" }, { key: "2", value: "CEO" }];
  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;
  requespo: requestPO;
  PdffileData: FileShare[];
  pdfBase64: string;
  public pdfcolumnDefs: ColDef[];
  private pdfcolumnApi: ColumnApi;
  private pdfapi: GridApi;
  pdfPath: any;
  paymentdata: any;
  listTypeItems: ListTypeItem[];
  PARTTypes: ListTypeItem[];
  configValueList: ConfigTypeValue[];
  replacementParts: SparePart[];

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
   // private ServiceReportService: ServiceReportService,
    private fileshareService: FileshareService,
    private uploadService: UploadService,
    private requestposervice: requestpoService,
    private listTypeService: ListTypeService,
    private configService: ConfigTypeValueService,
    private spareservice:SparePartService
  ) { }
  
  ngOnInit() {

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

    this.requestpoform = this.formBuilder.group({
      configtype: ['', Validators.required],
      parttype: ['', Validators.required],
      configvalue: ['', Validators.required],
      partno: ['', Validators.required],
      qty: ['', Validators.required],
      price: ['', Validators.required],
      distributor: ['', Validators.required],
      status: ['', Validators.required],
      podate: ['', Validators.required],
      amount: [''],
      discount: [''],
      afterdiscount: [''],
      deliverydate:['']
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

    this.listTypeService.getById("PART")
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.PARTTypes = data;
        },
        error: error => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });

    this.spareservice.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.replacementParts = data.object;
        },
        error: error => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });

    this.requestid = this.route.snapshot.paramMap.get('id');
    if (this.requestid != null) {
      this.hasAddAccess = false;
      if (this.user.username == "admin") {
        this.hasAddAccess = true;
      }
      this.customerService.getById(this.requestid)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.requestpoform.patchValue(data.object);
          },
          error: error => {
           // this.alertService.error(error);
            this.notificationService.showSuccess(error, "Error");
            this.loading = false;
          }
        });
      this.fileshareService.getById(this.requestid)
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
    this.columnDefs = this.createColumnDefs();
    this.pdfcolumnDefs = this.pdfcreateColumnDefs();
     

  }

  // convenience getter for easy access to form fields
  get f() { return this.requestpoform.controls; }
  //get a() { return this.requestpoform.controls.instrumentList; }
   
  onSubmit() {
   // //debugger;
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.requestpoform.invalid) {
      return;
    }
    this.isSave = true;
    this.loading = true;
    if (this.requestid == null) {
      this.requestposervice.save(this.requestpoform.value)
        .pipe(first())
        .subscribe({
          next: (data: ResultMsg) => {
            //debugger;
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.router.navigate(["Amclist"]);
            }
            else {
              this.notificationService.showError(data.resultMessage, "Error");
            }
            this.loading = false;
           
          },
          error: error => {
           // this.alertService.error(error);
            this.notificationService.showSuccess(error, "Error");
            this.loading = false;
          }
        });
    }
    else {
      this.requespo = this.requestpoform.value;
      this.requespo.id = this.requestid;
      this.requestposervice.update(this.requestid, this.requespo)
        .pipe(first())
        .subscribe({
          next: (data: ResultMsg) => {
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.router.navigate(["requestpolist"]);
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



  public onRowClicked(e) {
  //  //debugger;
  //  if (e.event.target !== undefined) {
  //    let data = e.data;
  //    let actionType = e.event.target.getAttribute("data-action-type");
  //    this.id = this.route.snapshot.paramMap.get('id');
  //    switch (actionType) {
  //      case "remove":
  //        if (confirm("Are you sure, you want to remove the config type?") == true) {
  //          this.config = new instrumentConfig();

  //          this.config.configtypeid = data.configTypeid;
  //          this.config.configvalueid = data.configValueid;
  //          this.config.instrumentid = this.id;
  //          this.config.sparepartid = data.id;

  //          //this.instrumentService.deleteConfig(data.configTypeid, data.configValueid)
  //          this.instrumentService.deleteConfig(this.config)
  //            .pipe(first())
  //            .subscribe({
  //              next: (d: any) => {
  //                if (d.result) {
  //                  this.notificationService.showSuccess(d.resultMessage, "Success");
  //                  this.selectedConfigType = this.selectedConfigType.filter(x => !(x.id == data.configValueid && x.listTypeItemId == data.configTypeid && x.sparePartId == data.id));
  //                  const selectedData = this.api.getSelectedRows();
  //                  this.sparePartDetails = this.sparePartDetails.filter(x => !(x.configValueid == data.configValueid && x.configTypeid == data.configTypeid && x.id == data.id));
  //                  //this.api.applyTransaction({ remove: selectedData });
  //                  this.recomandFilter(this.sparePartDetails);
  //                }
  //                else {
  //                  this.notificationService.showError(d.resultMessage, "Error");
  //                }
  //              },
  //              error: error => {
  //                this.notificationService.showError(error, "Error");
  //                this.loading = false;
  //              }
  //            });
  //        }
  //    }
  //  }
  }

  onCellValueChanged(event) {
    //debugger;
    //console.log(event) to test it
    var data = event.data;
    event.data.modified = true;
    //if (this.selectedConfigType.filter(x => x.id == data.configValueid && x.listTypeItemId == data.configTypeid
    //  && x.sparePartId == data.id).length > 0) {
    //  var d = this.selectedConfigType.filter(x => x.id == data.configValueid && x.listTypeItemId == data.configTypeid
    //    && x.sparePartId == data.id);
    //  d[0].insqty = event.newValue;
    //}
  }

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
            // console.log(data);

          },
          error: error => {
            this.notificationService.showError(error, "Error");
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
            this.notificationService.showError(error, "Error");
          }
        });
    }
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }


  private pdfcreateColumnDefs() {
    return [
      {
        headerName: 'Action',
        field: 'id',
        filter: false,
        enableSorting: false,
        editable: false,
        width: 100,
        sortable: false,
        template:
          `<button class="btn btn-link" type="button" (click)="delete(params)"><i class="fas fa-trash-alt" data-action-type="remove" title="Delete"></i></button>
          <button class="btn btn-link" type="button"><i class="fas fa-download" data-action-type="download" title="Download"></i></button>`
      },
      {
        headerName: 'FileName',
        field: 'fileName',
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
    this.pdfapi.sizeColumnsToFit();
  }



  public onPdfRowClicked(e) {
    //debugger;
    if (e.event.target !== undefined) {
      let data = e.data;
      let actionType = e.event.target.getAttribute("data-action-type");
      this.requestid = this.route.snapshot.paramMap.get('id');
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
                    this.fileshareService.getById(this.requestid)
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

  private createColumnDefs() {
    return [
      {
        headerName: 'RecievedDate',
        field: 'RecievedDate',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        width: 100,
        tooltipField: 'RecievedDate',
      },
      {
        headerName: 'Amount',
        field: 'amount',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        width: 0,
        hide: true,
      }
    ]
  }




  //onConfigChange(param: string) {
  //  this.configService.getById(param)
  //    .pipe(first())
  //    .subscribe({
  //      next: (data: any) => {
  //        this.figValueList = data.object;
  //      },
  //      error: error => {
  //        this.notificationService.showError(error, "Error");
  //        this.loading = false;
  //      }
  //    });
  //}
}
