import { DatePipe } from "@angular/common";
import { HttpEventType } from "@angular/common/http";
import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ColDef, ColumnApi, GridApi } from "ag-grid-community";
import { Guid } from "guid-typescript";
import { first } from "rxjs/operators";
import { AmcInstrumentRendererComponent } from "../amc/amc-instrument-renderer.component";
import { Currency, Distributor, ResultMsg, User } from "../_models";
import { Offerrequest } from "../_models/Offerrequest.model";
import { AccountService, AlertService, NotificationService, ListTypeService, ProfileService, DistributorService, CurrencyService, FileshareService } from "../_services";
import { OfferrequestService } from "../_services/Offerrequest.service";
import { SparePartsOfferRequestService } from "../_services/sparepartsofferrequest.service";
import { FilerendercomponentComponent } from "./filerendercomponent.component";
@Component({
  selector: "app-Offerrequest",
  templateUrl: "./Offerrequest.component.html",
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
  ) { }
  ngOnInit() {

    this.transaction = 0;
    this.user = this.accountService.userValue;

    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SSPAR");
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
      distributorid: ["", Validators.required],
      totalamount: [0, Validators.required],
      currencyId: ["", Validators.required],
      status: ["", Validators.required],
      podate: ["", Validators.required],
    })

    this.id = this.route.snapshot.paramMap.get("id");
    this.columnDefs = this.createColumnDefs();
    this.columnDefsAttachments = this.createColumnDefsAttachments();
    if (this.id != null) {
      this.Service.getById(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.form.patchValue(data.object);
          },
          error: (error) => {
            this.notificationService.showError("Error", "Error");
            this.loading = false;
          },
        });

      this.SparePartsService.getSparePartsByOfferRequestId(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.sparePartsList = data.object;
            this.api.setRowData(this.sparePartsList)
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

    this.GetFileList(this.id);
  }

  RemoveSpareParts(event) {
    var cellValue = event.value;
    var rowData = event.data;
    var indexOfSelectedRow = this.sparePartsList.indexOf(rowData);

    if (cellValue == rowData.id) {
      this.sparePartsList.splice(indexOfSelectedRow, 1)
      if (rowData.offerRequestId == null && cellValue == rowData.id) {
        this.api.setRowData(this.sparePartsList)
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

          data.offerRequestId = this.id;
          data.amount = Number(data.price) * Number(data.qty)

          if (this.sparePartsList.filter(x => x.partno == data.partno).length == 0) {
            this.sparePartsList.push(data);
            this.api.setRowData(this.sparePartsList)
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
      cellRendererFramework: AmcInstrumentRendererComponent,
      cellRendererParams: {
        deleteaccess: this.hasDeleteAccess,
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
      default: 0
    },
    {
      headerName: 'Amount',
      field: 'amount',
      filter: true,
      sortable: true
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


  getfil(x) {
    this.file = x;
  }
  createColumnDefsAttachments() {
    return [
      {
        headerName: "Action",
        field: "id",
        filter: false,
        editable: false,
        width: 100,
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
  public uploadFile = (files) => {
    if (files.length === 0) {
      return;
    }
    let filesToUpload: File[] = files;
    const formData = new FormData();

    Array.from(filesToUpload).map((file, index) => {
      return formData.append("file" + index, file, file.name);
    });
    this.FileShareService.upload(formData, this.id).subscribe((event) => {
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


  onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();
    // stop here if form is invalid
    if (this.form.invalid) return

    if (this.sparePartsList != [] && this.sparePartsList != null) {

      this.sparePartsList.forEach(instrument => {
        instrument.offerRequest = this.id;
      })
    }

    if (this.file != null) {
      this.uploadFile(this.file);
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
      this.router.navigate(["offerrequestlist"]);

    } else if (this.hasUpdateAccess) {
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

      this.router.navigate(["offerrequestlist"]);

    }
  }
}
