import { OnInit, Component, AfterViewInit, Input } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { Subject } from "rxjs";
import { NotificationService, AccountService } from "../_services";
import { BusinessUnitService } from "../_services/businessunit.service";
import { CompanyService } from "../_services/company.service";

@Component({
  templateUrl: "./businessunit.component.html"
})
export class CreateBusinessUnitComponent implements OnInit, AfterViewInit {
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
  formData: { [key: string]: any; };

  constructor(
    public activeModal: BsModalService,
    private businessUnitService: BusinessUnitService,
    private notificationService: NotificationService,
    private formBuilder: FormBuilder,
    private AccountService: AccountService,
    private CompanyService: CompanyService,
    private activeRoute: ActivatedRoute,
    private router: Router
  ) {
  }

  async ngOnInit() {
    this.onClose = new Subject();

    this.Form = this.formBuilder.group({
      businessUnitName: ['', [Validators.required]],
      companyId: ['', [Validators.required]],
      id: [""]
    });
    var id = this.activeRoute.snapshot.paramMap.get("id")
    this.isNewMode = id == null;

    let user = this.AccountService.userValue;
    this.Form.get('companyId').setValue(user.companyId);
    this.Form.get('companyId').disable();

    if (id) {
      this.id = id;
      this.Form.get('id').setValue(id);

      var getByIdRequest: any = await this.businessUnitService.GetById(id).toPromise();
      this.formData = getByIdRequest.object;
      this.Form.patchValue(this.formData);
    }

    var request: any = await this.CompanyService.GetAllCompany().toPromise();

    this.companyList = request.object;


    if (this.companyId) this.f.companyId.setValue(this.companyId)
    else {
      this.companyId = user.companyId;
    }
  }

  ngAfterViewInit(): void {
    if (!this.isNewMode) {
      this.Form.disable();
    }
    this.FormControlDisable()
  }

  Back() {
    this.router.navigate(["/businessunitlist"]);
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
  }

  async onSubmit() {
    this.submitted = true;
    this.Form.markAllAsTouched();
    
    this.Form.enable();
    let formData = this.Form.value;
    if (this.Form.invalid) return this.notificationService.showError("Form Invalid", "Error");
    //if (!this.isDialog) this.CancelEdit();

    if (!this.id) {
      var saveRequest: any = await this.businessUnitService.Save(this.Form.value).toPromise();
      let success = saveRequest.httpResponceCode == 200;
      if (success) {
        //this.onClose.next({ result: success, object: saveRequest.object });
        if (!this.isDialog) {
          this.notificationService.showSuccess("Business Unit created successfully!", "Success")
          this.router.navigate(["/businessunitlist"]);
        }
      }
    }

    else {
      var updateRequest: any = await this.businessUnitService.Update(this.id, formData).toPromise();
      let success = updateRequest.httpResponceCode == 200;
      if (success) {
        this.onClose.next({ result: success, object: updateRequest.object });
        if (!this.isDialog) {
          this.notificationService.showSuccess("Business Unit updated successfully!", "Success")
          this.router.navigate(["/businessunitlist"]);
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