import { HttpEventType } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';
import { first } from 'rxjs/operators';
import { FilerendercomponentComponent } from '../Offerrequest/filerendercomponent.component';
import { ProfileReadOnly, User } from '../_models';
import { AccountService, CustomerService, FileshareService, InstrumentService, ListTypeService, NotificationService, ProfileService } from '../_services';
import { BrandService } from '../_services/brand.service';
import { EnvService } from '../_services/env/env.service';
import { PastservicereportService } from '../_services/pastservicereport.service';

@Component({
  selector: 'app-pastservicereport',
  templateUrl: './pastservicereport.component.html',
})

export class PastservicereportComponent implements OnInit {

  form: FormGroup
  isEditMode: boolean
  isNewMode: boolean
  submitted: boolean;
  ServiceReport: any;
  id: string;
  PdffileData: any;
  isCompleted: any;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;

  attachments: any;
  file: any;
  transaction: number;
  hastransaction: boolean;
  public progress: number;
  user: User;
  profilePermission: ProfileReadOnly;
  customerList: any[];
  instrumentList: any[];
  siteList: any[];
  instrumentLst: any[];
  brandList: any;
  public columnDefs: ColDef[];
  public columnDefsAttachments: any[];
  private columnApi: ColumnApi;
  private api: GridApi;
  formData: any;

  constructor(
    private formBuilder: FormBuilder,
    private pastServiceReportService: PastservicereportService,
    private router: Router,
    private notificationService: NotificationService,
    private fileshareService: FileshareService,
    private route: ActivatedRoute,
    private profileService: ProfileService,
    private listTypeService: ListTypeService,
    private customerService: CustomerService,
    private instrumentService: InstrumentService,
    private environment: EnvService,
    private accountService: AccountService,
    private brandService: BrandService

  ) { }

  async ngOnInit() {
    this.transaction = 0;
    this.user = this.accountService.userValue;
    this.listTypeService.getItemById(this.user.roleId).pipe(first()).subscribe();
    let role = JSON.parse(localStorage.getItem('roles'));
    this.id = this.route.snapshot.paramMap.get("id");

    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter((x) => x.screenCode == "PSRRP");
      if (profilePermission.length > 0) {
        this.hasReadAccess = profilePermission[0].read;
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
        this.hasUpdateAccess = profilePermission[0].update;
      }
    }

    this.form = this.formBuilder.group({
      customerId: ["", Validators.required],
      siteId: ["", Validators.required],
      instrumentId: ["", Validators.required],
      brandId: ["", Validators.required],
      of: ["", Validators.required],
    });

    this.form.get('customerId').valueChanges
      .subscribe((data: any) => this.siteList = this.customerList.find(x => x.id == data)?.sites);

    this.form.get('siteId').valueChanges
      .subscribe((data: any) => this.instrumentLst = this.instrumentList.filter(x => x.custSiteId == data));

    await this.GetCustomer();
    await this.GetInstrument();
    await this.GetBrand();

    if (this.user.isAdmin) {
      this.hasAddAccess = false;
      this.hasDeleteAccess = false;
      this.hasUpdateAccess = false;
      this.hasReadAccess = false;
      this.notificationService.RestrictAdmin()
      return;
    }
    else role = role[0]?.itemCode;


