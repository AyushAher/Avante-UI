import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";
import {
  ListTypeItem, DistributorRegionContacts, LocalExpenses, ServiceRequest,
  ProfileReadOnly, ResultMsg, User,
} from "../../_models";
import {
  AccountService, ServiceRequestService, LocalExpensesService, AlertService, NotificationService, ProfileService,
  DistributorService, ListTypeService,
} from "../../_services";

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
  profilePermission: ProfileReadOnly;
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
  constructor(
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
    private listTypeService: ListTypeService
  ) { }

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(
        (x) => x.screenCode == "SCURR"
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
      city: ["", [Validators.required]],
      traveldate: ["", [Validators.required]],
      totalamount: ["", [Validators.required]],
      isactive: [true],
      remarks: ["", [Validators.required]],
      requesttype: ["", [Validators.required]],
    });

    this.id = this.route.snapshot.paramMap.get("id");

    if (this.id != null) {
      this.hasAddAccess = false;
      if (this.user.username == "admin") {
        this.hasAddAccess = true;
      }

      this.localExpensesService
        .getById(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.getengineers(data.object.distId)
            this.getservicerequest(data.object.distId)
            this.travelDetailform.patchValue(data.object);
          },
          error: (error) => {
            console.log(error);
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
          console.log(data);
        },
        error: (error) => {
          this.notificationService.showError(error, "Error");
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
          this.notificationService.showError(error, "Error");
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
          this.notificationService.showError(error, "Error");
          this.loading = false;
        },
      });
  }

  get f() {
    return this.travelDetailform.controls;
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
          console.log(error);
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
          this.engineer = data.object.contacts;
        },

        error: (error) => {
          console.log(error);
          this.notificationService.showError("Error", error);
          this.loading = false;
        },
      });
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
    // console.log(this.travelDetailform.value);

    if (this.id == null) {
      this.travelDetail = this.travelDetailform.value;
      this.localExpensesService
        .save(this.travelDetail)
        .pipe(first())
        .subscribe({
          next: (data: ResultMsg) => {
            if (data.result) {
              this.notificationService.showSuccess(
                data.resultMessage,
                "Success"
              );
              this.router.navigate(["/localexpenseslist"]);
            } else {
              this.notificationService.showError(data.resultMessage, "Error");
              console.log(data.resultMessage);
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
      this.localExpensesService
        .update(this.id, this.travelDetail)
        .pipe(first())
        .subscribe({
          next: (data: ResultMsg) => {
            if (data.result) {
              this.notificationService.showSuccess(
                data.resultMessage,
                "Success"
              );
              this.router.navigate(["/localexpenseslist"]);
            } else {
              this.notificationService.showError(data.resultMessage, "Error");
              console.log(data.resultMessage);
            }
            this.loading = false;
          },
          error: (error) => {
            this.notificationService.showError(error, "Error");
            console.log(error);
            this.loading = false;
          },
        });
    }
  }
}
