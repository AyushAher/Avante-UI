import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';
import { first } from 'rxjs/operators';
import { RenderComponent } from '../../distributor/rendercomponent';
import { LocalExpenses, ProfileReadOnly, User } from '../../_models';
import {
  AccountService,
  AlertService,
  DistributorService,
  ListTypeService,
  LocalExpensesService,
  NotificationService,
  ProfileService
} from '../../_services';
import { environment } from "../../../environments/environment";
import { EnvService } from 'src/app/_services/env/env.service';

@Component({
  selector: 'app-localexpenseslist',
  templateUrl: './localexpenseslist.component.html',
})
export class LocalexpenseslistComponent implements OnInit {
  form: FormGroup;
  List: LocalExpenses[];
  loading = false;
  submitted = false;
  isSave = false;
  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  user: User;


  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private Service: LocalExpensesService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private distributorService: DistributorService,
    private listTypeService: ListTypeService,
    private environment: EnvService,
  ) { }

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.listTypeService.getItemById(this.user.roleId).pipe(first()).subscribe();
    let role = JSON.parse(localStorage.getItem('roles'));

    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(
        (x) => x.screenCode == "LCEXP"
      );
      if (profilePermission.length > 0) {
        this.hasReadAccess = profilePermission[0].read;
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
        this.hasUpdateAccess = profilePermission[0].update;
      }
    }
    if (this.user.isAdmin) {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
      this.hasUpdateAccess = true;
      this.hasReadAccess = true;
    } else {
      role = role[0]?.itemCode;
    }

    this.Service.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          if (this.user.username != "admin") {

            this.distributorService.getByConId(this.user.contactId)
              .pipe(first())
              .subscribe({
                next: (data1: any) => {
                  if (role == this.environment.distRoleCode) {
                    this.List = data.object.filter(x => x.distId == data1.object[0].id)
                  } else if (role == this.environment.engRoleCode) {
                    data.object = data.object.filter(x => x.engineerid == this.user.contactId)
                    this.List = data.object;
                  } else {
                    this.List = data.object
                  }
                }
              })
          } else {
            this.List = data.object
          }
        },
        error: (error) => {
          
          this.loading = false;
        },
      });
    this.columnDefs = this.createColumnDefs();
  }

  Add() {
    this.router.navigate(["localexpenses"]);
  }

  private createColumnDefs() {
    return [
      {
        headerName: "Action",
        field: "id",
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        cellRendererFramework: RenderComponent,
        cellRendererParams: {
          inRouterLink: "/localexpenses",
          deleteLink: "LCEXP",
          deleteaccess: this.hasDeleteAccess,
        },
      },
      {
        headerName: "Engineer Name",
        field: "engineername",
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: "name",
      },
      {
        headerName: "Service Request No",
        field: "servicerequestno",
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: "code",
      },
      {
        headerName: "City",
        field: "city",
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: "code",
      },
      {
        headerName: "Amount",
        field: "totalamount",
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: "code",
      },
      {
        headerName: "Travel Date",
        field: "traveldate",
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: "code",
      },

    ];
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    // this.api.sizeColumnsToFit();
  }
}
