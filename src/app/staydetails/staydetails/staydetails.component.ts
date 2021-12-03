import {DatePipe} from "@angular/common";
import {Component, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {first} from "rxjs/operators";
import {
  Country,
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
  DistributorService,
  ListTypeService,
  NotificationService,
  ProfileService,
  ServiceRequestService,
  StaydetailsService
} from "../../_services";

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
  travelDetailmodel: Staydetails;
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

  valid: boolean;
  DistributorList: any;

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
    private countryservice: CountryService
  ) {
  }

  ngOnInit() {
    this.user = this.accountService.userValue;
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

    this.travelDetailform = this.formBuilder.group({
      engineerid: ["", [Validators.required]],
      distId: ["", [Validators.required]],
      servicerequestid: ["", [Validators.required]],
      accomodationtype: ["", [Validators.required]],
      hotelname: ["", [Validators.required]],
      stayaddress: ["", [Validators.required]],
      roomdetails: ["", [Validators.required]],
      city: ["", [Validators.required]],
      checkindate: ["", [Validators.required]],
      checkoutdate: ["", [Validators.required]],
      pricepernight: ["", [Validators.required]],
      totalcost: ["", [Validators.required]],
      isactive: [true],
    });

    this.id = this.route.snapshot.paramMap.get("id");

    if (this.id != null) {
      this.hasAddAccess = false;
      if (this.user.username == "admin") {
        this.hasAddAccess = true;
      }

      this.travelDetailService
        .getById(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            console.log(data);
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
    console.log(id);
    this.distributorservice.getDistributorRegionContacts(id)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.engineer = data.object
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

    this.travelDetailform.value.totalcost =
      Number(this.travelDetailform.value.pricepernight) * calc;

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
}
