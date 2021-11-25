import { Component, OnInit } from '@angular/core';

import { User, Customer, Country, DistributorRegion, ProfileReadOnly } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef,GridApi,ColumnApi} from 'ag-grid-community'; 

import { AccountService, AlertService, CustomerService, CountryService, NotificationService, ProfileService } from '../_services';
import { RenderComponent } from '../distributor/rendercomponent';


@Component({
  selector: 'app-distributorRgList',
  templateUrl: './customerlist.html',
})
export class CustomerListComponent implements OnInit {
  user: User;
  form: FormGroup;
  customerList: Customer[];
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
    this.customerService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.customerList = data.object;
        },
        error: error => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });
    this.columnDefs = this.createColumnDefs(); 
  }

  Add() {
    this.router.navigate(['customer']);  
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
        inRouterLink: '/customer',
        deleteLink: 'CU',
        deleteaccess: this.hasDeleteAccess
      },
    },{
      headerName: 'Customer Name',
      field: 'custname',
      filter: true,
      enableSorting: true,
      editable: false,
        sortable: true,
        tooltipField: 'custname',
    }, {
      headerName: 'Is Active',
        field: 'isactive',
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