import { Component, OnInit } from '@angular/core';

import { User, Customer, Country, DistributorRegion, ProfileReadOnly, Amc } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, GridApi, ColumnApi } from 'ag-grid-community';

import {
  AccountService, AlertService, CustomerService, CountryService,
  NotificationService, ProfileService, ServiceReportService, AmcService
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
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private customerService: CustomerService,
    private countryService: CountryService,
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
          this.notificationService.showError(error, "Error");
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
        deleteLink: 'a',
        deleteaccess: this.hasDeleteAccess
      },
    }, {
      headerName: 'Bill To',
      field: 'billto',
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
