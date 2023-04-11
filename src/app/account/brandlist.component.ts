import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ColDef, ColumnApi, GridApi } from "ag-grid-community";
import { Amc, User } from "../_models";
import { AccountService } from "../_services";
import { BrandService } from "../_services/brand.service";

@Component({
    selector: "CreateBrand",
    templateUrl: "./brandlist.component.html"
})

export class BrandListComponent implements OnInit {

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
        private BrandService: BrandService,
        private route: ActivatedRoute
    ) { }

    async ngOnInit() {
        this.user = this.accountService.userValue;

        if (this.user.isAdmin) {
            this.hasAddAccess = true;
            this.hasDeleteAccess = true;
        }

        var data: any = await this.BrandService.GetByCompanyId().toPromise()

        this.BrandList = data.object;
        this.columnDefs = this.createColumnDefs();
    }

    Add() {
        this.router.navigate(['brand'],
            {
                queryParams: {
                    isNSNav: false
                },// remove to replace all query params by provided
            });

    }


    EditRecord() {
        var data = this.api.getSelectedRows()[0]
        this.router.navigate([`brand/${data.id}`], {
            queryParams: {
                isNSNav: true
            }
        });
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
                width: "450"
            },
            {
                headerName: 'Business Unit',
                field: 'businessUnit',
                filter: true,
                enableSorting: true,
                editable: false,
                sortable: true,
                tooltipField: 'businessUnit',
                width: "440"
            },
            {
                headerName: 'Brand Name',
                field: 'brandName',
                filter: true,
                sortable: true,
                tooltipField: "brandName",
                width: "400"
            },
        ]
    }

    onGridReady(params): void {
        this.api = params.api;
        this.columnApi = params.columnApi;
    }

}
