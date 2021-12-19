import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { User, Instrument, CustomerSite, ListTypeItem, instrumentConfig, SparePart, Profile, UserProfile, ProfileRegions, ProfileReadOnly } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { first } from 'rxjs/operators';

import {
  AccountService, AlertService, CustomerSiteService, InstrumentService, ListTypeService, SparePartService
  , UploadService, NotificationService, ProfileService, UserProfileService
} from '../_services';


@Component({
  selector: 'app-userp',
  templateUrl: './userprofile.html',
})
export class UserProfileComponent implements OnInit {
  user: User;
  userprofileform: FormGroup;
  profilelist: Profile[];
  customersite: CustomerSite[];
  userprofile: UserProfile;
  loading = false;
  submitted = false;
  isSave = false;
  id: string;
  hidetable: boolean = false;
  code: string = "CONTY";
  listTypeItems: ListTypeItem[];
  config: instrumentConfig;
  sparePartDetails: SparePart[];
  selectedConfigType: string[] = [];
  imagePath: string;
  instuType: ListTypeItem[];
  roleList: ListTypeItem[];
  profileRegions: FormArray;
  listT: ListTypeItem;
  contactId: string;
  profileregion: ProfileRegions;
  profilewithregdata: ProfileRegions[];
  userlist: User[];
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
    private userprofileService: UserProfileService,
  ) { }

  ngOnInit() {
    //debugger;
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "URPRF");
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

    this.userprofileform = this.formBuilder.group({
      userId: ['', Validators.required],
      designation: [''],
      profileId: ['', Validators.required],
      profileForId: [''],
      distributorName: [''],
      roleId: ['', Validators.required],
      isdeleted: [false],
      profileRegions: this.formBuilder.array([]),
    });

    this.listTypeService.getById("RF")
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          //debugger;
          this.listTypeItems = data;
          this.listTypeItems = this.listTypeItems.filter(item => item.itemname !== "Contact");
          //this.addItem(this.listTypeItems);
        },
        error: error => {
           this.notificationService.showError(error, "Error");
           this.loading = false;
        }
      });

    this.listTypeService.getById("ROLES")
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          //debugger;
          this.roleList = data;
         // this.listTypeItems = this.listTypeItems.filter(item => item.itemname !== "Contact");
          //this.addItem(this.listTypeItems);
        },
        error: error => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });

    this.profileService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          //debugger;
          this.profilelist=data;
        },
        error: error => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });

    this.userprofileService.getUserAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          //debugger;
          this.userlist = data.object;
        },
        error: error => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });


    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id != null) {
      this.hasAddAccess = false;
      if (this.user.username == "admin") {
        this.hasAddAccess = true;
      }
      this.userprofileService.getById(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            //debugger;
            this.userprofileform.patchValue(data.object);
            this.contactId = data.object.contactid;
            this.profilewithregdata = data.object.profileRegions;
            this.onprofileClick(data.object.profileForId);
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
      userProfileId: '',
      select: false,
      level1Name: '',
      level2Name: '',
      level2Level1Name: '',
      level1id: '',
      level2id: '',
      profileRegionId :''
    });
  }

  addItem(value: any): void {
    //debugger;
    for (let i = 0; i < value.length; i++) {
      this.profileregion = value[i];
      this.profileRegions = this.userprofileform.get('profileRegions') as FormArray;
      this.profileRegions.push(this.formBuilder.group({
        id: '',
        userProfileId: this.profileregion.userProfileId,
        select: false,
        level1Name: this.profileregion.level1Name,
        level2Name: this.profileregion.level2Name,
        level2Level1Name: this.profileregion.level2Level1Name,
        level1id: this.profileregion.level1id,
        level2id: this.profileregion.level2id,
        profileRegionId: ''
      }));
    }

    let frmArray = this.userprofileform.get('profileRegions') as FormArray;
    frmArray.patchValue(this.profilewithregdata);
    this.profilewithregdata = [];

  }


  // convenience getter for easy access to form fields
  get f() { return this.userprofileform.controls; }
  get c() { return this.userprofileform.controls.profileRegions; }

  getName(i) {
    //debugger;
    return this.getControls()[i].value;
  }

  getControls() {
    return (<FormArray>this.userprofileform.get('profileRegions')).controls;
  }

  onprofileClick(value: any ) {
    let frmArray = this.userprofileform.get('profileRegions') as FormArray;
    frmArray.clear();
    this.userprofileService.getByProfileRegion(value, this.contactId)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          //debugger;
          //this.addItem(data.object);
          //frmArray.patchValue(this.profilewithregdata);
          //this.profilewithregdata = [];
        },
        error: error => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });
  }

  onUserChange(value: any) {
    //debugger;
    this.contactId = this.userlist.filter(x => x.userid === value)[0].contactid;
    this.userprofileService.getByUserId(this.contactId)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          //debugger;
          this.userprofileform.controls['designation'].setValue(data.object.designation);
          this.userprofileform.controls['distributorName'].setValue(data.object.distCustName);
          //this.userprofileform.setValue({
          //  designation: data.object.designation,
          //  distributorName: data.object.Profilefor,
          //});
          this.contactId = data.object.contactid;
        },
        error: error => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });
  }

  onSubmit() {
    //debugger;
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.userprofileform.invalid) {
      return;
    }
    this.isSave = true;
    this.loading = true;
    this.userprofile = this.userprofileform.value;


    if (this.id == null) {
      this.userprofileService.save(this.userprofile)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.router.navigate(["userprofilelist"]);
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
      this.userprofile.id = this.id;
      this.userprofileService.update(this.id, this.userprofile)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.router.navigate(["userprofilelist"]);
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
