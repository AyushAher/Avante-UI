import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { AgRendererComponent } from "ag-grid-angular";
import { first } from "rxjs/operators";
import { ListTypeItem, ProfileReadOnly, ServiceRequest, tickersAssignedHistory } from "../_models";
import { DistributorService, ListTypeService, NotificationService, ProfileService, ServiceRequestService, SRAssignedHistoryService } from "../_services";

@Component({
    template: `
    
    <form [formGroup]="Form" (ngSubmit)="onSubmit()">
<div class="row">
<div class="col-md-10">
<select formControlName="assignedto" class="form-select">
        <option *ngFor="let c of appendList" value={{c.id}}> {{c.fname}} {{c.lname}} </option>
        </select>
</div>   
<div class="col-md-2">
<button type="submit" *ngIf="hasUpdate && this.isGenerateReport == false" class="btn"> <i class="fas fa-save" title="save"></i></button>
</div>
</div>
</form>
`
})
export class ServiceRComponent implements AgRendererComponent, OnInit {
    params: any;
    appendList: any;
    Form: any;
    statuslist: any;
    hasUpdate: boolean = false;
    profilePermission: ProfileReadOnly;
    isGenerateReport: boolean = false;
    engineerid: any;
    srAssignedHistory: any;

    constructor(
        private distributorService: DistributorService,
        private formBuilder: FormBuilder,
        private notificationService: NotificationService,
        private serviceRequest: ServiceRequestService,
        private listTypeService: ListTypeService,
        private profileService: ProfileService,
        private srAssignedHistoryService: SRAssignedHistoryService,

    ) {
    }

    agInit(params: any): void {
        // //debugger;
        this.params = params;

    }
    ngOnInit(): void {
        this.Form = this.formBuilder.group({
            sdate: [""],
            edate: [""],
            serreqno: ['', Validators.required],
            distid: ['', Validators.required],
            custid: [''],
            statusid: [''],
            stageid: [''],
            siteid: [''],
            assignedto: [''],
            serreqdate: ['', Validators.required],
            visittype: ['', Validators.required],
            companyname: ['', Validators.required],
            requesttime: ['', Validators.required],
            sitename: [''],
            country: ['', Validators.required],
            contactperson: ['', Validators.required],
            email: ['', Validators.required],
            operatorname: [''],
            operatornumber: [''],
            operatoremail: [''],
            machmodelname: [''],
            machinesno: ['', Validators.required],
            machengineer: [''],
            xraygenerator: [''],
            breakdowntype: ['', Validators.required],
            isrecurring: [false],
            recurringcomments: [''],
            breakoccurdetailsid: ['', Validators.required],
            alarmdetails: [''],
            resolveaction: [''],
            currentinstrustatus: ['', Validators.required],
            accepted: [false],
            serresolutiondate: [''],
            escalation: [''],
            requesttypeid: [''],
            subrequesttypeid: [],
            remarks: [''],
            isactive: [true],
            isdeleted: [false],
            engComments: this.formBuilder.group({
                nextdate: [''],
                comments: ['']
            }),
            assignedHistory: this.formBuilder.group({
                engineername: [''],
                assigneddate: [''],
                ticketstatus: [''],
                comments: ['']
            }),
            engAction: this.formBuilder.group({
                engineername: [''],
                actiontaken: [''],
                comments: [''],
                teamviewerrecroding: [''],
                actiondate: ['']
            })
        });
        this.profilePermission = this.profileService.userProfileValue;
        if (this.profilePermission != null) {
            let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SRREQ");
            if (profilePermission.length > 0) {
                this.hasUpdate = profilePermission[0].update;
            }
        }
        this.listTypeService.getById('SRQST')
            .pipe(first())
            .subscribe({
                next: (data: ListTypeItem[]) => {
                    this.statuslist = data;
                },
                error: error => {

                }
            });

        this.Form.patchValue(this.params.data)
        this.Form.get('assignedto').setValue(this.params.value)
        this.engineerid = this.params.data.assignedto;

        this.distributorService.getDistributorRegionContacts(this.params.data.distid)
            .pipe(first())
            .subscribe((data: any) => {
                this.appendList = data.object;
            });
        setTimeout(() => {
            if (this.params.data.isReportGenerated) {
                this.Form.disable()
                this.isGenerateReport = true;
            }
        }, 100);

    }

    addAssignedHistory(sr: ServiceRequest) {
        if (this.engineerid != null && this.engineerid != sr.assignedto && this.isGenerateReport == false) {

            this.srAssignedHistory = new tickersAssignedHistory;
            this.srAssignedHistory.engineerid = this.engineerid;
            this.srAssignedHistory.servicerequestid = sr.id;
            this.srAssignedHistory.ticketstatus = "INPRG";
            this.srAssignedHistory.assigneddate = new Date()

            this.srAssignedHistoryService.save(this.srAssignedHistory)
                .pipe(first())
                .subscribe({
                    next: (data: any) => {
                        if (data.result) {
                            // this.notificationService.showSuccess(data.resultMessage, "Success");
                            this.notificationService.filter("itemadded");
                        } else {

                        }
                    },
                });
        }
    }

    onSubmit() {
        if (this.isGenerateReport == false) {
            let srrqData = this.params.data
            srrqData.createdon = new Date
            srrqData.accepted == "Accepted" ? srrqData.accepted = true : srrqData.accepted = false;
            srrqData.assignedto = this.Form.get('assignedto').value;

            let status = this.statuslist.find(x => x.listTypeItemId == this.Form.get('statusid').value)?.itemCode
            if (status == "NTASS" && this.Form.get('assignedto').value != null && this.Form.get('assignedto').value != "") {
                srrqData.statusid = (this.statuslist.find(x => x.itemCode == "ASSGN")?.listTypeItemId)
            }

            srrqData.scheduledCalls = []
            srrqData.engComments = []
            this.serviceRequest.update(srrqData.id, srrqData)
                .pipe(first())
                .subscribe((data: any) => {
                    if (data.result) {
                        this.addAssignedHistory(srrqData)
                        this.notificationService.showSuccess(data.resultMessage, "Success")
                        this.notificationService.filter("itemadded");
                    }
                })
        }
    }
    refresh(params: any): boolean {
        return false;
    }
}