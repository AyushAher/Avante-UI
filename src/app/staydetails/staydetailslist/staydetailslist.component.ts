import {Component, OnInit} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {ColDef, ColumnApi, GridApi} from "ag-grid-community";
import {first} from "rxjs/operators";
import {RenderComponent} from "../../distributor/rendercomponent";
import {ProfileReadOnly, Staydetails, User} from "../../_models";
import {
  AccountService,
  AlertService,
  DistributorService, ListTypeService,
  NotificationService,
  ProfileService,
  StaydetailsService
} from "../../_services";
import {environment} from "../../../environments/environment";

@Component({
  selector: "app-staydetailslist",
  templateUrl: "./staydetailslist.component.html",
})
export class StaydetailsListComponent implements OnInit {
  form: FormGroup;
  List: Staydetails[];
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
    private StayDetailsService: StaydetailsService,
    private notificationService: NotificationService,
    private distributorService: DistributorService,
    private profileService: ProfileService,
    private listTypeService: ListTypeService,

  ) {}

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.listTypeService.getItemById(this.user.roleId).pipe(first()).subscribe();
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(
        (x) => x.screenCode == "STDET"
      );
      if (profilePermission.length > 0) {
        this.hasReadAccess = profilePermission[0].read;
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
        this.hasUpdateAccess = profilePermission[0].update;
      }
    }
    if (this.user.username == "admin") {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
      this.hasUpdateAccess = true;
      this.hasReadAccess = true;
    }

    let role = JSON.parse(localStorage.getItem('roles'));
    role = role[0].itemCode;

    this.StayDetailsService
      .getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.distributorService.getByConId(this.user.contactId)
            .pipe(first())
            .subscribe({
              next: (data1: any) => {
                if (role == environment.distRoleCode) {
                  this.List = data.object.filter(x => x.distId == data1.object[0].id)
                } else if (role == environment.engRoleCode) {
                  data.object = data.object.filter(x => x.createdby == this.user.userId)
                  this.List = data.object;
                } else {
                  this.List = data.object
                }
              }
            })
        },
        error: (error) => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        },
      });
    this.columnDefs = this.createColumnDefs();
  }

  Add() {
    this.router.navigate(["staydetails"]);
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
          inRouterLink: "/staydetails",
          deleteLink: "STDET",
          deleteaccess: this.hasDeleteAccess,
        },
      },
      {
        headerName: "Engineer",
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
        headerName: "Checkin Date",
        field: "checkindate",
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: "code",
      },
      {
        headerName: "Accomodation Type",
        field: "accomodationtypename",
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
    ];
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    // this.api.sizeColumnsToFit();
  }
}
