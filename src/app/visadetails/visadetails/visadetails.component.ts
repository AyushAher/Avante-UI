import {DatePipe} from "@angular/common";
import {Component, EventEmitter, OnInit, Output} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {first} from "rxjs/operators";

import {
  Country,
  Currency,
  DistributorRegionContacts,
  ListTypeItem,
  ProfileReadOnly,
  ResultMsg,
  ServiceRequest,
  User,
  Visadetails
} from '../../_models';
import {
  AccountService,
  AlertService,
  CountryService,
  CurrencyService,
  DistributorService,
  FileshareService,
  ListTypeService,
  NotificationService,
  ProfileService,
  ServiceRequestService,
  VisadetailsService
} from '../../_services';
import {ColDef, ColumnApi, GridApi} from "ag-grid-community";
import {FilerendercomponentComponent} from "../../Offerrequest/filerendercomponent.component";
import {HttpEventType} from "@angular/common/http";
import {environment} from "../../../environments/environment";


@Component({
  selector: "app-visadetails",
  templateUrl: "./visadetails.component.html",
})
export class VisadetailsComponent implements OnInit {
  travelDetailform: FormGroup;
  travelDetail: Visadetails;
  loading = false;
  submitted = false;
  isSave = false;
  type: string;
  id: string;
  travelDetailmodel: Visadetails;
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  user: User;
  engineer: DistributorRegionContacts[] = [];
  servicerequest: ServiceRequest[] = [];
  country: Country[] = [];
  travelrequesttype: ListTypeItem[];
  visatype: ListTypeItem[];

  dateValid: boolean = false;
  DistributorList: any;


  public columnDefs: ColDef[];
  public columnDefsAttachments: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;

  file: any;
  attachments: any;
  fileList: [] = [];
  transaction: number;
  hastransaction: boolean;
  public progress: number;
  public message: string;

  @Output() public onUploadFinished = new EventEmitter();
  currencyList: Currency[];


  constructor(
    private FileShareService: FileshareService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private travelDetailService: VisadetailsService,
    private alertService: AlertService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private distributorservice: DistributorService,
    private servicerequestservice: ServiceRequestService,
    private listTypeService: ListTypeService,
    private countryservice: CountryService,
    private currencyService: CurrencyService,
  ) {
  }

