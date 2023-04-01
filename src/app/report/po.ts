import { Component, OnInit } from '@angular/core';

import {
  User, Country, Distributor, Customer, ResultMsg, ProfileReadOnly, ServiceReport,
  FileShare, workTime, sparePartRecomanded, actionList, sparePartsConsume, po, instrumentList
} from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, GridApi, ColumnApi } from 'ag-grid-community';

import {
  AccountService, AlertService, CountryService, DistributorService, CustomerService,
  NotificationService, ProfileService, ServiceReportService, FileshareService,
  UploadService, POService
} from '../_services';


@Component({
  selector: 'app-customer',
  templateUrl: './po.html',
})
export class poComponent implements OnInit {
  user: User;
  Poform: FormGroup;
  loading = false;
  submitted = false;
  isSave = false;
  type: string = "A";
  poid: string;
  countries: Country[];
  defaultdistributors: Distributor[];
  po: po;
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  //public defaultdistributors: any[] = [{ key: "1", value: "Ashish" }, { key: "2", value: "CEO" }];
  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;

  instrumentList: instrumentList[] = [];
  formData: any;


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
    private poservice: POService
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

    if (this.user.isAdmin) {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
      this.hasUpdateAccess = true;
      this.hasReadAccess = true;
    }

    this.Poform = this.formBuilder.group({
      customername: ['', Validators.required],
      purchaseorder: ['', Validators.required],
      country: ['', Validators.required],
      purchasedate: ['', Validators.required],
      customerreq: ['', Validators.required],
      purchaseordate: ['', Validators.required],
      quotationRef: ['', Validators.required],
      avantgradeinvc: ['', Validators.required],
      submittedbycountry: ['', Validators.required],
      proformainvcdate: ['', Validators.required],
      projectrefno: ['', Validators.required],
      amountrecv: ['', Validators.required],
      machinemodel: ['', Validators.required],
      amountpending: ['', Validators.required],
      serialno: ['', Validators.required],
      thermopo: ['', Validators.required],
      priorderconfirm: ['', Validators.required],
      thermopodate: ['', Validators.required],
      princconfamount: ['', Validators.required],
      princshipdate: ['', Validators.required],
      princinv: ['', Validators.required],
      remarks: ['', Validators.required],
      issuedByCountry: [''],
      customerpaymentterm: [''],
      expectedShipmentdate: ['']
    });

    this.countryService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.countries = data.object;
        },
        error: error => {
          //  this.alertService.error(error);

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

          this.loading = false;
        }
      });

    this.poid = this.route.snapshot.paramMap.get('id');
    if (this.poid != null) {
      this.hasAddAccess = false;
      if (this.user.isAdmin) {
        this.hasAddAccess = true;
      }
      this.customerService.getById(this.poid)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.formData = data.object;
            this.Poform.patchValue(this.formData);
          },
          error: error => {
            this.loading = false;
          }
        });
    }

    this.columnDefs = this.createColumnDefs();


  }

  // convenience getter for easy access to form fields
  get f() { return this.Poform.controls; }
  get a() { return this.Poform.controls.instrumentList; }

  onSubmit() {
    // //debugger;
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.Poform.invalid) {
      return;
    }
    this.isSave = true;
    this.loading = true;
    if (this.poid == null) {
      this.poservice.save(this.Poform.value)
        .pipe(first())
        .subscribe({
          next: (data: ResultMsg) => {
            //debugger;
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.router.navigate(["polist"]);
            }
            else {

            }
            this.loading = false;

          },
          error: error => {
            this.loading = false;
          }
        });
    }
    else {
      this.po = this.Poform.value;
      this.po.id = this.poid;
      this.poservice.update(this.poid, this.po)
        .pipe(first())
        .subscribe({
          next: (data: ResultMsg) => {
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.router.navigate(["polist"]);
            }
            else {

            }
            this.loading = false;

          },
          error: error => {
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
    //                  (d.resultMessage, "Error");
    //                }
    //              },
    //              error: error => {
    //                
    //                this.loading = false;
    //              }
    //            });
    //        }
    //    }
    //  }
  }

  onCellValueChanged(event) {
    //debugger;
    var data = event.data;
    event.data.modified = true;
    //if (this.selectedConfigType.filter(x => x.id == data.configValueid && x.listTypeItemId == data.configTypeid
    //  && x.sparePartId == data.id).length > 0) {
    //  var d = this.selectedConfigType.filter(x => x.id == data.configValueid && x.listTypeItemId == data.configTypeid
    //    && x.sparePartId == data.id);
    //  d[0].insqty = event.newValue;
    //}
  }


  private createColumnDefs() {
    return [
      {
        headerName: 'Instrument',
        field: 'instrument',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        template:
          `<button class="btn btn-link" type="button" (click)="delete(params)"><i class="fas fa-trash-alt" data-action-type="remove" title="Delete"></i></button>`
      },
      {
        headerName: 'part',
        field: 'part',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        tooltipField: 'part',
      },
      {
        headerName: 'Part Desc',
        field: 'partdesc',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false
      },
      {
        headerName: 'Qty',
        field: 'qty',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false
      },
      {
        headerName: 'Rate',
        field: 'rate',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false
      },
      {
        headerName: 'Amount',
        field: 'amount',
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

  //onConfigChange(param: string) {
  //  this.configService.getById(param)
  //    .pipe(first())
  //    .subscribe({
  //      next: (data: any) => {
  //        this.figValueList = data.object;
  //      },
  //      error: error => {
  //        
  //        this.loading = false;
  //      }
  //    });
  //}
}
