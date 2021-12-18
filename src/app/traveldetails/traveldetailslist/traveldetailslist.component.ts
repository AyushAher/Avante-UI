import {Component, OnInit} from "@angular/core";
import {FormGroup} from "@angular/forms";
import {Router} from "@angular/router";
import {ColDef, ColumnApi, GridApi} from "ag-grid-community";
import {first} from "rxjs/operators";
import {RenderComponent} from "../../distributor/rendercomponent";
import {ProfileReadOnly, travelDetails, User} from "../../_models";
import {AccountService, NotificationService, ProfileService, TravelDetailService} from "../../_services";

@Component({
  selector: "app-traveldetailslist",
  templateUrl: "./traveldetailslist.component.html",
})
export class TraveldetailslistComponent implements OnInit {
  form: FormGroup;
  List: travelDetails[];
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

  data: any;

  constructor(
    private router: Router,
    private accountService: AccountService,
    private Service: TravelDetailService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
  ) {}

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(
        (x) => x.screenCode == "TRDET"
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
    // console.log(this.user.id);

    // this.distributorId = this.route.snapshot.paramMap.get('id');
    this.Service
      .getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          data.object = data.object.filter(x => x.createdby == this.user.userId)
          this.List = data.object;
        },
        error: (error) => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        },
      });
    this.columnDefs = this.createColumnDefs();
  }

  Add() {
    this.router.navigate(["traveldetails"]);
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
          inRouterLink: "/traveldetails",
          deleteLink: "TRDET",
          deleteaccess: this.hasDeleteAccess,
        },
      },
      {
        headerName: "Engineer ",
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
        headerName: "Flight Date",
        field: "flightdetails.flightdate",
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: "code",
      },
      {
        headerName: "Travel Class",
        field: "travelclassname",
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: "code",
      },
      {
        headerName: "From City - To City",
        field: "fromtocity",
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
