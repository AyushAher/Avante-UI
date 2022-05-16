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
  isEditMode: boolean;
  isNewMode: boolean;

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


    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id != null) {
      this.profileService.getById(this.id)
        .pipe(first())
        .subscribe((data: any) => {
          this.listTypeItems = data.object.permissions

          data.object.permissions.forEach(element => {
            element.itemCode = element.screenCode
          });

          this.addItem(data.object.permissions)
          this.profileform.patchValue(data.object);
        });

      setTimeout(() => this.profileform.disable(), 500);
    }
    else {
      this.isNewMode = true
      this.profileService.GetAllScreens()
        .pipe(first())
        .subscribe((data: any) => {
          this.listTypeItems = data.object;
          data.object.sort((a, b) => {
            var value = 0
            a.categoryName < b.categoryName ? value = -1 : a.categoryName > b.categoryName ? value = 1 : value = 0;
            return value;
          });
          this.addItem(this.listTypeItems);
        });
    }
  }


  EditMode() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.isEditMode = true;
      this.profileform.enable();
    }
  }

  Back() {

    if ((this.isEditMode || this.isNewMode)) {
      if (confirm("Are you sure want to go back? All unsaved changes will be lost!"))
        this.router.navigate(["profilelist"])
    }

    else this.router.navigate(["profilelist"])

  }

  CancelEdit() {
    this.profileform.disable();
    this.isEditMode = false;
    this.isNewMode = false;
  }

  DeleteRecord() {
    if (confirm("Are you sure you want to edit the record?")) {

      this.profileService.delete(this.id).pipe(first())
        .subscribe((data: any) => {
          if (data.result)
            this.router.navigate(["profilelist"])
        })
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
      commercial: "",
      screenCode: ""
    });
  }

  addItem(value: any): void {
    //debugger;
    for (let i = 0; i < value.length; i++) {
      this.listT = value[i];

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
        delete: this.listT.delete == undefined || this.listT.delete == null ? false : this.listT.delete,
        commercial: this.listT.commercial == undefined || this.listT.commercial == null ? false : this.listT.commercial,
      }));
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.profileform.controls; }
  get c() { return this.profileform.controls.Permissions; }
  getScreenCode(i) {
    return this.getName(i).screenCode
  }
  getName(i) {
    return this.getControls()[i].value;
  }

  getControls() {
    return (<FormArray>this.profileform.get('permissions')).controls;
  }

  SelectAll(property: string) {
    let permission = this.profileform.get('permissions') as FormArray;

    if (property == "commercial") {
      for (let i of permission.controls) {
        if (i.value.screenCode == "SINST" || i.value.screenCode == "OFREQ" || i.value.screenCode == "AMC")
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

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.profileform.invalid) return;

    this.isSave = true;
    this.loading = true;
    this.profile = this.profileform.value;


    if (this.id == null) {
      this.profileService.save(this.profile)
        .pipe(first())
        .subscribe((data: any) => {
          //debugger;
          if (data.result) {
            this.notificationService.showSuccess(data.resultMessage, "Success");
            this.router.navigate(["profilelist"]);
          }
          this.loading = false;
        });
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
          this.loading = false;
        });
    }
  }

}
