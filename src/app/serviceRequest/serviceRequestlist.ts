import { Component, OnInit } from '@angular/core';

import { User, Customer, Country, DistributorRegion, ProfileReadOnly, ServiceRequest } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef,GridApi,ColumnApi} from 'ag-grid-community'; 
import { environment } from '../../environments/environment';
import {
  AccountService, AlertService, CustomerService, CountryService, NotificationService,
  ProfileService, ServiceRequestService, ContactService
} from '../_services';
import { RenderComponent } from '../distributor/rendercomponent';


@Component({
  selector: 'app-distributorRgList',
  templateUrl: './serviceRequestlist.html',
})
export class ServiceRequestListComponent implements OnInit {
  user: User;
  form: FormGroup;
  srCustList: ServiceRequest[];
  srDistList: ServiceRequest[];
  srEngList: ServiceRequest[];
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
  IsCustomerView: boolean = true;
  IsDistributorView: boolean = false;
  IsEngineerView: boolean = false;
  distId: any;
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
    private serviceRequestService: ServiceRequestService,
    private contcactservice: ContactService
  ) {
    
  }
  
  ngOnInit() {
    //debugger;
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

    if (this.user.roleId == environment.custRoleId) {
      this.IsCustomerView = true;
      this.IsDistributorView = false;
      this.IsEngineerView = false;
    }
    else if (this.user.roleId == environment.distRoleId) {
      this.IsCustomerView = false;
      this.IsDistributorView = true;
      this.IsEngineerView = false;
    }
    else {
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
    }
    else if (this.IsEngineerView) {
      this.columnDefs = this.createDisColumnDefs();
    }
    else {
      this.columnDefs = this.createCustColumnDefs();
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
    },{
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
        headerName: 'Assigned To',
        field: 'assignedtoName',
        filter: true,
        editable: false,
        sortable: true
      }
    ]
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
    }, {
      headerName: 'Distributor Name',
      field: 'distributor',
      filter: true,
      enableSorting: true,
      editable: false,
      sortable: true,
      tooltipField: 'distributor',
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
        headerName: 'Country',
        field: 'countryName',
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

  getallrecored() {
    this.serviceRequestService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.srCustList = data.object.filter(x => x.createdby == this.user.userId);
          this.srDistList = data.object.filter(x => x.distid == this.distId);
          this.srEngList = data.object.filter(x => x.assignedto == this.user.contactId);
        },
        error: error => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });
  }

}
