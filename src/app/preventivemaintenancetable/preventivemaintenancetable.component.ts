import {Component, OnInit} from '@angular/core';
import {CustomerSite, instrumentConfig, ListTypeItem, ProfileReadOnly, SparePart, User} from "../_models";
import {FormArray, FormBuilder, FormGroup} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {
  AccountService,
  AlertService,
  CustomerSiteService,
  InstrumentService,
  NotificationService,
  ProfileService,
  SparePartService,
  UploadService
} from "../_services";
import {first} from "rxjs/operators";
import {PrevchklocpartelementService} from "../_services/prevchklocpartelement.service";
import {PreventivemaintenancesService} from "../_services/preventivemaintenances.service";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-preventivemaintenancetable',
  templateUrl: './preventivemaintenancetable.component.html',
})

export class PreventivemaintenancetableComponent implements OnInit {
  user: User;
  Form: FormGroup;
  profile: any;
  customersite: CustomerSite[];
  loading = false;
  submitted = false;
  isSave = false;
  id: string;
  code: string = "CONTY";
  listTypeItems;
  config: instrumentConfig;
  sparePartDetails: SparePart[];
  selectedConfigType: string[] = [];
  imagePath: string;
  instuType: ListTypeItem[];
  maintenance: FormArray;
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  dateObj
  list
  savedData = []

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private customerSiteService: CustomerSiteService,
    private instrumentService: InstrumentService,
    private prevchklocpartelementService: PrevchklocpartelementService,
    private sparePartService: SparePartService,
    private uploadService: UploadService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private preventivemaintenancesService: PreventivemaintenancesService,
    public datepipe: DatePipe,
  ) {
  }

  ngOnInit() {
    //
    this.dateObj = this.datepipe.transform(Date.now(),"MM/dd/yyyy");
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "PROF");
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


    this.Form = this.formBuilder.group({
      serviceReportId: '9e38ddc3-a0d1-4fa4-a406-7aba59ebe532',
      maintenance: this.formBuilder.array([]),
    });

    this.id = this.route.snapshot.paramMap.get('id');
    // this.id = "";
    if (this.id != null) {

      this.hasAddAccess = this.user.username == "admin";

      this.preventivemaintenancesService.getById(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            //
            data.object.maintenance.forEach(value => {
              this.savedData.push(value);
            })
          },
          error: error => {
            this.notificationService.showError(error, "Error");
            this.loading = false;
          }
        });
    }

    this.prevchklocpartelementService.getAll()
      .pipe(first())
      .subscribe({
          next: (data: any) => {
            //
            this.listTypeItems = data.object;
            let data2 = []
            this.listTypeItems.forEach(value => {
              let data1 = this.savedData.find(x => x.elementId == value.id)
              console.log(data1)
                            if (data1 != undefined) {

                if (data1.monthlyDate == null) {
                  data1.monthlyDate = this.dateObj;
                }
                if (data1.weeklyDate == null) {
                  data1.weeklyDate = this.dateObj;
                }
                if (data1.yearlyDate == null) {
                  data1.yearlyDate = this.dateObj;
                }
                if (data1.every2YearDate == null) {
                  data1.every2YearDate = this.dateObj;
                }
                if (data1.every3YearDate == null) {
                  data1.every3YearDate = this.dateObj;
                }
                if (data1.every5YearDate == null) {
                  data1.every5YearDate = this.dateObj;
                }
                console.log(data1)
                let obj = {
                  elementId: data1.elementId,
                  element: data1.element,

                  location: data1.location,
                  locationId: data1.locationId,

                  weekly: data1.weekly,
                  monthly: data1.monthly,
                  yearly: data1.yearly,

                  every2year: data1.every2Year,
                  every3year: data1.every3Year,
                  every5year: data1.every5Year,

                  weeklyDate: data1.weeklyDate,
                  monthlyDate: data1.monthlyDate,
                  yearlyDate: data1.yearlyDate,

                  every2yearDate: data1.every2YearDate,
                  every3yearDate: data1.every3YearDate,
                  every5yearDate: data1.every5YearDate,
                };

                data2.push(obj);
              } else {
                let obj = {
                  elementId: value.id,
                  element: value.element,

                  location: value.location,
                  locationId: value.locationId,

                  weekly: false,
                  monthly: false,
                  yearly: false,

                  every2year: false,
                  every3year: false,
                  every5year: false,

                  weeklyDate: this.dateObj,
                  monthlyDate: this.dateObj,
                  yearlyDate: this.dateObj,

                  every2yearDate: this.dateObj,
                  every3yearDate: this.dateObj,
                  every5yearDate: this.dateObj,
                };
                data2.push(obj);
              }
            })
            this.addItem(data2);
            this.list = this.listTypeItems;
          },
          error: error => {
            this.notificationService.showError(error, "Error");
            this.loading = false;
          }
        }
      );

  }

  addItem(item: any) {
    item.forEach((value) => {
        this.maintenance = this.Form.get('maintenance') as FormArray;
        this.maintenance.push(this.formBuilder.group({
          elementId: value.elementId,
          location: value.location,
          element: value.element,
          locationId: value.locationId,

          weekly: value.weekly,
          monthly: value.monthly,
          yearly: value.yearly,
          isactive: true,
          every2year: value.every2year,
          every3year: value.every3year,
          every5year: value.every5year,

          weeklyDate: value.weeklyDate,
          monthlyDate: value.monthlyDate,
          yearlyDate: value.yearlyDate,

          every2yearDate: value.every2yearDate,
          every3yearDate: value.every3yearDate,
          every5yearDate: value.every5yearDate,
        }))
      }
    )
    console.log(this.maintenance)
  }


  // convenience getter for easy access to form fields
  get f() {
    return this.Form.controls;
  }

  get c() {
    return this.Form.controls.maintenance;
  }


  getName(i) {
    return this.getControls()[i].value;
  }

  getControls() {
    return (<FormArray>this.Form.get('maintenance')).controls;
  }

  onSubmit() {

    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid

    if (this.Form.invalid) {
      return console.log(this.Form);
    }

    this.isSave = true;
    this.loading = true;
    this.profile = this.Form.value;

    if (this.id == null) {
      this.preventivemaintenancesService.save(this.profile)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            //
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              // this.router.navigate(["profilelist"]);
            } else {
              this.notificationService.showError(data.resultMessage, "Error");
            }
            this.loading = false;
          },
          error: error => {
            this.notificationService.showError(error, "Error");
            this.loading = false;
          }
        });
    } else {
      this.profile.prevchklocpartelementid = this.id;
      this.preventivemaintenancesService.update(this.id, this.profile)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              // this.router.navigate(["profilelist"]);
            } else {
              this.notificationService.showError(data.resultMessage, "Error");
            }
            this.loading = false;
          },
          error: error => {
            this.notificationService.showError(error, "Error");
            this.loading = false;
          }
        });
    }
  }
}
