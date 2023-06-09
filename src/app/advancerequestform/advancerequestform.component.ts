import { HttpEventType } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ColumnApi, GridApi } from 'ag-grid-community';
import { first } from 'rxjs/operators';
import { FilerendercomponentComponent } from '../Offerrequest/filerendercomponent.component';
import { Currency, ProfileReadOnly, ServiceRequest, User } from '../_models';
import { FileshareService, AccountService, ProfileService, DistributorService, ListTypeService, ServiceRequestService, CurrencyService, CustomerService, NotificationService, CountryService } from '../_services';
import { AdvancerequestformService } from '../_services/advancerequestform.service';
import { BankdetailsService } from '../_services/bankdetails.service';
import { EnvService } from '../_services/env/env.service';

@Component({
  selector: 'app-advancerequestform',
  templateUrl: './advancerequestform.component.html',
})
export class AdvancerequestformComponent implements OnInit {

  id: string;
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

  public columnDefs: any[];
  public columnDefsAttachments: any[];
  private columnApi: ColumnApi;
  private api: GridApi;

  file: any;
  attachments: any;
  fileList: [] = [];
  transaction: number;
  hastransaction: boolean;
  public progress: number;
  @Output() public onUploadFinished = new EventEmitter();

  currencyList: Currency[];
  distId: string;
  engineerId: string
  customerList: any;
  country: any;
  bid: any;
  isEditMode: boolean;
  isNewMode: boolean;
  formData: any;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private FileShareService: FileshareService,
    private accountService: AccountService,
    private profileService: ProfileService,
    private distributorservice: DistributorService,
    private listTypeService: ListTypeService,
    private servicerequestservice: ServiceRequestService,
    private currencyService: CurrencyService,
    private customerService: CustomerService,
    private countrtyService: CountryService,
    private notificationService: NotificationService,
    private router: Router,
    private service: AdvancerequestformService,
    private environment: EnvService,
    private bankDetails: BankdetailsService,
  ) { }

  ngOnInit(): void {
    this.transaction = 0;

    this.user = this.accountService.userValue;
    this.listTypeService.getItemById(this.user.roleId).pipe(first()).subscribe();
    let role = JSON.parse(sessionStorage.getItem('roles'));
    this.id = this.route.snapshot.paramMap.get("id");

    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(
        (x) => x.screenCode == "ADREQ"
      );
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
      customerId: ["", Validators.required],
      distributorId: ["", Validators.required],

      officeLocationId: ["", Validators.required],
      advanceAmount: ["", Validators.required],
      advanceCurrency: ["", Validators.required],
      isBillable: ["0", Validators.required],
      clientNameLocation: ["", Validators.required],
      underTaking: ["0", Validators.required],
      reportingManager: ["", Validators.required],

      bankDetails: this.formBuilder.group({
        bankName: ["", [Validators.required]],
        branch: ["", [Validators.required]],
        nameInBank: ["", [Validators.required]],
        bankSwiftCode: ["", [Validators.required]],
        bankAccountNo: ["", [Validators.required]],
        ibanNo: ["", [Validators.required]],
        contactId: ["", [Validators.required]]
      })

    })


    if (this.user.isAdmin) {
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


    this.customerService.getAll().pipe(first())
      .subscribe((data: any) => this.customerList = data.object);


    this.countrtyService.getAll().pipe(first()).subscribe((data: any) => this.country = data.object)

    this.distributorservice.getByConId(this.user.contactId)
      .subscribe((data: any) => {
        if (this.user.username == "admin") return;
        this.form.get('distributorId').setValue(data.object[0].id);
        this.distributorservice.getDistributorRegionContacts(data.object[0].id)
          .subscribe((Engdata: any) => {
            this.distId = data.object[0].id
            this.engineer = Engdata.object;

            if (!this.IsEngineerView) return;


            this.form.get('engineerId').setValue(this.user.contactId)
            this.servicerequestservice.GetServiceRequestByDist(this.distId)
              .subscribe((Srqdata: any) => {
                this.servicerequest = Srqdata.object.filter(x => x.assignedto == this.user.contactId)
              });
          });

      })

    this.getBankDetails(this.user.contactId)

    if (this.id != null) {
      this.service.getById(this.id)
        .subscribe((data: any) => {
          this.servicerequestservice.GetServiceRequestByDist(data.object.distributorId)
            .subscribe((Srqdata: any) => {
              this.servicerequest = Srqdata.object.filter(x => x.assignedto == data.object.engineerId)
              this.GetFileList(data.object.id)
              setTimeout(() => {
                this.getBankDetails(data.object.engineerId)
              }, 500);
              this.formData = data.object;
              this.form.patchValue(this.formData);
            });
        });
      this.form.disable()
      this.columnDefsAttachments = this.createColumnDefsAttachmentsRO()
    } else {
      this.isNewMode = true;
      this.FormcontrolDisable()
    }


  }


  FormcontrolDisable() {
    if (this.IsEngineerView) {
      this.form.get('engineerId').disable()
    }
  }

  EditMode() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.isEditMode = true;

      this.router.navigate(
        ["."],
        {
          relativeTo: this.route,
          queryParams: {
            isNSNav: false
          },
          queryParamsHandling: 'merge',
        });

      this.form.enable();
      this.FormcontrolDisable()
      this.columnDefsAttachments = this.createColumnDefsAttachments()
    }
  }

  Back() {
    this.router.navigate(["advancerequestformlist"]);

  }

  CancelEdit() {
    if (!confirm("Are you sure you want to discard changes?")) return;
    if (this.id != null) this.form.patchValue(this.formData);
    else this.form.reset();
    this.form.disable()
    this.columnDefsAttachments = this.createColumnDefsAttachmentsRO()
    this.isEditMode = false;
    this.isNewMode = false;
    this.notificationService.SetNavParam();
  }

  DeleteRecord() {
    if (confirm("Are you sure you want to delete the record?")) {
      this.service.delete(this.id)
        .subscribe((data: any) => {
          if (data.result)
            this.router.navigate(["advancerequestformlist"], {
              queryParams: { isNSNav: true },
            });
        })
    }
  }


  get f() {
    return this.form.controls
  }

  get b() {
    let fg: any = this.form.get('bankDetails')
    return fg.controls;
  }

  getBankDetails(engId) {
    if (engId == null) return;

    this.form.get('bankDetails').get('contactId').setValue(engId);
    this.bankDetails.getByContactId(engId)
      .subscribe((data: any) => {
        if (data.object == null) {
          this.bid = null;
          this.form.get('bankDetails').reset()
        }
        else {
          this.form.get('bankDetails').patchValue(data.object)
          this.bid = data.object.id;
        }
      })

  }
  getservicerequest(id: string, engId = null) {
    this.getBankDetails(engId)
    this.servicerequestservice.GetServiceRequestByDist(id)
      .subscribe((Srqdata: any) => {
        this.servicerequest = Srqdata.object.filter(x => x.assignedto == engId)
      });
  }

  getengineers(id: string) {
    this.distributorservice.getDistributorRegionContacts(id)
      .subscribe((Engdata: any) => {
        this.distId = id
        this.engineer = Engdata.object;
      });
  }

  onServiceRequestChange() {
    var sreq = this.form.get('serviceRequestId').value
    var custid = this.servicerequest.find(x => x.id == sreq).custid
    this.form.get('customerId').setValue(custid);

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
    if (files.length === 0) return;

    let filesToUpload: File[] = files;
    const formData = new FormData();

    Array.from(filesToUpload).map((file, index) => {
      return formData.append("file" + index, file, file.name);
    });
    this.FileShareService.upload(formData, id, "TREXP", null).subscribe((event) => {
      if (event.type === HttpEventType.UploadProgress)
        this.progress = Math.round((100 * event.loaded) / event.total);
      else if (event.type === HttpEventType.Response) {
        this.onUploadFinished.emit(event.body);
      }
    });
  };

  GetFileList(id: string) {
    this.FileShareService.list(id)
      .subscribe((data: any) => this.attachments = data.object);
  }

  onGridReadyAttachments(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }


  onSubmit() {
    this.form.markAllAsTouched()
    console.log(this.form);

    if (this.form.get('underTaking').value == "0") {
      return this.notificationService.showInfo("Please sign the undertaking to procced", "Info")
    }

    this.form.get('engineerId').enable()
    this.form.get('bankDetails').get("contactId").setValue(this.form.get('engineerId').value)
    this.form.get('engineerId').disable()
    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }



    this.model = this.form.getRawValue();
    this.model.distId = this.distId

    if (this.IsEngineerView) this.model.engineerId = this.user.contactId;

    if (this.id == null) {
      this.service.save(this.model)
        .subscribe((data: any) => {
          if (this.file != null) this.uploadFile(this.file, data.object.id);
          if (data.result) {
            this.notificationService.showSuccess(data.resultMessage, "Success");
            this.router.navigate(["advancerequestformlist"], {
              queryParams: { isNSNav: true },
            });
          }
        });
    }

    else {
      this.model.id = this.id
      this.service.update(this.id, this.model)
        .subscribe((data: any) => {
          if (this.file != null) {
            this.uploadFile(this.file, this.id);
          }

          if (data.result) {
            this.notificationService.showSuccess(
              data.resultMessage,
              "Success"
            );
            this.router.navigate(["advancerequestformlist"], {
              queryParams: { isNSNav: true },
            });
          }
        });
    }

    this.model = this.form.get('bankDetails').value
    if (this.bid == null) {
      this.bankDetails.save(this.model)
        .subscribe();
    }

    else {
      this.model.id = this.bid
      this.bankDetails.update(this.bid, this.model)
        .subscribe();
    }



  }
}
