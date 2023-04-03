import { Component, OnInit } from '@angular/core';

import { User, Country, SparePart, ProfileReadOnly } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, GridApi, ColumnApi } from 'ag-grid-community';

import { AccountService, AlertService, CountryService, SparePartService, NotificationService, ProfileService } from '../_services';
import { RenderComponent } from '../distributor/rendercomponent';
import { EnvService } from '../_services/env/env.service';


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
  showGrid = true;

  isDist: boolean = false;
  isEng: boolean = false;
  isCust: boolean = false;

  constructor(
    private router: Router,
    private accountService: AccountService,
    private profileService: ProfileService,
    private sparePartService: SparePartService,
    private environment: EnvService,
  ) {

  }

  ngOnInit() {

    this.user = this.accountService.userValue;
    let role = JSON.parse(sessionStorage.getItem('roles'));

    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SSPAR");
      if (profilePermission.length > 0) {
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
      }
    }
    if (this.user.isAdmin) {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
    }
    else {
      role = role[0]?.itemCode;
    }

    if (role == this.environment.distRoleCode) this.isDist = true;
    else if (role == this.environment.engRoleCode) this.isEng = true;
    else if (role == this.environment.custRoleCode) this.isCust = true;

    this.sparePartService.getAll().pipe(first())
      .subscribe((data: any) => this.sparePartList = data.object);

    this.columnDefs = this.createColumnDefs();
  }

  ShowData(event) {
    this.showGrid = event
  }

  toggleFilter() {
    this.showGrid = !this.showGrid
  }

  DataFilter(event) {
    this.showGrid = true
    this.sparePartList = event;
  }

  Add() {
    this.router.navigate(['sparepart'], {
      queryParams: {
        isNSNav: false
      }
    });
  }
  export() {
    this.router.navigate(['exportsparepart']);
  }

  EditRecord() {
    var data = this.api.getSelectedRows()[0]
    this.router.navigate([`sparepart/${data.id}`], {
      queryParams: {
        isNSNav: true,
        creatingNewDistributor: true
      },
    })
  }

  private createColumnDefs() {
    return [
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
