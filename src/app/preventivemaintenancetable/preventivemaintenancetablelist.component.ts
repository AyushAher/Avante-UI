import {Component, OnInit} from '@angular/core';
import {
  CustomerSite,
  instrumentConfig,
  ListTypeItem,
  Profile,
  ProfileReadOnly,
  ResultMsg,
  SparePart,
  User
} from "../_models";
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {
  AccountService,
  AlertService,
  CustomerSiteService,
  InstrumentService,
  ListTypeService,
  NotificationService,
  ProfileService,
  SparePartService,
  UploadService
} from "../_services";
import {first} from "rxjs/operators";

@Component({
  selector: 'app-preventivemaintenancetable',
  templateUrl: './preventivemaintenancetablelist.component.html'
})
export class PreventivemaintenancetablelistComponent implements OnInit {
  user: User;
  profileform: FormGroup;
  profile: Profile;
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
  permissions: FormArray;
  listT: ListTypeItem;
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private customerSiteService: CustomerSiteService,
    private instrumentService: InstrumentService,
    private listTypeService: ListTypeService,
    private sparePartService: SparePartService,
    private uploadService: UploadService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
  ) {
  }

  ngOnInit() {
    //debugger;
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


    this.profileform = this.formBuilder.group({
      profilename: ['', Validators.required],
      permissions: this.formBuilder.array([]),
    });

    this.listTypeService.getById("SCRNS")
      .pipe(first())
      .subscribe({
          next: (data: ListTypeItem[]) => {
            //debugger;
            this.listTypeItems = data;
            this.addItem(this.listTypeItems);
          },
          error: error => {
            this.notificationService.showError(error, "Error");
            this.loading = false;
          }
        }
      );

    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id != null) {
      this.hasAddAccess = false;
      if (this.user.username == "admin") {
        this.hasAddAccess = true;
      }
      this.profileService.getById(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            //debugger;
            this.profileform.patchValue(data.object);

          },
          error: error => {
            this.notificationService.showError(error, "Error");
            this.loading = false;
          }
        });
    }
  }

  CreateItem(): FormGroup {
    return this.formBuilder.group({
      id: '',
      screenId: '',
      screenName: '',
      create: '',
      read: '',
      update: '',
      delete: ''
    });
  }

  addItem(value: any): void {
    //debugger;
    for (let i = 0; i < value.length; i++) {
      this.listT = value[i];
      this.permissions = this.profileform.get('permissions') as FormArray;
      this.permissions.push(this.formBuilder.group({
        id: '',
        screenId: this.listT.listTypeItemId,
        screenName: this.listT.itemname,
        create: false,
        read: false,
        update: false,
        delete: false
      }));
    }
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.profileform.controls;
  }

  get c() {
    return this.profileform.controls.Permissions;
  }


  getName(i) {

    return this.getControls()[i].value;
  }

  getControls() {
    return (<FormArray>this.profileform.get('permissions')).controls;
  }


  onSubmit() {
    //debugger;
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.profileform.invalid) {
      return;
    }
    this.isSave = true;
    this.loading = true;
    this.profile = this.profileform.value;


    if (this.id == null) {
      this.profileService.save(this.profile)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            //debugger;
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.router.navigate(["profilelist"]);
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
      this.profile.id = this.id;
      this.profileService.update(this.id, this.profile)
        .pipe(first())
        .subscribe({
          next: (data: ResultMsg) => {
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.router.navigate(["profilelist"]);
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
