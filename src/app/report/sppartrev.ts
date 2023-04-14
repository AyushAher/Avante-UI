import { Component, OnInit } from '@angular/core';

import { User, Customer, Country, DistributorRegion, ProfileReadOnly, Amc } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef,GridApi,ColumnApi} from 'ag-grid-community'; 

import {
  AccountService, AlertService, CustomerService, CountryService,
  NotificationService, ProfileService, ServiceReportService, AmcService, zohoapiService
} from '../_services';
import { RenderComponent } from '../distributor/rendercomponent';



@Component({
  selector: 'app-distributorRgList',
  templateUrl: './sppartrev.html',
})
export class sppartrevComponent implements OnInit {
  user: User;
  form: FormGroup;
  AmcList: any;
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
  pageData: any;
  currentpage: any;
  has_more_data: boolean;

  private zohocode: string;
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private customerService: CustomerService,
    private countryService: CountryService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private AmcService: AmcService,
    private zohoservice: zohoapiService,
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
    if (this.user.isAdmin) {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
    }
    this.route.queryParams.subscribe(params => {
      this.zohocode = params['code'];
    });

    this.form = this.fb.group({
      search: ['']
    });

    debugger;
    //this.accountService.clear();
    if (this.accountService.zohoauthValue == null) {
      if (this.zohocode == null) {
        this.zohoservice.authservice();
      }
      else {
        this.zohoservice.authwithcode(this.zohocode).subscribe({
          next: (data: any) => {
            //alert(data.access_token);
            sessionStorage.setItem('zohotoken', JSON.stringify(data.object));
            this.accountService.zohoauthSet(data.object);
            this.getsrcontrev("",1);
          },
          error: error => {
            
            this.loading = false;
          }
        });
      }
    }

    // this.distributorId = this.route.snapshot.paramMap.get('id');
    if (this.accountService.zohoauthValue != null) {
      this.getsrcontrev("",1);
    }
    this.columnDefs = this.createColumnDefs();
  }



  getsrcontrev(custname: string, page: number) {
    this.zohoservice.getSrConrtactRevenue(custname,page)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.AmcList = data.object.filter(x => x.cf_service_type == "Service Spares Sales");
          this.pageData = data.extraObject;
          this.currentpage = this.pageData.page;
          this.has_more_data = this.pageData.has_more_page;
        },
        error: error => {
          
          this.loading = false;
        }
      });
  }


  onSubmit() {
    //debugger;
    if (this.form.invalid) {
      return;
    }
    
    this.getsrcontrev(this.form.value.search,1);
  }

  private createColumnDefs() {
    return [{
      headerName: 'Customer Name',
      field: 'customer_name',
      filter: true,
        editable: false,
      sortable: true,
      tooltipField: 'customer_name',
      },
      {
        headerName: 'SalesOrder Number',
        field: 'salesorder_number',
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: 'salesorder_number',
      },
      {
        headerName: 'Payment',
        field: 'total',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'total',
      },
      {
        headerName: 'Type',
        field: 'cf_service_type',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'cf_service_type',
      },
      {
        headerName: 'Date',
        field: 'date',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'date',
      }
    ]
  }  

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }
  onNext() {
    if (this.pageData.has_more_page) {
      this.currentpage = this.pageData.page + 1;
      this.getsrcontrev(this.form.value.search, this.currentpage);
    }
  }

  onPrev() {
    this.currentpage = this.pageData.page - 1;
    this.getsrcontrev(this.form.value.search, this.currentpage);
  }
}
