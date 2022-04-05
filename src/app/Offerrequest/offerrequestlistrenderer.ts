import { Component, OnInit } from "@angular/core";
import { first } from "rxjs/operators";
import { NotificationService } from "../_services";
import { OfferRequestProcessesService } from "../_services/offer-request-processes.service";
import { OfferrequestService } from "../_services/Offerrequest.service";



@Component({
    template: `<a [routerLink]="[params.inRouterLink,params.value]" class="btn btn-link"
                  style="margin-right: 10px; padding: 0;"><i class="fas fa-pen" title="Edit"></i></a>
    <button class="btn btn-link"  [disabled]="!params.deleteaccess && !isLocked" (click)="delete(params)"><i class="fas fa-trash-alt"
                                                                                         title="Delete"></i></button>`
})

export class OfferRequestListRenderer implements OnInit {
    params: any;
    isLocked: boolean = false;

    constructor(
        private offerRequestProcess: OfferRequestProcessesService,
        private OfferrequestService: OfferrequestService,
        private notificationService: NotificationService,
    ) { }

    ngOnInit(): void {
        console.log(this.params)
        this.offerRequestProcess.getAll(this.params.value).pipe(first())
            .subscribe((data: any) => {
                this.isLocked = data.object.filter(x => !x.isCompleted).length == 0
            })
    }

    agInit(params: any): void {
        this.params = params;
    }

    refresh(params: any): boolean {
        return false;
    }

    delete(params) {
        this.OfferrequestService.delete(params.value)
            .pipe(first())
            .subscribe({
                next: (data: any) => {
                    if (data.result) {
                        this.notificationService.showSuccess(data.resultMessage, "Success");
                        const selectedData = params.api.getSelectedRows();
                        params.api.applyTransaction({ remove: selectedData });
                    } else {
                        
                    }
                },
                error: error => {
                    
                }
            });
    }

}