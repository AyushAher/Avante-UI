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
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-distributorRgList',
  templateUrl: './Reportlist.html',
})
export class ReportListComponent implements OnInit {
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
  private zohocode: string;
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
    debugger;
    //this.accountService.clear();
    if (this.accountService.zohoauthValue == null) {
      if (this.zohocode == null) {
        window.location.href = environment.commonzohocodeapi + 'reportlist' + '&access_type=offline';
      }
      else {
        this.zohoservice.authwithcode(this.zohocode,"reportlist").subscribe({
          next: (data: any) => {
            debugger;
            //alert(data.access_token);
            localStorage.setItem('zohotoken', JSON.stringify(data.object));
            this.accountService.zohoauthSet(data.object);
            this.getinvoice();
          },
          error: error => {
            
            this.loading = false;
          }
        });
      }
    }

    // this.distributorId = this.route.snapshot.paramMap.get('id');
    if (this.accountService.zohoauthValue != null) {
      this.getinvoice();
    }
    this.columnDefs = this.createColumnDefs();
  }

  getinvoice() {
    this.zohoservice.getAllinvoice()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.AmcList = data.object;
        },
        error: error => {
          
          this.loading = false;
        }
      });
  }

  Add() {
    this.router.navigate(['amc']);  
  }
 

  private createColumnDefs() {
    return [{
      headerName: 'invoice_id',
      field: 'invoice_id',
      filter: true,
      enableSorting: true,
      editable: false,
        sortable: true,
      tooltipField: 'invoice_id',
    }, {
      headerName: 'customer_name',
      field: 'customer_name',
      filter: true,
        editable: false,
      sortable: true
      },
      {
        headerName: 'email',
        field: 'email',
        filter: true,
        editable: false,
        sortable: true
      },
      {
        headerName: 'invoice_number',
        field: 'invoice_number',
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
