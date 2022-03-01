import { Component, OnInit } from '@angular/core';

import {
  CustomerSite,
  instrumentConfig,
  ListTypeItem,
  Profile,
  ProfileReadOnly,
  ResultMsg,
  SparePart,
  User
} from '../_models';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import {
  AccountService,
  AlertService,
  ListTypeService,
  NotificationService,
  ProfileService
} from '../_services';


@Component({
  selector: 'app-instrument',
  templateUrl: './profile.html',
})
export class ProfileComponent implements OnInit {
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
    private listTypeService: ListTypeService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
  ) { }

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
      isactive: [true],
      isdeleted: [false],
    });

    this.listTypeService.getById("SCRNS")
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          //debugger;
          this.listTypeItems = data;

          this.addItem(this.listTypeItems);
        },
        error: error => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });

    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id != null) {
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
      delete: '',
      categoryName: "",
      screenCode: ""
    });
  }

  addItem(value: any): void {
    //debugger;
    this.listTypeService.getById("PRGRP")
      .pipe(first())
      .subscribe((data: any) => {
        //debugger;

        let cat = "";
        for (let i = 0; i < value.length; i++) {
          this.listT = value[i];
          let screencode = this.listT.itemCode
          if (screencode == "SCURR"
            || screencode == "SCOUN"
            || screencode == "PROF"
            || screencode == "URPRF") {
            cat = data.find(x => x.itemCode == "COMON")?.itemname;
          }
          else if (screencode == "AMC"
            || screencode == "SCUST"
            || screencode == "CTSPI"
            || screencode == "SDIST"
            || screencode == "SINST"
            || screencode == "OFREQ"
            || screencode == "PRVMN"
            || screencode == "SCDLE"
            || screencode == "SRREP"
            || screencode == "SRREQ"
            || screencode == "SSPAR"
            || screencode == "SPRCM") {
            cat = data.find(x => x.itemCode == "MSTRS")?.itemname;
          }
          else if (screencode == "AUDIT"
            || screencode == "SIMXP"
            || screencode == "SSRCH") {
            cat = data.find(x => x.itemCode == "UTILS")?.itemname;
          }

          else if (screencode == "CTSS"
            || screencode == "LCEXP"
            || screencode == "STDET"
            || screencode == "TRDET"
            || screencode == "VADET") {
            cat = data.find(x => x.itemCode == "TRAVL")?.itemname;
          }

          else if (screencode == "CUSDH"
            || screencode == "DHSET"
            || screencode == "DISDH") {
            cat = data.find(x => x.itemCode == "DASH")?.itemname;
          }
          this.permissions = this.profileform.get('permissions') as FormArray;
          this.permissions.push(this.formBuilder.group({
            id: '',
            screenId: this.listT.listTypeItemId,
            screenName: this.listT.itemname,
            create: false,
            screenCode: this.listT.itemCode,
            read: false,
            categoryName: cat,
            update: false,
            delete: false
          }));
        }
      });
  }

  // convenience getter for easy access to form fields
  get f() { return this.profileform.controls; }
  get c() { return this.profileform.controls.Permissions; }


  getName(i) {

    return this.getControls()[i].value;
  }

  getControls() {
    return (<FormArray>this.profileform.get('permissions')).controls;
  }

  SelectAll(property: string) {
    let permission = this.profileform.get('permissions') as FormArray;
    let inp = document.getElementById('selectall' + property) as HTMLInputElement;

    for (var i of permission.controls) {
      inp.checked ? i.get(property).setValue(true) : i.get(property).setValue(false);
    }
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
            }
            else {
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
    else {
      this.profile.id = this.id;
      this.profileService.update(this.id, this.profile)
        .pipe(first())
        .subscribe({
          next: (data: ResultMsg) => {
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.router.navigate(["profilelist"]);
            }
            else {
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
