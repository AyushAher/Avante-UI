import {Component, OnInit} from '@angular/core';

import {
  CustomerSite,
  instrumentConfig,
  ListTypeItem,
  Profile,
  ProfileReadOnly,
  ProfileRegions,
  SparePart,
  User,
  UserProfile
} from '../_models';
import {ActivatedRoute, Router} from '@angular/router';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {first} from 'rxjs/operators';

import {
  AccountService,
  AlertService,
  CustomerSiteService,
  DistributorService,
  InstrumentService,
  ListTypeService,
  NotificationService,
  ProfileService,
  SparePartService,
  UploadService,
  UserProfileService
} from '../_services';
import {environment} from "../../environments/environment";
import {IDropdownSettings} from "ng-multiselect-dropdown";


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

  isEng: boolean = false;
  isDist: boolean = false;
  regionList: any;
  dropdownSettings: IDropdownSettings = {};

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
    private DistributorService: DistributorService,
  ) { }

  ngOnInit() {
    this.dropdownSettings = {
      idField: 'id',
      textField: 'region',
    };
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
      distRegions: ['', Validators.required],
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

            this.contactId = data.object.contactid;
            this.onRoleChange(data.object?.roleId);

            var subreq = data.object.distRegions?.split(',');
            let items: any = [];
            if (subreq != null && subreq.length > 0) {
              for (var i = 0; i < subreq.length; i++) {
                let t = {id: subreq[i]}
                items.push(t);
              }
              this.userprofileform.patchValue({"distRegions": items});
            }

            this.userprofileform.patchValue({"userId": data.object.userId});
            this.userprofileform.patchValue({"designation": data.object.designation});
            this.userprofileform.patchValue({"profileId": data.object.profileId});
            this.userprofileform.patchValue({"profileForId": data.object.profileForId});
            this.userprofileform.patchValue({"distributorName": data.object.distributorName});
            this.userprofileform.patchValue({"roleId": data.object.roleId});
            this.userprofileform.patchValue({"isdeleted": data.object.isdeleted});
            this.userprofileform.patchValue({"profileRegions": data.object.profileRegions});

            this.profilewithregdata = data.object.profileRegions;
            // this.userprofileform.patchValue(data.object);
            this.onprofileClick(data.object.profileForId);
          },
          error: error => {
            this.notificationService.showError(error, "Error");
            this.loading = false;
          }
        });
    }
  }

  onRoleChange(role: string) {
    switch (this.roleList.filter(x => x.listTypeItemId == role)[0]?.itemCode) {
      case environment.engRoleCode:
        this.isEng = true;
        this.GetDistributorByContactId();
        break;

      case environment.distRoleCode:
        this.isDist = true;
        this.GetDistributorByContactId();
        break;

      case environment.custRoleCode:
        this.isDist = false;
        this.isEng = false;
        this.userprofileform.get('distRegions').clearValidators()
        this.userprofileform.get('distRegions').updateValueAndValidity()
        break;
    }
  }

  GetDistributorByContactId() {
    this.DistributorService.getByConId(this.contactId)
      .pipe(first())
      .subscribe({
          next: (data: any) => {
            if (data.result) {
              this.regionList = data.object[0]?.regions;
            }
          }
        }
      )
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
    this.GetDistributorByContactId();
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

    if (this.userprofileform.get('distRegions').value.length > 0) {
      var selectarray = this.userprofileform.get('distRegions').value;
      this.userprofile.distRegions = selectarray.map(x => x.id).join(',');
    }

    if (this.id == null) {
      this.userprofileService.save(this.userprofile)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.router.navigate(["userprofilelist"]);
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
