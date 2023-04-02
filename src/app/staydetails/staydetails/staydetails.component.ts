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
import { EnvService } from "src/app/_services/env/env.service";

@Component({
  selector: "app-staydetails",
  templateUrl: "./staydetails.component.html",
  // styleUrls: ['./staydetails.component.css']
})
export class StaydetailsComponent implements OnInit {
  form: FormGroup;
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
  formData: any;

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
    private currencyService: CurrencyService,
    private environment: EnvService,
  ) {
  }

  get f() {
    return this.form.controls;
  }

  ngOnInit() {
    this.user = this.accountService.userValue;
    let role = JSON.parse(sessionStorage.getItem('roles'));
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
    if (this.user.isAdmin) {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
      this.hasUpdateAccess = true;
      this.hasReadAccess = true;
    }
    else {
      role = role[0]?.itemCode;
    }

    this.form = this.formBuilder.group({
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
      amount: [0],
      combined: [false]
    });

    if (role == this.environment.engRoleCode) {
      this.isEng = true;
      this.form.get('engineerid').disable()
      this.form.get('distId').disable()
    }
    else if (role == this.environment.distRoleCode) {
      this.isDist = true;
      this.form.get('distId').disable()
    }
    this.currencyService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.currencyList = data.object
        },
      })

    this.id = this.route.snapshot.paramMap.get("id");

    if (this.isEng) {
      this.form.get('hotelname').disable()
      this.form.get('stayaddress').disable()
      this.form.get('roomdetails').disable()
      this.form.get('pricepernight').disable()
      this.form.get('totalcost').disable()
      this.form.get('totalCurrencyId').disable()
      this.form.get('perNightCurrencyId').disable()
    } else if (this.isDist) {
      this.form.get('hotelname').setValidators([Validators.required]);
      this.form.get('hotelname').updateValueAndValidity();

      this.form.get('stayaddress').setValidators([Validators.required]);
      this.form.get('stayaddress').updateValueAndValidity();

      this.form.get('roomdetails').setValidators([Validators.required]);
      this.form.get('roomdetails').updateValueAndValidity();

      this.form.get('pricepernight').setValidators([Validators.required]);
      this.form.get('pricepernight').updateValueAndValidity();

      this.form.get('totalcost').setValidators([Validators.required]);
      this.form.get('totalcost').updateValueAndValidity();

      this.form.get('totalCurrencyId').setValidators([Validators.required]);
      this.form.get('totalCurrencyId').updateValueAndValidity();

      this.form.get('perNightCurrencyId').setValidators([Validators.required]);
      this.form.get('perNightCurrencyId').updateValueAndValidity();
    }

    this.listTypeService.getItemById(this.user.roleId).pipe(first()).subscribe();
    this.distributorservice.getByConId(this.user.contactId).pipe(first())
      .subscribe({
        next: (data: any) => {
          if (this.user.username != "admin") {
            this.form.get('distId').setValue(data.object[0].id)
            this.getengineers(data.object[0].id)
            this.getservicerequest(data.object[0].id, this.user.contactId)
          }
        }
      })
    if (role == this.environment.engRoleCode) {
      this.form.get('engineerid').setValue(this.user.contactId)
    }
    this.distributorservice.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.DistributorList = data.object;
        }
      })

    this.listTypeService
      .getById(this.code)
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.accomodationtype = data;
        },
      });

    if (this.id != null) {
      this.travelDetailService
        .getById(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.distributorservice.getDistributorRegionContacts(data.object.distId)
              .pipe(first())
              .subscribe((Engdata: any) => {
                this.engineer = Engdata.object
                this.distId = data.object.distId

                this.servicerequestservice
                  .GetServiceRequestByDist(data.object.distId)
                  .pipe(first())
                  .subscribe((Srqdata: any) => {
                    this.servicerequest = Srqdata.object.filter(x => x.assignedto == data.object.engineerid && !x.isReportGenerated)
                    data.object.servicerequestid = data.object.servicerequestid?.split(',').filter(x => x != "");
                    this.formData = data.object;
                    this.form.patchValue(this.formData);
                  });
              });
          }
        });
    }

  }

  getservicerequest(id: string, engId: string = null) {
    this.servicerequestservice
      .GetServiceRequestByDist(id)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.servicerequest = data.object.filter(x => x.assignedto == engId && !x.isReportGenerated)
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

    let currentDate = new Date(this.form.value.checkindate);
    let dateSent = new Date(this.form.value.checkoutdate);

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
    this.form.value.checkindate = datepipie.transform(
      currentDate,
      'dd/MM/YYYY'
    );

    this.form.value.checkoutdate = datepipie.transform(
      dateSent,
      'dd/MM/YYYY'
    );
    this.travelDetail = this.form.value;

    if (this.form.get('servicerequestid').value.length > 0) {
      var selectarray = this.form.get('servicerequestid').value;
      this.travelDetail.servicerequestid = selectarray.toString();
    }

    else if (this.form.get('servicerequestid').value.length == 0) {
      this.travelDetail.servicerequestid = ""
    }


    if (calc > 1) this.valid = true

    else {
      this.notificationService.showError(
        "The difference between start date and end date should be more than 1 day !",
        "Error"
      );
      this.valid = false;
      this.loading = false;
      return;
    }

    if (!this.form.value.isactive) {
      this.form.value.isactive = false;
    }

    this.travelDetail.distId = this.distId
    if (this.isEng) this.travelDetail.engineerid = this.user.contactId;

    if (this.valid) {
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
                this.router.navigate(["/staydetailslist"]);
              } else {

              }
              this.loading = false;
            },
            error: (error) => {
              // this.alertService.error(error);

              this.loading = false;
            },
          });
      } else {
        this.travelDetail = this.form.value;
        this.travelDetail.distId = this.distId
        if (this.isEng) this.travelDetail.engineerid = this.user.contactId;
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

              }
              this.loading = false;
            },
            error: (error) => {

              this.loading = false;
            },
          });
      }
    }
  }
}
