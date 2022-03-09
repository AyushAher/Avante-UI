import { Component, OnInit } from '@angular/core';

import { Country, ProfileReadOnly, ServiceRequest, User } from '../_models';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';
import { environment } from '../../environments/environment';
import {
  AccountService,
  ContactService,
  DistributorService,
  ListTypeService,
  NotificationService,
  ProfileService,
  ServiceRequestService
} from '../_services';
import { RenderComponent } from '../distributor/rendercomponent';
import { DatePipe } from '@angular/common';
import { ServiceRComponent } from './ServicerequestRenderer';


@Component({
  selector: 'app-distributorRgList',
  templateUrl: './serviceRequestlist.html',
})
export class ServiceRequestListComponent implements OnInit {
  user: User;
  form: FormGroup;
  srCustList: ServiceRequest[];
  srDistList: ServiceRequest[];
  srAdminList: ServiceRequest[];
  srEngList: ServiceRequest[];
  loading = false;
  customerId: string;
  countries: Country[];
  profilePermission: ProfileReadOnly;
  hasAddAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;
  IsCustomerView: boolean = true;
  IsDistributorView: boolean = false;
  IsEngineerView: boolean = false;
  IsAdminView: boolean = false;
  distId: any;
  datepipe: any = new DatePipe("en-US");
  appendList: any;

