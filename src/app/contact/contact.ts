import { Component, OnInit } from '@angular/core';

import { User, Contact, Country, ListTypeItem, ProfileReadOnly, CustomerSite } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { first } from 'rxjs/operators';

import {
  AccountService, AlertService, ContactService, CountryService, ListTypeService, DistributorService, ProfileService,
  NotificationService, CustomerSiteService
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
    private customersiteService: CustomerSiteService
  ) { }

  ngOnInit() {

    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;

    this.contactform = this.formBuilder.group({
      fname: ['', [Validators.required, Validators.maxLength(512)]],
      lname: ['', [Validators.required, Validators.maxLength(512)]],
      mname: [''],
      pcontactno: [''],
      pemail: ['', [Validators.required, Validators.pattern("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$")]],
      scontactno: [''],
      semail: ['', [Validators.required, Validators.pattern("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$")]],
      designationid: ['', [Validators.required, Validators.maxLength(512)]],
      isActive: [true],
      isdeleted: [false],
      whatsappNo:[''],

      address: this.formBuilder.group({
        street: ['', Validators.required],
        area: ['', Validators.required],
        place: ['', Validators.required],
        city: ['', Validators.required],
        countryid: ['', Validators.required],
        zip: ['', Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(10)])],
        geolat: ['', Validators.required],
        geolong: ['', Validators.required],
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



    if (this.user.username == "admin") {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
      this.hasUpdateAccess = true;
      this.hasReadAccess = true;
    }

    console.log(this.id);
    console.log(this.type);


    this.countryService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.countries = data.object;
        },
        error: error => {
          // this.alertService.error(error);
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });

    this.listTypeService.getById(this.code)
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.listTypeItems = data;
        },
        error: error => {
          // this.alertService.error(error);
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });

    if (this.type == "CS") {
      //debugger;
      this.customersiteService.getById(this.masterId)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.contactform.patchValue({ address: data.object.address });
          },
          error: error => {
            // this.alertService.error(error);
            this.notificationService.showError(error, "Error");
            this.loading = false;
          }
        });
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
            this.contactform.patchValue(data.object);
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
          error: error => {
            //this.alertService.error(error);
            this.notificationService.showError(error, "Error");
            this.loading = false;
          }
        });
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.contactform.controls; }
  get a() { return this.contactform.controls.address }

  addUser() {
    //debugger;
    this.user = new User;
    this.contactmodel = this.contactform.value;
    this.user.firstName = this.contactmodel.fname,
      this.user.lastName = this.contactmodel.lname,
      this.user.email = this.contactmodel.pemail,
      this.user.contactid = this.id
    this.user.username = this.contactmodel.fname + this.contactmodel.lname;
    this.accountService.register(this.user)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          if (data.result) {
            this.notificationService.showSuccess(data.resultMessage, "Success");
          }
          else {
            this.notificationService.showError(data.resultMessage, "Error");
          }
          // this.notificationService.showSuccess("User Added successful", "Success");
        },
        error: error => {
          //  this.alertService.error(error);
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });
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
    //debugger;
    this.inputObj = obj;
    if (this.pcontactNumber) {
      obj.setNumber(this.pcontactNumber);
    }
  }

  countryChange(country: any) {
    //debugger;
    this.countryCode = country.dialCode;
  //  this.setValue();
  }

  countryChange2(country: any) {
    //debugger;
    this.country2Code = country.dialCode;
    //  this.setValue();
  }

  countryChange2w(country: any) {
    //debugger;
    this.country2Codew = country.dialCode;
    //  this.setValue();
  }

  getNumber(e: any) {
    //debugger;
  }



  onSubmit() {
    //debugger;
    this.submitted = true;
    //this.id = this.route.snapshot.paramMap.get('cid');
    //this.type = this.route.snapshot.paramMap.get('type');
    console.log(this.id);
    console.log(this.type);
    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.contactform.invalid) {
      return;
    }
    // this.isSave = true;
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
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            //debugger;
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
            }
            else {
              this.notificationService.showError(data.resultMessage, "Error");
            }
            // this.alertService.success('Data save successfull');
            //  this.notificationService.showSuccess("Data Save Successful", "Success");
            // console.log(data);
            this.contact.id = data.id;
            this.loading = false;
            this.back();
            //if (this.type == "D") {
            //  this.router.navigate(["/customerlist", this.id]);
            //}
            //else if (this.type == "DR") {
            //  this.router.navigate(["/customerlist", this.id]);
            //}
            //else if (this.type == "C") {
            //  this.router.navigate(["/customerlist", this.id]);
            //}
            //else if (this.type == "CS") {
            //  this.router.navigate(["/customerlist", this.id]);
            //}
            //this.router.navigate(['../login'], { relativeTo: this.route });
          },
          error: error => {
            // this.alertService.error(error);
            this.notificationService.showError(error, "Error");
            this.loading = false;
          }
        });
    }
    else {
      this.contact.id = this.id;
      this.contactService.update(this.id, this.contact)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            //debugger;
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.back();
            }
            else {
              this.notificationService.showError(data.resultMessage, "Error");
            }

            this.contact.id = data.id;
            this.loading = false;
          },
          error: error => {
            // this.alertService.error(error);
            this.notificationService.showError(error, "Error");
            this.loading = false;
          }
        });
    }
  }

  back() {


    if (this.type == "D") {
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
