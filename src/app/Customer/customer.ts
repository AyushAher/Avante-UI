import { Component, OnInit } from '@angular/core';

import { Country, Customer, ProfileReadOnly, ResultMsg, User } from '../_models';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import {
  AccountService,
  AlertService,
  CountryService,
  CustomerService,
  DistributorRegionService,
  DistributorService,
  ListTypeService,
  NotificationService,
  ProfileService
} from '../_services';
import { Guid } from 'guid-typescript';


@Component({
  selector: 'app-customer',
  templateUrl: './customer.html',
})
export class CustomerComponent implements OnInit {
  user: User;
  customerform: FormGroup;
  loading = false;
  submitted = false;
  isSave = false;
  type: string = "C";
  customerId: string;
  countries: Country[];
  defaultdistributors: any[];
  customer: Customer;
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  distRegionsList: any;
  industrySegmentList: any;
  isEditMode: any;
  isNewMode: any;
  regionCountry: any[] = [];
  formData: any;
  //public defaultdistributors: any[] = [{ key: "1", value: "Ashish" }, { key: "2", value: "CEO" }];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private distributorService: DistributorService,
    private countryService: CountryService,
    private customerService: CustomerService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private listtypeService: ListTypeService,
    private distRegionService: DistributorRegionService,
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
      this.hasUpdateAccess = true;
      this.hasReadAccess = true;
    }

    this.customerform = this.formBuilder.group({
      custname: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      countryid: ['', Validators.required],
      code: [''],
      defdistid: ['', Validators.required],
      industrySegment: ['', Validators.required],
      defdistregionid: ['', Validators.required],
      address: this.formBuilder.group({
        street: ['', Validators.required],
        area: [""],
        place: ['', Validators.required],
        city: ['', Validators.required],
        countryid: ['', Validators.required],
        zip: ['', Validators.compose([Validators.pattern("^[0-9]{4,15}$"), Validators.minLength(4), Validators.maxLength(15)])],
        geolat: ['', [Validators.min(-90), Validators.max(90)]],
        geolong: ['', [Validators.min(-180), Validators.max(180)]],
      }),
    });

    this.customerform.get("countryid")
      .valueChanges.subscribe((data) => {
        this.a.countryid.setValue(data);
      })

    this.countryService.getAll()
      .pipe(first()).subscribe({
        next: (data: any) => this.countries = data.object
      });

    this.listtypeService.getById("INSEG")
      .pipe(first()).subscribe((data: any) => this.industrySegmentList = data);

    this.distributorService.getAll()
      .pipe(first()).subscribe((data: any) => {
        this.defaultdistributors = data.object;
      });

    this.distRegionService.getAll()
      .subscribe((data: any) => {
        this.distRegionsList = data
      })


    this.customerId = this.route.snapshot.paramMap.get('id');
    if (this.customerId != null) {
      this.customerService.getById(this.customerId)
        .pipe(first()).subscribe({
          next: (data: any) => {
            this.formData = data.object;
            this.customerform.patchValue(this.formData);
            this.onDistributorRegion(data.object.defdistregionid)
          },
        });
      this.customerform.disable()
    }
    else {
      this.isNewMode = true;
      this.FormControlDisable();
    }

  }

  EditMode() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.isEditMode = true;
      this.customerform.enable();
      this.router.navigate(
        ["."],
        {
          relativeTo: this.route,
          queryParams: {
            isNSNav: false
          },
          queryParamsHandling: 'merge', // remove to replace all query params by provided
        });
      this.FormControlDisable()
    }
  }

  FormControlDisable() {
    this.a.countryid.disable();
    this.f.defdistid.disable();
    this.f.countryid.disable();
    this.f.code.disable();
  }

  Back() {
    this.router.navigate(["customerlist"]);

  }

  CancelEdit() {
    if (!confirm("Are you sure you want to discard changes?")) return;
    if (this.customerId != null) this.customerform.patchValue(this.formData);
    else this.customerform.reset();
    this.customerform.disable()
    this.isEditMode = false;
    this.isNewMode = false;
    this.notificationService.SetNavParam();
  }

  DeleteRecord() {
    if (confirm("Are you sure you want to delete the record?")) {
      this.customerService.delete(this.customerId).pipe(first())
        .subscribe((data: any) => {
          if (data.result) {
            this.notificationService.showSuccess("Record deleted successfully", "Success");
            this.router.navigate(["customerlist"], {
              queryParams: {
                isNSNav: true
              }
            });
          }
          else {
            this.notificationService.showInfo(data.resultMessage, "Info");
          }
        })
    }
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.customerform.controls;
  }

  get a() {
    var controls: any = (this.customerform.controls.address);
    return controls.controls;
  }

  onDistributorRegion(e) {
    var region = this.distRegionsList?.find(x => x.id == e);
    this.regionCountry = [];
    this.regionCountry.push(this.countries.find(x => x.id == region?.countries))
    this.customerform.get("defdistid").setValue(region?.distid);
    this.customerform.get("countryid").setValue(region?.countries);
  }

  onSubmit() {
    this.customerform.markAllAsTouched()

    if (this.customerform.invalid) return;
    this.customerform.enable();
    this.customer = this.customerform.value;
    this.FormControlDisable();

    if (this.customerId == null) {
      this.customer.id = Guid.create().toString();
      this.customerService.save(this.customer)
        .subscribe((data: any) => {
          if (!data.result) return;
          this.router.navigate([`/contact/${this.type}/${this.customer.id}`], {
            queryParams: {
              isNewDistSetUp: true,
              isNSNav: true
            }
          })
        });
    }
    else {
      this.customer.id = this.customerId;
      this.customerService.update(this.customerId, this.customer)
        .pipe(first()).subscribe((data: ResultMsg) => {
          if (data.result) {
            this.notificationService.showSuccess(data.resultMessage, "Success");
            this.router.navigate(["customerlist"], {
              queryParams: {
                isNSNav: true
              }
            });
          }
          else {
            this.notificationService.showInfo(data.resultMessage, "Info");
          }
        });
    }
  }
}
