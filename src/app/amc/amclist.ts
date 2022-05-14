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
import { environment } from 'src/environments/environment';


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
  showGrid: boolean = false;
  isDist: boolean;

  constructor(
    private router: Router,
    private accountService: AccountService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private AmcService: AmcService
  ) {

  }

  ngOnInit() {
    let role = JSON.parse(localStorage.getItem('roles'));
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
    else role = role[0]?.itemCode;


    if (role == environment.distRoleCode) this.isDist = true;
    else {
      this.toggleFilter()
      this.AmcService.getAll()
        .pipe(first())
        .subscribe((data: any) => {

          this.AmcList = data.object?.filter(x => !x.isCompleted)
          console.log(data, this.AmcList);
        });
    }
    this.columnDefs = this.createColumnDefs();
  }

  Add() {
    this.router.navigate(['amc']);
  }


  ShowData(event) {
    this.showGrid = event
  }

  toggleFilter() {
    this.showGrid = !this.showGrid
  }

  DataFilter(event) {
    this.AmcList = event?.filter(x => !x.isCompleted)
  }

  EditRecord() {
    var data = this.api.getSelectedRows()[0]
    this.router.navigate([`amc/${data.id}`])
  }

  private createColumnDefs() {
    return [
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
