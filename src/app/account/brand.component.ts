import { OnInit, Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { BsModalService } from "ngx-bootstrap/modal";
import { first } from "rxjs/operators";
import { NotificationService } from "../_services";
import { BrandService } from "../_services/brand.service";

@Component({
  selector: "CreateBrand",
  templateUrl: "./brand.component.html"
})
export class CreateBrandComponent implements OnInit {
  Form: FormGroup
  submitted: boolean

  constructor(
    private notificationService: NotificationService,
    private formBuilder: FormBuilder,
    private brandService: BrandService,
    private bsModelService: BsModalService
  ) {
  }

  ngOnInit(): void {
    this.Form = this.formBuilder.group({
      brandName: ['']
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.Form.invalid) return;

    this.brandService.Save(this.Form.value)
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