import { Component, OnInit } from '@angular/core';

import { User, Customer, Country, DistributorRegion, ProfileReadOnly, Amc, requestPO } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef,GridApi,ColumnApi} from 'ag-grid-community'; 

import {
  AccountService, AlertService, CustomerService, CountryService,
  NotificationService, ProfileService, requestpoService
} from '../_services';
import { RenderComponent } from '../distributor/rendercomponent';


@Component({
  selector: 'app-distributorRgList',
  templateUrl: './ServiceReportlist.html',
})
export class RequestPOListComponent implements OnInit {
  user: User;
  form: FormGroup;
  requestList: requestPO[];
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
    private requestposervice: requestpoService
  ) {
    
  }
  
  ngOnInit() {

    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SCUST");
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
    this.requestposervice.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.requestList = data.object;
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
      width: 100,
      editable: false,
      sortable: false,
      cellRendererFramework: RenderComponent,
      cellRendererParams: {
        inRouterLink: '/requestpo',
        deleteLink: 'a',
        deleteaccess: this.hasDeleteAccess
      },
    },{
      headerName: 'ConfigType',
      field: 'configtype',
      filter: true,
      enableSorting: true,
      editable: false,
        sortable: true,
      tooltipField: 'configtype',
    }, {
      headerName: 'ConfigValue',
      field: 'configvalue',
      filter: true,
        editable: false,
      sortable: true
      },
      {
        headerName: 'PartNo',
        field: 'partno',
        filter: true,
        editable: false,
        sortable: true
      },
      {
        headerName: 'HSC Code',
        field: 'hsccode',
        filter: true,
        editable: false,
        sortable: true
      },
      {
        headerName: 'Qty',
        field: 'qty',
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
