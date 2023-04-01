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
  templateUrl: './custpay.html',
})
export class CustPayComponent implements OnInit {
  user: User;
  form: FormGroup;
  AmcList: any;
  loading = false;
  submitted = false;
  isSave = false;
  customerId: string;
  type: string = "D";
  pageData: any;
  currentpage: any;
  has_more_data: boolean;
  countries: Country[];
  profilePermission: ProfileReadOnly;
  hasAddAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;

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
            debugger;
            //alert(data.access_token);
            localStorage.setItem('zohotoken', JSON.stringify(data.object));
            debugger;
            this.accountService.zohoauthSet(data.object);
            this.getinvoice("",1);
          },
          error: error => {
            
            this.loading = false;
          }
        });
      }
    }

    // this.distributorId = this.route.snapshot.paramMap.get('id');
    if (this.accountService.zohoauthValue != null) {
      this.getinvoice("",1);
    }
    this.columnDefs = this.createColumnDefs();
  }



  getinvoice(custname:string,page:number) {
    this.zohoservice.getAllCustomerPayments(custname,page)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          debugger;
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
    
    this.getinvoice(this.form.value.search,1);
  }


  onNext() {
    if (this.pageData.has_more_page) {
      this.currentpage = this.pageData.page + 1;
      this.getinvoice(this.form.value.search, this.currentpage);
    }    
  }

  onPrev() {
    this.currentpage = this.pageData.page - 1;
    this.getinvoice(this.form.value.search, this.currentpage);
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
        headerName: 'Payment',
        field: 'amount',
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: 'amount'
      },
      {
        headerName: 'Invoice Number',
        field: 'invoice_numbers',
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: 'invoice_numbers'
      },
      {
        headerName: 'Payment Mode',
        field: 'payment_mode',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'payment_mode',
      },
      {
        headerName: 'Type',
        field: 'payment_type',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'payment_type',
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

}
