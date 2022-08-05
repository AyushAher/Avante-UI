import { Component, OnInit } from '@angular/core';

import { User, Customer, Country, Instrument, Profile, UserProfile, ProfileReadOnly } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, GridApi, ColumnApi } from 'ag-grid-community';

import { AccountService, AlertService, CountryService, InstrumentService, NotificationService, ProfileService, UserProfileService } from '../_services';
import { RenderComponent } from '../distributor/rendercomponent';
import { EnvService } from '../_services/env/env.service';


@Component({
  selector: 'app-instuList',
  templateUrl: './userprofilelist.html',
})
export class UserProfileListComponent implements OnInit {
  user: User;
  form: FormGroup;
  userprofileList: UserProfile[];
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
  showGrid: any = true;
  IsCustomerView: boolean;
  IsDistributorView: boolean;
  IsEngineerView: boolean;

  constructor(
    private router: Router,
    private accountService: AccountService,
    private profileService: ProfileService,
    private environment: EnvService,
    private userprofileService: UserProfileService,
  ) {

  }

  ngOnInit() {

    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "URPRF");
      if (profilePermission.length > 0) {
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
      }
    }

    if (this.user.username == "admin") {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
    } else {

      let role = JSON.parse(localStorage.getItem('roles'));
      role = role[0]?.itemCode;

      if (role == this.environment.custRoleCode) {
        this.IsCustomerView = true;
        this.IsDistributorView = false;
        this.IsEngineerView = false;
      } else if (role == this.environment.distRoleCode) {
        this.IsCustomerView = false;
        this.IsDistributorView = true;
        this.IsEngineerView = false;
      } else {
        this.IsCustomerView = false;
        this.IsDistributorView = false;
        this.IsEngineerView = true;
      }


    }

    this.userprofileService.getAll().pipe(first())
      .subscribe((data: any) => {
        this.userprofileList = data.object
      });

    this.columnDefs = this.createColumnDefs();
  }

  Add() {
    this.router.navigate(['userprofile']);
  }

  DataFilter(event) {
    this.userprofileList = event;
  }

  ShowData(event) {
    this.showGrid = event
  }

  toggleFilter() {
    this.showGrid = !this.showGrid
  }


  EditRecord() {
    var data = this.api.getSelectedRows()[0]
    this.router.navigate([`userprofile/${data.id}`])
  }

  private createColumnDefs() {
    return [
      {
        headerName: 'Username',
        field: 'username',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'username',
      },
      {
        headerName: 'Profile Name',
        field: 'profileName',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'profileName',
      }
    ]
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }

}
