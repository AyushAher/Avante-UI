import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { Subject } from "rxjs";
import { first } from "rxjs/operators";
import { User } from "../_models";
import { AccountService, ContactService, DistributorRegionService, DistributorService, NotificationService, ProfileService, UserProfileService } from "../_services";
import { BrandService } from "../_services/brand.service";
import { BusinessUnitService } from "../_services/businessunit.service";
import { CompanyService } from "../_services/company.service";
import { CreateBrandComponent } from "./brand.component";
import { CreateBusinessUnitComponent } from "./businessunit.component";

@Component({
    templateUrl: "./Existing.component.html"
})
export default class ExistingCIM implements OnInit {

    @Input('username') username: any
    @Input('password') password: any

    public onClose: Subject<any>;
    public modalRef: BsModalRef;
    modalOptions: any;

    Form: FormGroup;
    companyList: any;
    brandList: any;
    buList: any;
    user: User;
    distributorList: any;
    contactList: any;
    distRegionList: any;
    profileList: any;
    userProfileList: any;

    constructor(
        private formBuilder: FormBuilder,
        private notificationService: NotificationService,
        private companyService: CompanyService,
        private brandService: BrandService,
        private buService: BusinessUnitService,
        private distributorService: DistributorService,
        private modalService: BsModalService,
        private contactService: ContactService,
        private distRegionService: DistributorRegionService,
        private profileService: ProfileService,
        private userProfileService: UserProfileService,
        private accountService: AccountService,
        private router: Router
    ) {


    }

    async ngOnInit() {
        this.modalOptions = {
            backdrop: 'static',
            ignoreBackdropClick: true,
            keyboard: false,
            initialState: {
                isDialog: true,
                username: (this.username || this.user.username),
                password: (this.password || sessionStorage.getItem('password'))
            },
        }

        this.accountService.userSubject.subscribe(data => this.user = data);
        this.Form = this.formBuilder.group({
            company: [],
            bu: [],
            brand: [],
            distributor: [],
            contact: [],
            distRegion: [],
            profile: [],
            userProfile: []
        });

        var companyRequest: any = await this.companyService.GetAllCompany().toPromise();
        this.companyList = companyRequest.object;
    }

    async OnCompanyChange() {
        debugger;
        let data = this.f.company.value;

        var buReq: any = await this.buService.GetByCustomCompanyId(data).toPromise();
        this.buList = buReq.object;
        if (this.buList && this.buList.length > 0) this.f.bu.setValue(this.buList[0].id);
        else return this.BUStage();

        var brandReq: any = await this.brandService.GetByCustomCompanyId(data).toPromise();
        this.brandList = brandReq.object;
        if (this.brandList && this.brandList.length > 0) this.f.brand.setValue(this.brandList[0].id);
        else return this.BrandStage();

        this.accountService.login(this.username, this.password, data, this.f.bu.value, this.f.brand.value)
            .subscribe(async () => {
                var distributorReq: any = await this.distributorService.getAll().toPromise();
                this.distributorList = distributorReq.object;
                if (this.distributorList && this.distributorList.length > 0) this.f.distributor.setValue(this.distributorList[0].id);
                else return this.Navigate(['distributor']);

                var contactReq: any = await this.contactService.getAll().toPromise();
                this.contactList = contactReq.object;
                if (this.contactList && this.contactList.length > 0) this.f.contact.setValue(this.contactList[0].id);
                else return this.Navigate(['contact', 'D', this.f.distributor.value]);

                var distRegionReq: any = await this.distRegionService.getAll().toPromise();
                this.distRegionList = distRegionReq.object;
                if (this.distRegionList && this.distRegionList.length > 0) this.f.distRegion.setValue(this.distRegionList[0].id);
                else return this.Navigate(['distributorregion', this.f.distributor.value]);

                // var profileReq: any = await this.profileService.getAll().toPromise();
                // this.profileList = profileReq.object;
                // if (this.profileList && this.profileList.length > 0) this.f.profile.setValue(this.profileList[0].id);
                // else return this.Navigate(['profile']);

                // var userProfileReq: any = await this.userProfileService.getAll().toPromise();
                // this.userProfileList = userProfileReq.object;
                // if (this.userProfileList && this.userProfileList.length > 0) this.f.userProfile.setValue(this.userProfileList[0].id);
                // else return this.Navigate(['userprofile']);

                this.notificationService.showInfo("Setup is completed", "Setup");
            });
    }

    public get f() {
        return this.Form.controls;
    }

    Navigate(route) {
        this.modalService.hide();
        this.router.navigate(route, { queryParams: { isNewSetUp: true } });
    }

    BUStage() {
        this.modalOptions.initialState.companyId = this.f.company.value;

        this.modalRef = this.modalService.show(CreateBusinessUnitComponent, this.modalOptions)

        this.modalRef.content.onClose.subscribe((businessUnitData) => {
            if (!businessUnitData.result) return;
            this.modalOptions.initialState.businessUnitId = businessUnitData.object.id;
            this.f.bu.setValue(businessUnitData.object.id);

            this.modalRef = this.modalService.show(CreateBrandComponent, this.modalOptions)
            this.modalRef.content.onClose.subscribe((brandData) => {
                if (!brandData.result) return;
                this.modalOptions.initialState.brandId = brandData.object.id;
                this.f.brand.setValue(brandData.object.id);

                this.modalService.hide();

                this.accountService.login(this.username, this.password, this.f.company.value, this.f.bu.value, this.f.brand.value)
                    .subscribe(async () => {
                        this.Navigate(['distributor'])
                    })
            })
        })
    }

    BrandStage() {
        this.modalRef = this.modalService.show(CreateBrandComponent, this.modalOptions)
        this.modalRef.content.onClose.subscribe((brandData) => {
            this.modalOptions.initialState.brandId = brandData.object.id;
            this.f.brand.setValue(brandData.object.id);

            this.modalService.hide();

            this.accountService.login((this.username || this.user.username), (this.password || sessionStorage.getItem('password')), this.f.company, this.f.bu, this.f.brand)
                .pipe(first()).subscribe(() => this.Navigate(['distributor']))

        })
    }

}