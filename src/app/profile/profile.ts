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
  listTypeItems: any;
  config: instrumentConfig;
  sparePartDetails: SparePart[];
  selectedConfigType: string[] = [];
  imagePath: string;
  instuType: ListTypeItem[];
  permissions: FormArray;
  listT: any;
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  isCopy: boolean = false;
  isEditMode: boolean;
  isNewMode: boolean;
  privilagesList: any[];
  screensList: any[];
  lstScreens: any[] = [];
  lstCategory: any[];
  isNewSetup: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private listTypeService: ListTypeService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
  ) {
    notificationService.listen().subscribe((m) => {
      this.GetById();
    })

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

    if (this.user.isAdmin) {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
      this.hasUpdateAccess = true;
      this.hasReadAccess = true;
    }


    this.profileform = this.formBuilder.group({
      profilename: ['', Validators.required],
      description: ['', Validators.required],
      permissions: this.formBuilder.array([]),
      isactive: [true],
      isdeleted: [false],
      screenId: [],
      categoryId: [],
      create: false,
      read: false,
      update: false,
      delete: false,
      commercial: false,
      privilages: [""],
    });


    this.id = this.route.snapshot.paramMap.get('id');

    this.route.queryParams.subscribe((data) => {
      this.isNewSetup = data.isNewSetUp != null && data.isNewSetUp != undefined;
    });

    this.listTypeService.getById("PVGLS")
      .pipe(first()).subscribe((data: any) => this.privilagesList = data)

    this.listTypeService.getById("PRGRP")
      .pipe(first()).subscribe((data: any) => this.lstCategory = data)


    this.profileService.GetAllScreens()
      .pipe(first())
      .subscribe((data: any) => {

        data.object.sort((a, b) => {
          var value = 0
          a.categoryName < b.categoryName ? value = -1 : a.categoryName > b.categoryName ? value = 1 : value = 0;
          return value;
        });

        this.screensList = data.object;

        if (this.id != null) {
          this.GetById();
          setTimeout(() => this.profileform.disable(), 500);
        }
        else {
          this.isNewMode = true
        }
      });
  }


  EditMode() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.isEditMode = true;
      this.profileform.enable();

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

    if ((this.isEditMode || this.isNewMode)) {
      if (confirm("Are you sure want to go back? All unsaved changes will be lost!"))
        this.router.navigate(["profilelist"])
    }
    else this.router.navigate(["profilelist"])

  }
  GetById() {

    this.profileService.getById(this.id)
      .pipe(first())
      .subscribe((profileData: any) => {
        this.profileform.get("profilename").setValue(profileData.object.profilename)
        this.profileform.get("description").setValue(profileData.object.description)
        profileData.object.permissions.forEach(x => {
          this.profileform.get("categoryId").setValue(x.category)
          this.onCategoryChange()
          this.profileform.get("screenId").setValue(x.screenId)
          this.profileform.get("create").setValue(x.create)
          this.profileform.get("read").setValue(x.read)
          this.profileform.get("update").setValue(x.update)
          this.profileform.get("delete").setValue(x.delete)
          this.profileform.get("commercial").setValue(x.commercial)
          this.profileform.get("privilages").setValue(x.privilages)
          if (!this.isCopy) {
            this.AddScreen(x.id)
          }
        });
      });
  }

  CancelEdit() {
    this.profileform.disable();
    this.isEditMode = false;
    this.isNewMode = false;
  }

  DeleteRecord() {
    if (confirm("Are you sure you want to delete the record?")) {
      this.profileService.delete(this.id).pipe(first())
        .subscribe((data: any) => {
          if (data.result) {
            this.notificationService.showSuccess("Record deleted successfully", "Success");
            this.router.navigate(["profilelist"])
          }
          else {
            this.notificationService.showInfo(data.resultMessage, "Info");
          }
        })
    }
  }

  CopyRecord() {
    this.isCopy = true;
    this.GetById();
    this.id = null;
  }

  onCategoryChange() {
    let categoryId = this.profileform.get("categoryId").value;
    this.lstScreens = this.screensList.filter(x => x.category == categoryId)
    setTimeout(() => this.profileform.get("screenId").reset(), 500);
  }

  addItem(): void {
    this.listT = this.listTypeItems;

    this.permissions = this.profileform.get('permissions') as FormArray;
    this.permissions.push(this.formBuilder.group({
      id: this.listT.id == undefined || this.listT.id == null ? '' : this.listT.id,
      screenId: this.listT.listTypeItemId,
      screenName: this.listT.itemname,
      create: this.listT.create == undefined || this.listT.create == null ? false : this.listT.create,
      screenCode: this.listT.itemCode,
      read: this.listT.read == undefined || this.listT.read == null ? false : this.listT.read,
      categoryName: this.listT.categoryName,
      update: this.listT.update == undefined || this.listT.update == null ? false : this.listT.update,
      privilages: this.listT.privilages,
      delete: this.listT.delete == undefined || this.listT.delete == null ? false : this.listT.delete,
      commercial: this.listT.commercial == undefined || this.listT.commercial == null ? false : this.listT.commercial,
    }));

  }

  // convenience getter for easy access to form fields
  get f() { return this.profileform.controls; }
  get c() { return this.profileform.controls.Permissions; }

  getScreenCode() {
    let code = "";
    if (this.lstScreens.length > 0) code = this.lstScreens.find(x => x.listTypeItemId == this.profileform.get("screenId").value)?.itemCode;
    return code
  }
  getName(i) {
    return this.getControls()[i].value;
  }

  screenCode(i) {
    return this.getName(i).screenCode
  }

  AddScreen(id: string = "") {
    debugger
    let screnId = this.profileform.get("screenId")
    if (!screnId.value) return this.notificationService.showInfo("Select Screen", "Info");

    let array = (<FormArray>this.profileform.get("permissions")).value.findIndex(x => x.screenId == screnId.value)
    if (array != -1) return this.notificationService.showInfo("This Screen Already Exists!", "Info");

    let fcreate = this.profileform.get("create")
    let fread = this.profileform.get("read")
    let fdelete = this.profileform.get("delete")
    let fupdate = this.profileform.get("update")
    let fcommercial = this.profileform.get("commercial")
    let screen = this.lstScreens.find(x => x.listTypeItemId == screnId.value);
    let privilages = this.profileform.get("privilages");
    if (!privilages.value) return this.notificationService.showInfo("Select privilege", "Info");

    let obj = {
      id,
      listTypeItemId: screen?.listTypeItemId,
      itemname: screen?.itemname,
      itemCode: screen?.itemCode,
      categoryName: screen?.categoryName,
      privilages: privilages.value,
      create: fcreate.value,
      read: fread.value,
      delete: fdelete.value,
      update: fupdate.value,
      commercial: fcommercial.value,
    }

    this.profileform.get("categoryId").reset();
    screnId.reset();
    privilages.reset();
    fcreate.reset();
    fread.reset();
    fdelete.reset();
    fupdate.reset();
    fcommercial.reset();
    this.lstScreens = [];
    this.listTypeItems = obj
    this.addItem()
  }

  DeleteScreen(index) {
    (<FormArray>this.profileform.get("permissions")).removeAt(index);
  }
  getControls() {
    return (<FormArray>this.profileform.get('permissions')).controls;
  }

  SelectAll(property: string) {
    let permission = this.profileform.get('permissions') as FormArray;

    if (property == "commercial") {
      for (let i of permission.controls) {
        if (i.value.screenCode == "SINST" || i.value.screenCode == "OFREQ" || i.value.screenCode == "SAMC")
          i.get(property).setValue(!i.get(property).value)
      }
      return
    }


    let inp = document.getElementById('selectall' + property) as HTMLInputElement;

    for (var i of permission.controls) {
      inp.checked ? i.get(property).setValue(true) : i.get(property).setValue(false);
    }
  }

  onSubmit() {
    //debugger;
    this.submitted = true;
    this.profileform.markAllAsTouched();
    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.profileform.invalid) return;

    this.isSave = true;
    this.loading = true;
    this.profile = this.profileform.value;

    if (this.id == null) {
      let ppermissions = this.profileform.get('permissions') as FormArray;
      if (ppermissions.length <= 0) {
        this.notificationService.showInfo("Please add screen with permissions to proceed further.", "Info");
      }
      else {
        this.profileService.save(this.profile)
          .pipe(first())
          .subscribe((data: any) => {
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              if (!this.isNewSetup) this.router.navigate(["profilelist"]);
              else this.router.navigate(['userprofile'], { queryParams: { isNewSetUp: true } });
            }
            else {
              this.notificationService.showInfo(data.resultMessage, "Info");
            }
            this.loading = false;
            this.isCopy = false;
          });
      }
    }
    else {
      this.profile.id = this.id;
      this.profileService.update(this.id, this.profile)
        .pipe(first())
        .subscribe((data: ResultMsg) => {
          if (data.result) {
            this.notificationService.showSuccess(data.resultMessage, "Success");
            this.router.navigate(["profilelist"]);
          }
          else {
            this.notificationService.showInfo(data.resultMessage, "Info");
          }
          this.loading = false;
        });
    }
  }

}
