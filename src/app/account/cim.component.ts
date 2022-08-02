import { Component, Input, OnInit } from '@angular/core';
import { User } from "../_models";
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AccountService, NotificationService } from "../_services";
import { BsModalService } from "ngx-bootstrap/modal";
import { first } from "rxjs/operators";
import { BrandService } from '../_services/brand.service';
import { BusinessUnitService } from '../_services/businessunit.service';
import { CIMService } from '../_services/CIM.service';

@Component({
  selector: 'app-CIM',
  templateUrl: './cim.component.html',
})
export class CIMComponent implements OnInit {

  NewPasswoard: string;
  user: User;
  Form: any;
  loading: boolean = false;
  submitted: boolean = false;
  businessUnitList: any = []
  brandList: any = []
  cimList: any = []
  @Input('username') username
  @Input('password') password

  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private notificationService: NotificationService,
    public activeModal: BsModalService,
    public BrandService: BrandService,
    public BusinessUnitService: BusinessUnitService,
    public CIMService: CIMService,
  ) { }

  ngOnInit() {
    this.BusinessUnitService.GetAll()
      .pipe(first()).subscribe((data: any) => this.businessUnitList = data.object)

    this.BrandService.GetAll()
      .pipe(first()).subscribe((data: any) => this.brandList = data.object)

    this.CIMService.GetAll()
      .pipe(first()).subscribe((data: any) => this.cimList = data.object)


    this.Form = this.formBuilder.group({
      brandId: ["", Validators.required],
      businessUnitId: ["", Validators.required]
    })
  }

  get f() {
    return this.Form.controls;
  }

  onValueSubmit() {

    this.submitted = true;
    // stop here if form is invalid
    if (this.Form.invalid) {
      return;
    }

    var cim = this.cimList.find(x => x.brandId == this.f.brandId.value && x.businessUnitId == this.f.businessUnitId.value)
    console.log(cim, this.cimList);

    if ((cim == undefined || !cim) && confirm("CIM does not exists, do you want to Create New CIM?")) {
      this.CIMService.Save(this.Form.value)
        .pipe(first()).subscribe((data: any) => {
          console.log(data);

          if (data.result) {
            this.cimList.push(data.object)
            cim = data.object.id
            this.accountService.Authenticate(this.username, this.password, cim)
            this.close()
          }
        })
    }
    else {
      this.accountService.Authenticate(this.username, this.password, cim.id)
      this.close()
    }
  }

  close() {
    //alert('test cholde');
    this.activeModal.hide();
    this.notificationService.filter("itemadded");
  }
}
	