  constructor(
    private router: Router,
    private accountService: AccountService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private serviceRequestService: ServiceRequestService,
    private contcactservice: ContactService,
    private distributorService: DistributorService,
    private listTypeService: ListTypeService
  ) {
    this.notificationService.listen().subscribe((m: any) => {
      this.getallrecored();
    })
  }

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SRREQ");
      if (profilePermission.length > 0) {
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
      }
    }
    if (this.user.username == "admin") {
      this.hasAddAccess = false;
      this.hasDeleteAccess = true;
      this.IsAdminView = true;
      this.getallrecored();
      this.columnDefs = this.createCustColumnDefs();
    } else {
      this.listTypeService.getItemById(this.user.roleId).pipe(first()).subscribe();

      let role = JSON.parse(localStorage.getItem('roles'));
      role = role[0]?.itemCode;

      if (role == environment.custRoleCode) {
        this.IsCustomerView = true;
        this.IsDistributorView = false;
        this.IsEngineerView = false;
      } else if (role == environment.distRoleCode) {
        this.IsCustomerView = false;
        this.IsDistributorView = true;
        this.IsEngineerView = false;
      } else {
        this.IsCustomerView = false;
        this.IsDistributorView = false;
        this.IsEngineerView = true;
      }

      this.contcactservice.getDistByContact(this.user.contactId)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.distId = data.object.defdistid;
            this.getallrecored();
          },
          error: error => {
            //  this.alertService.error(error);
            this.notificationService.showSuccess(error, "Error");
            this.loading = false;
          }
        });

      // this.distributorId = this.route.snapshot.paramMap.get('id');

      if (this.IsDistributorView) {
        this.columnDefs = this.createDisColumnDefs();
      } else if (this.IsEngineerView) {
        this.columnDefs = this.createDisColumnDefs();
      } else if (this.IsCustomerView) {
        this.columnDefs = this.createCustColumnDefs();
      } else if (this.IsAdminView) {
        this.columnDefs = this.createDisColumnDefs()
      }

    }

  }

  Add() {
    this.router.navigate(['servicerequest']);
  }


  private createDisColumnDefs() {
    return [{
      headerName: 'Action',
      field: 'id',
      filter: false,
      enableSorting: false,
      width: 200,
      editable: false,
      sortable: false,
      cellRendererFramework: RenderComponent,
      cellRendererParams: {
        inRouterLink: '/servicerequest',
        deleteLink: 'SR',
        deleteaccess: this.hasDeleteAccess
      },
    },
    {
      headerName: 'Service Request No.',
      field: 'serreqno',
      filter: true,
      enableSorting: true,
      editable: false,
      sortable: true,
      tooltipField: 'Service Request No.',
    },
    {
      headerName: 'Customer Name',
      field: 'companyname',
      filter: true,
      enableSorting: true,
      editable: false,
      sortable: true,
      tooltipField: 'companyname',
    }, {
      headerName: 'Site Name',
      field: 'sitename',
      filter: true,
      editable: false,
      sortable: true
    },
    {
      headerName: 'Machine Serial No.',
      field: 'machineModelName',
      filter: true,
      editable: false,
      sortable: true
    },
    {
      headerName: 'Machine Model Name',
      field: 'machmodelname',
      filter: true,
      editable: false,
      sortable: true
    },
    {
      headerName: 'Contact Person',
      field: 'contactperson',
      filter: true,
      editable: false,
      sortable: true
    },
    {
      headerName: 'Service Type',
      field: 'visittypeName',
      filter: true,
      editable: false,
      sortable: true
    },
    {
      headerName: 'Status',
      field: 'statusName',
      filter: true,
      editable: false,
      sortable: true
    },
    {
      headerName: 'Stage',
      field: 'stageName',
      filter: true,
      editable: false,
      sortable: true
    },
    {
      headerName: 'Raised On',
      field: 'createdon',
      filter: true,
      editable: false,
      sortable: true
    },
    {
      headerName: 'Assigned To',
      field: 'assignedto',
      width: 400,
      cellRendererFramework: ServiceRComponent,
      hide: !this.IsDistributorView,
      cellRendererParams: {
        isDist: this.IsDistributorView
      },
      filter: true,
      editable: false,
      sortable: true
    }]
  }

  private createCustColumnDefs() {
    return [{
      headerName: 'Action',
      field: 'id',
      filter: false,
      enableSorting: false,
      width: 200,
      editable: false,
      sortable: false,
      cellRendererFramework: RenderComponent,
      cellRendererParams: {
        inRouterLink: '/servicerequest',
        deleteLink: 'SR',
        deleteaccess: this.hasDeleteAccess
      },
    },
    {
      headerName: 'Service Request No.',
      field: 'serreqno',
      filter: true,
      enableSorting: true,
      editable: false,
      sortable: true,
    },
    {
      headerName: 'Distributor Name',
      field: 'distributor',
      filter: true,
      enableSorting: true,
      editable: false,
      sortable: true,
    },
    {
      headerName: 'Site Name',
      field: 'sitename',
      filter: true,
      editable: false,
      sortable: true
    },

    {
      headerName: 'Machine Serial No.',
      field: 'machineModelName',
      filter: true,
      editable: false,
      sortable: true
    },
    {
      headerName: 'Machine Model Name',
      field: 'machmodelname',
      filter: true,
      editable: false,
      sortable: true
    },
    {
      headerName: 'Contact Person',
      field: 'contactperson',
      filter: true,
      editable: false,
      sortable: true
    },
    {
      headerName: 'Service Type',
      field: 'visittypeName',
      filter: true,
      editable: false,
      sortable: true
    },
    {
      headerName: 'Schedule Details',
      field: 'scheduledCalls.Time',
      filter: true,
      width: 350,
      editable: false,
      sortable: true
    }
    ]
  }


  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
  }

  getallrecored() {
    this.serviceRequestService.getAll(this.user.userId)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          data.object?.forEach(ser => {
            ser.accepted ? ser.accepted = "Accepted" : ser.accepted = "Not Accepted"
            ser.createdon = this.datepipe.transform(ser.createdon, "MM/dd/yyyy HH:mm")
            if (ser.scheduledCalls.length > 0) {
              ser.scheduledCalls = ser.scheduledCalls[0]
              let date = new Date(ser.scheduledCalls.endTime)
              let datestr = this.datepipe.transform(date, "MM/dd/yyyy")
              ser.scheduledCalls.endTime = this.datepipe.transform(ser.scheduledCalls.endTime, "shortTime")
              ser.scheduledCalls.startTime = this.datepipe.transform(ser.scheduledCalls.startTime, "shortTime")
              ser.scheduledCalls.Time = ser.scheduledCalls.location + " : " + datestr + " At " + ser.scheduledCalls.startTime + " - " + ser.scheduledCalls.endTime
              
            }
          });

          if (this.user.username != 'admin') {
            this.srCustList = data.object;
            this.srDistList = data.object;
            this.srEngList = data.object;
          } else {
            this.srAdminList = data.object;
          }
        },
        error: error => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });
  }

}
