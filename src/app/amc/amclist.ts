import { Component, OnInit } from '@angular/core';

import { Amc, Country, ProfileReadOnly, User } from '../_models';
import { ActivatedRoute, Router } from '@angular/router';
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
import { EnvService } from '../_services/env/env.service';


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
  showGrid: boolean = true;
  isDist: boolean;

  constructor(
    private router: Router,
    private accountService: AccountService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private AmcService: AmcService,
    private environment: EnvService,
    private route: ActivatedRoute

  ) {

  }

  ngOnInit() {
    let role = JSON.parse(sessionStorage.getItem('roles'));
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SAMC");
      if (profilePermission.length > 0) {
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
      }
    }
    if (this.user.isAdmin) {
      this.hasAddAccess = false;
      this.hasDeleteAccess = true;
    }
    else role = role[0]?.itemCode;


    if (role == this.environment.distRoleCode) this.isDist = true;

    this.AmcService.getAll()
      .pipe(first()).subscribe((data: any) => {
        this.AmcList = data.object?.filter(x => !x.isCompleted)
        if (this.AmcList == null || this.AmcList.length <= 0) return;
        this.AmcList.forEach(x => {
          x.isactive = x.isactive ? "Yes" : "No";
          x.period = x.sdate + " - " + x.edate
        });

      });

    this.columnDefs = this.createColumnDefs();
  }

  Add() {
    this.router.navigate(['amc'], {
      queryParams: {
        isNSNav: false
      },
    });
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
    this.router.navigate([`amc/${data.id}`], {
      queryParams: {
        isNSNav: true,
        creatingNewDistributor: true
      },
    })
  }

  private createColumnDefs() {
    return [
      {
        headerName: 'Customer Site',
        field: 'custSiteName',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'custSiteName',
      },
      {
        headerName: 'Service Quote',
        field: 'servicequote',
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
      {
        headerName: 'Period',
        field: 'period',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'period',
      },
      {
        headerName: 'Is Active',
        field: 'isactive',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'isActive'
      }
    ]
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }

}
