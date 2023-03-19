import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { Subject } from "rxjs";
import { NotificationService, AccountService } from "../_services";
import { BrandService } from "../_services/brand.service";

@Component({
    selector: "setup",
    templateUrl: "./setup.component.html"
})
export default class SetUp implements OnInit {

    Form: FormGroup
    public onClose: Subject<any>;
    public modalRef: BsModalRef;
    @Input('username') username
    @Input('password') password

    constructor(private formBuilder: FormBuilder,
        private notificationService: NotificationService,
        public activeModal: BsModalService,
        public brandService: BrandService
    ) { }

    ngOnInit(): void {
        this.onClose = new Subject();
        this.Form = this.formBuilder.group({
            nSetUp: [Validators.required]
        });
    }

    onValueSubmit() {
        var data = this.Form.get("nSetUp").value
        if (this.Form.invalid || !data) return this.notificationService.showError("Form Invalid", "Error");

        this.close(data == 1 || data == "1");
    }

    close(result: any) {

        this.onClose.next({ newSetUp: result });
        this.notificationService.filter("itemadded");
    }
}