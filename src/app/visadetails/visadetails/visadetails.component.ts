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
  User,
  Visadetails
} from '../../_models';
import {
  AccountService,
  AlertService,
  CountryService,
  DistributorService,
  ListTypeService,
  NotificationService,
  ProfileService,
  ServiceRequestService,
  VisadetailsService
} from '../../_services';


@Component({
  selector: "app-visadetails",
  templateUrl: "./visadetails.component.html",
})
export class VisadetailsComponent implements OnInit {
  travelDetailform: FormGroup;
  travelDetail: Visadetails;
  loading = false;
  submitted = false;
  isSave = false;
  type: string;
  id: string;
  travelDetailmodel: Visadetails;
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  user: User;
  engineer: DistributorRegionContacts[] = [];
  servicerequest: ServiceRequest[] = [];
  country: Country[] = [];
  travelrequesttype: ListTypeItem[];
  visatype: ListTypeItem[];

  dateValid: boolean = false;
  DistributorList: any;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private travelDetailService: VisadetailsService,
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
      enddate: ["", [Validators.required]],
      startdate: ["", [Validators.required]],
      country: ["", [Validators.required]],
      visatypeid: ["", [Validators.required]],
      visacost: ["", [Validators.required]],
      requesttype: ["", [Validators.required]],
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

      
    this.countryservice
      .getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.country = data.object;
        },
        error: (error) => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        },
      });

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
      .getById("VISAT")
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.visatype = data;
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
          this.servicerequest = data.object;
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
    debugger;
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


    let currentDate = new Date(this.travelDetailform.value.startdate);
    let dateSent = new Date(this.travelDetailform.value.enddate);

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
    this.travelDetailform.value.startdate = datepipie.transform(
      currentDate,
      "MM/dd/yyyy"
    );
    this.travelDetailform.value.enddate = datepipie.transform(
      dateSent,
      "MM/dd/yyyy"
    );

    if (calc > 1) {
      this.dateValid = true;
    } else {
      this.notificationService.showError(
        "The difference between start date and end date should be more than 1 day !",
        "Error"
      );
      this.dateValid = false;
    }
    if (this.dateValid) {
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

                this.router.navigate(["visadetailslist"]);
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
                this.router.navigate(["visadetailslist"]);
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
