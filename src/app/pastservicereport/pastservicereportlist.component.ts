import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AgRendererComponent } from 'ag-grid-angular';
import { ColDef, GridApi } from 'ag-grid-community';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { first } from 'rxjs/operators';
import { ServiceRComponent } from '../serviceRequest/ServicerequestRenderer';
import { User } from '../_models';
import { Offerrequest } from '../_models/Offerrequest.model';
import { AccountService, FileshareService, NotificationService, ProfileService } from '../_services';
import { EnvService } from '../_services/env/env.service';
import { OfferrequestService } from '../_services/Offerrequest.service';
import { PastservicereportService } from '../_services/pastservicereport.service';

@Component({
    selector: 'app-pastservicereport',
    templateUrl: './pastservicereportlist.component.html',
})
export class PastservicereportlistComponent implements OnInit {
    form: FormGroup;
    model: Offerrequest;
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
    private api: GridApi;
    profilePermission: any;
    zohocode: any;
    role: string;
    showGrid: any = true;
    isDist: boolean;
    bsModalRef: BsModalRef;

    constructor(
        private router: Router,
        private accountService: AccountService,
        private environment: EnvService,
        private Service: PastservicereportService,
        private profileService: ProfileService,
        private route: ActivatedRoute

    ) {
    }

    ngOnInit() {
        this.user = this.accountService.userValue;
        let role = JSON.parse(sessionStorage.getItem('roles'));
        this.profilePermission = this.profileService.userProfileValue;
        if (this.profilePermission != null) {
            let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "PSRRP");
            if (profilePermission.length > 0) {
                this.hasReadAccess = profilePermission[0].read;
                this.hasAddAccess = profilePermission[0].create;
                this.hasDeleteAccess = profilePermission[0].delete;
                this.hasUpdateAccess = profilePermission[0].update;
            }
        }

        if (this.user.username == 'admin') {
            this.hasAddAccess = true;
            this.hasDeleteAccess = true;
            this.hasUpdateAccess = true;
            this.hasReadAccess = true;
        } else {
            this.role = role[0]?.itemCode;
        }
        if (this.role == this.environment.distRoleCode) this.isDist = true;

        this.Service.getAll().pipe(first())
            .subscribe((data: any) => this.model = data.object);
        this.columnDefs = this.createColumnDefs();
    }

    ShowData(event) {
        this.showGrid = event
    }

    toggleFilter() {
        this.showGrid = !this.showGrid
    }

    DataFilter(event) {
        this.model = event?.filter(x => !x.isCompleted)
    }

    Add() {
        this.router.navigate(["pastservicereport"],
            {
                queryParams: {
                    isNSNav: false
                },// remove to replace all query params by provided
            });
    }

    EditRecord(e) {
        var data = this.api.getSelectedRows()[0]
        var colIndex = e.event.target.ariaColIndex

        if (colIndex && colIndex != 6)
            this.router.navigate([`pastservicereport/${data.id}`])
    }

    private createColumnDefs() {
        return [
            {
                headerName: "Customer",
                field: "customer",
                filter: true,
                tooltipField: "customer",
                enableSorting: true,
                sortable: true,
            },
            {
                headerName: "Site",
                field: "site",
                filter: true,
                tooltipField: "site",
                enableSorting: true,
                sortable: true,
            },
            {
                headerName: "Instrument",
                field: "instrument",
                filter: true,
                tooltipField: "instrument",
                enableSorting: true,
                sortable: true,
            },
            {
                headerName: "Brand",
                field: "brand",
                filter: true,
                tooltipField: "brand",
                enableSorting: true,
                sortable: true,
            },
            {
                headerName: "OF",
                field: "of",
                filter: true,
                tooltipField: "of",
                enableSorting: true,
                sortable: true,
            },

            {
                headerName: 'Download',
                field: 'fileId',
                cellRendererFramework: DownloadReportFile,
                filter: true,
                editable: false,
                sortable: true,
            }
        ]
    }
    onGridReady(params: any): void {
        this.api = params.api;
        this.api.sizeColumnsToFit();
    }

}

@Component({
    selector: 'app-DownloadReportFile',

    template: ` <button type="button"
                        class="btn btn-link"
                        (click)="download()"
                        *ngIf="params.value">
                    <i class="fas fa-download" title="Download"></i>
                </button>`
})

export class DownloadReportFile implements AgRendererComponent {
    params: any;
    hasFileId: boolean = false;

    constructor(
        private fileService: FileshareService,
    ) { }


    agInit(params: any): void {
        this.params = params;
    }

    refresh(params: any): boolean {
        return false;
    }

    download() {
        this.fileService.download(this.params.value).subscribe((event) => {
            if (event.type === HttpEventType.Response) {
                this.downloadFile(event);
            }
        });
    }

    private downloadFile(data: HttpResponse<Blob>) {
        const downloadedFile = new Blob([data.body], { type: data.body.type });
        const a = document.createElement("a");
        a.setAttribute("style", "display:block;");
        document.body.appendChild(a);
        a.download = this.params.data.fileName;
        a.href = URL.createObjectURL(downloadedFile);
        a.innerHTML = this.params.fileUrl;
        a.target = "_blank";
        a.click();
        document.body.removeChild(a);
    }
}