import {Component, OnInit} from '@angular/core';

import {Country, ProfileReadOnly, ServiceReport, User} from '../_models';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup} from '@angular/forms';
import {first} from 'rxjs/operators';
import {ColDef, ColumnApi, GridApi} from 'ag-grid-community';

import {
  AccountService,
  AlertService,
  CountryService,
  CustomerService,
  NotificationService,
  ProfileService,
  ServiceReportService
} from '../_services';
import {RenderComponent} from '../distributor/rendercomponent';


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
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private customerService: CustomerService,
    private countryService: CountryService,
    private notificationService: NotificationService,
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
    }


    // this.distributorId = this.route.snapshot.paramMap.get('id');
    this.ServiceReportService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.ServiceReportList = data.object;
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
    },{
      headerName: 'Customer Name',
      field: 'customer',
      filter: true,
      enableSorting: true,
      editable: false,
        sortable: true,
      tooltipField: 'customer',
    }, {
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
      }
    ]
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }

}
