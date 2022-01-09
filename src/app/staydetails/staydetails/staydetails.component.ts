import {DatePipe} from "@angular/common";
import {Component, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {first} from "rxjs/operators";
import {
  Country,
  Currency,
  DistributorRegionContacts,
  ListTypeItem,
  ProfileReadOnly,
  ResultMsg,
  ServiceRequest,
  Staydetails,
  User,
} from "../../_models";
import {
  AccountService,
  AlertService,
  CountryService,
  CurrencyService,
  DistributorService,
  ListTypeService,
  NotificationService,
  ProfileService,
  ServiceRequestService,
  StaydetailsService
} from "../../_services";
import {environment} from "../../../environments/environment";

@Component({
  selector: "app-staydetails",
  templateUrl: "./staydetails.component.html",
  // styleUrls: ['./staydetails.component.css']
})
export class StaydetailsComponent implements OnInit {
  Form: FormGroup;
  Model: Staydetails;
  loading = false;
  submitted = false;
  id: string;
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  user: User;

  code = "ACCOM";
  country: Country[];
  accomodationtype: ListTypeItem[];
  engineer: DistributorRegionContacts[] = [];
  servicerequest: ServiceRequest[] = [];
  currencyList: Currency[];
  valid: boolean;
  DistributorList: any;

  isDist: boolean = false;
  isEng: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private Service: StaydetailsService,
    private alertService: AlertService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private distributorservice: DistributorService,
    private servicerequestservice: ServiceRequestService,
    private listTypeService: ListTypeService,
    private countryservice: CountryService,
    private currencyService: CurrencyService,
  ) {
  }

  ngOnInit() {
    this.user = this.accountService.userValue;
    let role;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(
        (x) => x.screenCode == "STDET"
      );
      if (profilePermission.length > 0) {
        this.hasReadAccess = profilePermission[0].read;
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
        this.hasUpdateAccess = profilePermission[0].update;
      }
    }

    if (this.user.username != "admin") {
      role = JSON.parse(localStorage.getItem('roles'));
      role = role[0]?.itemCode;
    }

    if (this.user.username == "admin") {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
      this.hasUpdateAccess = true;
      this.hasReadAccess = true;
      this.isEng = true;
      this.isDist = true;
    } else if (role == environment.engRoleCode) {
      this.isEng = true;
    } else if (role == environment.distRoleCode) {
      this.isDist = true;
    }


    this.Form = this.formBuilder.group({
      engineerid: ["", [Validators.required]],
      distId: ["", [Validators.required]],
      servicerequestid: ["", [Validators.required]],
      accomodationtype: ["", [Validators.required]],
      city: ["", [Validators.required]],
      checkindate: ["", [Validators.required]],
      checkoutdate: ["", [Validators.required]],

      hotelname: "",
      stayaddress: "",
      roomdetails: "",
      pricepernight: 0,
      totalcost: 0,
      isactive: true,
      isdeleted: false,
      totalCurrencyId: "",
      perNightCurrencyId: "",
    });

    this.currencyService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.currencyList = data.object
        },
        error: (error) => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      })

    this.id = this.route.snapshot.paramMap.get("id");

    if (this.id != null) {
      this.Service
        .getById(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.getengineers(data.object.distId)
            this.getservicerequest(data.object.distId)
            this.Form.patchValue(data.object);
          },
          error: (error) => {
            this.notificationService.showError("Error", "Error");
            this.loading = false;
          },
        });
    }

    if (this.isEng) {
      this.Form.get('hotelname').disable()
      this.Form.get('stayaddress').disable()
      this.Form.get('roomdetails').disable()
      this.Form.get('pricepernight').disable()
      this.Form.get('totalcost').disable()
      this.Form.get('totalCurrencyId').disable()
      this.Form.get('perNightCurrencyId').disable()
    } else if (this.isDist && this.id != null) {
      this.Form.get('hotelname').setValidators([Validators.required]);
      this.Form.get('hotelname').updateValueAndValidity();

      this.Form.get('stayaddress').setValidators([Validators.required]);
      this.Form.get('stayaddress').updateValueAndValidity();

      this.Form.get('roomdetails').setValidators([Validators.required]);
      this.Form.get('roomdetails').updateValueAndValidity();

      this.Form.get('pricepernight').setValidators([Validators.required]);
      this.Form.get('pricepernight').updateValueAndValidity();

      this.Form.get('totalcost').setValidators([Validators.required]);
      this.Form.get('totalcost').updateValueAndValidity();

      this.Form.get('totalCurrencyId').setValidators([Validators.required]);
      this.Form.get('totalCurrencyId').updateValueAndValidity();

      this.Form.get('perNightCurrencyId').setValidators([Validators.required]);
      this.Form.get('perNightCurrencyId').updateValueAndValidity();
    }

    this.listTypeService.getItemById(this.user.roleId).pipe(first()).subscribe();
    this.distributorservice.getByConId(this.user.contactId).pipe(first())
      .subscribe({
        next: (data: any) => {
          this.Form.get('distId').setValue(data.object[0].id)
          this.getengineers(data.object[0].id)
        }
      })
    if (role == environment.engRoleCode) {
      this.Form.get('engineerid').setValue(this.user.contactId)
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
    return this.Form.controls;
  }

  getservicerequest(id: string) {
    this.servicerequestservice
      .GetServiceRequestByDist(id)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.isEng ? this.servicerequest = data.object.filter(x => x.assignedto == this.user.contactId)
            : this.isDist ? this.servicerequest = data.object.filter(x => x.distid == id) : this.servicerequest = [];
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
          this.engineer = data.object
          this.getservicerequest(id)
        },

        error: (error) => {
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
    if (this.Form.invalid) {
      return;
    }
    // this.isSave = true;
    this.loading = true;

    let currentDate = new Date(this.Form.value.checkindate);
    let dateSent = new Date(this.Form.value.checkoutdate);

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
    this.Form.value.checkindate = datepipie.transform(
      currentDate,
      "MM/dd/yyyy"
    );

    this.Form.value.checkoutdate = datepipie.transform(
      dateSent,
      "MM/dd/yyyy"
    );
    this.Model = this.Form.value;

    if (calc > 1) {
      this.valid = true;
    } else {
      this.notificationService.showError(
        "The difference between start date and end date should be more than 1 day !",
        "Error"
      );
      this.valid = false;
      this.loading = false;
      return;
    }

    if (!this.Form.value.isactive) {
      this.Form.value.isactive = false;
    }
    if (this.valid) {
      if (this.id == null) {
        this.Service
          .save(this.Model)
          .pipe(first())
          .subscribe({
            next: (data: ResultMsg) => {
              debugger;
              if (data.result) {
                this.notificationService.showSuccess(
                  data.resultMessage,
                  "Success"
                );
                this.router.navigate(["/staydetailslist"]);
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
        this.Model = this.Form.value;
        this.Model.id = this.id;
        this.Service
          .update(this.id, this.Model)
          .pipe(first())
          .subscribe({
            next: (data: ResultMsg) => {
              if (data.result) {
                this.notificationService.showSuccess(
                  data.resultMessage,
                  "Success"
                );
                this.router.navigate(["/staydetailslist"]);
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
