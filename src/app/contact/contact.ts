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
  isNewParentMode: boolean;
  parentEntity: any
  label;
  creatingNewDistributor: boolean;
  distCustName;

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
      distCustName: [""],
      fname: ['', [Validators.required, Validators.maxLength(512)]],
      lname: ['', [Validators.required, Validators.maxLength(512)]],
      mname: ['', [Validators.required]],
      pcontactno: ['', Validators.required],
      pemail: ['', [Validators.required, Validators.pattern("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$")]],
      scontactno: ['', Validators.required],
      semail: ['', [Validators.pattern("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$"), Validators.required]],
      designationid: ['', [Validators.required, Validators.maxLength(512)]],
      isActive: [true],
      isdeleted: [false],
      whatsappNo: ['', Validators.required],

      address: this.formBuilder.group({
        street: ['', Validators.required],
        area: [''],
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
      this.isNewSetup = data.isNewSetUp != null && data.isNewSetUp != undefined && data.isNewSetUp == "true";
      this.isNewParentMode = data.isNewMode != null && data.isNewMode != undefined && data.isNewMode == "true";
      this.creatingNewDistributor = data.creatingNewDistributor != null && data.creatingNewDistributor != undefined && data.creatingNewDistributor == "true";
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

    if (!this.isNewParentMode && !this.isNewSetup) {
      switch (this.type) {
        case "C":
          this.label = "Customer"
          this.customerService.getById(this.masterId)
            .subscribe((data: any) => {
              if (!data.result || data.object == null) return;
              this.contactform.get('parentEntity').setValue(data.object.custname);
            });
          break;
        case "CS":
          this.label = "Customer Site"
          this.customersiteService.getById(this.masterId)
            .subscribe((data: any) => {
              if (!data.result || data.object == null) return;
              this.contactform.get('parentEntity').setValue(data.object.custregname);

              this.distCustName = "Customer";
              this.customerService.getById(data.object.custid)
                .subscribe((data: any) => {
                  if (!data.result || data.object == null) return;
                  this.contactform.get('distCustName').setValue(data.object.custname);
                });
            });
          break;
        case "D":
          this.label = "Distributor"
          this.distributorService.getById(this.masterId)
            .subscribe((data: any) => {
              if (!data.result || data.object == null) return;
              this.contactform.get('parentEntity').setValue(data.object.distname);
            });
          break;

        case "DR":
          this.label = "Distributor Region"
          this.distRegions.getById(this.masterId)
            .subscribe((data: any) => {
              if (!data.result || data.object == null) return;
              this.contactform.get('parentEntity').setValue(data.object.distregname);

              this.distributorService.getById(data.object.distid)
                .subscribe((data: any) => {
                  if (!data.result || data.object == null) return;
                  this.distCustName = "Principal Distributor";
                  this.contactform.get('distCustName').setValue(data.object.distname);
                })
            });
          break;

      }
    }
    else {
      switch (this.type) {
        case "C":
          this.label = "Customer"
          this.parentEntity = JSON.parse(sessionStorage.getItem('customer'))
          this.contactform.get('parentEntity').setValue(this.parentEntity.custname);
          break;
        case "CS":
          this.label = "Customer Site"

          this.parentEntity = JSON.parse(sessionStorage.getItem('customer'))
          if (!this.parentEntity) {
            this.customerService.getById(this.detailId).subscribe((data: any) => {
              if (data.result && data.object) {
                this.parentEntity = data.object;
                this.contactform.get('distCustName').setValue(this.parentEntity?.custname);
                this.distCustName = "Customer";
              }
            })
          }

          this.contactform.get('distCustName').setValue(this.parentEntity?.custname);
          this.distCustName = "Customer";

          this.parentEntity = JSON.parse(sessionStorage.getItem('site'))
          this.contactform.get('parentEntity').setValue(this.parentEntity.custregname);
          break;
        case "D":
          this.label = "Principal Distributor"
          this.parentEntity = JSON.parse(sessionStorage.getItem('distributor'));
          this.contactform.get('parentEntity').setValue(this.parentEntity.distname);
          break;

        case "DR":
          this.label = "Distributor Region"
          this.parentEntity = JSON.parse(sessionStorage.getItem('distributor'));
          if (!this.parentEntity) {
            this.distributorService.getById(this.detailId).subscribe((data: any) => {
              if (data.result && data.object) {
                this.parentEntity = data.object;
                this.distCustName = "Principal Distributor";
                this.contactform.get('distCustName').setValue(this.parentEntity.distname);
              }
            })
          }
          else {
            this.distCustName = "Principal Distributor";
            this.contactform.get('distCustName').setValue(this.parentEntity.distname);
          }

          this.parentEntity = JSON.parse(sessionStorage.getItem('distributorRegion'))
          this.contactform.get('parentEntity').setValue(this.parentEntity.distregname);
          break;

      }
    }


    if (this.user.isAdmin) {
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

    if (!this.isNewParentMode && !this.isNewSetup) {
      if (this.type == "CS") {
        this.customersiteService.getById(this.masterId)
          .pipe(first()).subscribe({
            next: (data: any) => {
              this.contactform.patchValue({ address: data.object.address });
            },
          });
      }
      else if (this.type === "D") {
        this.distributorService.getById(this.masterId).pipe(first())
          .subscribe((data: any) => {
            this.contactform.patchValue({ address: data.object.address });
          })
      }
      else if (this.type === "DR") {
        this.distRegions.getById(this.masterId).pipe(first())
          .subscribe((data: any) => {
            this.contactform.patchValue({ address: data.object.address });
          })
      }
      else if (this.type === "C") {
        this.customerService.getById(this.masterId).pipe(first())
          .subscribe((data: any) => {
            this.contactform.patchValue({ address: data.object.address });
          })
      }
    }
    else {
      this.contactform.patchValue({ address: this.parentEntity.address });
    }

    if (this.id != null) {
      this.hasAddAccess = false;
      if (this.user.isAdmin) {
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

    this.contactform.get('pcontactno').valueChanges
      .subscribe((data: any) => {
        if (this.inputObj) {
          this.inputObj.setNumber(data);
        }
        if (this.inputObj2) {
          this.inputObj2.setNumber(data);
        }
        if (this.inputObj2w) {
          this.inputObj2w.setNumber(data);
        }

        this.contactform.get('scontactno').setValue(data);
        this.contactform.get('whatsappNo').setValue(data);
      });

    this.contactform.get('pemail').valueChanges
      .subscribe((data: any) => {
        this.contactform.get('semail').setValue(data);
      });



  }

  EditMode() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.isEditMode = true;

      this.router.navigate(
        ["."],
        {
          relativeTo: this.route,
          queryParams: {
            isNSNav: false
          },
          queryParamsHandling: 'merge',
        });

      this.contactform.enable();
    }
  }

  Back() {
    this.back(!(this.isEditMode || this.isNewMode))
  }

  CancelEdit() {
    if (!confirm("Are you sure you want to discard changes?")) return;
    if (this.id != null) this.contactform.patchValue(this.formData);
    else this.contactform.reset();
    this.contactform.disable()
    this.isEditMode = false;
    this.isNewMode = false;
    this.notificationService.SetNavParam();
  }

  DeleteRecord() {
    if (confirm("Are you sure you want to delete the record?")) {
      this.contactService.delete(this.id).pipe(first())
        .subscribe((data: any) => {
          if (data.result) {
            this.notificationService.showSuccess("Record deleted successfully", "Success");
            this.back(true);
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

  addUser() {
    if (this.id == null) {
      return this.notificationService.showInfo("Save contact before creating user.", "Info");
    }

    this.user = new User;
    this.contactmodel = this.contactform.value;
    this.user.firstName = this.contactmodel.fname,
      this.user.lastName = this.contactmodel.lname,
      this.user.email = this.contactmodel.pemail,
      this.user.contactid = this.id,
      this.user.userType = this.type

    this.user.username = this.contactmodel.fname + ' ' + this.contactmodel.lname;

    this.accountService.register(this.user).subscribe((data: any) => {
      if (data.result) {
        this.isUser = true;
        this.notificationService.showSuccess(data.resultMessage, "Success");
      }
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

      if (this.isNewParentMode || this.isNewSetup) {
        switch (this.type) {
          case "D":
            sessionStorage.setItem('distributorContact', JSON.stringify(this.contact));
            this.router.navigate(['distributorregion', this.masterId], {
              queryParams: {
                isNSNav: true,
                isNewParentMode: true,
              }
            })
            break;
          case "C":
            sessionStorage.setItem('customerContact', JSON.stringify(this.contact));
            this.router.navigate(['customersite', this.masterId], {
              queryParams: {
                isNSNav: true,
                isNewParentMode: true,
              }
            });
            // this.customerService.SaveCustomer();
            // this.contactService.save(this.contact)
            //   .subscribe((data: any) => {
            //     if (data.result) {
            //       this.id = data.object.id;
            //       this.notificationService.showSuccess(data.resultMessage, "Success");
            //       this.contact.id = data.id;
            //       this.loading = false;
            //       this.contactform.disable()
            //       this.isEditMode = false;
            //       this.isNewMode = false;
            //       this.back(true);
            //     }
            //     else {
            //       this.notificationService.showInfo(data.resultMessage, "Info");
            //     }
            //   })
            break;
          case "DR":
            sessionStorage.setItem('distributorRegionContact', JSON.stringify(this.contact));
            var requestObject = {
              distributor: JSON.parse(sessionStorage.getItem('distributor')),
              distributorContact: JSON.parse(sessionStorage.getItem('distributorContact')),
              distributorRegion: JSON.parse(sessionStorage.getItem('distributorRegion')),
              distributorRegionContact: JSON.parse(sessionStorage.getItem('distributorRegionContact')),
            };
            setTimeout(() => {
              this.contactService.SaveDistributorTree(requestObject)
                .subscribe((data: any) => {
                  if (data.result) {
                    this.notificationService.showSuccess(data.resultMessage, "Success");
                    this.loading = false;
                    this.contactform.disable()
                    this.isEditMode = false;
                    this.isNewMode = false;
                    this.back(true);
                  }
                  else {
                    this.notificationService.showInfo(data.resultMessage, "Info");
                  }
                })
            }, 500);
            break;
          case "CS":
            if (sessionStorage.getItem("customer")) this.customerService.SaveCustomer();
            sessionStorage.setItem('customerSiteContact', JSON.stringify(this.contact));
            var requestObjectCust = {
              customer: JSON.parse(sessionStorage.getItem('customer')),
              customerContact: JSON.parse(sessionStorage.getItem('customerContact')),
              customerSite: JSON.parse(sessionStorage.getItem('customerSite')),
              customerSiteContact: JSON.parse(sessionStorage.getItem('customerSiteContact')),
            };
            setTimeout(() => {
              this.contactService.SaveCustomerTree(requestObjectCust)
                .subscribe((data: any) => {
                  if (data.result) {
                    this.notificationService.showSuccess(data.resultMessage, "Success");
                    this.loading = false;
                    this.contactform.disable()
                    this.isEditMode = false;
                    this.isNewMode = false;
                    this.back(true);
                  }
                  else {
                    this.notificationService.showInfo(data.resultMessage, "Info");
                  }
                })
            }, 500);
            break;
        }
      }
      else if (!this.isNewParentMode && !this.isNewSetup) {
        this.contactService.save(this.contact)
          .subscribe((data: any) => {
            if (data.result) {
              this.id = data.object.id;
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.contact.id = data.id;
              this.loading = false;
              this.contactform.disable()
              this.isEditMode = false;
              this.isNewMode = false;
              this.back(true);
            }
            else {
              this.notificationService.showInfo(data.resultMessage, "Info");
            }
          })
      }
    }
    else {
      this.contact.id = this.id;
      this.contactService.update(this.id, this.contact).subscribe((data: any) => {
        if (data.result) {
          this.notificationService.showSuccess(data.resultMessage, "Success");
          this.contactform.disable()
          this.isEditMode = false;
          this.isNewMode = false;
          this.back(true);
        }

        this.contact.id = data.id;
        this.loading = false;
      })
    }
  }

  back(isNSNav) {
    if (this.isNewSetup) {
      sessionStorage.removeItem('distributor');
      sessionStorage.removeItem('distributorRegion');
      sessionStorage.removeItem('site');
      sessionStorage.removeItem('customer');

      this.router.navigate(['distributorregion', this.masterId], {
        queryParams: {
          //  isNSNav,
          isNewSetup: true
        }
      });
    }
    else if (this.type == "D") {
      this.router.navigate(['contactlist', this.type, this.masterId], {
        queryParams: {
          isNSNav,
        }
      });
    }
    else if (this.type == "DR" && !this.isNewParentMode) {
      this.router.navigate(['contactlist', this.type, this.detailId, this.masterId], {
        queryParams: {
          isNSNav
        }
      });
    }
    else if (this.type == "DR" && this.isNewParentMode) {
      this.router.navigate(['distributorlist'], {
        queryParams: {
          isNSNav
        }
      });
    }
    else if (this.type == "C") {
      this.router.navigate(['contactlist', this.type, this.masterId], {
        queryParams: {
          isNSNav
        }
      });
    }
    else if (this.type == "CS" && this.isNewParentMode) {
      this.router.navigate(['customerlist'], {
        queryParams: {
          isNSNav
        }
      });
    }
    else if (this.type == "CS" && !this.isNewParentMode) {
      this.router.navigate(['contactlist', this.type, this.detailId, this.masterId], {
        queryParams: {
          isNSNav
        }
      });
    }
  }
}
