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
import { LocalExpReceiptsService } from "src/app/_services/local-exp-receipts.service";
import { EnvService } from "src/app/_services/env/env.service";

@Component({
  selector: "app-localexpenses",
  templateUrl: "./localexpenses.component.html",
})
export class LocalexpensesComponent implements OnInit {
  form: FormGroup;
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
  datepipe = new DatePipe('en-US')
  rowData: any;
  processFile: any;
  @ViewChild('stageFiles') stageFiles;
  formData: any;

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
    private listTypeService: ListTypeService,
    private localExpReService: LocalExpReceiptsService,
    private environment: EnvService
  ) {
    this.notificationService.listen().subscribe((m: any) => {
      this.localExpReService.getAll(this.id).pipe(first())
        .subscribe((stageData: any) => {
          stageData.object.forEach(element => {
            element.createdOn = this.datepipe.transform(element.createdOn, 'dd/MM/YYYY')
          });

          this.rowData = stageData.object;
          this.form.get('amount').reset()
          this.form.get('remarks').reset()
          this.stageFiles.nativeElement.value = "";
          var selectedfiles = document.getElementById("receiptsFilesList");
          selectedfiles.innerHTML = '';
        })
    });
  }

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
    if (role == this.environment.engRoleCode) {
      this.isEng = true;
    } else if (role == this.environment.distRoleCode) {
      this.isDist = true;
    }

    this.form = this.formBuilder.group({
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

      amount: [0],
      comment: []
    });

    this.id = this.route.snapshot.paramMap.get("id");

    this.currencyService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.currencyList = data.object
        }
      })

    this.distributorservice.getByConId(this.user.contactId).pipe(first())
      .subscribe({
        next: (data: any) => {
          if (this.user.username != "admin") {
            this.form.get('distId').setValue(data.object[0].id)
            if (this.isEng) {
              this.engId = this.user.contactId
            }
            this.getengineers(data.object[0].id)
            this.getservicerequest(data.object[0].id, this.user.contactId)
          }
        }
      })

    if (role == this.environment.engRoleCode) {
      this.form.get('engineerid').setValue(this.user.contactId)
    }

    this.distributorservice.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.DistributorList = data.object;
          data.object.forEach(x => {
            x.contacts.forEach(element => {
              if (element.id == this.user.contactId) {
                this.form.get('distId').setValue(x.id)
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

                    this.formData = data.object;
                    this.form.patchValue(this.formData);
                  });
              });
          }
        });
    }
    this.columnDefsAttachments = this.createColumnDefsAttachments();

  }

  get f() {
    return this.form.controls;
  }

  DisableChoseFile(className) {
    let ofer = <HTMLInputElement>document.querySelector(`input[type="file"].` + className)
    ofer.disabled = !ofer.disabled
  }

  submitStageData() {
    if (!this.f.amount.value) return this.notificationService.showInfo("Amount cannot be empty", "Info")

    if (!this.f.comment.value) return this.notificationService.showInfo("Comments cannot be empty", "Info")


    let hasNoAttachment = false;

    let Attachment = <HTMLInputElement>document.getElementById("receiptsFilesList_Attachment")
    hasNoAttachment = Attachment?.checked


    let remarks = this.form.get('comment').value;

    if (!hasNoAttachment && this.processFile == null) {
      this.notificationService.showInfo("No Attachments Selected.", "Error")
      return;
    }

    let amount = this.form.get('amount').value

    let offerProcess = {
      remarks,
      localExpenseId: this.id,
      amount,
    }

    this.localExpReService.save(offerProcess).pipe(first())
      .subscribe((data: any) => {
        if (this.processFile != null && !hasNoAttachment)
          this.uploadFile(this.processFile, data.extraObject);

        this.processFile = null;
        this.notificationService.filter("itemadded");

        data.object.forEach(element => {
          element.createdOn = this.datepipe.transform(element.createdOn, 'dd/MM/YYYY')
        });

        this.rowData = data.object
        this.form.get("stageName").reset()
        this.form.get("stageComments").reset()
        this.form.get("stagePaymentType").reset()
      })
  }

  deleteProcess(id) {
    this.localExpReService.delete(id).pipe(first())
      .subscribe((data: any) => {
        data.object.forEach(element => {
          element.createdOn = this.datepipe.transform(element.createdOn, 'dd/MM/YYYY')
        });

        this.rowData = data.object
      })
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

  listfile = (x, lstId = "selectedfiles") => {
    document.getElementById(lstId).style.display = "block";

    var selectedfiles = document.getElementById(lstId);
    var ulist = document.createElement("ul");
    ulist.id = "demo";
    ulist.style.width = "max-content"
    selectedfiles.appendChild(ulist);

    this.transaction++;
    this.hastransaction = true;

    for (let i = 0; i < x.length; i++) {
      var name = x[i]?.name;
      ulist.style.marginTop = "5px"
      var node = document.createElement("li");
      node.style.wordBreak = "break-word";
      node.style.width = "300px"
      node.appendChild(document.createTextNode(name));
      ulist.appendChild(node);
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

  public uploadFile = (files, id, code = "LCEXP") => {
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
    if (this.form.invalid) {
      return;
    }
    // this.isSave = true;
    this.loading = true;
    this.travelDetail = this.form.value;

    let traveldate = this.form.value.traveldate;
    const datepipie = new DatePipe("en-US");
    this.form.value.traveldate = datepipie.transform(
      traveldate,
      'dd/MM/YYYY'
    );

    if (!this.form.value.isactive) {
      this.form.value.isactive = false;
    }

    this.form.value.distId = this.distId;
    if (this.isEng) {
      this.form.value.engineerid = this.engId;
    }

    if (this.id == null) {
      this.travelDetail = this.form.value;
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
            }
            this.loading = false;
          },
          error: (error) => {
            // this.alertService.error(error);

            this.loading = false;
          },
        });
    } else {
      this.travelDetail = this.form.value;
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
