import { Component, OnInit } from '@angular/core';

import { Country, ProfileReadOnly, User } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, GridApi, ColumnApi } from 'ag-grid-community';

import { AccountService, AlertService, CountryService, NotificationService, ProfileService } from '../_services';
import { RenderComponent } from '../distributor/rendercomponent';


@Component({
  selector: 'app-countryList',
  templateUrl: './countrylist.html',
})
export class CountryListComponent implements OnInit {
  user: User;
  form: FormGroup;
  countryList: Country[];
  loading = false;
  submitted = false;
  isSave = false;
  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private countryService: CountryService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
  ) {

  }

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SCOUN");
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
    // this.distributorId = this.route.snapshot.paramMap.get('id');
    this.countryService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          //debugger;
          this.countryList = data.object;
        },
        error: error => {

          this.loading = false;
        }
      });
    this.columnDefs = this.createColumnDefs();
  }

  Add() {
    this.router.navigate(['country']);
  }


  EditRecord() {
    var data = this.api.getSelectedRows()[0]
    this.router.navigate([`country/${data.id}`])
  }

  private createColumnDefs() {
    return [
      {
        headerName: 'Country Name',
        field: 'name',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'name',
      }, {
        headerName: 'ISO Code 2',
        field: 'iso_2',
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: 'iso_2',
      }, {
        headerName: 'ISO Code 3',
        field: 'iso_3',
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: 'iso_3',
      }
    ]
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }

}