    if (this.id != null) {
      var data: any = await this.pastServiceReportService.getById(this.id).pipe(first())
        .toPromise();

      this.formData = data.object;
      this.form.patchValue(this.formData);
      this.GetFileList(data.object.id);
      this.form.disable();

      this.form.disable();
      this.columnDefsAttachments = this.createColumnDefsAttachmentsRO()
    }
    else {
      this.isNewMode = true
      this.isEditMode = true;
      this.columnDefsAttachments = this.createColumnDefsAttachments()
    }
  }
  get f() { return this.form.controls; }

  async GetCustomer() {
    var data: any = await this.customerService.getAllByConId(this.user.contactId).toPromise()
    if (!data || !data.result) return;
    this.customerList = data.object;
  }
  async GetBrand() {
    var data: any = await this.brandService.GetByCompanyId().toPromise()
    if (!data || !data.result) return;
    this.brandList = data.object;
  }

  async GetInstrument() {
    var data: any = await this.instrumentService.getAll(this.user.userId).toPromise()
    if (!data || !data.result) return;
    this.instrumentList = data.object;
  }

  EditMode() {
    this.isEditMode = confirm("Are you sure you want to edit the record?")
    this.form.enable();

    this.isEditMode = true;
    this.isNewMode = true;
    this.columnDefsAttachments = this.createColumnDefsAttachments()
  }

  Back() {

    if ((this.isEditMode || this.isNewMode)) {
      if (confirm("Are you sure want to go back? All unsaved changes will be lost!"))
        this.router.navigate(["pastservicereportlist"])
    }

    else this.router.navigate(["pastservicereportlist"])

  }


  ToggleDropdown(id: string) {
    document.getElementById(id).classList.toggle("show")
  }

  CancelEdit() {
    if (!confirm("Are you sure you want to discard changes?")) return;
    this.columnDefsAttachments = this.createColumnDefsAttachmentsRO()
    if (this.id != null) this.form.patchValue(this.formData);
    else this.form.reset();
    this.form.disable()
    this.isEditMode = false;
    this.isNewMode = false;
  }

  DeleteRecord() {
    if (!confirm("Are you sure you want to edit the record?")) return;

    this.pastServiceReportService.delete(this.id)
      .pipe(first()).subscribe((data: any) => {
        if (data.result) this.router.navigate(["pastservicereportlist"])
      })
  }



  onSubmit() {
    this.submitted = true;
    this.form.markAllAsTouched()
    // stop here if form is invalid
    if (this.form.invalid) return;
    this.ServiceReport = this.form.value;

    if (this.file == null && (!this.attachments || this.attachments.length == 0))
      return this.notificationService.showError("Please attach service report", "Error")

    if (this.id == null) {
      this.pastServiceReportService.save(this.ServiceReport)
        .pipe(first())
        .subscribe({
          next: async (data: any) => {
            if (!data.result) return;
            this.CancelEdit()
            await this.uploadFile(this.file, data.object.id);
            this.notificationService.filter("itemadded");
            document.getElementById('selectedfiles').style.display = 'none';
            this.notificationService.showSuccess(data.resultMessage, 'Success');
            this.router.navigate(["/pastservicereportlist"])
          }
        });
    } else {

      this.ServiceReport = this.form.value;
      this.ServiceReport.id = this.id;
      this.pastServiceReportService.update(this.id, this.ServiceReport)
        .pipe(first())
        .subscribe(async (data: any) => {
          if (!data.result) return;
          this.CancelEdit()
          if (this.file != null) await this.uploadFile(this.file, data.object.id);
          this.notificationService.filter("itemadded");
          document.getElementById('selectedfiles').style.display = 'none';
          this.notificationService.showSuccess(data.resultMessage, 'Success');
          this.router.navigate(["/pastservicereportlist"])
        });
    }
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

  public uploadFile = (files, id) => {
    if (files.length === 0) {
      return;
    }
    let filesToUpload: File[] = files;
    const formData = new FormData();

    Array.from(filesToUpload).map((file, index) => {
      return formData.append("file" + index, file, file.name);
    });

    return this.fileshareService.upload(formData, id, "PSTSRP", null).toPromise();
  };

  GetFileList(id: string) {
    this.fileshareService.list(id)
      .pipe(first()).subscribe((data: any) => this.attachments = data.object);
  }

  public onPdfRowClicked(e) {
    if (!this.isCompleted) {
      if (e.event.target !== undefined) {
        const data = e.data;
        const actionType = e.event.target.getAttribute('data-action-type');
        this.id = this.route.snapshot.paramMap.get('id');
        switch (actionType) {
          case 'remove':
            if (confirm('Are you sure, you want to remove the config type?') == true) {
              // this.instrumentService.deleteConfig(data.configTypeid, data.configValueid)
              this.fileshareService.delete(data.id).pipe(first())
                .subscribe((d: any) => {
                  if (d.result) {
                    this.notificationService.showSuccess(d.resultMessage, 'Success');
                    this.fileshareService.getById(this.id)
                      .pipe(first()).subscribe((data: any) => this.PdffileData = data.object);
                  }
                });
            }
            break;
          case 'download':
            this.GetFileList(data.filePath);
        }
      }
    }
  }

  download(fileData: any) {
    const byteArray = new Uint8Array(atob(fileData).split('').map(char => char.charCodeAt(0)));
    const b = new Blob([byteArray], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(b);
    window.open(url);
  }

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


  onGridReadyAttachments(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
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
}


