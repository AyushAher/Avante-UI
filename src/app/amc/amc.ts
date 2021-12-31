import {DatePipe} from "@angular/common";
import {Component, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {ColDef, ColumnApi, GridApi} from "ag-grid-community";
import {Guid} from "guid-typescript";
import {first} from "rxjs/operators";
import {Amc, Currency, Customer, ListTypeItem, ResultMsg, User} from "../_models";
import {AmcInstrument} from "../_models/Amcinstrument";
import {
  AccountService,
  AlertService,
  AmcService,
  CurrencyService,
  CustomerService,
  ListTypeService,
  NotificationService,
  ProfileService
} from "../_services";
import {AmcinstrumentService} from "../_services/amcinstrument.service";
import {AmcInstrumentRendererComponent} from "./amc-instrument-renderer.component";

@Component({
  selector: "app-Amc",
  templateUrl: "./Amc.html",
})
export class AmcComponent implements OnInit {
  form: FormGroup;
  model: Amc;
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

  customersList: Customer[];
  currencyList: Currency[];
  serviceType: ListTypeItem[];
  instrumentserialno: any;
  instrumentAutoComplete: any[];
  instrumentList: AmcInstrument[] = []
  supplierList: ListTypeItem[];
  custSiteList: any;

  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;
  hasId: boolean;

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
  ) {

    this.notificationService.listen().subscribe((m: any) => {
      if (this.id != null) {
        this.AmcInstrumentService.getAmcInstrumentsByAmcId(this.id)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              this.instrumentList = data.object;
            },
            error: (error) => {
              this.notificationService.showError("Error", "Error");
              this.loading = false;
            },
          });
      }
    });
  }

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "AMC");
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

    this.form = this.formBuilder.group({
      isactive: [true],
      isdeleted: [false],
      billtoid: ["", Validators.required],
      servicequote: ["", Validators.required],
      sqdate: ["", Validators.required],
      sdate: ["", Validators.required],
      edate: ["", Validators.required],
      project: ["", Validators.required],
      servicetype: ["", Validators.required],
      brand: ["", Validators.required],
      currency: ["", Validators.required],
      zerorate: [0, Validators.required],
      tnc: ["", Validators.required],
      custSite: ["", Validators.required],
    })

    this.id = this.route.snapshot.paramMap.get("id");
    this.columnDefs = this.createColumnDefs();

    if (this.id != null) {
      this.Service.getById(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.GetSites(data.object.billtoid);
            this.form.patchValue(data.object);
          },
          error: (error) => {
            this.notificationService.showError("Error", "Error");
            this.loading = false;
          },
        });

      this.AmcInstrumentService.getAmcInstrumentsByAmcId(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.instrumentList = data.object;
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

    this.customerService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.customersList = data.object
        },
        error: (error) => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      })

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


    this.listTypeService
      .getById("SERTY")
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.serviceType = data;
        },
        error: (error) => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        },
      });

    this.listTypeService
      .getById("SUPPL")
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.supplierList = data;
        },
        error: (error) => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        },
      });

  }

  get f() {
    return this.form.controls;
  }

  GetSites(customerId) {
    this.customerService.getById(customerId)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          //debugger;
          this.custSiteList = data.object.sites;
        },
        error: error => {
          // this.alertService.error(error);
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });

  }

  RemoveInnstrument(event) {
    var cellValue = event.value;
    var rowData = event.data;
    if (this.hasDeleteAccess) {

      if (cellValue == rowData.id) {
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
  }

  InstrumentSearch = (searchtext) => {
    this.instrumentserialno = searchtext;

    this.Service
      .searchByKeyword(this.instrumentserialno)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.instrumentAutoComplete = data.object;
        },
        error: (error) => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        },
      });
  }
  AddInstrument(instrument: any) {
    this.Service
      .searchByKeyword(instrument)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.instrumentList = this.instrumentList || [];
          var data = data.object[0];
          data.id = Guid.create();
          data.id = data.id.value;
          if (this.instrumentList.filter(x => x.id == data.id).length == 0) {
            this.instrumentList.push(data);
            this.api.setRowData(this.instrumentList)
          }
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
      filter: false,
      enableSorting: false,
      width: 100,
      editable: false,
      sortable: false,
      cellRendererFramework: AmcInstrumentRendererComponent,
      cellRendererParams: {
        deleteaccess: this.hasDeleteAccess,
        list: this.instrumentList
      },

    }, {
      headerName: 'instrument',
      field: 'insType',
      filter: true,
      enableSorting: true,
      editable: false,
      sortable: true,
      tooltipField: 'instrument',
    }, {
      headerName: 'serialnos',
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
      sortable: true,
      default: 0
    },
    {
      headerName: 'Amount',
      field: 'amount',
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
      var rowAmount = (Number(data.qty) * Number(data.rate));
      d[0].amount = rowAmount;
      d[0].rate = Number(data.rate)
      d[0].qty = Number(data.qty)
      this.api.setRowData(this.instrumentList)
    }
  }

  onSubmit() {

    this.submitted = true;

    this.alertService.clear();

    if (this.instrumentList != null && this.instrumentList.length > 0) {
      this.instrumentList.forEach(instrument => {
        instrument.amcId = this.id;
      })
    }

    if (this.form.invalid) return;

    this.model = this.form.value;

    const datepipie = new DatePipe("en-US");
    this.model.sqdate = datepipie.transform(this.model.sqdate, "MM/dd/yyyy");
    this.model.sdate = datepipie.transform(this.model.sdate, "MM/dd/yyyy");
    this.model.edate = datepipie.transform(this.model.edate, "MM/dd/yyyy");

    if (!this.hasId && this.hasAddAccess) {
      this.model = this.form.value;
      this.model.id = this.id;

      this.Service.save(this.model)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.notificationService.showSuccess(
              data.resultMessage,
              "Success"
            );
          },
          error: (error) => {
            console.log(error)
            this.notificationService.showError(error, "Error");
            this.loading = false;
          },
        });

      if (this.instrumentList != null && this.instrumentList.length > 0) {
        this.AmcInstrumentService.SaveAmcInstruments(this.instrumentList)
          .pipe(first())
          .subscribe({
            next: (data: ResultMsg) => {
              this.router.navigate(["amclist"]);
            },
            error: (error) => {
              this.notificationService.showError(error, "Error");
              this.loading = false;
            },
          });
      }
    }
    else if (this.hasUpdateAccess) {
      this.model = this.form.value;
      this.model.id = this.id;

      this.Service.update(this.id, this.model)
        .pipe(first())
        .subscribe({
          next: (data: ResultMsg) => {
            this.notificationService.showSuccess(
              data.resultMessage,
              "Success"
            );
          },
          error: (error) => {
            this.notificationService.showError(error, "Error");
            this.loading = false;
          },
        });
      if (this.instrumentList != null && this.instrumentList.length > 0) {
        this.AmcInstrumentService.SaveAmcInstruments(this.instrumentList)
          .pipe(first())
          .subscribe({
            next: (data: ResultMsg) => {
              this.router.navigate(["amclist"]);
            },
            error: (error) => {
              this.notificationService.showError(error, "Error");
              this.loading = false;
            },
          });
      }
    }
  }
}
