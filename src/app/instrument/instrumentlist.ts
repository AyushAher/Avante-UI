import { Component, OnInit } from '@angular/core';

import { User, Customer, Country, Instrument, ProfileReadOnly } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, GridApi, ColumnApi } from 'ag-grid-community';

import { AccountService, AlertService, CountryService, InstrumentService, NotificationService, ProfileService } from '../_services';
import { RenderComponent } from '../distributor/rendercomponent';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-instuList',
  templateUrl: './instrumentlist.html',
})
export class InstrumentListComponent implements OnInit {
  user: User;
  form: FormGroup;
  instrumentList: Instrument[];
  loading = false;
  submitted = false;
  isSave = false;
  customerId: string;
  type: string = "D";
  countries: Country[];
  profilePermission: ProfileReadOnly;
  hasAddAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;
  filterData: any;
  showGrid = false;

  isDist: boolean = false;
  isEng: boolean = false;
  isCust: boolean = false;

  constructor(
    private router: Router,
    private accountService: AccountService,
    private profileService: ProfileService,
  ) {

  }

  ngOnInit() {
    let role = JSON.parse(localStorage.getItem('roles'));
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SINST");
      if (profilePermission.length > 0) {

        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;

      }
    }
    if (this.user.username == "admin") {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
    }
    else {
      role = role[0]?.itemCode;
    }

    if (role == environment.distRoleCode) this.isDist = true;
    else if (role == environment.engRoleCode) this.isEng = true;
    else if (role == environment.custRoleCode) this.isCust = true;

    this.columnDefs = this.createColumnDefs();
  }

  Add() {
    this.router.navigate(['instrument']);
  }

  DataFilter(event) {
    this.instrumentList = event
  }

  ShowData(event) {
    this.showGrid = event
  }

  toggleFilter() {
    this.showGrid = !this.showGrid
  }

  private createColumnDefs() {
    return [
      {
        headerName: 'Action',
        field: 'id',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        cellRendererFramework: RenderComponent,
        cellRendererParams: {
          inRouterLink: '/instrument',
          deleteLink: 'I',
          deleteaccess: this.hasDeleteAccess
        },
      },
      {
        headerName: 'Site Name',
        field: 'custSiteName',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'custSiteName'
      }, {
        headerName: 'Serial No',
        field: 'serialnos',
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: 'serialnos'
      }
    ]
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }

}
