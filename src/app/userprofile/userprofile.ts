import { Component, OnInit } from '@angular/core';

import {
  CustomerSite,
  ListTypeItem,
  Profile,
  ProfileReadOnly,
  ProfileRegions,
  User,
  UserProfile
} from '../_models';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import {
  AccountService,
  AlertService,
  CustomerService,
  DistributorService,
  ListTypeService,
  NotificationService,
  ProfileService,
  UserProfileService
} from '../_services';
import { IDropdownSettings } from "ng-multiselect-dropdown";
import { EnvService } from '../_services/env/env.service';
import { BusinessUnitService } from '../_services/businessunit.service';
import { BrandService } from '../_services/brand.service';


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
  submitted = false;
  id: string;
  hidetable: boolean = false;
  listTypeItems: ListTypeItem[];
  roleList: ListTypeItem[];
  profileRegions: FormArray;
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
  siteDropdownSettings: IDropdownSettings = {};
  isEditMode: boolean;
  isNewMode: boolean;
  siteList: any;
  isCustomer: any;
  businessUnitDropdownSettings: any;
  businessUnitList: any[];
  brandDropdownSettings: any;
  brandList: any[];
  isNewSetup: boolean;
  formData: any;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private listTypeService: ListTypeService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private userprofileService: UserProfileService,
    private DistributorService: DistributorService,
    private environment: EnvService,
    private customerService: CustomerService,
    private businessUnitService: BusinessUnitService,
    private brandService: BrandService
  ) { }

  ngOnInit() {
    this.dropdownSettings = {
      idField: 'id',
      textField: 'distregname',
    };

    this.siteDropdownSettings = {
      idField: 'id',
      textField: 'custregname',
    };

    this.businessUnitDropdownSettings = {
      idField: 'id',
      textField: 'businessUnitName',
    };

    this.brandDropdownSettings = {
      idField: 'id',
      textField: 'brandName',
    };

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

    if (this.user.isAdmin) {
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
      custSites: [],
      isdeleted: [false],
      profileRegions: this.formBuilder.array([]),
      businessUnitId: ["", Validators.required],
      brandId: ["", Validators.required],
      description: ["", Validators.required]
    });

    this.listTypeService.getById("RF").pipe(first())
      .subscribe((data: ListTypeItem[]) => {
        this.listTypeItems = data;
        this.listTypeItems = this.listTypeItems.filter(item => item.itemname !== "Contact");
      });

    this.listTypeService.getById("ROLES").pipe(first())
      .subscribe((data: ListTypeItem[]) => this.roleList = data.filter(x => x.itemCode != "RADM"));

    this.profileService.getAll().pipe(first())
      .subscribe((data: any) => this.profilelist = data.object);

    this.userprofileService.getUserAll().pipe(first())
      .subscribe((data: any) => this.userlist = data.object);

    this.businessUnitService.GetByCompanyId()
      .pipe(first()).subscribe((data: any) => this.businessUnitList = data.object)

    this.userprofileform.get("businessUnitId")
      .valueChanges
      .subscribe((values: any) => {
        if (!values) return;
        this.brandList = []
        values.map(x => {
          this.brandService.GetByBU(x.id)
            .pipe(first()).subscribe((data: any) => {
              var nBrand = [];
              var lstBrand: any[] = this.userprofileform.get("brandId").value
              this.brandList = data.object
              this.brandList.forEach(element => {
                var obj = lstBrand.find(x => x.id == element.id);
                if (obj) nBrand.push(obj);
              })
              this.userprofileform.get("brandId").setValue(nBrand);
            })
        })

      })

    this.id = this.route.snapshot.paramMap.get('id');

    this.route.queryParams.subscribe((data) => {
      this.isNewSetup = data.isNewSetUp != null && data.isNewSetUp != undefined;
    });

    if (this.id != null) {
      this.userprofileService.getById(this.id)
        .pipe(first())
        .subscribe((data: any) => {
          console.log(data);

          this.contactId = data.object.contactid;
          let role = data.object.roleId;
          this.isCustomer = data.object.userType.toLowerCase() == "customer";

          if (this.isCustomer) {
            this.userprofileform.get("custSites").setValidators([Validators.required])
            this.userprofileform.get("custSites").updateValueAndValidity();
          }

          this.customerService.getAllByConId(data.object.contactid)
            .pipe(first()).subscribe((data: any) => {
              this.siteList = data.object[0]?.sites
            })

          this.listTypeService.getById("ROLES")
            .pipe(first()).subscribe({
              next: (data: ListTypeItem[]) => {
                switch (data?.find(x => x.listTypeItemId == role)?.itemCode) {
                  case this.environment.engRoleCode:
                    this.isEng = true;
                    this.GetDistributorByContactId();
                    break;

                  case this.environment.distRoleCode:
                    this.isDist = true;
                    this.GetDistributorByContactId();
                    break;

                  case this.environment.custRoleCode:
                    this.isDist = false;
                    this.isEng = false;
                    this.userprofileform.get('distRegions').clearValidators()
                    this.userprofileform.get('distRegions').updateValueAndValidity()
                    this.userprofileform.get('businessUnitId').clearValidators()
                    this.userprofileform.get('businessUnitId').updateValueAndValidity()
                    this.userprofileform.get('brandId').clearValidators()
                    this.userprofileform.get('brandId').updateValueAndValidity()
                    break;
                }
              }
            })

          var subreq = data.object.distRegions?.split(',');
          let items: any = [];
          if (subreq != null && subreq.length > 0) {
            for (var i = 0; i < subreq.length; i++) {
              let t = { id: subreq[i] }
              items.push(t);
            }
            this.userprofileform.patchValue({ "distRegions": items });
          }

          subreq = data.object.businessUnitId?.split(',');
          items = [];
          if (subreq != null && subreq.length > 0) {
            for (var i = 0; i < subreq.length; i++) {
              let t = { id: subreq[i] }
              items.push(t);
            }
            this.userprofileform.patchValue({ "businessUnitId": items });
          }

          subreq = data.object.brandId?.split(',');
          items = [];
          if (subreq != null && subreq.length > 0) {
            for (var i = 0; i < subreq.length; i++) {
              let t = { id: subreq[i] }
              items.push(t);
            }
            this.userprofileform.patchValue({ "brandId": items });
            // this.formData.brandId = items;
          }

          subreq = data.object.custSites?.split(',');
          items = [];
          if (subreq != null && subreq.length > 0) {
            for (var i = 0; i < subreq.length; i++) {
              let t = { id: subreq[i] }
              items.push(t);
            }
            this.userprofileform.patchValue({ "custSites": items });
          }

          this.userprofileform.patchValue({ "userId": data.object.userId });
          this.userprofileform.patchValue({ "designation": data.object.designation });
          this.userprofileform.patchValue({ "profileId": data.object.profileId });
          this.userprofileform.patchValue({ "profileForId": data.object.profileForId });
          this.userprofileform.patchValue({ "distributorName": data.object.distributorName });
          this.userprofileform.patchValue({ "roleId": data.object.roleId });
          this.userprofileform.patchValue({ "isdeleted": data.object.isdeleted });
          this.userprofileform.patchValue({ "description": data.object.description });

          if (data.object.profileRegions != null) {
            this.userprofileform.patchValue({ "profileRegions": data.object.profileRegions });
            this.profilewithregdata = data.object.profileRegions;
          }

          this.onprofileClick(data.object.profileForId);

        });

      setTimeout(() => {
        this.userprofileform.enable();
        this.formData = this.userprofileform.value;
        this.userprofileform.disable();
      }, 100);
    }
    else {
      this.isNewMode = true
    }
  }

  EditMode() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.isEditMode = true;
      this.userprofileform.enable();

      this.router.navigate(
        ["."],
        {
          relativeTo: this.route,
          queryParams: {
            isNSNav: false
          },
          queryParamsHandling: 'merge', // remove to replace all query params by provided
        });
    }
  }

  Back() {
    this.router.navigate(["userprofilelist"]);
  }

  CancelEdit() {
    if (!confirm("Are you sure you want to discard changes?")) return;
    if (this.id != null) this.userprofileform.patchValue(this.formData);
    else this.userprofileform.reset();
    this.userprofileform.disable()
    this.isEditMode = false;
    this.isNewMode = false;
    this.notificationService.SetNavParam();
  }

  DeleteRecord() {
    if (confirm("Are you sure you want to delete the record?")) {

      this.userprofileService.delete(this.id).pipe(first())
        .subscribe((data: any) => {
          if (data.result)
            this.router.navigate(["userprofilelist"], {
              //relativeTo: this.activeRoute,
              queryParams: { isNSNav: true },
              //queryParamsHandling: 'merge'
            })
        })
    }
  }

  onRoleChange(role: string) {
    this.listTypeService.getById("ROLES")
      .pipe(first())
      .subscribe((data: ListTypeItem[]) => {
        switch (data?.find(x => x.listTypeItemId == role)?.itemCode) {
          case this.environment.engRoleCode:
            this.isEng = true;
            this.GetDistributorByContactId();
            break;

          case this.environment.distRoleCode:
            this.isDist = true;
            this.GetDistributorByContactId();
            break;

          case this.environment.custRoleCode:
            this.isDist = false;
            this.isEng = false;
            this.userprofileform.get('distRegions').clearValidators()
            this.userprofileform.get('distRegions').updateValueAndValidity()
            this.userprofileform.get('businessUnitId').clearValidators()
            this.userprofileform.get('businessUnitId').updateValueAndValidity()
            this.userprofileform.get('brandId').clearValidators()
            this.userprofileform.get('brandId').updateValueAndValidity()
            break;
        }
      })
  }

  GetDistributorByContactId() {
    this.DistributorService.getByConId(this.contactId)
      .pipe(first())
      .subscribe((data: any) => {
        if (data.result)
          this.regionList = data.object[0]?.regions;
      })
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
      profileRegionId: ''
    });
  }

  addItem(value: any): void {
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

  onprofileClick(value: any) {
    let frmArray = this.userprofileform.get('profileRegions') as FormArray;
    frmArray.clear();
  }

  onUserChange(value: any) {
    this.contactId = this.userlist.filter(x => x.userid === value)[0].contactid;
    this.customerService.getAllByConId(this.contactId)
      .pipe(first()).subscribe((data: any) => {
        if (data.object.length > 0) this.siteList = data.object[0].sites
        else this.siteList = []

        this.GetDistributorByContactId();
        this.userprofileService.getByUserId(this.contactId)
          .pipe(first()).subscribe((data: any) => {
            this.isCustomer = data.object?.userType.toLowerCase() == "customer";
            if (this.isCustomer) {
              this.userprofileform.get("custSites").setValidators([Validators.required])
              this.userprofileform.get("custSites").updateValueAndValidity();
            }
            this.userprofileform.controls['designation'].setValue(data.object.designation);
            this.userprofileform.controls['distributorName'].setValue(data.object.distCustName);
            this.contactId = data.object.contactid;
          })
      });
  }

  onSubmit() {
    //debugger;
    this.submitted = true;
    this.userprofileform.markAllAsTouched()
    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.userprofileform.invalid) {
      return;
    }

    this.userprofile = this.userprofileform.value;

    if (this.userprofileform.get('distRegions').value?.length > 0) {
      var selectarray = this.userprofileform.get('distRegions').value;
      this.userprofile.distRegions = selectarray.map(x => x.id).join(',');
    }

    if (this.userprofileform.get('businessUnitId').value?.length > 0) {
      var selectarray = this.userprofileform.get('businessUnitId').value;
      this.userprofile.businessUnitId = selectarray.map(x => x.id).join(',');
    }

    if (this.userprofileform.get('brandId').value?.length > 0) {
      var selectarray = this.userprofileform.get('brandId').value;
      this.userprofile.brandId = selectarray.map(x => x.id).join(',');
    }

    if (this.userprofileform.get('custSites').value?.length > 0) {
      var selectarray = this.userprofileform.get('custSites').value;
      this.userprofile.custSites = selectarray.map(x => x.id).join(',');
    }

    if (this.id == null) {
      this.userprofileService.save(this.userprofile)
        .pipe(first())
        .subscribe((data: any) => {
          if (data.result) {
            this.notificationService.showSuccess(data.resultMessage, "Success");
            // if (this.isNewSetup) {
            //   this.notificationService.showInfo("New CIM Setup completed", "Setup Completed");
            //   this.router.navigate(['/']);
            // }
            // else
            this.router.navigate(["userprofilelist"],
              {
                //relativeTo: this.activeRoute,
                queryParams: { isNSNav: true },
                //queryParamsHandling: 'merge'
              });
          }
        });
    }
    else {
      this.userprofile.id = this.id;
      this.userprofileService.update(this.id, this.userprofile)
        .pipe(first())
        .subscribe((data: any) => {
          if (data.result) {
            this.notificationService.showSuccess(data.resultMessage, "Success");
            this.router.navigate(["userprofilelist"],
              {
                //relativeTo: this.activeRoute,
                queryParams: { isNSNav: true },
                //queryParamsHandling: 'merge'
              });
          }
        });
    }
  }

}
