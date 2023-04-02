import { DatePipe } from "@angular/common";
import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";

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
import { ColDef, ColumnApi, GridApi } from "ag-grid-community";
import { FilerendercomponentComponent } from "../../Offerrequest/filerendercomponent.component";
import { HttpEventType } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { EnvService } from "src/app/_services/env/env.service";


@Component({
  selector: "app-visadetails",
  templateUrl: "./visadetails.component.html",
})
export class VisadetailsComponent implements OnInit {
  form: FormGroup;
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

  isEng: boolean = false
  isDist: boolean = false
  distId: string;

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
    private environment: EnvService,
    private currencyService: CurrencyService,
  ) {
  }

  ngOnInit() {

    let role = JSON.parse(sessionStorage.getItem('roles'));

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
    if (this.user.isAdmin) {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
      this.hasUpdateAccess = true;
      this.hasReadAccess = true;
    } else {
      role = role[0]?.itemCode;
    }
    if (role == this.environment.engRoleCode) {
      this.isEng = true;
    } else if (role == this.environment.distRoleCode) {
      this.isDist = true;
    }

    this.form = this.formBuilder.group({
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
      currencyId: ["", Validators.required],
      amount: [0],
      combined: [false],
    });

    this.currencyService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.currencyList = data.object
        },
        error: (error) => {

          this.loading = false;
        }
      })

    this.distributorservice.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.DistributorList = data.object;
        },
        error: (error) => {

          this.loading = false;
        },
      })

    this.listTypeService.getItemById(this.user.roleId).pipe(first()).subscribe();
    this.distributorservice.getByConId(this.user.contactId).pipe(first())
      .subscribe({
        next: (data: any) => {
          if (this.user.username != "admin") {
            this.form.get('distId').setValue(data.object[0].id)
            this.getengineers(data.object[0].id)
            this.getservicerequest(data.object[0].id, this.user.contactId)
          }
        }
      })
    if (role == this.environment.engRoleCode) {
      this.form.get('engineerid').setValue(this.user.contactId)
      this.form.get('engineerid').disable()
      this.form.get('distId').disable()
    } else if (role == this.environment.distRoleCode) {
      this.form.get('distId').disable()
    }

    this.countryservice
      .getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.country = data.object;
        },
        error: (error) => {

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

          this.loading = false;
        },
      });
    this.columnDefsAttachments = this.createColumnDefsAttachments();

    this.id = this.route.snapshot.paramMap.get("id");

    if (this.id != null) {
      this.hasAddAccess = false;
      this.travelDetailService
        .getById(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.distributorservice.getDistributorRegionContacts(data.object.distId)
              .pipe(first())
              .subscribe((Engdata: any) => {
                this.distId = data.object.distId
                this.engineer = Engdata.object;
                this.servicerequestservice
                  .GetServiceRequestByDist(data.object.distId)
                  .pipe(first())
                  .subscribe((Srqdata: any) => {
                    this.servicerequest = Srqdata.object.filter(x => x.assignedto == data.object.engineerid && !x.isReportGenerated)
                    this.GetFileList(data.object.id)
                    data.object.servicerequestid = data.object.servicerequestid?.split(',').filter(x => x != "");
                    this.form.patchValue(data.object);
                  });
              });
          },
        });
    }

  }

  get f() {
    return this.form.controls;
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
      });
  }

  onGridReadyAttachments(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }




  getservicerequest(id: string, engId = null) {
    this.servicerequestservice
      .GetServiceRequestByDist(id)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.servicerequest = data.object.filter(x => x.assignedto == engId && !x.isReportGenerated)
        },

        error: (error) => {

          this.loading = false;
        },
      });
  }

  getengineers(id: string) {
    this.distId = id
    this.distributorservice.getDistributorRegionContacts(id)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.engineer = data.object;
          // this.getservicerequest(id)
        },

        error: (error) => {

          this.loading = false;
        },
      });
  }


  onSubmit() {
    this.submitted = true;
    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }
    // this.isSave = true;
    this.loading = true;

    this.travelDetail = this.form.value;

    let currentDate = new Date(this.form.value.startdate);
    let dateSent = new Date(this.form.value.enddate);

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
    this.form.value.startdate = datepipie.transform(
      currentDate,
      'dd/MM/YYYY'
    );
    this.form.value.enddate = datepipie.transform(
      dateSent,
      'dd/MM/YYYY'
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
    if (this.isEng) this.travelDetail.engineerid = this.user.contactId
    this.travelDetail.distId = this.distId;

    if (this.form.get('servicerequestid').value.length > 0) {
      var selectarray = this.form.get('servicerequestid').value;
      this.travelDetail.servicerequestid = selectarray.toString();
    }

    else if (this.form.get('servicerequestid').value.length == 0) {
      this.travelDetail.servicerequestid = ""
    }


    if (this.dateValid) {
      if (this.id == null) {
        this.travelDetailService
          .save(this.travelDetail)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (data.result) {
                if (this.file != null) {
                  this.uploadFile(this.file, data.object.id);
                }
                this.notificationService.showSuccess(
                  data.resultMessage,
                  "Success"
                );

                this.router.navigate(["visadetailslist"]);
              }
              this.loading = false;
            },
          });
      } else {
        this.travelDetail = this.form.value;
        this.travelDetail.id = this.id;
        if (this.isEng) this.travelDetail.engineerid = this.user.contactId
        this.travelDetail.distId = this.distId;
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

              }
              this.loading = false;
            },
            error: (error) => {


              this.loading = false;
            },
          });
      }
    }
  }
}
