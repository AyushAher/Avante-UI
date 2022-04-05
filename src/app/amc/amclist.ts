import { Component, OnInit } from '@angular/core';

import { Amc, Country, ProfileReadOnly, User } from '../_models';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';

import {
  AccountService,
  AmcService,
  NotificationService,
  ProfileService
} from '../_services';
import { RenderComponent } from '../distributor/rendercomponent';


@Component({
  selector: 'app-distributorRgList',
  templateUrl: './Amclist.html',
})
export class AmcListComponent implements OnInit {
  user: User;
  form: FormGroup;
  AmcList: Amc[];
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

  constructor(
    private router: Router,
    private accountService: AccountService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private AmcService: AmcService
  ) {

  }

  ngOnInit() {

    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "AMC");
      if (profilePermission.length > 0) {
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
      }
    }
    if (this.user.username == "admin") {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
    }


    // this.distributorId = this.route.snapshot.paramMap.get('id');
    this.AmcService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.AmcList = data.object;
        },
        error: error => {
          
          this.loading = false;
        }
      });
    this.columnDefs = this.createColumnDefs();
  }

  Add() {
    this.router.navigate(['amc']);
  }


  private createColumnDefs() {
    return [{
      headerName: 'Action',
      field: 'id',
      filter: false,
      enableSorting: false,
      editable: false,
      sortable: false,
      cellRendererFramework: RenderComponent,
      cellRendererParams: {
        inRouterLink: '/amc',
        deleteLink: 'AMC',
        deleteaccess: this.hasDeleteAccess
      },
    },
    {
      headerName: 'Bill To',
      field: 'billto',
      filter: true,
      enableSorting: true,
      editable: false,
      sortable: true,
      tooltipField: 'Bill To',
    },
    {
      headerName: 'Customer Site',
      field: 'custSiteName',
      filter: true,
      enableSorting: true,
      editable: false,
      sortable: true,
      tooltipField: 'Bill To',
    },
    {
      headerName: 'Service Quote',
      field: 'servicequote',
      filter: true,
      editable: false,
      sortable: true
    },
    {
      headerName: 'SQ Date',
      field: 'sqdate',
      filter: true,
      editable: false,
      sortable: true
    },
    {
      headerName: 'Project',
      field: 'project',
      filter: true,
      editable: false,
      sortable: true
    },

    ]
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }

}
