import {Component, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {first} from "rxjs/operators";
import {
  Customersatisfactionsurvey,
  DistributorRegionContacts,
  ListTypeItem,
  ProfileReadOnly,
  ResultMsg,
  ServiceRequest,
  User,
} from "../../_models";
import {
  AccountService,
  AlertService,
  CustomersatisfactionsurveyService,
  DistributorService,
  ListTypeService,
  NotificationService,
  ProfileService,
  ServiceRequestService,
} from "../../_services";
import {environment} from "../../../environments/environment";

@Component({
  selector: "app-customersatisfactionsurvey",
  templateUrl: "./customersatisfactionsurvey.component.html",
})
export class CustomersatisfactionsurveyComponent implements OnInit {
  form: FormGroup;
  customersatisfactionsurvey: Customersatisfactionsurvey;
  loading = false;
  submitted = false;
  isSave = false;
  type: string;
  id: string;
  travelDetailmodel: Customersatisfactionsurvey;
  profilePermission: ProfileReadOnly;

  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;

  user: User;
  code = "ACCOM";

  accomodationtype: ListTypeItem[];
  engineer: DistributorRegionContacts[] = [];
  servicerequest: ServiceRequest[] = [];
  travelrequesttype: ListTypeItem[];

  valid: boolean;
  DistributorList: any;
  eng: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private CustomersatisfactionsurveyService: CustomersatisfactionsurveyService,
    private alertService: AlertService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private distributorservice: DistributorService,
    private servicerequestservice: ServiceRequestService,
    private listTypeService: ListTypeService
  ) {
  }

  ngOnInit() {
    this.user = this.accountService.userValue;

    this.profilePermission = this.profileService.userProfileValue;

    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(
        (x) => x.screenCode == "CTSS"
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

    this.form = this.formBuilder.group({
      isactive: [true],
      engineerid: [""],
      distId: [""],
      servicerequestid: ["", [Validators.required]],
      ontime: [""],
      knowledgewithproduct: [""],
      problemsolveskill: [""],
      satisfactionlevel: [""],
      isdeleted: [false],
    });

    this.id = this.route.snapshot.paramMap.get("id");

    let role = JSON.parse(localStorage.getItem('roles'));
    role = role[0].itemCode;

    if (this.id != null) {
      if (this.user.username == "admin") {
        this.hasAddAccess = true;
      }

      this.CustomersatisfactionsurveyService.getById(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.getengineers(data.object.distId)
            this.getservicerequest(data.object.distId)
            this.form.patchValue(data.object);
          },
          error: (error) => {
            console.log(error);
            this.notificationService.showError(Error, "Error");
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

    this.distributorservice.getByConId(this.user.contactId).pipe(first())
      .subscribe({
        next: (data: any) => {
          this.form.get('distId').setValue(data.object[0].id)
          this.getengineers(data.object[0].id)
        }
      })
    if (role == environment.engRoleCode) {
      this.eng = true
      this.form.get('engineerid').setValue(this.user.contactId)
    }
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
    return this.form.controls;
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
          this.engineer = data.object;
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
    if (this.form.invalid) {
      return;
    }
    // this.isSave = true;
    this.loading = true;
    this.customersatisfactionsurvey = this.form.value;

    if (!this.form.value.isactive) {
      this.form.value.isactive = false;
    }
    // console.log(this.travelDetailform.value);

    if (this.id == null) {
      if (!this.form.value.isactive) {
        this.form.value.isactive = false;
      }
      if (!this.form.value.ontime) {
        this.form.value.ontime = false;
      }
      if (!this.form.value.knowledgewithproduct) {
        this.form.value.knowledgewithproduct = false;
      }

      if (!this.form.value.problemsolveskill) {
        this.form.value.problemsolveskill = false;
      }
      if (!this.form.value.satisfactionlevel) {
        this.form.value.satisfactionlevel = false;
      }

      this.customersatisfactionsurvey = this.form.value;
      this.CustomersatisfactionsurveyService.save(this.form.value)
        .pipe(first())
        .subscribe({
          next: (data: ResultMsg) => {
            if (data.result) {
              this.notificationService.showSuccess(
                data.resultMessage,
                "Success"
              );
              this.router.navigate(["/customersatisfactionsurveylist"]);
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
      this.customersatisfactionsurvey = this.form.value;
      this.customersatisfactionsurvey.id = this.id;
      this.CustomersatisfactionsurveyService.update(
        this.id,
        this.customersatisfactionsurvey
      )
        .pipe(first())
        .subscribe({
          next: (data: ResultMsg) => {
            if (data.result) {
              this.notificationService.showSuccess(
                data.resultMessage,
                "Success"
              );
              this.router.navigate(["/customersatisfactionsurveylist"]);
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
