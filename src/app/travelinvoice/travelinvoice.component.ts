import { DatePipe } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';
import { first } from 'rxjs/operators';
import { FilerendercomponentComponent } from '../Offerrequest/filerendercomponent.component';
import { ProfileReadOnly, ServiceRequest, Currency, Customer, User } from '../_models';
import { AlertService, FileshareService, AccountService, ProfileService, DistributorService, ListTypeService, ServiceRequestService, CurrencyService, CustomerService, NotificationService } from '../_services';
import { EnvService } from '../_services/env/env.service';
import { TravelinvoiceService } from '../_services/travelinvoice.service';

@Component({
  selector: 'app-travelinvoice',
  templateUrl: './travelinvoice.component.html',
})

export class TravelinvoiceComponent implements OnInit {
  id: string;
  loading = false;
  submitted = false;
  form: FormGroup;
  model: any;
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  user: User;

  engineer: any[] = [];
  servicerequest: ServiceRequest[] = [];

  DistributorList: any[] = [];
  IsCustomerView: boolean = false;
  IsDistributorView: boolean = false;
  IsEngineerView: boolean = false;


  public columnDefs: ColDef[];
  public columnDefsAttachments: any[];
  private columnApi: ColumnApi;
  private api: GridApi;

  file: any;
  attachments: any;
  transaction: number;
  hastransaction: boolean;
  public progress: number;
  currencyList: Currency[];
  distId: string;
  isEditMode: any;
  isNewMode: boolean;
  formData: any;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private FileShareService: FileshareService,
    private TravelInvoicesService: TravelinvoiceService,
    private accountService: AccountService,
    private profileService: ProfileService,
    private distributorservice: DistributorService,
    private listTypeService: ListTypeService,
    private servicerequestservice: ServiceRequestService,
    private currencyService: CurrencyService,
    private environment: EnvService,
    private notificationService: NotificationService,
    private router: Router,
  ) { }
  ngOnInit(): void {

    this.transaction = 0;

    this.user = this.accountService.userValue;
    this.listTypeService.getItemById(this.user.roleId).pipe(first()).subscribe();
    let role = JSON.parse(localStorage.getItem('roles'));
    this.id = this.route.snapshot.paramMap.get("id");

    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter((x) => x.screenCode == "TREXP");
      if (profilePermission.length > 0) {
        this.hasReadAccess = profilePermission[0].read;
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
        this.hasUpdateAccess = profilePermission[0].update;
      }
    }

    this.form = this.formBuilder.group({
      engineerId: ["", [Validators.required]],
      serviceRequestId: ["", [Validators.required]],
      distributorId: ["", Validators.required],
      amountBuild: ["", Validators.required],
    })


    if (this.user.username == "admin") {
      this.hasAddAccess = false;
      this.hasDeleteAccess = false;
      this.hasUpdateAccess = false;
      this.hasReadAccess = false;
      this.notificationService.RestrictAdmin()
      return;
    }
    else role = role[0]?.itemCode;


    if (role == this.environment.custRoleCode) {
      this.IsCustomerView = true;
      this.IsDistributorView = false;
      this.IsEngineerView = false;
    }

    else if (role == this.environment.distRoleCode) {
      this.IsCustomerView = false;
      this.IsDistributorView = true;
      this.IsEngineerView = false;
    }

    else if (role == this.environment.engRoleCode) {
      this.IsCustomerView = false;
      this.IsDistributorView = false;
      this.IsEngineerView = true;
    }

    this.currencyService.getAll().pipe(first())
      .subscribe((data: any) => this.currencyList = data.object)

    this.distributorservice.getAll().pipe(first())
      .subscribe((data: any) => this.DistributorList = data.object)

    this.distributorservice.getByConId(this.user.contactId)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          if (this.user.username != "admin") {
            this.form.get('distributorId').setValue(data.object[0].id);
            this.distributorservice.getDistributorRegionContacts(data.object[0].id).pipe(first())
              .subscribe((Engdata: any) => {
                this.distId = data.object[0].id
                this.engineer = Engdata.object;
                this.servicerequestservice.GetServiceRequestByDist(data.object[0].id).pipe(first())
                  .subscribe((Srqdata: any) =>
                    this.servicerequest = Srqdata.object.filter(x => x.assignedto == data.object[0].id && !x.isReportGenerated)
                  );

                if (this.IsEngineerView) {
                  this.form.get('engineerId').setValue(this.user.contactId)
                  this.getservicerequest(this.distId, this.user.contactId)
                }
              });

          }
        }
      })


    if (this.id != null) {
      this.TravelInvoicesService.getById(this.id).pipe(first())
        .subscribe((data: any) => {
          this.distributorservice.getDistributorRegionContacts(data.object.distributorId)
            .pipe(first())
            .subscribe((Engdata: any) => {
              this.distId = data.object.distributorId

              this.engineer = Engdata.object;
              this.servicerequestservice
                .GetServiceRequestByDist(data.object.distributorId)
                .pipe(first())
                .subscribe((Srqdata: any) => {
                  setTimeout(() => {
                    this.servicerequest = Srqdata.object.filter(x => x.assignedto == data.object.engineerId && !x.isReportGenerated)
                    this.GetFileList(data.object.id)
                    this.formData = data.object;
                    this.form.patchValue(this.formData);
                  }, 1000);
                });
            });
        })
      this.form.disable();
      this.columnDefsAttachments = this.createColumnDefsAttachmentsRO()

    }
    else {
      this.FormControlDisable()
      this.isNewMode = true
      this.columnDefsAttachments = this.createColumnDefsAttachments()
    }

  }

  EditMode() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.isEditMode = true;
      this.form.enable();
      this.columnDefsAttachments = this.createColumnDefsAttachments()
      this.FormControlDisable();
    }
  }

  Back() {

    if ((this.isEditMode || this.isNewMode)) {
      if (confirm("Are you sure want to go back? All unsaved changes will be lost!"))
        this.router.navigate(["travelinvoicelist"])
    }

    else this.router.navigate(["travelinvoicelist"])

  }

  CancelEdit() {
    if (!confirm("Are you sure you want to discard changes?")) return;
    if (this.id != null) this.form.patchValue(this.formData);
    else this.form.reset();
    this.form.disable()
    this.columnDefsAttachments = this.createColumnDefsAttachments()
    this.isEditMode = false;
    this.isNewMode = false;
  }

  FormControlDisable() {
    if (this.IsEngineerView) {
      this.form.get('engineerId').disable()
      this.form.get('distributorId').disable()
    }

    else if (this.IsDistributorView) {
      this.form.get('distributorId').disable()
    }

  }

  DeleteRecord() {
    if (confirm("Are you sure you want to delete the record?")) {

      this.TravelInvoicesService.delete(this.id).pipe(first())
        .subscribe((data: any) => {
          if (data.result)
            this.router.navigate(["travelinvoicelist"])
        })
    }
  }

  get f() {
    return this.form.controls
  }

  getservicerequest(id: string, engId = null) {
    this.servicerequestservice
      .GetServiceRequestByDist(id)
      .pipe(first())
      .subscribe((Srqdata: any) => {
        this.servicerequest = Srqdata.object.filter(x => x.assignedto == engId && !x.isReportGenerated)
      });
  }

  getengineers(id: string) {
    this.distributorservice.getDistributorRegionContacts(id)
      .pipe(first())
      .subscribe((Engdata: any) => {
        this.distId = id
        this.engineer = Engdata.object;
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
        lockPosition: "left",
        sortable: false,
        cellRendererFramework: FilerendercomponentComponent,
        cellRendererParams: {
          deleteaccess: this.hasDeleteAccess && this.isEditMode,
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

  createColumnDefsAttachmentsRO() {
    return [
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
    this.FileShareService.upload(formData, id, "TRINV", null).subscribe((event) => {
      if (event.type === HttpEventType.UploadProgress)
        this.progress = Math.round((100 * event.loaded) / event.total);
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
    this.form.markAllAsTouched()
    this.submitted = true;
    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    this.loading = true;

    this.model = this.form.value;
    this.model.distributorId = this.distId

    if (this.IsEngineerView) this.model.engineerId = this.user.contactId;

    if (this.id == null) {
      this.TravelInvoicesService
        .save(this.model)
        .pipe(first())
        .subscribe((data: any) => {
          if (this.file != null) this.uploadFile(this.file, data.object.id);
          if (data.result) {
            this.notificationService.showSuccess(data.resultMessage, "Success");
            this.router.navigate(["travelinvoicelist"]);
          }
          this.loading = false;
        });
    }

    else {
      this.model.id = this.id
      this.TravelInvoicesService
        .update(this.id, this.model)
        .pipe(first())
        .subscribe((data: any) => {
          if (this.file != null) this.uploadFile(this.file, this.id)

          if (data.result) {
            this.notificationService.showSuccess(
              data.resultMessage,
              "Success"
            );
            this.router.navigate(["travelinvoicelist"]);
          }
          this.loading = false;
        });
    }


  }
}
