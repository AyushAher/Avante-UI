import { Component, OnInit } from '@angular/core';

import { User, Customer, CustomerSite, Country, DistributorRegion, ResultMsg, ProfileReadOnly } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService, CountryService, CustomerService, ProfileService, DistributorRegionService, CustomerSiteService, NotificationService } from '../_services';


@Component({
  selector: 'app-customersite',
  templateUrl: './customersite.html',
})
export class CustomerSiteComponent implements OnInit {
  user: User;
  customersiteform: FormGroup;
  loading = false;
  submitted = false;
  isSave = false;
  customers: Customer[];
  type: string = "CS";
  csiteid: string;
  customerid: string;
  custSite: CustomerSite;
  countries: Country[];
  distRegions: DistributorRegion[];
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  isNewMode: boolean;
  isEditMode: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private countryService: CountryService,
    private distributorRegionservice: DistributorRegionService,
    private customersiteService: CustomerSiteService,
    private customerService: CustomerService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
  ) { }

  ngOnInit() {

    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SCUST");
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
      this.hasReadAccess = true;
      this.hasUpdateAccess = true;
    }


    this.customerid = this.route.snapshot.paramMap.get('id');
    this.csiteid = this.route.snapshot.paramMap.get('cid');

    this.customersiteform = this.formBuilder.group({
      custid: ['', Validators.required],
      regname: [''],
      custregname: ['', Validators.required],
      distid: ['', Validators.required],
      payterms: ['', Validators.required],
      isblocked: false,
      isactive: true,
      isdeleted: [false],
      address: this.formBuilder.group({
        street: ['', Validators.required],
        area: ['', Validators.required],
        place: ['', Validators.required],
        city: ['', Validators.required],
        countryid: ['', Validators.required],
        zip: ['', Validators.compose([Validators.minLength(4), Validators.maxLength(15)])],
        geolat: ['', Validators.required],
        geolong: ['', Validators.required],
        isActive: true,
      }),
    });
    this.countryService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.countries = data.object;
        },
        error: error => {
          this.alertService.error(error);
          this.loading = false;
        }
      });
    this.distributorRegionservice.getDistByCustomerId(this.customerid)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.distRegions = data.object;
        },
        error: error => {
          //  this.alertService.error(error);

          this.loading = false;
        }
      });

    this.customerService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.customers = data.object;
        },
        error: error => {
          // this.alertService.error(error);

          this.loading = false;
        }
      });

    if (this.csiteid != null) {
      this.hasAddAccess = false;
      if (this.user.username == "admin") {
        this.hasAddAccess = true;
      }
      this.customersiteService.getById(this.csiteid)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.customersiteform.patchValue(data.object);
          },
          error: error => {
            // this.alertService.error(error);

            this.loading = false;
          }
        });
      this.customersiteform.disable()
    } else {
      this.isNewMode = true
    }

  }


  EditMode() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.isEditMode = true;
      this.customersiteform.enable();
    }
  }

  Back() {

    if ((this.isEditMode || this.isNewMode)) {
      if (confirm("Are you sure want to go back? All unsaved changes will be lost!"))
        this.router.navigate(["customersitelist", this.customerid]);
    }

    else this.router.navigate(["customersitelist", this.customerid]);

  }

  CancelEdit() {
    this.customersiteform.disable()
    this.isEditMode = false;
  }

  DeleteRecord() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.customersiteService.delete(this.csiteid).pipe(first())
        .subscribe((data: any) => {
          if (data.result)
            this.router.navigate(["customersitelist", this.customerid]);
        })
    }
  }


  showallDdl(value: boolean) {
    //debugger;
    if (value == true) {
      this.distributorRegionservice.getAll()
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.distRegions = data;
          },
          error: error => {
            // this.alertService.error(error);

            this.loading = false;
          }
        });
    }
    else {
      this.distributorRegionservice.getDistByCustomerId(this.customerid)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.distRegions = data.object;
          },
          error: error => {
            // this.alertService.error(error);

            this.loading = false;
          }
        });
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.customersiteform.controls; }
  get a() { return this.customersiteform.controls.address; }

  onSubmit() {
    //debugger;
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.customersiteform.invalid) {
      return;
    }
    this.isSave = true;
    this.loading = true;
    if (this.csiteid == null) {
      this.customersiteService.save(this.customersiteform.value)
        .pipe(first())
        .subscribe({
          next: (data: ResultMsg) => {
            //debugger;
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.router.navigate(["customersitelist", this.customerid]);
            }
            else {

            }
            this.loading = false;

          },
          error: error => {
            // this.alertService.error(error);

            this.loading = false;
          }
        });
    }
    else {
      this.custSite = this.customersiteform.value;
      this.custSite.id = this.csiteid;
      this.customersiteService.update(this.csiteid, this.custSite)
        .pipe(first())
        .subscribe({
          next: (data: ResultMsg) => {
            //debugger;
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.router.navigate(["customersitelist", this.customerid]);
            }
            else {

            }
            this.loading = false;

          },
          error: error => {
            //  this.alertService.error(error);

            this.loading = false;
          }
        });
    }
  }
}
