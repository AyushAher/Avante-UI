import { Component, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { AgRendererComponent } from "ag-grid-angular";
import { first } from "rxjs/operators";
import { ServiceRequest } from "../_models";
import { DistributorService, NotificationService, ServiceRequestService } from "../_services";

@Component({
    template: `
    
    <form [formGroup]="Form" (ngSubmit)="onSubmit()">
<div class="row">
<div class="col-md-10">
<select formControlName="assignedto" class="form-control">
        <option *ngFor="let c of appendList" value={{c.id}}> {{c.fname}} {{c.lname}} </option>
        </select>
</div>   
<div class="col-md-2">
<button type="submit" class="btn btn-primary"> <i class="fas fa-save" title="save"></i></button>
</div>
</div>
</form>
`
})
export class ServiceRComponent implements AgRendererComponent, OnInit {
    params: any;
    appendList: any;
    Form: any;

    constructor(
        private distributorService: DistributorService,
        private formbuilder: FormBuilder,
        private notificationService: NotificationService,
        private serviceRequest: ServiceRequestService
    ) { }

    agInit(params: any): void {
        // //debugger;
        this.params = params;

    }
    ngOnInit(): void {
        this.Form = this.formbuilder.group({
            assignedto: ""
        })

        this.Form.get('assignedto').setValue(this.params.value)

        this.distributorService.getDistributorRegionContacts(this.params.data.distid)
            .pipe(first())
            .subscribe((data: any) => {
                this.appendList = data.object;
            });
    }
    onSubmit() {
        let srrqData = this.params.data
        srrqData.createdon = new Date
        srrqData.accepted == "Accepted" ? srrqData.accepted = true : srrqData.accepted = false;
        srrqData.assignedto = this.Form.get('assignedto').value;

        this.serviceRequest.update(srrqData.id, srrqData)
            .pipe(first())
            .subscribe((data: any) => {
                if (data.result) {
                    this.notificationService.showSuccess(data.resultMessage, "Success")
                } else {
                    this.notificationService.showError(data.resultMessage, "Error")
                }
            })
    }

    refresh(params: any): boolean {
        return false;
    }
}