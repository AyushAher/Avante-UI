import { OnInit, Component, AfterViewInit, Input } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { Subject } from "rxjs";
import { AccountService, NotificationService } from "../_services";
import { BrandService } from "../_services/brand.service";
import { CompanyService } from "../_services/company.service";

@Component({
  selector: "CreateBrand",
  templateUrl: "./brand.component.html"
})
export class CreateBrandComponent implements OnInit, AfterViewInit {
  Form: FormGroup
  submitted: boolean
  @Input("companyId") companyId: any
  id: any;

  isNewMode: any;
  isEditMode: any;

  hasDeleteAccess: boolean = false;
  companyList: any;

  public modalRef: BsModalRef;
  public onClose: Subject<any>;
  @Input("isDialog") isDialog: boolean = false;
  formData: any;

  constructor(
    public activeModal: BsModalService,
    private notificationService: NotificationService,
    private formBuilder: FormBuilder,
    private brandService: BrandService,
    private AccountService: AccountService,
    private CompanyService: CompanyService,
    private activeRoute: ActivatedRoute,
    private router: Router
  ) { }

  async ngOnInit() {
    this.onClose = new Subject();
    this.Form = this.formBuilder.group({
      brandName: ['', [Validators.required]],
      companyId: ['', [Validators.required]],
      id: [""]
    });

    var id = this.activeRoute.snapshot.paramMap.get("id")
    this.isNewMode = id == null;

    if (id) {
      this.id = id;
      this.Form.get('id').setValue(id);
      var getByIdRequest: any = await this.brandService.GetById(id).toPromise();
      this.formData = getByIdRequest.object;
      this.Form.patchValue(this.formData);
    }

    var request: any = await this.CompanyService.GetAllCompany().toPromise();

    this.companyList = request.object;

    if (this.companyId) this.f.companyId.setValue(this.companyId)
    else {
      let user = this.AccountService.userValue;
      this.companyId = user.companyId;
    }

  }

  ngAfterViewInit(): void {
    if (!this.isNewMode) {
      this.Form.disable();
    }
    this.FormControlDisable()
  }



  EditMode() {
    if (!confirm("Are you sure you want to edit the record?")) return;

    this.isEditMode = true;
    this.Form.enable();
    this.FormControlDisable();
  }

  CancelEdit() {
    if (!confirm("Are you sure you want to discard changes?")) return;
    if (this.id != null) this.Form.patchValue(this.formData);
    else this.Form.reset();
    this.Form.disable()
    this.isEditMode = false;
    this.isNewMode = false;
  }
  FormControlDisable() {
    // this.Form.get('companyId').disable();
  }

  Back() {
    this.router.navigate(["/brandlist"])
  }

  async onSubmit() {
    this.submitted = true;
    this.Form.markAllAsTouched();

    this.Form.enable();
    let formData = this.Form.value;
    if (this.Form.invalid) return this.notificationService.showError("Form Invalid", "Error");
    if (!this.isDialog) this.CancelEdit();

    if (!this.id) {
      var saveRequest: any = await this.brandService.Save(this.Form.value).toPromise();
      let success = saveRequest.httpResponceCode == 200;
      if (success) {
        this.onClose.next({ result: success, object: saveRequest.object });
        if (!this.isDialog) {
          this.notificationService.showSuccess("Brand created successfully!", "Success")
          this.router.navigate(["/brandlist"])
          return;
        }
      }
    }

    else {
      var updateRequest: any = await this.brandService.Update(this.id, formData).toPromise();
      let success = updateRequest.httpResponceCode == 200;
      if (success) {
        this.onClose.next({ result: success, object: updateRequest.object });

        if (!this.isDialog) {
          this.notificationService.showSuccess("Brand updated successfully!", "Success")
          this.router.navigate(["/brandlist"])
        }
      }
    }
  }

  close(success) {
    this.onClose.next(success);
  }

  get f() {
    return this.Form.controls;
  }
}