import { Component, OnInit } from '@angular/core';

import { User, Customer, Country, DistributorRegion, ProfileReadOnly, Amc } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, GridApi, ColumnApi } from 'ag-grid-community';

import {
  AccountService, AlertService, CustomerService, CountryService,
  NotificationService, ProfileService, ServiceReportService, AmcService, zohoapiService
} from '../_services';
import { RenderComponent } from '../distributor/rendercomponent';
import { environment } from 'src/environments/environment';



@Component({
  selector: 'app-distributorRgList',
  templateUrl: './sostatus.html',
})
export class sostatusComponent implements OnInit {
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
    if (this.user.username == "admin") {
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
        window.location.href = environment.commonzohocodeapi + 'sostatus' + '&access_type=offline';
      }
      else {
        this.zohoservice.authwithcode(this.zohocode, "sostatus").subscribe({
          next: (data: any) => {
            localStorage.setItem('zohotoken', JSON.stringify(data.object));
            this.accountService.zohoauthSet(data.object);
            this.getquotation("", 1);
          },
          error: error => {
            
            this.loading = false;
          }
        });
      }
    }

    // this.distributorId = this.route.snapshot.paramMap.get('id');
    if (this.accountService.zohoauthValue != null) {
      this.getquotation("", 1);
    }
    this.columnDefs = this.createColumnDefs();
  }



  getquotation(custname: string, page: number) {
    this.zohoservice.getsostatus(custname, page)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.AmcList = data.object;
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

    this.getquotation(this.form.value.search, 1);
  }

  onNext() {
    if (this.pageData.has_more_page) {
      this.currentpage = this.pageData.page + 1;
      this.getquotation(this.form.value.search, this.currentpage);
    }
  }

  onPrev() {
    this.currentpage = this.pageData.page - 1;
    this.getquotation(this.form.value.search, this.currentpage);
  }

  private createColumnDefs() {
    return [{
      headerName: 'Customer Name',
      field: 'cf_intended_customer',
      filter: true,
      editable: false,
      sortable: true,
      tooltipField: 'cf_intended_customer'
    },
    {
      headerName: 'Payment',
      field: 'total',
      filter: true,
      editable: false,
      sortable: true,
      tooltipField: 'total'
    },
    {
      headerName: 'PO Number',
      field: 'purchaseorder_number',
      filter: true,
      editable: false,
      sortable: true,
      tooltipField: 'purchaseorder_number'
    },
    {
      headerName: 'ProjectNo',
      field: 'cf_project_no',
      filter: true,
      enableSorting: true,
      editable: false,
      sortable: true,
      tooltipField: 'cf_project_no',
    },
    {
      headerName: 'MachineMode',
      field: 'cf_brand',
      filter: true,
      enableSorting: true,
      editable: false,
      sortable: true,
      tooltipField: 'cf_brand',
    },
    {
      headerName: 'Reference Number',
      field: 'reference_number',
      filter: true,
      enableSorting: true,
      editable: false,
      sortable: true,
      tooltipField: 'reference_number',
    },
    {
      headerName: 'PO Date',
      field: 'date',
      filter: true,
      enableSorting: true,
      editable: false,
      sortable: true,
      tooltipField: 'date',
    },
    {
      headerName: 'Status',
      field: 'status',
      filter: true,
      enableSorting: true,
      editable: false,
      sortable: true,
      tooltipField: 'status',
    },

    ]
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }

}
