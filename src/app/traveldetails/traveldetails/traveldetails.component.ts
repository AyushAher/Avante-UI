import {DatePipe} from "@angular/common";
import {Component, EventEmitter, OnInit, Output} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {first} from "rxjs/operators";

import {
  DistributorRegionContacts,
  ListTypeItem,
  ProfileReadOnly,
  ResultMsg,
  ServiceRequest,
  travelDetails,
  User
} from "../../_models";
import {
  AccountService,
  AlertService,
  DistributorService,
  FileshareService,
  ListTypeService,
  NotificationService,
  ProfileService,
  ServiceRequestService,
  TravelDetailService
} from "../../_services";
import {FilerendercomponentComponent} from "../../Offerrequest/filerendercomponent.component";
import {HttpEventType} from "@angular/common/http";
import {ColDef, ColumnApi, GridApi} from "ag-grid-community";

@Component({
  selector: "app-traveldetails",
  templateUrl: "./traveldetails.component.html",
})
export class TraveldetailsComponent implements OnInit {
  travelDetailform: FormGroup;
  travelDetail: travelDetails;
  loading = false;
  submitted = false;
  isSave = false;
  type: string;
  id: string;
  travelDetailmodel: travelDetails;
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  user: User;

  distid = "f785105b-cba7-4d5b-b58c-099002f3e3e0";

  engineer: DistributorRegionContacts[] = [];
  servicerequest: ServiceRequest[] = [];
  classoftravel: ListTypeItem[];
  travelrequesttype: ListTypeItem[];
  Triptype: ListTypeItem[];

  code = ["CLTRA", "TRPTY", "TRRQT"];
  dateValid: boolean;
  cityValid: boolean;
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


  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private FileShareService: FileshareService,
    private accountService: AccountService,
    private travelDetailService: TravelDetailService,
    private alertService: AlertService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private distributorservice: DistributorService,
    private listTypeService: ListTypeService,
    private servicerequestservice: ServiceRequestService
  ) { }

  ngOnInit() {
    this.transaction = 0;

    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(
        (x) => x.screenCode == "TRDET"
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
      servicerequestid: ["", [Validators.required]],
      distId: ["", [Validators.required]],
      triptype: ["", [Validators.required]],
      travelclass: ["", [Validators.required]],
      fromcity: ["", [Validators.required]],
      tocity: ["", [Validators.required]],
      departuredate: ["", [Validators.required]],
      returndate: ["", [Validators.required]],
      isactive: [true],
      requesttype: ["", [Validators.required]],
      flightdetails: this.formBuilder.group({
        airline: ["", [Validators.required]],
        flightno: ["", [Validators.required]],
        flightdate: ["", [Validators.required]],
        flightcost: ["", [Validators.required]],
      }),
    });

    this.id = this.route.snapshot.paramMap.get("id");

    if (this.id != null) {
      this.hasAddAccess = false;

      if (this.user.username == "admin") {
        this.hasAddAccess = true;
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

    this.listTypeService
      .getById(this.code[0])
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.classoftravel = data;
        },
        error: (error) => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        },
      });

    this.listTypeService
      .getById(this.code[1])
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.Triptype = data;
        },
        error: (error) => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        },
      });

    this.listTypeService
      .getById(this.code[2])
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
    this.columnDefsAttachments = this.createColumnDefsAttachments();

  }

  get t() {
    return this.travelDetailform.controls;
  }
  get f() {
    return this.travelDetailform.controls.flightdetails;
  }

  getservicerequest(id: string) {
    this.servicerequestservice
      .GetServiceRequestByDist(id)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.servicerequest = (data.object);
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
    this.FileShareService.upload(formData, id, "TRREQ",null).subscribe((event) => {
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

  onSubmit() {
    this.submitted = true;
    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.travelDetailform.invalid) {
      return;
    }
    this.isSave = true;

    this.loading = true;
    this.travelDetail = this.travelDetailform.value;

    let dateSent;
    let currentDate = new Date(this.travelDetailform.value.departuredate);
    dateSent = new Date(this.travelDetailform.value.returndate);
    let flightdate = new Date(
      this.travelDetailform.value.flightdetails.flightdate
    );

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
    this.travelDetailform.value.departuredate = datepipie.transform(
      currentDate,
      "MM/dd/yyyy"
    );

    this.travelDetailform.value.returndate = datepipie.transform(
      dateSent,
      "MM/dd/yyyy"
    );

    this.travelDetailform.value.flightdetails.flightdate = datepipie.transform(
      flightdate,
      "MM/dd/yyyy"
    );

    let fcity = this.travelDetailform.value.fromcity.toLowerCase();
    let city = this.travelDetailform.value.tocity;
    let tcity = this.travelDetailform.value.tocity.toLowerCase();
    if (fcity != tcity) {
      this.cityValid = true;
    } else {
      this.notificationService.showError(
        "From City and To City cannot be same",
        "Error"
      );
      this.cityValid = false;
      this.loading = false;
    }

    if (calc > 1) {
      this.dateValid = true;
    } else {
      this.notificationService.showError(
        "The difference between Departure Date and Return Date should be more than 1 day !",
        "Error"
      );
      this.dateValid = false;
    }
    if (this.dateValid && this.cityValid) {
      if (this.id == null) {
        this.travelDetailService
          .save(this.travelDetail)
          .pipe(first())
          .subscribe({
            next: (data: any) => {

              if (this.file != null) {
                this.uploadFile(this.file, data.object.id);
              }
              if (data.result) {
                this.notificationService.showSuccess(
                  data.resultMessage,
                  "Success"
                );

                this.router.navigate(["traveldetailslist"]);
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

              if (this.file != null) {
                this.uploadFile(this.file, this.id);
              }

              if (data.result) {
                this.notificationService.showSuccess(
                  data.resultMessage,
                  "Success"
                );
                this.router.navigate(["traveldetailslist"]);
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
