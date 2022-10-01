import { Component, Input, OnInit } from '@angular/core';
import { User } from "../_models";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AccountService, NotificationService } from "../_services";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { Subject } from 'rxjs';
import { CompanyService } from '../_services/company.service';
import { BrandService } from '../_services/brand.service';
import { first } from 'rxjs/operators';
import { CreateBrandComponent } from './brand.component';
import { CreateBusinessUnitComponent } from './businessunit.component';
import { CreateCompanyComponent } from './company.component';

@Component({
  selector: 'app-CIM',
  templateUrl: './cim.component.html',
})
export class CIMComponent implements OnInit {

  NewPasswoard: string;
  user: User;
  Form: FormGroup;
  loading: boolean = false;
  submitted: boolean = false;
  businessUnitList: any = []
  brandList: any = []
  cimList: any = []
  companyList: any = []
  public modalRef: BsModalRef;

  public onClose: Subject<any>;
  @Input('username') username
  @Input('password') password
  @Input('cimData') cimData

  constructor(
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    public activeModal: BsModalService,
    public CompanyService: CompanyService,
    public brandService: BrandService,
    private accountService: AccountService
  ) {
    this.notificationService.listen().subscribe((m: any) => {
      if (this.modalRef != null) this.modalRef.hide()
      this.CompanyService.GetAllModelData()
        .pipe(first()).subscribe((data: any) => {
          this.brandList = data.object.brandList
          this.businessUnitList = data.object.businessUnitList
          this.companyList = data.object.companyList
        })
    })

  }

  ngOnInit() {

    this.onClose = new Subject();

    this.Form = this.formBuilder.group({
      brandId: ["", Validators.required],
      businessUnitId: ["", Validators.required],
      companyId: ["", Validators.required]
    })

    let data = this.cimData;

    if (data == null)
      return this.notificationService.showError("Some Error Occurred. Please Refresh the page.", "Error")

    this.user = this.accountService.userValue;
    this.brandList = data.brandList;
    this.companyList = data.companyList;
    this.businessUnitList = data.businessUnitList;

    this.f.brandId.valueChanges.subscribe((data: any) => {
      if (data != "new") return;
      this.onClose.next({ result: false })
      this.activeModal.hide();
      this.notificationService.filter("brand")
    })

    this.f.companyId.valueChanges.subscribe((data: any) => {
      if (data != "new") return;
      this.onClose.next({ result: false })
      this.activeModal.hide();
      this.notificationService.filter("company")
    })

    this.f.businessUnitId.valueChanges.subscribe((data: any) => {
      if (data != "new") return;
      this.onClose.next({ result: false })
      this.activeModal.hide();
      this.notificationService.filter("businessunit")
    })


    if (this.user.username == "admin") return;

    this.f.companyId.setValue(this.user.companyId)
    this.f.companyId.disable();
  }

  get f() {
    return this.Form.controls;
  }

  onValueSubmit() {

    this.submitted = true;
    let form = this.Form.value
    // stop here if form is invalid
    if (this.Form.invalid || this.f.companyId.value === "new" || this.f.businessUnitId.value === "new" || this.f.brandId.value === "new") return;
    this.Form.enable()
    this.close({ result: true, form: this.Form.value })
    this.Form.disable()

  }

  close(ressult: any) {
    this.onClose.next(ressult);
    this.activeModal.hide();
    this.notificationService.filter("itemadded");
  }
}

