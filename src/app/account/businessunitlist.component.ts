import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ColDef, ColumnApi, GridApi } from "ag-grid-community";
import { Amc, User } from "../_models";
import { AccountService } from "../_services";
import { BusinessUnitService } from "../_services/businessunit.service";

@Component({
    selector: "CreateBrand",
    templateUrl: "./businessunitlist.component.html"
})

export class BusinessUnitListComponent implements OnInit {

    user: User;
    BrandList: any;
    hasAddAccess: boolean = false;
    hasDeleteAccess: boolean = false;
    public columnDefs: any
    private columnApi: ColumnApi;
    private api: GridApi;

    constructor(
        private router: Router,
        private accountService: AccountService,
        private BusinessUnitService: BusinessUnitService,
    ) { }

    async ngOnInit() {
        this.user = this.accountService.userValue;

        if (this.user.isAdmin) {
            this.hasAddAccess = true;
            this.hasDeleteAccess = true;
        }

        var data: any = await this.BusinessUnitService.GetByCompanyId().toPromise()

        this.BrandList = data.object;
        this.columnDefs = this.createColumnDefs();
    }

    Add() {
        this.router.navigate(['businessunit']);
    }


    EditRecord() {
        var data = this.api.getSelectedRows()[0]
        this.router.navigate([`businessunit/${data.id}`])
    }

    private createColumnDefs() {
        return [
            {
                headerName: 'Company',
                field: 'companyName',
                filter: true,
                enableSorting: true,
                editable: false,
                sortable: true,
                tooltipField: 'companyName',
            },
            {
                headerName: 'Business Unit',
                field: 'businessUnitName',
                filter: true,
                sortable: true,
                tooltipField: "businessUnitName",
                width: "1000"
            },
        ]
    }

    onGridReady(params): void {
        this.api = params.api;
        this.columnApi = params.columnApi;
    }

}
