import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';
import { first } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { FilerendercomponentComponent } from '../Offerrequest/filerendercomponent.component';
import { travelDetails, ProfileReadOnly, DistributorRegionContacts, ServiceRequest, ListTypeItem, Currency, User, Customer } from '../_models';
import { AccountService, AlertService, CurrencyService, CustomerService, DistributorService, FileshareService, ListTypeService, NotificationService, ProfileService, ServiceRequestService, TravelDetailService } from '../_services';
import { TravelExpenseService } from '../_services/travel-expense.service';

@Component({
  selector: 'app-travelexpense',
  templateUrl: './travelexpense.component.html',
  styleUrls: ['./travelexpense.component.css']
})

export class TravelexpenseComponent implements OnInit {
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
  public columnDefsAttachments: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;

  file: any;
  attachments: any;
  fileList: [] = [];
  transaction: number;
  hastransaction: boolean;
  public progress: number;
  currencyList: Currency[];

  @Output() public onUploadFinished = new EventEmitter();
  distId: string;
  natureOfExpense: any;
  customerList: Customer[];
  datepipe = new DatePipe('en-US')
  designationList: any;
  grandCompanyTotalAmt: any;
  grandEngineerTotalAmt: any;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private FileShareService: FileshareService,
    private TravelExpenseService: TravelExpenseService,
    private accountService: AccountService,
    private profileService: ProfileService,
    private distributorservice: DistributorService,
    private listTypeService: ListTypeService,
    private servicerequestservice: ServiceRequestService,
    private currencyService: CurrencyService,
    private customerService: CustomerService,
    private notificationService: NotificationService,
    private router: Router,
    private numberPipe: DecimalPipe,
  ) { }

  ngOnInit(): void {
    this.transaction = 0;

    this.user = this.accountService.userValue;
    this.listTypeService.getItemById(this.user.roleId).pipe(first()).subscribe();
    let role = JSON.parse(localStorage.getItem('roles'));
    this.id = this.route.snapshot.paramMap.get("id");

    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(
        (x) => x.screenCode == "TREXP"
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
      startDate: ["", Validators.required],
      endDate: ["", Validators.required],
      totalDays: 0,
      designation: "",
      grandCompanyTotal: 0,
      grandEngineerTotal: 0,
    })


    if (this.user.username == "admin") {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
      this.hasUpdateAccess = true;
      this.hasReadAccess = true;
    } else {
      role = role[0]?.itemCode;
    }

    if (role == environment.custRoleCode) {
      this.IsCustomerView = true;
      this.IsDistributorView = false;
      this.IsEngineerView = false;
    }
    else if (role == environment.distRoleCode) {
      this.IsCustomerView = false;
      this.IsDistributorView = true;
      this.IsEngineerView = false;
    }

    else if (role == environment.engRoleCode) {
      this.IsCustomerView = false;
      this.IsDistributorView = false;
      this.IsEngineerView = true;
    }

    this.currencyService.getAll().pipe(first())
      .subscribe((data: any) => this.currencyList = data.object)

    this.distributorservice.getAll().pipe(first())
      .subscribe((data: any) => this.DistributorList = data.object)

    this.listTypeService.getById("DESIG").pipe(first())
      .subscribe((data: any) => this.designationList = data);

    this.customerService.getAll().pipe(first())
      .subscribe((data: any) => this.customerList = data.object);


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
                  this.form.get('engineerId').disable()
                  this.getservicerequest(this.distId, this.user.contactId)
                }
              });

          }
        }
      })


    if (this.id != null) {
      this.TravelExpenseService.getById(this.id).pipe(first())
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
                  this.servicerequest = Srqdata.object.filter(x => x.assignedto == data.object.engineerId && !x.isReportGenerated)
                  this.GetFileList(data.object.id)

                  setTimeout(() => {
                    this.form.patchValue(data.object)
                    this.form.patchValue({ "grandEngineerTotal": this.numberPipe.transform(this.grandEngineerTotalAmt) })
                    this.form.patchValue({ "grandCompanyTotal": this.numberPipe.transform(this.grandCompanyTotalAmt) })
                  }, 1000);
                });
            });
        })
    }
  }

  get f() {
    return this.form.controls
  }

  onGrandEngineerTotal = (e) => {
    this.grandEngineerTotalAmt = e
    // setTimeout(() => this.form.get('grandEngineerTotal').setValue(e), 1000);
  }

  onGrandCompanyTotal = (e) => {
    this.grandCompanyTotalAmt = e
    // setTimeout(() => this.form.get('grandCompanyTotal').setValue(e), 1000);
  }


  getservicerequest(id: string, engId = null) {
    let engid = this.form.get('engineerId').value

    if (engid) {
      let designation = this.engineer.find(x => x.id == engid).designationid
      this.form.get('designation').setValue(designation)
    }

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

  OnDateChange() {

    let currentDate = new Date(this.form.value.startDate);
    let dateSent = new Date(this.form.value.endDate);

    if (currentDate && dateSent) {
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
      if (calc > -365)
        this.form.get('totalDays').setValue(calc)
      else
        this.form.get('totalDays').reset()
    }

  }

  OnSubmit() {
    this.submitted = true;
    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    this.loading = true;


    if (this.form.get('totalDays').value != null && this.form.get('totalDays').value < 1)
      return this.notificationService.showError("The difference between Start Date and End Date should be more than 1 day !", "Error");

    this.form.value.startDate = this.datepipe.transform(this.form.value.startDate, "MM/dd/yyyy");
    this.form.value.endDate = this.datepipe.transform(this.form.value.endDate, "MM/dd/yyyy");

    this.model = this.form.value;
    this.model.distId = this.distId

    if (this.IsEngineerView) this.model.engineerId = this.user.contactId;

    if (this.id == null) {
      this.TravelExpenseService
        .save(this.model)
        .pipe(first())
        .subscribe((data: any) => {
          if (this.file != null) this.uploadFile(this.file, data.object.id);
          if (data.result) {
            this.notificationService.showSuccess(data.resultMessage, "Success");
            this.router.navigate(["travelexpenselist"]);
          }
          this.loading = false;
        });
    }

    else {
      this.model.id = this.id
      this.TravelExpenseService
        .update(this.id, this.model)
        .pipe(first())
        .subscribe((data: any) => {
          if (this.file != null) {
            this.uploadFile(this.file, this.id);
          }

          if (data.result) {
            this.notificationService.showSuccess(
              data.resultMessage,
              "Success"
            );
            this.router.navigate(["travelexpenselist"]);
          }
          this.loading = false;
        });
    }


  }
}
