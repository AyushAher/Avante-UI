import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { BsModalService } from "ngx-bootstrap/modal";
import { first } from "rxjs/operators";
import { NotificationService } from "../_services";
import { InstrumentAccessoryService } from "../_services/InstrumentAccessory.Service";

@Component({
    templateUrl: "./Accessories.component.html",
    selector: "app-Accessories"
})
export class Accessories implements OnInit {
    form: FormGroup
    loading: boolean
    submitted: Boolean
    instrumentAccessoryModel: any

    @Input("id") instrumentId: any;
    constructor(
        private formBuilder: FormBuilder,
        private notificationService: NotificationService,
        private activeModal: BsModalService,
        private instrumentAccessoryService: InstrumentAccessoryService
    ) { }

    ngOnInit(): void {
        this.form = this.formBuilder.group({
            accessoryName: ["", Validators.required],
            brandName: ["", Validators.required],
            modelName: ["", Validators.required],
            modelNumber: ["", Validators.required],
            serialNumber: ["", Validators.required],
            yearOfPurchase: ["", Validators.required],
            quantity: ["", Validators.required],
            accessoryDescription: ["", Validators.required],
        })

    }


    onValueSubmit() {
        this.form.markAllAsTouched();
        if (this.form.invalid) return;
        this.loading = true;
        this.instrumentAccessoryModel = this.form.value;
        this.instrumentAccessoryModel.instrumentId = this.instrumentId;
        this.instrumentAccessoryService.save(this.instrumentAccessoryModel)
            .pipe(first()).subscribe((data: any) => {
                if (data.result) this.notificationService.showSuccess(data.resultMessage, "Success");
                this.close();
                this.loading = false;
            });
    }

    close() {
        this.activeModal.hide();
        this.notificationService.filter("itemadded");
    }

    get f() {
        return this.form.controls;
    }
}