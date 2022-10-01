import { OnInit, Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { BsModalService } from "ngx-bootstrap/modal";
import { first } from "rxjs/operators";
import { NotificationService } from "../_services";
import { BrandService } from "../_services/brand.service";
import { CompanyService } from "../_services/company.service";

@Component({
  selector: "CreateBrand",
  templateUrl: "./company.component.html"
})
export class CreateCompanyComponent implements OnInit {
  Form: FormGroup
  submitted: boolean

  constructor(
    private notificationService: NotificationService,
    private formBuilder: FormBuilder,
    private bsModelService: BsModalService,
    private companyService: CompanyService,
  ) {
  }

  ngOnInit(): void {
    this.Form = this.formBuilder.group({
      companyName: ['']
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.Form.invalid) return;

    this.companyService.Save(this.Form.value)
      .pipe(first()).subscribe(() => this.close())
  }

  get f() {
    return this.Form.controls;
  }

  close() {
    this.bsModelService.hide();
    this.notificationService.filter("cim");
  }
}