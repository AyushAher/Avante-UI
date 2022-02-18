import { Component, OnInit } from '@angular/core';

import { Country, ProfileReadOnly, ServiceReport, User } from '../_models';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';

import {
  AccountService,
  ContactService,
  NotificationService,
  ProfileService,
  ServiceReportService
} from '../_services';
import { RenderComponent } from '../distributor/rendercomponent';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-distributorRgList',
  templateUrl: './ServiceReportlist.html',
})
export class ServiceReportListComponent implements OnInit {
  user: User;
  form: FormGroup;
  ServiceReportList: ServiceReport[];
  loading = false;
  submitted = false;
  countries: Country[];
  profilePermission: ProfileReadOnly;
  hasAddAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;
  role: any;

  constructor(
    private router: Router,
    private accountService: AccountService,
    private notificationService: NotificationService,
    private contcactservice: ContactService,
    private profileService: ProfileService,
    private ServiceReportService: ServiceReportService
  ) {

  }

  ngOnInit() {

    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SRREP");
      if (profilePermission.length > 0) {
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
      }
    }
    if (this.user.username == "admin") {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
    } else {
      this.role = JSON.parse(localStorage.getItem('roles'));
      this.role = this.role[0]?.itemCode;

    }


    // this.distributorId = this.route.snapshot.paramMap.get('id');
    this.ServiceReportService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.contcactservice.getDistByContact(this.user.contactId)
            .pipe(first())
            .subscribe((data1: any) => {
              switch (this.role) {
                case environment.custRoleCode:
                  this.ServiceReportList = data.object.filter(x => x.serviceRequest.createdby == this.user.userId);
                  break;
                case environment.distRoleCode:
                  this.ServiceReportList = data.object.filter(x => x.serviceRequest.distid == data1.object.defdistid);
                  break;
                case environment.engRoleCode:
                  this.ServiceReportList = data.object.filter(x => x.serviceRequest.assignedto == this.user.contactId);
                  break;
                default:
                  this.ServiceReportList = data.object;
                  break
              }
            })
        },
        error: error => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });
    this.columnDefs = this.createColumnDefs();
  }

  Add() {
    this.router.navigate(['servicereport']);
  }


  private createColumnDefs() {
    return [{
      headerName: 'Action',
      field: 'id',
      filter: false,
      enableSorting: false,
      width: 150,
      editable: false,
      sortable: false,
      cellRendererFramework: RenderComponent,
      cellRendererParams: {
        inRouterLink: '/servicereport',
        deleteLink: 'SRE',
        deleteaccess: this.hasDeleteAccess
      },
    },
    {
      headerName: 'Service Req. No.',
      field: 'serviceRequest.serreqno',
      filter: true,
      enableSorting: true,
      editable: false,
      sortable: true,
      tooltipField: 'customer',
    },
    {
      headerName: 'Customer Name',
      field: 'customer',
      filter: true,
      enableSorting: true,
      editable: false,
      sortable: true,
      tooltipField: 'customer',
    },
    {
      headerName: 'Department',
      field: 'departmentName',
      filter: true,
      editable: false,
      sortable: true
    },
    {
      headerName: 'Of',
      field: 'srOf',
      filter: true,
      editable: false,
      sortable: true
    },
    {
      headerName: 'Lab Chief',
      field: 'labChief',
      filter: true,
      editable: false,
      sortable: true
    },
    {
      headerName: 'Instrument',
      field: 'instrument',
      filter: true,
      editable: false,
      sortable: true
    }]
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }

}
