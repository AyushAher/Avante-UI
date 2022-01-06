import {Component, OnInit} from '@angular/core';
import {User} from "../_models";
import {ColDef, ColumnApi, GridApi} from "ag-grid-community";
import {ActivatedRoute, Router} from "@angular/router";
import {AccountService} from "../_services";
import {AudittrailService} from "../_services/audittrail.service";
import {first} from "rxjs/operators";
import {RenderComponent} from "../distributor/rendercomponent";
import {DatePipe} from "@angular/common";

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

  constructor(
    private router: Router,
    private accountService: AccountService,
    private Service: AudittrailService,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.user = this.accountService.userValue;
    if (this.user.username == "admin") {
      this.Service.getAll()
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            data.object.forEach(x => {

              let stringFormat = String(x.nValue).replace('`', "")
              stringFormat = stringFormat.replace('`', "")
              var JSONobj = JSON.parse(String(stringFormat))

              x.createdon = this.datepipie.transform(x.createdon, "MM-dd-yyyy HH:mm:ss")
            })
            this.List = data.object;
          },
        })
    }
    this.columnDefs = this.createColumnDefs();
  }

  private createColumnDefs() {
    return [
      {
        headerName: " ",
        field: "id",
        width: 55,
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        cellRendererFramework: RenderComponent,
        cellRendererParams: {
          inRouterLink: "/audittrail",
          deleteLink: "VSDET",
        }
      }, {
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
