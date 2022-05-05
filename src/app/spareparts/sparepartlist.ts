import { Component, OnInit } from '@angular/core';

import { User, Country, SparePart, ProfileReadOnly } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, GridApi, ColumnApi } from 'ag-grid-community';

import { AccountService, AlertService, CountryService, SparePartService, NotificationService, ProfileService } from '../_services';
import { RenderComponent } from '../distributor/rendercomponent';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-spareList',
  templateUrl: './sparepartlist.html',
})
export class SparePartListComponent implements OnInit {
  user: User;
  form: FormGroup;
  sparePartList: SparePart[];
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
  showGrid = false;

  isDist: boolean= false;
  isEng: boolean= false;
  isCust: boolean= false;

  constructor(
    private router: Router,
    private accountService: AccountService,
    private profileService: ProfileService,
  ) {

  }

  ngOnInit() {

    this.user = this.accountService.userValue;
    let role = JSON.parse(localStorage.getItem('roles'));

    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SSPAR");
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

  DataFilter(event) {
    this.showGrid = true
    this.sparePartList = event;
  }

  Add() {
    this.router.navigate(['sparepart']);
  }
  export() {
    this.router.navigate(['exportsparepart']);
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
          inRouterLink: '/sparepart',
          deleteLink: 'S',
          deleteaccess: this.hasDeleteAccess
        },
      },
      {
        headerName: 'Config Type',
        field: 'configTypeName',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'configTypeName',
      },
      {
        headerName: 'Config Value',
        field: 'configValueName',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'configValueName',
      },
      {
        headerName: 'Part Type',
        field: 'partTypeName',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'partTypeName',
      },
      {
        headerName: 'Part No.',
        field: 'partNo',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'partNo',
      },
      {
        headerName: 'Quantity',
        field: 'qty',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'qty',
      }, {
        headerName: 'Item Description',
        field: 'itemDesc',
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: 'itemDesc',
      },

    ]
  }


  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }

}
