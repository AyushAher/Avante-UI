import { Component, OnInit } from '@angular/core';

import { User, Customer, Country, Instrument, Profile, UserProfile, ProfileReadOnly } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef,GridApi,ColumnApi} from 'ag-grid-community'; 

import { AccountService, AlertService, CountryService, InstrumentService, NotificationService, ProfileService, UserProfileService } from '../_services';
import { RenderComponent } from '../distributor/rendercomponent';


@Component({
  selector: 'app-instuList',
  templateUrl: './userprofilelist.html',
})
export class UserProfileListComponent implements OnInit {
  user: User;
  form: FormGroup;
  userprofileList: UserProfile[];
  loading = false;
  submitted = false;
  isSave = false;
  customerId: string;
  type: string = "D";
  countries: Country[];
  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;  
  profilePermission: ProfileReadOnly;
  hasAddAccess: boolean = false;
  hasDeleteAccess: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private instrumentService: InstrumentService,
    private countryService: CountryService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private userprofileService: UserProfileService,
  ) {
    
  }
  
  ngOnInit() {

    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "URPRF");
      if (profilePermission.length > 0) {
        // this.hasReadAccess = profilePermission[0].read;
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
        // this.hasUpdateAccess = profilePermission[0].update;
      }
    }

    if (this.user.username == "admin") {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
     // this.hasUpdateAccess = true;
//this.hasReadAccess = true;
    }


    // this.distributorId = this.route.snapshot.paramMap.get('id');
    this.userprofileService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          //debugger;
          this.userprofileList = data.object;
        },
        error: error => {
           this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });
    this.columnDefs = this.createColumnDefs(); 
  }

  Add() {
    this.router.navigate(['userprofile']);  
  }
 

  private createColumnDefs() {
    return [
      {
        headerName: 'Action',
        field: 'id',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        width: 100,
        cellRendererFramework: RenderComponent,
        cellRendererParams: {
          inRouterLink: '/userprofile',
          deleteLink: 'UP',
          deleteaccess: this.hasDeleteAccess
        },
      },
      {
      headerName: 'Username',
        field: 'username',
      filter: true,
      enableSorting: true,
      editable: false,
        sortable: true,
        tooltipField: 'username',
      },
      {
        headerName: 'Profile Name',
        field: 'profileName',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'profileName',
      }
    ]
  }  

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }

}
