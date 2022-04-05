import { DatePipe } from "@angular/common";
import { Component, EventEmitter, OnInit, Output, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";
import {
  Currency,
  DistributorRegionContacts,
  ListTypeItem,
  LocalExpenses,
  ResultMsg,
  ServiceRequest,
  User,
} from "../../_models";
import {
  AccountService,
  AlertService,
  CurrencyService,
  DistributorService,
  FileshareService,
  ListTypeService,
  LocalExpensesService,
  NotificationService,
  ProfileService,
  ServiceRequestService,
} from "../../_services";
import { ColDef, ColumnApi, GridApi } from "ag-grid-community";
import { FilerendercomponentComponent } from "../../Offerrequest/filerendercomponent.component";
import { HttpEventType } from "@angular/common/http";
import { environment } from "../../../environments/environment";

@Component({
  selector: "app-localexpenses",
  templateUrl: "./localexpenses.component.html",
})
export class LocalexpensesComponent implements OnInit {
  travelDetailform: FormGroup;
  travelDetail: LocalExpenses;
  loading = false;
  submitted = false;
  isSave = false;
  type: string;
  id: string;
  travelDetailmodel: LocalExpenses;
  profilePermission: any;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  user: User;

  distid = "f9f3900d-8b03-4242-a94a-701401f4ec5b";
  code = "ACCOM";
  accomodationtype: ListTypeItem[];
  engineer: DistributorRegionContacts[] = [];
  servicerequest: ServiceRequest[] = [];
  travelrequesttype: ListTypeItem[];

  valid: boolean;
  DistributorList: any;
  currencyList: Currency[];


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
  isEng: boolean = false;
  isDist: boolean = false;

  @Output() public onUploadFinished = new EventEmitter();
  distId: string;
  engId: string;

  constructor(
    private FileShareService: FileshareService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private localExpensesService: LocalExpensesService,
    private alertService: AlertService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private distributorservice: DistributorService,
    private servicerequestservice: ServiceRequestService,
    private currencyService: CurrencyService,
    private listTypeService: ListTypeService
  ) { }

  ngOnInit() {
    this.transaction = 0;

    this.user = this.accountService.userValue;

    let role = JSON.parse(localStorage.getItem('roles'));

    this.listTypeService.getItemById(this.user.roleId).pipe(first()).subscribe();
    this.profilePermission = this.profileService.userProfileValue;

    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(
        (x) => x.screenCode == "LCEXP"
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
    } else {
      role = role[0]?.itemCode;
    }
    if (role == environment.engRoleCode) {
      this.isEng = true;
    } else if (role == environment.distRoleCode) {
      this.isDist = true;
    }

    this.travelDetailform = this.formBuilder.group({
      engineerid: [{ value: "", disabled: this.isEng }, [Validators.required]],
      distId: [{ value: "", disabled: this.isDist || this.isEng }, [Validators.required]], servicerequestid: ["", [Validators.required]],
      city: ["", [Validators.required]],
      traveldate: ["", [Validators.required]],
      totalamount: ["", [Validators.required]],
      isactive: [true],
      remarks: ["", [Validators.required]],
      requesttype: ["", [Validators.required]],
      currencyId: ["", [Validators.required]],
      isdeleted: [false],
    });

    this.id = this.route.snapshot.paramMap.get("id");

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

    this.distributorservice.getByConId(this.user.contactId).pipe(first())
      .subscribe({
        next: (data: any) => {
          if (this.user.username != "admin") {
            this.travelDetailform.get('distId').setValue(data.object[0].id)
            if (this.isEng) {
              this.engId = this.user.contactId
            }
            this.getengineers(data.object[0].id)
            this.getservicerequest(data.object[0].id, this.user.contactId)
          }
        }
      })

    if (role == environment.engRoleCode) {
      this.travelDetailform.get('engineerid').setValue(this.user.contactId)
    }

    this.distributorservice.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.DistributorList = data.object;
          data.object.forEach(x => {
            x.contacts.forEach(element => {
              if (element.id == this.user.contactId) {
                this.travelDetailform.get('distId').setValue(x.id)                
                this.getengineers(x.id)
              }
            });
          })
        },
        error: (error) => {
          
          this.loading = false;
        },
      })

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
      .getById(this.code)
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.accomodationtype = data;
        },
        error: (error) => {
          
          this.loading = false;
        },
      });

    if (this.id != null) {
      this.localExpensesService
        .getById(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.getengineers(data.object.distId)
            this.getservicerequest(data.object.distId, data.object.engineerid)
            this.GetFileList(data.object.id);
            setTimeout(() => {
              this.travelDetailform.patchValue(data.object);
            }, 100);
          },
          error: (error) => {
            
            this.loading = false;
          },
        });
    }


    this.columnDefsAttachments = this.createColumnDefsAttachments();

  }

  get f() {
    return this.travelDetailform.controls;
  }

  getservicerequest(id: string, engId: any = null) {
    this.servicerequestservice
      .GetServiceRequestByDist(id)
      .pipe(first())
      .subscribe({
        next: (data: any) => this.servicerequest = data.object.filter(x => x.assignedto == engId && !x.isReportGenerated),

        error: (error) => {
          
          this.loading = false;
        },
      });
  }

  getengineers(id: string) {
    this.distributorservice.getDistributorRegionContacts(id)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.distId = id;
          this.engineer = data.object;
        },

        error: (error) => {
          
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
    this.FileShareService.upload(formData, id, "LCEXP", null).subscribe((event) => {
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
          (err, "Error");
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
    // this.isSave = true;
    this.loading = true;
    this.travelDetail = this.travelDetailform.value;

    let traveldate = this.travelDetailform.value.traveldate;
    const datepipie = new DatePipe("en-US");
    this.travelDetailform.value.traveldate = datepipie.transform(
      traveldate,
      "MM/dd/yyyy"
    );

    if (!this.travelDetailform.value.isactive) {
      this.travelDetailform.value.isactive = false;
    }

    this.travelDetailform.value.distId = this.distId;
    if (this.isEng) {
      this.travelDetailform.value.engineerid = this.engId;
    }

    if (this.id == null) {
      this.travelDetail = this.travelDetailform.value;
      this.localExpensesService
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
              this.router.navigate(["/localexpenseslist"]);
            } else {
              
              console.log(data.resultMessage);
            }
            this.loading = false;
          },
          error: (error) => {
            // this.alertService.error(error);
            
            this.loading = false;
          },
        });
    } else {
      this.travelDetail = this.travelDetailform.value;
      this.travelDetail.id = this.id;
      this.localExpensesService
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
              this.router.navigate(["/localexpenseslist"]);
            } else {
              
              console.log(data.resultMessage);
            }
            this.loading = false;
          },
          error: (error) => {
            
            console.log(error);
            this.loading = false;
          },
        });
    }
  }
}
