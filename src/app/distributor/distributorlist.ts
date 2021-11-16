import { Component, OnInit } from '@angular/core';

import { User, Distributor, Country, ProfileReadOnly } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef,GridApi,ColumnApi} from 'ag-grid-community'; 

import { AccountService, AlertService, DistributorService, CountryService, NotificationService, ProfileService } from '../_services';
import { RenderComponent } from './rendercomponent';


@Component({
  selector: 'app-distributorList',
  templateUrl: './distributorlist.html',
})
export class DistributorListComponent implements OnInit {
  user: User;
  form: FormGroup;
  distributorModel: Distributor[];
  loading = false;
  submitted = false;
  isSave = false;
  distributorId: string;
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
    private distributorService: DistributorService,
    private countryService: CountryService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
  ) {
    
  }
  
  ngOnInit() {
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SDIST");
      if (profilePermission.length > 0) {
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
      }
    }
   // this.hasAddAccess = this.profilePermission.permissions.filter(x => x.screenName == "Distributor")[0].create;
    if (this.user.username == "admin") {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
    }
    this.columnDefs = this.createColumnDefs();
    // this.distributorId = this.route.snapshot.paramMap.get('id');
    this.distributorService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          //debugger;
          this.distributorModel = data.object;

        },
        error: error => {
          this.notificationService.showError(error, "Error");
          //this.alertService.error(error);
          this.loading = false;
        }
      });

  }

  Add() {
    this.router.navigate(['distributor']);  
  }

  delete(value: any) {
    //debugger;
    this.distributorService.delete(value)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          //debugger;
          alert('deleted');
        },
        error: error => {
         // this.alertService.error(error);
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });
  }

  private createColumnDefs() {
    return [
      {
        headerName: 'Action',
        field: 'id',
        filter: false,
        enableSorting: false,
        editable: false,
        width: 100,
        sortable: false,
        cellRendererFramework: RenderComponent,
        cellRendererParams: {
          inRouterLink: '/distributor',
          deleteLink: 'D',
          deleteaccess: this.hasDeleteAccess
        },
      },
      {
      headerName: 'Distributor Name',
      field: 'distname',
      filter: true,
      tooltipField: 'distname',
      enableSorting: true,
      editable: false,
        sortable: true
      //cellRenderer: function (params) {
      //  let keyData = params.data.id;
      //  let columnName = params.data.distname
      //  let newLink = `<a  routerLink="/distributor/${keyData}" routerLinkActive="active">${columnName}</a>`;
      //  return newLink;
      //}
      //cellRendererFramework: RenderComponent,
      //cellRendererParams: {
      //  inRouterLink: '/distributor'
      //},
    },
      {
      headerName: 'Pay Term',
        field: 'payterms',
      filter: true,
        editable: false,
        sortable: true,
        tooltipField: 'payterms',
      }
    ]
  }  

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    
    this.api.sizeColumnsToFit();
  }

}
