import { Component, OnInit } from '@angular/core';
import { ProfileReadOnly, User } from "../_models";
import { ColDef, ColumnApi, GridApi } from "ag-grid-community";
import { ActivatedRoute, Router } from "@angular/router";
import { AccountService, ProfileService } from "../_services";
import { AudittrailService } from "../_services/audittrail.service";
import { first } from "rxjs/operators";
import { RenderComponent } from "../distributor/rendercomponent";
import { DatePipe } from "@angular/common";

@Component({
  selector: 'app-audittrail',
  templateUrl: './audittrail.component.html',
})
export class AudittrailComponent implements OnInit {

  List: any;
  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;
  user: User;
  datepipie = new DatePipe("en-US");

  hasReadAccess: boolean = false
  hasAddAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  profilePermission: ProfileReadOnly;

  constructor(
    private router: Router,
    private accountService: AccountService,
    private Service: AudittrailService,
    private route: ActivatedRoute,
    private profileService: ProfileService,
  ) {
  }

  ngOnInit(): void {
    this.user = this.accountService.userValue;

    this.profilePermission = this.profileService.userProfileValue;

    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "AUDIT");
      if (profilePermission.length > 0) {
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
        this.hasUpdateAccess = profilePermission[0].update;
        this.hasReadAccess = profilePermission[0].read;
      }
    }

    if (this.user.isAdmin || this.hasReadAccess) {
      this.Service.getAll()
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            data.object.forEach(x => {
              x.createdon = this.datepipie.transform(x.createdon, "dd/MM/YYYY HH:mm:ss")
            })
            this.List = data.object;
          },
        })
    }
    this.columnDefs = this.createColumnDefs();
  }

  EditRecord() {
    var data = this.api.getSelectedRows()[0]
    this.router.navigate([`audittrail/${data.id}`])
  }

  private createColumnDefs() {
    return [
      {
        headerName: "Action",
        field: "action",
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        width: 100
      },
      {
        headerName: "Created On",
        field: "createdon",
        filter: true,
        editable: false,
        sortable: true,
        width: 200
      },
      {
        headerName: "User",
        field: "user",
        filter: true,
        editable: false,
        sortable: true,
        width: 100
      },

      {
        headerName: "Screen",
        field: "screen",
        filter: true,
        editable: false,
        sortable: true,
      },

      {
        headerName: "Old Value",
        field: "oValue",
        filter: true,
        editable: false,
        sortable: true,
      },

      {
        headerName: "New Value",
        field: "nValue",
        filter: true,
        editable: false,
        sortable: true,
      },

    ];
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }

}
