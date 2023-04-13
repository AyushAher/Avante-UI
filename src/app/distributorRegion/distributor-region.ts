import { Component, OnInit } from '@angular/core';

import { User, DistributorRegion, Country, Distributor, ResultMsg, ProfileReadOnly } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService, DistributorRegionService, ProfileService, CountryService, DistributorService, NotificationService, ListTypeService } from '../_services';
import { Guid } from 'guid-typescript';


@Component({
  selector: 'app-distributorRegion',
  templateUrl: './distributor-region.html',
})
export class DistributorRegionComponent implements OnInit {
  user: User;
  destributorRegionform: FormGroup;
  loading = false;
  submitted = false;
  isSave = false;
  countries: Country[];
  distributors: Distributor[];
  distRegion: DistributorRegion;
  distributorRegionId: string;
  distributorId: string;
  type: string = "DR";
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  isEditMode: boolean;
  isNewMode: boolean;
  isNewSetup: boolean;
  formData: any;
  distributorName: any;
  isNewParentMode: boolean;
  PaymentTermsList: any;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private countryService: CountryService,
    private alertService: AlertService,
    private distributorService: DistributorService,
    private distributorRegionService: DistributorRegionService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private listTypeService: ListTypeService
  ) { }

  ngOnInit() {

    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SDIST");
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

    this.destributorRegionform = this.formBuilder.group({
      distid: ['', Validators.required],
      distName: ['', [Validators.required]],
      region: ['', Validators.required],
      distregname: ['', Validators.required],
      payterms: ['', Validators.required],
      isblocked: false,
      isActive: true,
      countries: ["", Validators.required],
      isdeleted: [false],
      address: this.formBuilder.group({
        street: ['', Validators.required],
        area: [""],
        place: ['', Validators.required],
        city: ['', Validators.required],
        countryid: ['', Validators.required],
        zip: ['', Validators.compose([Validators.pattern("^[0-9]{4,15}$"), Validators.minLength(4), Validators.maxLength(15)])],
        geolat: [''],
        geolong: [''],
        isActive: false,
      }),
    });

    this.countryService.getAll()
      .pipe(first()).subscribe((data: any) => this.countries = data.object);

    this.distributorService.getAll()
      .pipe(first()).subscribe((data: any) => this.distributors = data.object);

    this.distributorId = this.route.snapshot.paramMap.get('id');
    this.distributorRegionId = this.route.snapshot.paramMap.get('rid');

    this.listTypeService.getById("GPAYT")
      .subscribe((data: any) => this.PaymentTermsList = data);

    this.route.queryParams.subscribe((data) => {
      this.isNewSetup = data.isNewSetUp != null && data.isNewSetUp != undefined;
      this.isNewParentMode = data.isNewDist != null && data.isNewDist != undefined && data.isNewDist == "true";
    });

    this.destributorRegionform.controls['distid'].setValue(this.distributorId, { onlySelf: true });


    if (!this.isNewParentMode && this.distributorId != null) {
      this.distributorService.getById(this.distributorId)
        .subscribe((data: any) => {
          this.distributorName = data.object.distname;
          this.destributorRegionform.controls['distName'].setValue(this.distributorName, { onlySelf: true });
        })
    }
    else if (this.isNewParentMode && this.distributorId != null) {
      this.distributorService.getById(this.distributorId)
        .subscribe((data: any) => {
          if (!data.result) return;
          data = data.object;
          setTimeout(() => {
            this.distributorName = data.distname;
            this.destributorRegionform.controls['distName'].setValue(this.distributorName, { onlySelf: true });
            this.destributorRegionform.controls['distregname'].setValue(data.distname, { onlySelf: true });
            this.destributorRegionform.controls['region'].setValue(this.countries.find(x => x.id == data.address.countryid)?.formal, { onlySelf: true });
            this.destributorRegionform.controls['countries'].setValue(data.address.countryid, { onlySelf: true });
            this.destributorRegionform.controls['payterms'].setValue(data.payterms, { onlySelf: true });
            this.destributorRegionform.get("address").patchValue(data.address)
          }, 300);
        })


    }

    if (this.distributorRegionId != null) {
      this.hasAddAccess = false;
      if (this.user.isAdmin) {
        this.hasAddAccess = true;
      }
      this.distributorRegionService.getById(this.distributorRegionId)
        .pipe(first()).subscribe({
          next: (data: any) => {
            this.formData = data.object;
            this.destributorRegionform.patchValue(this.formData);
          },
        });
      this.destributorRegionform.disable();
    }
    else this.isNewMode = true;


    this.destributorRegionform.get("countries").valueChanges
      .subscribe((data: any) => {
        this.destributorRegionform.get("address").get("countryid").setValue(data);
      })
  }


  EditMode() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.isEditMode = true;
      this.destributorRegionform.enable();
      this.destributorRegionform.get("distName").disable();
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
    this.router.navigate(["distregionlist", this.distributorId]);

  }

  CancelEdit() {
    if (!confirm("Are you sure you want to discard changes?")) return;
    if (this.distributorRegionId != null) this.destributorRegionform.patchValue(this.formData);
    else {
      this.destributorRegionform.get("distid").setValue(this.distributorId)
      this.destributorRegionform.get("distName").setValue(this.distributorName)
    }
    this.destributorRegionform.disable()
    this.isEditMode = false;
    this.isNewMode = false;
    this.notificationService.SetNavParam();
  }

  DeleteRecord() {
    if (confirm("Are you sure you want to delete the record?")) {
      this.distributorRegionService.delete(this.distributorRegionId).pipe(first())
        .subscribe((data: any) => {
          if (data.result) {
            this.notificationService.showSuccess("Record deleted successfully", "Success");
            this.router.navigate(["distregionlist", this.distributorId], {
              //relativeTo: this.activeRoute,
              queryParams: { isNSNav: true },
              //queryParamsHandling: 'merge'
            });
          }
          else
            this.notificationService.showInfo(data.resultMessage, "Info");
        })
    }
  }



  // convenience getter for easy access to form fields
  get f() {
    return this.destributorRegionform.controls;
  }

  get a() {
    var controls: any = (this.destributorRegionform.controls.address);
    return controls.controls;
  }

  onSubmit() {
    console.log(this.destributorRegionform);

    this.destributorRegionform.markAllAsTouched()
    if (this.destributorRegionform.invalid) return;

    this.distRegion = this.destributorRegionform.value;

    if (this.distributorRegionId == null) {
      ``
      this.distributorRegionId = Guid.create().toString()
      this.distRegion.id = this.distributorRegionId
      this.distributorRegionService.save(this.distRegion)
        .subscribe((data: any) => {
          if (!data.result) {
            return;
          }
          this.router.navigate(['contact', this.type, this.distributorId, this.distRegion.id], {
            queryParams: {
              isNewMode: true,
              isNSNav: true
            }
          });
        })

    }
    else {
      this.distRegion.id = this.distributorRegionId;
      this.distributorRegionService.update(this.distributorRegionId, this.distRegion)
        .pipe(first())
        .subscribe({
          next: (data: ResultMsg) => {
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.router.navigate(["distregionlist", this.distributorId],
                {
                  queryParams: { isNSNav: true },
                });
            }
            this.loading = false;
          },
        });
    }
  }

}
