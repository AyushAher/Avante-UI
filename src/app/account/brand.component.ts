import { OnInit, Component, AfterViewInit, Input } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { Subject } from "rxjs";
import { AccountService, NotificationService } from "../_services";
import { BrandService } from "../_services/brand.service";
import { CompanyService } from "../_services/company.service";
import { BusinessUnitService } from "../_services/businessunit.service";

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
  buList: any;

  constructor(
    public activeModal: BsModalService,
    private notificationService: NotificationService,
    private formBuilder: FormBuilder,
    private brandService: BrandService,
    private businessUnitService: BusinessUnitService,
    private AccountService: AccountService,
    private CompanyService: CompanyService,
    private activeRoute: ActivatedRoute,
    private router: Router
  ) { }

  async ngOnInit() {
    this.onClose = new Subject();
    this.hasDeleteAccess = this.AccountService.userValue.isAdmin;
    this.Form = this.formBuilder.group({
      brandName: ['', [Validators.required]],
      businessUnitId: ['', [Validators.required]],
      companyId: ['', [Validators.required]],
      company: ['', [Validators.required]],
      id: [""]
    });


    let user = this.AccountService.userValue;
    this.Form.get('companyId').setValue(user.companyId);
    this.Form.get('companyId').disable();
    var id = this.activeRoute.snapshot.paramMap.get("id")
    this.isNewMode = id == null;

    if (id) {
      this.id = id;
      this.Form.get('id').setValue(id);
      var getByIdRequest: any = await this.brandService.GetById(id).toPromise();
      this.formData = getByIdRequest.object;
      this.Form.patchValue(this.formData);
      console.log(this.formData);

    }

    var request: any = await this.businessUnitService.GetByCompanyId().toPromise();

    this.buList = request.object;

    request = await this.CompanyService.GetAllCompany().toPromise();

    this.companyList = request.object;

    if (this.companyId) this.f.companyId.setValue(this.companyId)
    else {
      this.companyId = user.companyId;
    }

    this.Form.get("company")
      .setValue(this.companyList?.find(comp => comp.id == this.companyId)?.companyName);

  }

  ngAfterViewInit(): void {
    if (!this.isNewMode) {
      this.Form.disable();
    }
    this.FormControlDisable()
  }


  DeleteRecord() {
    this.brandService.Delete(this.id)
      .subscribe((data: any) => {
        if (data.result) {
          this.notificationService.showSuccess("Deleted Successfully", "Success")
          this.router.navigate(["/brandlist"], { queryParams: { isNSNav: true } })
        }
        else this.notificationService.showInfo(data.resultMessage, "Error")
      })
  }


  EditMode() {
    if (!confirm("Are you sure you want to edit the record?")) return;

    this.isEditMode = true;
    this.Form.enable();
    this.FormControlDisable();
    this.router.navigate(
      ["."],
      {
        relativeTo: this.activeRoute,
        queryParams: {
          isNSNav: false
        },
        queryParamsHandling: 'merge', // remove to replace all query params by provided
      });
  }

  CancelEdit() {
    if (!confirm("Are you sure you want to discard changes?")) return;
    if (this.id != null) this.Form.patchValue(this.formData);
    else this.Form.reset();
    this.Form.disable()
    this.isEditMode = false;
    this.isNewMode = false;

    this.notificationService.SetNavParam();

  }
  FormControlDisable() {
    this.Form.get('companyId').disable();
    this.Form.get('company').disable();
  }

  Back() {
    this.router.navigate(["/brandlist"]);
  }

  async onSubmit() {
    this.submitted = true;
    this.Form.markAllAsTouched();
    this.Form.enable();
    let formData = this.Form.value;
    this.FormControlDisable();
    if (this.Form.invalid && this.isDialog) return this.notificationService.showError("Form Invalid", "Error");
    if (this.Form.invalid) return;
    //if (!this.isDialog) this.CancelEdit();

    if (!this.id) {
      this.brandService.Save(formData)
        .subscribe((data: any) => {
          var success = data.result;
          if (success) {
            this.onClose.next({ result: success, object: data.object });
            if (!this.isDialog) {
              this.notificationService.showSuccess("Brand saved successfully!", "Success")
              this.router.navigate(["/brandlist"],
                {
                  //relativeTo: this.activeRoute,
                  queryParams: { isNSNav: true },
                  //queryParamsHandling: 'merge'
                });
            }
          }
          else this.notificationService.showInfo(data.resultMessage, "Info");
        })
    }

    else {
      this.brandService.Update(this.id, formData)
        .subscribe((data: any) => {
          var success = data.result;
          if (success) {
            this.onClose.next({ result: success, object: data.object });
            if (!this.isDialog) {
              this.notificationService.showSuccess("Brand updated successfully!", "Success")
              this.router.navigate(["/brandlist"],
                {
                  //relativeTo: this.activeRoute,
                  queryParams: { isNSNav: true },
                  //queryParamsHandling: 'merge'
                });
            }
          }
          else this.notificationService.showInfo(data.resultMessage, "Info");
        })

    }
  }

  close(success) {
    this.onClose.next(success);
  }

  get f() {
    return this.Form.controls;
  }
}