  ngOnInit() {
    this.transaction = 0;

    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(
        (x) => x.screenCode == "VADET"
      );
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

    this.travelDetailform = this.formBuilder.group({
      engineerid: ["", [Validators.required]],
      distId: ["", [Validators.required]],
      servicerequestid: ["", [Validators.required]],
      enddate: ["", [Validators.required]],
      startdate: ["", [Validators.required]],
      country: ["", [Validators.required]],
      visatypeid: ["", [Validators.required]],
      visacost: ["", [Validators.required]],
      requesttype: ["", [Validators.required]],
      isactive: [true],
      isdeleted: [false],
      currencyId: ["",Validators.required],
    });

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

    this.id = this.route.snapshot.paramMap.get("id");

    if (this.id != null) {
      this.hasAddAccess = false;
      if (this.user.username == "admin") {
        this.hasAddAccess = true;
        this.hasUpdateAccess = true;
      }

      this.travelDetailService
        .getById(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.getengineers(data.object.distId)
            this.getservicerequest(data.object.distId)
            this.travelDetailform.patchValue(data.object);
            this.GetFileList(data.object.id)
          },
          error: (error) => {
            this.notificationService.showError("Error", "Error");
            this.loading = false;
          },
        });
    }

    this.distributorservice.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.DistributorList = data.object;
        },
        error: (error) => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        },
      })


    let role = JSON.parse(localStorage.getItem('roles'));
    role = role[0].itemCode;

    this.distributorservice.getByConId(this.user.contactId).pipe(first())
      .subscribe({
        next: (data: any) => {
          this.travelDetailform.get('distId').setValue(data.object[0].id)
          this.getengineers(data.object[0].id)
        }
      })
    if (role == environment.engRoleCode) {
      this.travelDetailform.get('engineerid').setValue(this.user.contactId)
    }

    this.countryservice
      .getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.country = data.object;
        },
        error: (error) => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        },
      });

    this.listTypeService
      .getById("TRRQT")
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.travelrequesttype = data;
        },
        error: (error) => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        },
      });

    this.listTypeService
      .getById("VISAT")
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.visatype = data;
        },
        error: (error) => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        },
      });
    this.columnDefsAttachments = this.createColumnDefsAttachments();

  }

  get f() {
    return this.travelDetailform.controls;
  }


  getfil(x) {
    this.file = x;
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

  public uploadFile = (files, id) => {
    if (files.length === 0) {
      return;
    }
    let filesToUpload: File[] = files;
    const formData = new FormData();

    Array.from(filesToUpload).map((file, index) => {
      return formData.append("file" + index, file, file.name);
    });
    this.FileShareService.upload(formData, id, "VISADET", null).subscribe((event) => {
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

  onGridReadyAttachments(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }


  getservicerequest(id: string) {
    this.servicerequestservice
      .GetServiceRequestByDist(id)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.servicerequest = data.object;
        },

        error: (error) => {
          this.notificationService.showError("Error", error);
          this.loading = false;
        },
      });
  }

  getengineers(id: string) {
    this.distributorservice.getDistributorRegionContacts(id)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.engineer = data.object;
        },

        error: (error) => {
          this.notificationService.showError("Error", error);
          this.loading = false;
        },
      });
  }

  onSubmit() {

    debugger;
    this.submitted = true;
    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.travelDetailform.invalid) {
      return;
    }
    // this.isSave = true;
    this.loading = true;

    this.travelDetail = this.travelDetailform.value;


    let currentDate = new Date(this.travelDetailform.value.startdate);
    let dateSent = new Date(this.travelDetailform.value.enddate);

    let calc = Math.floor(
      (Date.UTC(
        dateSent.getFullYear(),
        dateSent.getMonth(),
        dateSent.getDate()
        ) -
        Date.UTC(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate()
        )) /
      (1000 * 60 * 60 * 24)
    );

    const datepipie = new DatePipe("en-US");
    this.travelDetailform.value.startdate = datepipie.transform(
      currentDate,
      "MM/dd/yyyy"
    );
    this.travelDetailform.value.enddate = datepipie.transform(
      dateSent,
      "MM/dd/yyyy"
    );

    if (calc > 1) {
      this.dateValid = true;
    } else {
      this.notificationService.showError(
        "The difference between start date and end date should be more than 1 day !",
        "Error"
      );
      this.dateValid = false;
    }
    if (this.dateValid) {
      if (this.id == null) {
        this.travelDetailService
          .save(this.travelDetail)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              debugger;
              if (data.result) {

                if (this.file != null) {
                  this.uploadFile(this.file, data.object.id);
                }
                this.notificationService.showSuccess(
                  data.resultMessage,
                  "Success"
                );

                this.router.navigate(["visadetailslist"]);
              } else {
                this.notificationService.showError(data.resultMessage, "Error");
              }
              this.loading = false;
            },
            error: (error) => {
              // this.alertService.error(error);
              this.notificationService.showError(error, "Error");
              this.loading = false;
            },
          });
      } else {
        this.travelDetail = this.travelDetailform.value;
        this.travelDetail.id = this.id;
        this.travelDetailService
          .update(this.id, this.travelDetail)
          .pipe(first())
          .subscribe({
            next: (data: ResultMsg) => {
              if (data.result) {

              if (this.file != null) {
                this.uploadFile(this.file, this.id);
              }
                this.notificationService.showSuccess(
                  data.resultMessage,
                  "Success"
                );
                this.router.navigate(["visadetailslist"]);
              } else {
                this.notificationService.showError(data.resultMessage, "Error");
              }
              this.loading = false;
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
