import {Component, OnInit} from "@angular/core";
import {ColDef, ColumnApi, GridApi} from "ag-grid-community";
import {FormGroup} from "@angular/forms";
import {Router} from "@angular/router";
import {AccountService, NotificationService, ProfileService} from "../_services";
import {CustspinventoryService} from "../_services/custspinventory.service";
import {RenderComponent} from "../distributor/rendercomponent";
import {Custspinventory} from "../_models/custspinventory";
import {first} from "rxjs/operators";
import {User} from "../_models";

@Component({
  selector: "app-Custspinventorylist",
  templateUrl: "./Custspinventorylist.component.html",
})

export class CustspinventorylistComponent implements OnInit {
  form: FormGroup;
  model: Custspinventory;
  loading = false;
  submitted = false;
  isSave = false;
  type: string;
  id: string;
  user: User;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  hasInternalAccess: boolean = false;
  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;
  profilePermission: any;

  constructor(
    private router: Router,
    private accountService: AccountService,
    private notificationService: NotificationService,
    private Service: CustspinventoryService,
    private profileService: ProfileService,
  ) {
  }

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.columnDefs = this.createColumnDefs();
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "CTSPI");
      if (profilePermission.length > 0) {
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
      }
    }
    if (this.user.username == "admin") {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
    }

    this.Service.getAll(this.user.contactId)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.model = data.object;
        },
        error: (error) => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        },
      });
  }

  Add() {
    this.router.navigate(["customerspinventory"]);
  }

  private createColumnDefs() {
    return [
      {
        headerName: "Action",
        field: "id",
        filter: false, enableSorting: false,
        editable: false,
        sortable: false,
        cellRendererFramework: RenderComponent,
        cellRendererParams: {
          inRouterLink: "/customerspinventory",
          deleteLink: "CUSTS",
          deleteaccess: this.hasDeleteAccess,
        },
      },
      {
        headerName: "Configtype",
        field: "configTypeId",
        filter: true,
        tooltipField: "configtype",
        enableSorting: true,
        editable: false,
        sortable: true,
      },
      {
        headerName: "ConfigValue",
        field: "configValueId",
        filter: true,
        tooltipField: "configvalue",
        enableSorting: true,
        editable: false,
        sortable: true,
      },
      {
        headerName: "Partno",
        field: "partNo",
        filter: true,
        tooltipField: "partno",
        enableSorting: true,
        editable: false,
        sortable: true,
      },
      {
        headerName: "Hsccode",
        field: "hscCode",
        filter: true,
        tooltipField: "hsccode",
        enableSorting: true,
        editable: false,
        sortable: true,
      },
      {
        headerName: "Qtyavailable",
        field: "qtyAvailable",
        filter: true,
        tooltipField: "qtyavailable",
        enableSorting: true,
        editable: false,
        sortable: true,
      },
    ]
  }

  onGridReady(params: any): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    // this.api.sizeColumnsToFit();

  }
}
