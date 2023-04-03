import { Component, OnInit } from '@angular/core';

import { User, Customer, Country, Instrument, Profile, ProfileReadOnly } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, GridApi, ColumnApi } from 'ag-grid-community';

import { AccountService, AlertService, CountryService, InstrumentService, NotificationService, ProfileService } from '../_services';
import { RenderComponent } from '../distributor/rendercomponent';


@Component({
  selector: 'app-instuList',
  templateUrl: './profilelist.html',
})
export class ProfileListComponent implements OnInit {
  user: User;
  form: FormGroup;
  profileList: Profile[];
  loading = false;
  submitted = false;
  isSave = false;
  customerId: string;
  type: string = "D";
  countries: Country[];
  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;
  profilePermission: ProfileReadOnly;
  hasAddAccess: boolean = false;
  hasDeleteAccess: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private instrumentService: InstrumentService,
    private countryService: CountryService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
  ) {

  }

  ngOnInit() {
    //debugger;
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "PROF");
      if (profilePermission.length > 0) {
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
      }
    }

    if (this.user.isAdmin) {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
    }
    // this.distributorId = this.route.snapshot.paramMap.get('id');
    this.profileService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          //debugger;
          this.profileList = data.object;
        },
        error: error => {

          this.loading = false;
        }
      });
    this.columnDefs = this.createColumnDefs();
  }

  Add() {
    this.router.navigate(['profile'], {
      queryParams: {
        isNSNav: false
      },
    });
  }


  EditRecord() {
    var data = this.api.getSelectedRows()[0]
    this.router.navigate([`profile/${data.id}`], {
      queryParams: {
        isNSNav: true,
        creatingNewDistributor: true
      },
    })
  }

  private createColumnDefs() {
    return [{
      headerName: 'Profile Name',
      field: 'profilename',
      filter: true,
      enableSorting: true,
      editable: false,
      sortable: true,
      tooltipField: 'profilename',
    },
    {
      headerName: 'Description',
      field: 'description',
      filter: true,
      enableSorting: true,
      sortable: true,
      tooltipField: 'description',
    }]
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }

}
