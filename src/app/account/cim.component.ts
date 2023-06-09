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
import { BusinessUnitService } from '../_services/businessunit.service';

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
  businessUnitList: any[] = []
  brandList: any = []
  cimList: any = []
  companyList: any = []
  public modalRef: BsModalRef;
  isAdmin: boolean = false;
  public onClose: Subject<any>;
  @Input('username') username
  @Input('password') password
  @Input('cimData') cimData

  lstBusinessUnit: any = []
  lstBrand: any = []
  currentCompanyId: any;

  constructor(
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    public activeModal: BsModalService,
    public CompanyService: CompanyService,
    public brandService: BrandService,
    public businessUnitService: BusinessUnitService,
    private accountService: AccountService
  ) {
    this.notificationService.listen().subscribe((m: any) => {
      if (this.modalRef != null) this.modalRef.hide()
      this.CompanyService.GetAllModelData()
        .pipe(first()).subscribe((data: any) => {
          this.lstBrand = data.object.brandList
          // this.lstBusinessUnit = data.object.businessUnitList
          this.companyList = data.object.companyList

        })
    })

  }

  ngOnInit() {

    this.onClose = new Subject();

    this.Form = this.formBuilder.group({
      brandId: [""],
      businessUnitId: [""],
      companyId: ["", Validators.required],
      company: [],
      brand: [],
      bu: []
    });

    setTimeout(() => {
      if (!this.user.isAdmin) {
        this.Form.get('brandId').setValidators([Validators.required])
        this.Form.get('brandId').updateValueAndValidity();

        this.Form.get('businessUnitId').setValidators([Validators.required])
        this.Form.get('businessUnitId').updateValueAndValidity();

      }
    }, 500);

    this.Form.get('businessUnitId').valueChanges
      .subscribe((value: any) => {
        this.Form.get("bu").setValue(this.businessUnitList.find(x => x.id == value)?.businessUnitName)
        this.brandService.GetByBU(value)
          .subscribe((data: any) => {
            this.brandList = [];
            this.user.brandId?.split(',').forEach(e => {
              if (data.object && data.object.length > 0) {
                var obj = data.object.find(x => x.id == e);
                if (obj) this.brandList.push(obj);
              }
            });
          })
      });

    this.Form.get("brandId").valueChanges
      .subscribe(value => this.Form.get("brand").setValue(this.brandList.find(x => x.id == value)?.brandName))

    this.Form.get("companyId").valueChanges
      .subscribe(value => this.Form.get("company").setValue(this.companyList.find(x => x.id == value)?.companyName))

    let data = this.cimData;

    if (data == null)
      return this.notificationService.showError("Some Error Occurred. Please Refresh the page.", "Error")

    this.user = this.accountService.userValue;
    this.isAdmin = this.user.isAdmin
    // this.lstBrand = data.brandList;
    this.companyList = data.companyList;
    // this.lstBusinessUnit = data.businessUnitList;

    this.businessUnitService.GetByCustomCompanyId(this.user.companyId)
      .subscribe((data: any) => {
        this.businessUnitList = [];
        this.user.buId?.split(',').forEach(e => {
          if (data.object && data.object.length > 0) {
            var obj = data.object.find(x => x.id == e);
            if (obj) this.businessUnitList.push(obj);
          }
        });

      })


    this.f.brandId.valueChanges.subscribe((data: any) => {
      let companyId = this.f.companyId.value
      if (data != "new" || !companyId) return;
      this.onClose.next({ result: false, companyId })
      this.activeModal.hide();
      this.notificationService.filter("brand")
    })

    this.f.companyId.valueChanges.subscribe((data: any) => {
      this.currentCompanyId = data
      if (data != "new") {
        this.brandList = this.lstBrand.filter(x => x.companyId == data);
        this.businessUnitList = this.lstBusinessUnit.filter(x => x.companyId == data)
        setTimeout(() => {
          this.f.brandId.reset()
          this.f.businessUnitId.reset()
        }, 500);
      }
      else {
        this.onClose.next({ result: false, companyId: null })
        this.activeModal.hide();
        this.notificationService.filter("company")
      }
    })

    this.f.businessUnitId.valueChanges.subscribe((data: any) => {
      let companyId = this.f.companyId.value
      if (data != "new" || !companyId) return;
      this.onClose.next({ result: false, companyId })
      this.activeModal.hide();
      this.notificationService.filter("businessunit")
    })


    if (this.user.isSuperAdmin) return;

    this.f.companyId.setValue(this.user.companyId)
    this.f.companyId.disable();
  }

  get f() {
    return this.Form.controls;
  }

  onValueSubmit() {

    this.submitted = true;
    // stop here if form is invalid
    if (this.Form.invalid || this.f.companyId.value === "new" || this.f.businessUnitId.value === "new" || this.f.brandId.value === "new") return;
    this.Form.enable()
    let companyId = this.f.companyId.value
    this.close({ result: true, form: this.Form.value, companyId })
    this.Form.disable()

  }

  close(result: any) {
    this.onClose.next(result);
    this.activeModal.hide();
    this.notificationService.filter("itemadded");
  }
}

