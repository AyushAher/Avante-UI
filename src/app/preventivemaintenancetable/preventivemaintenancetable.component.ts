import {Component, OnInit} from '@angular/core';
import {CustomerSite, instrumentConfig, ListTypeItem, ProfileReadOnly, SparePart, User} from "../_models";
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
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
  listTypeItems: ListTypeItem[];
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
  ) {
  }

  ngOnInit() {
    //debugger;
    this.dateObj = Date.now();
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
      serviceReportId: ['a6fb836e-78dc-4826-b7b0-54b87d9bd916', Validators.required],
      maintenance: this.formBuilder.array([]),
    });

    this.prevchklocpartelementService.getAll()
      .pipe(first())
      .subscribe({
          next: (data: any) => {
            //debugger;
            this.listTypeItems = data.object;
            this.addItem(this.listTypeItems);
            this.list = this.listTypeItems;
          },
          error: error => {
            this.notificationService.showError(error, "Error");
            this.loading = false;
          }
        }
      );

    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id != null) {

      this.hasAddAccess = this.user.username == "admin";

      this.preventivemaintenancesService.getById(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            //debugger;
            this.Form.patchValue(data.object);
            console.log(data.object)
          },
          error: error => {
            this.notificationService.showError(error, "Error");
            this.loading = false;
          }
        });
    }
  }

  addItem(item: any): void {
    item.forEach((value) => {
        this.maintenance = this.Form.get('maintenance') as FormArray;
        this.maintenance.push(this.formBuilder.group({
          prevchklocpartelementid: 'a6fb836e-78dc-4826-b7b0-54b87d9bd916',
          location: value.location,
          element: value.element,
          listTypeItemId: value.listTypeItemId,

          weekly: false,
          monthly: false,
          yearly: false,
          isactive: true,
          every2year: false,
          every3year: false,
          every5year: false,
        }))
      }
    )
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
    debugger;
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
            //debugger;
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
