import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
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
import { environment } from "../../../environments/environment";

@Component({
  selector: "app-staydetails",
  templateUrl: "./staydetails.component.html",
  // styleUrls: ['./staydetails.component.css']
})
export class StaydetailsComponent implements OnInit {
  travelDetailform: FormGroup;
  travelDetail: Staydetails;
  loading = false;
  submitted = false;
  isSave = false;
  type: string;
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
  distId: string;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private travelDetailService: StaydetailsService,
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

  get f() {
    return this.travelDetailform.controls;
  }

  ngOnInit() {
    this.user = this.accountService.userValue;
    let role = JSON.parse(localStorage.getItem('roles'));
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
    if (this.user.username == "admin") {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
      this.hasUpdateAccess = true;
      this.hasReadAccess = true;
    }
    else {
      role = role[0]?.itemCode;
    }

    this.travelDetailform = this.formBuilder.group({
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
      pricepernight: "",
      totalcost: "",
      isactive: true,
      isdeleted: false,
      totalCurrencyId: "",
      perNightCurrencyId: "",
    });

    if (role == environment.engRoleCode) {
      this.isEng = true;
      this.travelDetailform.get('engineerid').disable()
      this.travelDetailform.get('distId').disable()
    }
    else if (role == environment.distRoleCode) {
      this.isDist = true;
      this.travelDetailform.get('distId').disable()
    }
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
      this.travelDetailService
        .getById(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.getengineers(data.object.distId)
            this.getservicerequest(data.object.distId, data.object.engineerid)
            this.travelDetailform.patchValue(data.object);
          },
          error: (error) => {
            this.notificationService.showError("Error", "Error");
            this.loading = false;
          },
        });
    }

    if (this.isEng) {
      this.travelDetailform.get('hotelname').disable()
      this.travelDetailform.get('stayaddress').disable()
      this.travelDetailform.get('roomdetails').disable()
      this.travelDetailform.get('pricepernight').disable()
      this.travelDetailform.get('totalcost').disable()
      this.travelDetailform.get('totalCurrencyId').disable()
      this.travelDetailform.get('perNightCurrencyId').disable()
    } else if (this.isDist) {
      this.travelDetailform.get('hotelname').setValidators([Validators.required]);
      this.travelDetailform.get('hotelname').updateValueAndValidity();

      this.travelDetailform.get('stayaddress').setValidators([Validators.required]);
      this.travelDetailform.get('stayaddress').updateValueAndValidity();

      this.travelDetailform.get('roomdetails').setValidators([Validators.required]);
      this.travelDetailform.get('roomdetails').updateValueAndValidity();

      this.travelDetailform.get('pricepernight').setValidators([Validators.required]);
      this.travelDetailform.get('pricepernight').updateValueAndValidity();

      this.travelDetailform.get('totalcost').setValidators([Validators.required]);
      this.travelDetailform.get('totalcost').updateValueAndValidity();

      this.travelDetailform.get('totalCurrencyId').setValidators([Validators.required]);
      this.travelDetailform.get('totalCurrencyId').updateValueAndValidity();

      this.travelDetailform.get('perNightCurrencyId').setValidators([Validators.required]);
      this.travelDetailform.get('perNightCurrencyId').updateValueAndValidity();
    }

    this.listTypeService.getItemById(this.user.roleId).pipe(first()).subscribe();
    this.distributorservice.getByConId(this.user.contactId).pipe(first())
      .subscribe({
        next: (data: any) => {
          if (this.user.username != "admin") {
            this.travelDetailform.get('distId').setValue(data.object[0].id)
            this.getengineers(data.object[0].id)
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

  getservicerequest(id: string, engId: string = null) {
    this.servicerequestservice
      .GetServiceRequestByDist(id)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.servicerequest = data.object.filter(x => x.assignedto == engId)
        },

        error: (error) => {
          this.notificationService.showError("Error", error);
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
          this.engineer = data.object
          // this.getservicerequest(id)
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
    if (this.travelDetailform.invalid) {
      return;
    }
    // this.isSave = true;
    this.loading = true;

    let currentDate = new Date(this.travelDetailform.value.checkindate);
    let dateSent = new Date(this.travelDetailform.value.checkoutdate);

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
    this.travelDetailform.value.checkindate = datepipie.transform(
      currentDate,
      "MM/dd/yyyy"
    );

    this.travelDetailform.value.checkoutdate = datepipie.transform(
      dateSent,
      "MM/dd/yyyy"
    );
    this.travelDetail = this.travelDetailform.value;

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

    if (!this.travelDetailform.value.isactive) {
      this.travelDetailform.value.isactive = false;
    }
    if (this.valid) {
      if (this.id == null) {
        this.travelDetailService
          .save(this.travelDetail)
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
        this.travelDetail = this.travelDetailform.value;
        this.travelDetail.id = this.id;
        this.travelDetailService
          .update(this.id, this.travelDetail)
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
