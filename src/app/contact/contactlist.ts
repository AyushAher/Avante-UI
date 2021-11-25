import { Component, OnInit } from '@angular/core';

import { User, Contact, Country, DistributorRegion, Customer, ProfileReadOnly } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef,GridApi,ColumnApi} from 'ag-grid-community'; 

import {
  AccountService, AlertService, ContactService, CountryService, DistributorService, CustomerService,
  DistributorRegionService, CustomerSiteService, NotificationService, ProfileService
} from '../_services';
import { RenderComponent } from '../distributor/rendercomponent';


@Component({
  selector: 'app-contactlist',
  templateUrl: './contactlist.html',
})
export class ContactListComponent implements OnInit {
  user: User;
  form: FormGroup;
  contactList: Contact[];
  loading = false;
  submitted = false;
  isSave = false;
  customerId: string;
  type: string = "D";
  masterId: string;
  detailId: string;
  countries: Country[];
  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private contactService: ContactService,
    private countryService: CountryService,
    private distributorService: DistributorService,
    private customerService: CustomerService,
    private distRegionService: DistributorRegionService,
    private customerSiteService: CustomerSiteService,
    private notificationService: NotificationService,
    private profileService: ProfileService
  ) {
    
  }
  
  ngOnInit() {
    // this.distributorId = this.route.snapshot.paramMap.get('id');
    this.masterId = this.route.snapshot.paramMap.get('id');
    this.detailId = this.route.snapshot.paramMap.get('cid');
    this.type = this.route.snapshot.paramMap.get('type');

    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      if (this.type == "DR" || this.type == "D") {
        let profilePermission = this.profilePermission.permissions.filter(x => x.screenName == "SDIST");
        if (profilePermission.length > 0) {
          this.hasReadAccess = profilePermission[0].read;
          this.hasAddAccess = profilePermission[0].create;
          this.hasDeleteAccess = profilePermission[0].delete;
          this.hasUpdateAccess = profilePermission[0].update;
        }
      }

      if (this.type == "C" || this.type == "CS") {
        let profilePermission = this.profilePermission.permissions.filter(x => x.screenName == "SCUST");
        if (profilePermission.length > 0) {
          this.hasReadAccess = profilePermission[0].read;
          this.hasAddAccess = profilePermission[0].create;
          this.hasDeleteAccess = profilePermission[0].delete;
          this.hasUpdateAccess = profilePermission[0].update;
        }
      }
    }

    if (this.user.username == "admin") {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
      this.hasUpdateAccess = true;
      this.hasReadAccess = true;
    }

    if (this.type == "DR" || this.type == "CS") {
      this.columnDefs = this.createColumnDefsForDetail();
    }
    else {
      this.columnDefs = this.createColumnDefs();
    }
    if (this.type == "D") {
      this.distributorService.getById(this.masterId)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.contactList = data.object.contacts;
          },
          error: error => {
            this.notificationService.showSuccess(error, "Error");
            this.loading = false;
          }
        });
    }
    else if (this.type == "DR") {
      this.distRegionService.getById(this.detailId)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.contactList = data.object.contacts;
          },
          error: error => {
            this.notificationService.showSuccess(error, "Error");
            this.loading = false;
          }
        });
     // this.contact.contactMapping.mappedFor = "REG";
    }
    else if (this.type == "C") {
      this.customerService.getById(this.masterId)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.contactList = data.object.contacts;
          },
          error: error => {
            this.notificationService.showSuccess(error, "Error");
            this.loading = false;
          }
        });
    }
    else if (this.type == "CS") {
      //this.contact.contactMapping.mappedFor = "SITE";
      this.customerSiteService.getById(this.detailId)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.contactList = data.object.contacts;
          },
          error: error => {
            this.notificationService.showSuccess(error, "Error");
            this.loading = false;
          }
        });
    }

  }

  Add() {
    //debugger;
    if (this.type == "DR" || this.type == "CS") {
      this.router.navigate(['contact', this.type, this.masterId, this.detailId]);
    }
    else{
      this.router.navigate(['contact', this.type, this.masterId]);
    }
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
        inRouterLink: '/contact/' + this.type + '/' + this.masterId + '/',
        deleteLink: 'C'
      },
    },{
      headerName: 'first Name',
      field: 'fname',
      filter: true,
      enableSorting: true,
      editable: false,
        sortable: true,
        tooltipField: 'fname',
    }, {
      headerName: 'email',
        field: 'pemail',
      filter: true,
        editable: false,
        sortable: true,
        tooltipField: 'pemail',
      },
      
    ]
  }

  private createColumnDefsForDetail() {
    return [{
      headerName: 'Action',
      field: 'id',
      filter: true,
      enableSorting: true,
      editable: false,
      sortable: true,
      cellRendererFramework: RenderComponent,
      cellRendererParams: {
        inRouterLink: '/contact/' + this.type + '/' + this.masterId + '/' + this.detailId + '/'
      },
    },{
      headerName: 'first Name',
      field: 'fname',
      filter: true,
      enableSorting: true,
      editable: false,
        sortable: true,
        tooltipField: 'fname',
    }, {
      headerName: 'email',
      field: 'pemail',
      filter: true,
      editable: false,
        sortable: true,
        tooltipField: 'pemail',
    },
    
    ]
  }


  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }

}