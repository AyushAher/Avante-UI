import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ColDef, ColumnApi, GridApi } from "ag-grid-community";
import { BsModalRef } from "ngx-bootstrap/modal";
import { first } from "rxjs/operators";
import { RenderComponent } from "../distributor/rendercomponent";
import { ProfileReadOnly, User } from "../_models";
import { AccountService, ProfileService } from "../_services";
import { AdvancerequestformService } from "../_services/advancerequestform.service";

@Component({
    selector: 'app-advancerequestform',
    templateUrl: './advancerequestformlist.component.html',
})
export class AdvancerequestlistformComponent implements OnInit {

    public columnDefs: ColDef[];
    private columnApi: ColumnApi;
    private api: GridApi;
    profilePermission: ProfileReadOnly;
    hasReadAccess: boolean = false;
    hasUpdateAccess: boolean = false;
    hasDeleteAccess: boolean = false;
    hasAddAccess: boolean = false;
    user: User;
    bsModalRef: BsModalRef;

    List: any;
    constructor(
        private router: Router,
        private accountService: AccountService,
        private Service: AdvancerequestformService,
        private profileService: ProfileService,
    ) { }

    ngOnInit(): void {
        this.user = this.accountService.userValue;
        let role;
        this.profilePermission = this.profileService.userProfileValue;
        if (this.profilePermission != null) {
            let profilePermission = this.profilePermission.permissions.filter(
                (x) => x.screenCode == "ADREQ"
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
            role = JSON.parse(sessionStorage.getItem('roles'));
            role = role[0].itemCode;
        }

        this.Service.getAll().pipe(first())
            .subscribe((data: any) => this.List = data.object)

        this.columnDefs = this.createColumnDefs();
    }

    Add() {
        this.router.navigate(["advancerequestform"]);
    }

    EditRecord() {
        var data = this.api.getSelectedRows()[0]
        this.router.navigate([`advancerequestform/${data.id}`])
    }

    private createColumnDefs() {
        return [
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
                headerName: "Advance Amount",
                field: "advanceAmount",
                filter: true,
                editable: false,
                sortable: true,
                tooltipField: "code",
            },
            {
                headerName: "Client Name and Location",
                field: "clientNameLocation",
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