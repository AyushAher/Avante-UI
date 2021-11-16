import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";

import {
  ProfileReadOnly, User, ListTypeItem,
  ResultMsg, DistributorRegionContacts, ServiceRequest, travelDetails
} from "../../_models";
import {
  AccountService, AlertService, NotificationService, ProfileService, DistributorService,
  ListTypeService, ServiceRequestService, TravelDetailService
} from "../../_services";

@Component({
  selector: "app-traveldetails",
  templateUrl: "./traveldetails.component.html",
})
export class TraveldetailsComponent implements OnInit {
  travelDetailform: FormGroup;
  travelDetail: travelDetails;
  loading = false;
  submitted = false;
  isSave = false;
  type: string;
  id: string;
  travelDetailmodel: travelDetails;
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  user: User;

  distid = "f785105b-cba7-4d5b-b58c-099002f3e3e0";

  engineer: DistributorRegionContacts[] = [];
  servicerequest: ServiceRequest[] = [];
  classoftravel: ListTypeItem[];
  travelrequesttype: ListTypeItem[];
  Triptype: ListTypeItem[];

  code = ["CLTRA", "TRPTY", "TRRQT"];
  dateValid: boolean;
  cityValid: boolean;
  DistributorList: any;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private travelDetailService: TravelDetailService,
    private alertService: AlertService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private distributorservice: DistributorService,
    private listTypeService: ListTypeService,
    private servicerequestservice: ServiceRequestService
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
      servicerequestid: ["", [Validators.required]],
      distId: ["", [Validators.required]],
      triptype: ["", [Validators.required]],
      travelclass: ["", [Validators.required]],
      fromcity: ["", [Validators.required]],
      tocity: ["", [Validators.required]],
      departuredate: ["", [Validators.required]],
      returndate: ["", [Validators.required]],
      isactive: [true],
      requesttype: ["", [Validators.required]],
      flightdetails: this.formBuilder.group({
        airline: ["", [Validators.required]],
        flightno: ["", [Validators.required]],
        flightdate: ["", [Validators.required]],
        flightcost: ["", [Validators.required]],
      }),
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
      .getById(this.code[0])
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.classoftravel = data;
        },
        error: (error) => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        },
      });

    this.listTypeService
      .getById(this.code[1])
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.Triptype = data;
        },
        error: (error) => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        },
      });

    this.listTypeService
      .getById(this.code[2])
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
  }

  get t() {
    return this.travelDetailform.controls;
  }
  get f() {
    return this.travelDetailform.controls.flightdetails;
  }

  getservicerequest(id: string) {
    this.servicerequestservice
      .GetServiceRequestByDist(id)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.servicerequest = (data.object);
          console.log(this.servicerequest)
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
          this.engineer = data.object.contacts;
          console.log(this.engineer)
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
    this.isSave = true;

    this.loading = true;
    this.travelDetail = this.travelDetailform.value;

    let dateSent;
    let currentDate = new Date(this.travelDetailform.value.departuredate);
    dateSent = new Date(this.travelDetailform.value.returndate);
    let flightdate = new Date(
      this.travelDetailform.value.flightdetails.flightdate
    );

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
    this.travelDetailform.value.departuredate = datepipie.transform(
      currentDate,
      "MM/dd/yyyy"
    );

    this.travelDetailform.value.returndate = datepipie.transform(
      dateSent,
      "MM/dd/yyyy"
    );

    this.travelDetailform.value.flightdetails.flightdate = datepipie.transform(
      flightdate,
      "MM/dd/yyyy"
    );

    let fcity = this.travelDetailform.value.fromcity.toLowerCase();
    let city = this.travelDetailform.value.tocity;
    let tcity = this.travelDetailform.value.tocity.toLowerCase();
    if (fcity != tcity) {
      this.cityValid = true;
    } else {
      this.notificationService.showError(
        "From City and To City cannot be same",
        "Error"
      );
      this.cityValid = false;
      this.loading = false;
    }

    if (calc > 1) {
      this.dateValid = true;
    } else {
      this.notificationService.showError(
        "The difference between Departure Date and Return Date should be more than 1 day !",
        "Error"
      );
      this.dateValid = false;
    }
    if (this.dateValid && this.cityValid) {
      if (this.id == null) {
        this.travelDetailService
          .save(this.travelDetail)
          .pipe(first())
          .subscribe({
            next: (data: ResultMsg) => {
              if (data.result) {
                this.notificationService.showSuccess(
                  data.resultMessage,
                  "Success"
                );

                this.router.navigate(["traveldetailslist"]);
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
                this.router.navigate(["traveldetailslist"]);
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
