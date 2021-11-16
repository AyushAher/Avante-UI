import { Component, OnInit } from '@angular/core';

import { User, Customer, Country, DistributorRegion, ProfileReadOnly, Amc, ServiceReport } from '../_models';
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
  templateUrl: './srrpt.html',
})
export class srrptComponent implements OnInit {
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
    private ServiceReportService: ServiceReportService
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
    

    this.form = this.fb.group({
      search: ['']
    });
    this.getrpt("");
    this.columnDefs = this.createColumnDefs();
  }



  getrpt(custname: string) {
    debugger;
    this.ServiceReportService.getbycust(custname)
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
  }


  onSubmit() {
    //debugger;
    if (this.form.invalid) {
      return;
    }

    this.getrpt(this.form.value.search);
  }

  private createColumnDefs() {
    return [{
      headerName: 'Sr No',
      field: 'id',
      filter: false,
      enableSorting: false,
      width: 150,
      editable: false,
      sortable: false,
    }, {
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
