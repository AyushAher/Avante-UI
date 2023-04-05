import { Component, OnInit } from '@angular/core';

import { User, Customer, CustomerSite, Country, DistributorRegion, ResultMsg, ProfileReadOnly } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService, CountryService, CustomerService, ProfileService, DistributorRegionService, CustomerSiteService, NotificationService, ListTypeService } from '../_services';
import { Guid } from 'guid-typescript';


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
  formData: any;
  customerName: string
  PaymentTermsList: any;
  isNewParentMode: boolean;

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
    private listTypeService: ListTypeService
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

    if (this.user.isAdmin) {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
      this.hasReadAccess = true;
      this.hasUpdateAccess = true;
    }


    this.customerid = this.route.snapshot.paramMap.get('id');
    this.csiteid = this.route.snapshot.paramMap.get('cid');

    this.customersiteform = this.formBuilder.group({
      custid: ['', Validators.required],
      custname: ['', Validators.required],
      regname: [''],
      custregname: ['', Validators.required],
      distid: ['', Validators.required],
      payterms: ['', Validators.required],
      isblocked: false,
      isactive: true,
      isdeleted: [false],
      address: this.formBuilder.group({
        street: ['', Validators.required],
        area: [""],
        place: ['', Validators.required],
        city: ['', Validators.required],
        countryid: ['', Validators.required],
        zip: ['', Validators.compose([Validators.minLength(4), Validators.maxLength(15)])],
        geolong: [''],
        geolat: [''],
        isActive: true,
      }),
    });


    this.route.queryParams.subscribe((data) => {
      this.isNewParentMode = data.isNewParentMode != null && data.isNewParentMode != undefined && data.isNewParentMode == "true";
    });

    this.listTypeService.getById("GPAYT")
      .subscribe((data: any) => this.PaymentTermsList = data);
    if (!this.isNewParentMode) {
      this.distributorRegionservice.getDistByCustomerId(this.customerid)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.distRegions = data.object;
          },
        });

    }
    else {
      let customer = JSON.parse(sessionStorage.getItem('customer'));

      this.distributorRegionservice.getById(customer.defdistregionid)
        .subscribe({
          next: (data: any) => {
            if (data.result && data.object) {
              this.distRegions = [data.object];
              this.customersiteform.get('regname').setValue(data.object.region)
            }
          },
        });
    }
    this.customerService.getAll()
      .subscribe((data: any) => {
        this.customers = data.object;
        var customer: any = this.customers.find(x => x.id == this.customerid);
        if (!customer && this.isNewParentMode) {
          customer = JSON.parse(sessionStorage.getItem('customer'));
        }
        this.customersiteform.get("custid").setValue(this.customerid)

        if (customer) {
          this.customerName = customer.custname
          if (customer.defDistRegion) this.customersiteform.get('regname').setValue(customer.defDistRegion)
          if (customer.custname) this.customersiteform.get('custname').setValue(customer.custname)
          if (customer.defdistregionid) this.customersiteform.get('distid').setValue(customer.defdistregionid)

          this.countryService.getAll()
            .subscribe((data: any) => {
              this.countries = data.object;
              var siteName = this.countries.find(x => x.id == customer.address.countryid)?.name
              this.customersiteform.get('custregname').setValue(siteName)
            });
        }
      });

    if (this.csiteid != null) {
      this.hasAddAccess = false;
      if (this.user.isAdmin) {
        this.hasAddAccess = true;
      }
      this.customersiteService.getById(this.csiteid)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.formData = data.object;
            this.customersiteform.patchValue(this.formData);
          },
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
    this.router.navigate(["customersitelist", this.customerid]);

  }

  CancelEdit() {
    if (!confirm("Are you sure you want to discard changes?")) return;
    if (this.csiteid != null) this.customersiteform.patchValue(this.formData);
    else this.customersiteform.reset();
    this.customersiteform.disable()
    this.isEditMode = false;
    this.isNewMode = false;
    this.notificationService.SetNavParam();
  }

  DeleteRecord() {
    if (confirm("Are you sure you want to delete the record?")) {
      this.customersiteService.delete(this.csiteid).pipe(first())
        .subscribe((data: any) => {
          if (data.result) {
            this.notificationService.showSuccess("Record deleted successfully", "Success");
            this.router.navigate(["customersitelist", this.customerid]);
          }
          else {
            this.notificationService.showInfo(data.resultMessage, "Info");
          }

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
        });
    }
    else {
      this.distributorRegionservice.getDistByCustomerId(this.customerid)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.distRegions = data.object;
          },
        });
    }
  }


  // convenience getter for easy access to form fields
  get f() {
    return this.customersiteform.controls;
  }

  get a() {
    var controls: any = (this.customersiteform.controls.address);
    return controls.controls;
  }

  onSubmit() {
    this.customersiteform.markAllAsTouched()

    if (this.customersiteform.invalid) return;

    if (this.csiteid == null) {
      this.csiteid = Guid.create().toString();
      this.custSite = this.customersiteform.value;
      this.custSite.id = this.csiteid;

      sessionStorage.setItem("site", JSON.stringify(this.custSite));
      return this.router.navigate(['contact', this.type, this.customerid, this.csiteid], {
        queryParams: {
          isNewMode: true,
          isNSNav: true
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
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.router.navigate(["customersitelist", this.customerid], {
                queryParams: {
                  isNSNav: true
                }
              })
            }
            this.loading = false;

          },
        });
    }
  }
}
