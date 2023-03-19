import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { BsModalService } from "ngx-bootstrap/modal";
import { User } from "../_models";
import { AccountService, NotificationService } from "../_services";

@Component({
    templateUrl: "./ChangeCIM.component.html",
})
export default class ChangeCIM implements OnInit {
    Form: FormGroup;
    user: User


    constructor(
        private accountService: AccountService,
        private formBuilder: FormBuilder,
        private notificationService: NotificationService,
        private activeModalService: BsModalService
    ) { }

    ngOnInit(): void {
        this.user = this.accountService.userValue
        this.Form = this.formBuilder.group({
            password: ["", Validators.required],
            userName: ["", Validators.required]
        });

        this.Form.get('userName').setValue(this.user.username);
    }


    public get f() {
        return this.Form.controls;
    }


    onSubmit() {
        this.Form.markAllAsTouched();
        if (this.Form.invalid) return this.notificationService.showError("Form Invalid", "Error");

        let userName = this.Form.get('userName').value;
        let password = this.Form.get('password').value;
        this.close();
        setTimeout(() => {
            this.accountService.Authenticate(userName, password, this.user.companyId);
        }, 500);
    }

    close() {
        this.activeModalService.hide();
    }

}