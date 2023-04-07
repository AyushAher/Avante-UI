import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ColumnApi, GridApi } from "ag-grid-community";
import { User } from "../_models";
import { AccountService } from "../_services";
import { CompanyService } from "../_services/company.service";

@Component({
    selector: "CreateCompany",
    templateUrl: "./companylist.component.html"
})

export class CompanyListComponent implements OnInit {

    user: User;
    CompanyList: any;
    hasAddAccess: boolean = false;
    hasDeleteAccess: boolean = false;
    public columnDefs: any
    private columnApi: ColumnApi;
    private api: GridApi;

    constructor(
        private router: Router,
        private accountService: AccountService,
        private CompanyService: CompanyService,
        private route: ActivatedRoute
    ) { }

    async ngOnInit() {
        this.user = this.accountService.userValue;

        if (this.user.isAdmin) {
            this.hasAddAccess = true;
            this.hasDeleteAccess = true;
        }

        var data: any = await this.CompanyService.GetAllCompany().toPromise()

        this.CompanyList = data.object;
        this.columnDefs = this.createColumnDefs();
    }

    Add() {
        this.router.navigate(['company'],
            {

                queryParams: {
                    isNSNav: false
                },// remove to replace all query params by provided
            });
    }


    EditRecord() {
        var data = this.api.getSelectedRows()[0]
        this.router.navigate([`company/${data.id}`], {
            queryParams: {
                isNSNav: true
            }
        })
    }

    private createColumnDefs() {
        return [
            {
                headerName: 'Company Name',
                field: 'companyName',
                filter: true,
                sortable: true,
                tooltipField: "companyName",
                // width: "1000"
            },
            {
                headerName: 'Primary Email',
                field: 'companyEmail',
                filter: true,
                sortable: true,
                tooltipField: "companyEmail",
                // width: "1000"
            },
            {
                headerName: 'Secondary Email',
                field: 'secondaryCompanyEmail',
                filter: true,
                sortable: true,
                tooltipField: "secondaryCompanyEmail",
                // width: "1000"
            },
        ]
    }

    onGridReady(params): void {
        this.api = params.api;
        this.columnApi = params.columnApi;
        this.api.sizeColumnsToFit();
    }

}
