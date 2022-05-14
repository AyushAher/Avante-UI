import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ColDef, ColumnApi, GridApi } from "ag-grid-community";
import { first } from "rxjs/operators";
import { RenderComponent } from "../distributor/rendercomponent";
import { ProfileReadOnly, User } from "../_models";
import { AccountService, ProfileService } from "../_services";
import { TravelinvoiceService } from "../_services/travelinvoice.service";

@Component({
    selector: 'app-travelexpense',
    templateUrl: './travelinvoicelist.component.html',
})

export class TravelInvoiceListComponent implements OnInit {

    public columnDefs: ColDef[];
    private columnApi: ColumnApi;
    private api: GridApi;
    profilePermission: ProfileReadOnly;
    hasReadAccess: boolean = false;
    hasUpdateAccess: boolean = false;
    hasDeleteAccess: boolean = false;
    hasAddAccess: boolean = false;
    user: User;

    List: any;
    constructor(
        private router: Router,
        private accountService: AccountService,
        private Service: TravelinvoiceService,
        private profileService: ProfileService,
    ) { }

    ngOnInit(): void {
        this.user = this.accountService.userValue;
        let role;
        this.profilePermission = this.profileService.userProfileValue;
        if (this.profilePermission != null) {
            let profilePermission = this.profilePermission.permissions.filter(
                (x) => x.screenCode == "TREXP"
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
        } else {
            role = JSON.parse(localStorage.getItem('roles'));
            role = role[0].itemCode;
        }

        this.Service.getAll().pipe(first())
            .subscribe((data: any) => this.List = data.object)

        this.columnDefs = this.createColumnDefs();
    }

    Add() {
        this.router.navigate(["travelinvoice"]);
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
                    inRouterLink: "/travelinvoice",
                    deleteLink: "TRIVC",
                    deleteaccess: false,
                },
            },
            {
                headerName: "Engineer ",
                field: "engineerName",
                filter: true,
                enableSorting: true,
                editable: false,
                sortable: true,
                tooltipField: "name",
            },
            {
                headerName: "Service Request No",
                field: "serviceRequestNo",
                filter: true,
                editable: false,
                sortable: true,
                tooltipField: "code",
            },
            {
                headerName: "Amount Build",
                field: "amountBuild",
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
        this.api.sizeColumnsToFit();
    }
}