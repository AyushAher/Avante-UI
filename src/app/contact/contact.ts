import { Component, OnInit } from '@angular/core';

import { User, Contact, Country, ListTypeItem, ProfileReadOnly, CustomerSite } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { first } from 'rxjs/operators';

import {
  AccountService, AlertService, ContactService, CountryService, ListTypeService, DistributorService, ProfileService,
  NotificationService, CustomerSiteService, DistributorRegionService, CustomerService
} from '../_services';
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';



@Component({
  selector: 'app-contact',
  templateUrl: './contact.html',
})
export class ContactComponent implements OnInit {
  user: User;
  contactform: FormGroup;
  contact: Contact;
  loading = false;
  submitted = false;
  isSave = false;
  type: string;
  id: string;
  countries: Country[];
  code: string = "DESIG";
  listTypeItems: ListTypeItem[];
  masterId: string;
  detailId: string;
  contactmodel: Contact;
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  countryCode: string = "";
  inputObj: any;
  inputObj2: any;
  country2Code: string = "";
  pcontactNumber: any;
  inputObj2w: any;
  country2Codew: string = "";
  @ViewChild('phoneInput')
  phoneInput: ElementRef;
  public designations: any[] = [{ key: "1", value: "Ashish" }, { key: "2", value: "CEO" }];
  isEditMode: any;
  isNewMode: any;
  isUser: boolean;
  isNewSetup: boolean;
  formData: { [key: string]: any; };

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private contactService: ContactService,
    private alertService: AlertService,
    private countryService: CountryService,
    private listTypeService: ListTypeService,
    private distributorService: DistributorService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private customersiteService: CustomerSiteService,
    private distRegions: DistributorRegionService,
    private customerService: CustomerService
  ) { }

  ngOnInit() {

    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;

    this.contactform = this.formBuilder.group({
      parentEntity: [""],
      fname: ['', [Validators.required, Validators.maxLength(512)]],
      lname: ['', [Validators.required, Validators.maxLength(512)]],
      mname: [''],
      pcontactno: [''],
      pemail: ['', [Validators.required, Validators.pattern("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$")]],
      scontactno: [''],
      semail: ['', [Validators.pattern("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$")]],
      designationid: ['', [Validators.required, Validators.maxLength(512)]],
      isActive: [true],
      isdeleted: [false],
      whatsappNo: [''],

      address: this.formBuilder.group({
        street: ['', Validators.required],
        area: ['', Validators.required],
        place: ['', Validators.required],
        city: ['', Validators.required],
        countryid: ['', Validators.required],
        zip: ['', Validators.compose([Validators.minLength(4), Validators.maxLength(15)])],
        geolat: [''],
        geolong: [''],
        isActive: [true],
      }),
      contactMapping: this.formBuilder.group({
        mappedFor: null,
        parentId: null,
      }),
    });

    this.id = this.route.snapshot.paramMap.get('cid');
    this.masterId = this.route.snapshot.paramMap.get('id');
    this.type = this.route.snapshot.paramMap.get('type');

    this.route.queryParams.subscribe((data) => {
      this.isNewSetup = data.isNewSetUp != null && data.isNewSetUp != undefined;
    });


    if (this.type == "DR" || this.type == "CS") {
      this.masterId = this.route.snapshot.paramMap.get('cid');
      this.detailId = this.route.snapshot.paramMap.get('id');
      this.id = this.route.snapshot.paramMap.get('did');;
    }
    if (this.profilePermission != null) {
      if (this.type == "DR" || this.type == "D") {
        let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SDIST");
        if (profilePermission.length > 0) {
          this.hasReadAccess = profilePermission[0].read;
          this.hasAddAccess = profilePermission[0].create;
          this.hasDeleteAccess = profilePermission[0].delete;
          this.hasUpdateAccess = profilePermission[0].update;
        }
      }

      if (this.type == "C" || this.type == "CS") {
        let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SCUST");
        if (profilePermission.length > 0) {
          this.hasReadAccess = profilePermission[0].read;
          this.hasAddAccess = profilePermission[0].create;
          this.hasDeleteAccess = profilePermission[0].delete;
          this.hasUpdateAccess = profilePermission[0].update;
        }
      }
    }


    switch (this.type) {
      case "C":
        this.customerService.getById(this.masterId)
          .subscribe((data: any) => {
            if (!data.result || data.object == null) return;
            this.contactform.get('parentEntity').setValue(data.object.custname);
          });
        break;
      case "CS":
        this.customersiteService.getById(this.masterId)
          .subscribe((data: any) => {
            if (!data.result || data.object == null) return;
            this.contactform.get('parentEntity').setValue(data.object.custregname);
          });
        break;
      case "D":
        this.distributorService.getById(this.masterId)
          .subscribe((data: any) => {
            console.log(data);
            if (!data.result || data.object == null) return;
            this.contactform.get('parentEntity').setValue(data.object.distname);
          });
        break;

      case "DR":
        this.distRegions.getById(this.masterId)
          .subscribe((data: any) => {
            console.log(data);
            if (!data.result || data.object == null) return;
            this.contactform.get('parentEntity').setValue(data.object.distregname);
          });
        break;

    }


    if (this.user.username == "admin") {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
      this.hasUpdateAccess = true;
      this.hasReadAccess = true;
    }


    this.countryService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.countries = data.object;
        },
      });

    this.listTypeService.getById(this.code)
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.listTypeItems = data;
        },
      });

    if (this.type == "CS") {
      //debugger;
      this.customersiteService.getById(this.masterId)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.contactform.patchValue({ address: data.object.address });
          },
        });
    } else if (this.type === "D") {
      this.distributorService.getById(this.masterId).pipe(first())
        .subscribe((data: any) => {
          this.contactform.patchValue({ address: data.object.address });
        })
    } else if (this.type === "DR") {
      this.distRegions.getById(this.masterId).pipe(first())
        .subscribe((data: any) => {
          this.contactform.patchValue({ address: data.object.address });
        })
    } else if (this.type === "C") {
      this.customerService.getById(this.masterId).pipe(first())
        .subscribe((data: any) => {
          this.contactform.patchValue({ address: data.object.address });
        })
    }

    if (this.id != null) {
      this.hasAddAccess = false;
      if (this.user.username == "admin") {
        this.hasAddAccess = true;
      }


      this.contactService.getById(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.isUser = data.object.isUser
            this.formData = data.object;
            this.contactform.patchValue(this.formData);
            //this.pcontactNumber = data.object.pcontactno;
            if (this.inputObj) {
              this.inputObj.setNumber(data.object.pcontactno);
            }
            if (this.inputObj2) {
              this.inputObj2.setNumber(data.object.scontactno);
            }
            if (this.inputObj2w) {
              this.inputObj2w.setNumber(data.object.whatsappNo);
            }

          },
        });
      this.contactform.disable()
    } else this.isNewMode = true
  }

  EditMode() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.isEditMode = true;
      this.contactform.enable();
    }
  }

  Back() {

    if ((this.isEditMode || this.isNewMode)) {
      if (confirm("Are you sure want to go back? All unsaved changes will be lost!"))
        this.back()
    }

    else this.back()
  }

  CancelEdit() {
    if (!confirm("Are you sure you want to discard changes?")) return;
    if (this.id != null) this.contactform.patchValue(this.formData);
    else this.contactform.reset();
    this.contactform.disable()
    this.isEditMode = false;
    this.isNewMode = false;
  }

  DeleteRecord() {
    if (confirm("Are you sure you want to delete the record?")) {
      this.contactService.delete(this.id).pipe(first())
        .subscribe((data: any) => {
          if (data.result) {
            this.notificationService.showSuccess("Record deleted successfully", "Success");
            this.back();
          }
          else {
            this.notificationService.showInfo(data.resultMessage, "Info");
          }
        })
    }
  }

  ToggleDropdown(id: string) {
    document.getElementById(id).classList.toggle("show")
  }

  get f() {
    return this.contactform.controls;
  }

  get a() {
    var controls: any = (this.contactform.controls.address);
    return controls.controls;
  }

  addUser(contactId = this.id) {
    this.user = new User;
    this.contactmodel = this.contactform.value;
    this.user.firstName = this.contactmodel.fname,
      this.user.lastName = this.contactmodel.lname,
      this.user.email = this.contactmodel.pemail,
      this.user.contactid = this.id,
      this.user.userType = this.type

    this.user.username = this.contactmodel.fname + this.contactmodel.lname;

    this.accountService.register(this.user).subscribe((data: any) => {
      if (data.result) this.notificationService.showSuccess(data.resultMessage, "Success");
      else this.notificationService.showInfo(data.resultMessage, "Info")
    })
  }


  telInputObjectCo(obj) {
    this.inputObj2 = obj;
    if (this.pcontactNumber) {
      obj.setNumber(this.pcontactNumber);
    }
  }

  telInputObjectCow(obj) {
    this.inputObj2w = obj;
    if (this.pcontactNumber) {
      obj.setNumber(this.pcontactNumber);
    }
  }

  telInputObject(obj) {
    this.inputObj = obj;
    if (this.pcontactNumber) {
      obj.setNumber(this.pcontactNumber);
    }
  }

  countryChange(country: any) {
    this.countryCode = country.dialCode;
  }

  countryChange2(country: any) {
    this.country2Code = country.dialCode;
  }

  countryChange2w(country: any) {
    this.country2Codew = country.dialCode;
  }

  getNumber(e: any) {
  }

  async onSubmit(back = false, createUser = false) {
    this.contactform.markAllAsTouched()
    this.alertService.clear();

    // stop here if form is invalid
    if (this.contactform.invalid) {
      return;
    }

    this.loading = true;

    this.contact = this.contactform.value;

    if (this.contact.pcontactno != null) {
      if (!this.contact.pcontactno.includes("+")) {
        this.contact.pcontactno = '+' + this.countryCode + this.contact.pcontactno;
      }
    }

    if (this.contact.scontactno != null) {
      if (!this.contact.scontactno.includes("+")) {
        this.contact.scontactno = '+' + this.country2Code + this.contact.scontactno;
      }
    }

    if (this.contact.whatsappNo != null) {
      if (!this.contact.whatsappNo.includes("+")) {
        this.contact.whatsappNo = '+' + this.country2Codew + this.contact.whatsappNo;
      }
    }

    this.contact.address.zip = String(this.contact.address.zip);
    this.contact.address.geolat = String(this.contact.address.geolat);
    this.contact.address.geolong = String(this.contact.address.geolong);


    if (this.type == "D") {
      this.contact.contactMapping.mappedFor = "DIST";
    }
    else if (this.type == "DR") {
      this.id = this.route.snapshot.paramMap.get('did');
      this.contact.contactMapping.mappedFor = "REG";
    }
    else if (this.type == "C") {
      this.contact.contactMapping.mappedFor = "CUST";
    }
    else if (this.type == "CS") {
      this.id = this.route.snapshot.paramMap.get('did');
      this.contact.contactMapping.mappedFor = "SITE";
    }

    this.contact.contactMapping.parentId = this.masterId;

    if (this.id == null) {
      this.contactService.save(this.contact)
        .subscribe((data: any) => {
          if (data.result) {
            this.id = data.object.id;
            if (this.isNewSetup || createUser) this.addUser(data.object.id);

            this.notificationService.showSuccess(data.resultMessage, "Success");
            this.contact.id = data.id;
            this.loading = false;
            if (back) this.back();
          }
          else {
            this.notificationService.showInfo(data.resultMessage, "Info");
          }
        })
    }
    else {
      this.contact.id = this.id;
      this.contactService.update(this.id, this.contact).subscribe((data: any) => {
        if (data.result) {
          if (createUser) this.addUser(this.id);
          this.notificationService.showSuccess(data.resultMessage, "Success");
          if (back) this.back();
        }

        this.contact.id = data.id;
        this.loading = false;
      })
    }
  }

  back() {
    if (this.isNewSetup) {
      this.router.navigate(['distributorregion', this.masterId], {
        queryParams: {
          isNewSetUp: true
        }
      });
    }
    else if (this.type == "D") {
      this.router.navigate(['contactlist', this.type, this.masterId]);
    }
    else if (this.type == "DR") {
      this.router.navigate(['contactlist', this.type, this.detailId, this.masterId]);
    }
    else if (this.type == "C") {
      this.router.navigate(['contactlist', this.type, this.masterId]);
    }
    else if (this.type == "CS") {
      this.router.navigate(['contactlist', this.type, this.detailId, this.masterId]);
    }
  }
}
