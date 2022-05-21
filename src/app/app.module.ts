import { BrowserModule } from '@angular/platform-browser';
import { CommonModule, DatePipe, DecimalPipe, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { Ng2TelInputModule } from 'ng2-tel-input';
import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HomeComponent } from './home/home.component';
import { CounterComponent } from './counter/counter.component';
import { FetchDataComponent } from './fetch-data/fetch-data.component';
import { FooterComponent } from './footer/footer';
import { NavSideMenuComponent } from './nav-sidemenu/nav-sidemenu.component';
// used to create fake backend
import { ErrorInterceptor, fakeBackendProvider, JwtInterceptor } from './_helpers';
import { LayoutComponent } from './layout/layout.component';
import { AlertComponent } from './_components';
import { DistributorComponent } from './distributor/distributor';
import { ContactComponent } from './contact/contact';
import { DistributorRegionComponent } from './distributorRegion/distributor-region';
import { CustomerComponent } from './customer/customer';
import { CustomerSiteComponent } from './customersite/customersite';
import { SparePartComponent } from './spareparts/sparepart';
import { InstrumentComponent } from './instrument/instrument';
import { DistributorListComponent } from './distributor/distributorlist';
// Datepicker module
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { AgGridModule } from 'ag-grid-angular';
import { DistributorRegionListComponent } from './distributorRegion/distregionlist';
import { RenderComponent } from './distributor/rendercomponent';
import { CustomerListComponent } from './customer/customerlist';
import { InstrumentListComponent } from './instrument/instrumentlist';
import { SparePartListComponent } from './spareparts/sparepartlist';
import { ContactListComponent } from './contact/contactlist';
import { CustomerSiteListComponent } from './customersite/customersitelist';
import { SearchComponent } from './search/search';
import { lnkRenderComponent } from './search/lnkrendercomponent';
import { InstrumentRonlyComponent } from './instrumentReadonly/instrument';
import { ToastrModule } from 'ngx-toastr';
import { ProfileListComponent } from './profile/profilelist';
import { ProfileComponent } from './profile/profile';
import { UserProfileListComponent } from './userprofile/userprofilelist';
import { UserProfileComponent } from './userprofile/userprofile';
import { CurrencyListComponent } from './currency/currencylist';
import { CurrencyComponent } from './currency/currency';
import { CountryListComponent } from './country/countrylist';
import { CountryComponent } from './country/country';
import { MasterListComponent } from './masterlist/masterlist';
import { MasterListItemComponent } from './masterlist/masterlistitem';
import { ModelContentComponent } from './masterlist/modelcontent';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ModelEngContentComponent } from './serviceRequest/modelengcontent';
import { MRenderComponent } from './masterlist/rendercomponent';
import { ExportSparePartComponent } from './spareparts/export';
import { ServiceRequestComponent } from './serviceRequest/serviceRequest';
import { ServiceRequestListComponent } from './serviceRequest/serviceRequestlist';
import { ModelEngActionContentComponent } from './serviceRequest/modelengactioncontent';
import { WorkdoneContentComponent } from './serviceReport/workdonecontent';
import { WorkTimeContentComponent } from './serviceReport/workTime';
import { ServiceReportComponent } from './serviceReport/serviceReport';
import { ServiceReportListComponent } from './serviceReport/serviceReportlist';
import { SignaturePadModule } from 'angular2-signaturepad';
import { StaydetailsListComponent } from './Staydetails/staydetailslist/staydetailslist.component';
import { StaydetailsComponent } from './Staydetails/staydetails/staydetails.component';
import { VisadetailsListComponent } from './Visadetails/visadetailslist/visadetailslist.component';
import { VisadetailsComponent } from './Visadetails/visadetails/visadetails.component';
import { LocalexpensesComponent } from './LocalExpenses/localexpenses/localexpenses.component';
import { LocalexpenseslistComponent } from './LocalExpenses/localexpenseslist/localexpenseslist.component';
import { CustomersatisfactionsurveyComponent } from './customersatisfactionsurvey/customersatisfactionsurvey/customersatisfactionsurvey.component';
import { CustomersatisfactionsurveylistComponent } from './customersatisfactionsurvey/customersatisfactionsurveylist/customersatisfactionsurveylist.component';
import { TraveldetailsComponent } from './traveldetails/traveldetails/traveldetails.component';
import { TraveldetailslistComponent } from './traveldetails/traveldetailslist/traveldetailslist.component';
import { ReportListComponent } from './report/reportlist';
import { CustPayComponent } from './report/custpay';
import { srcontrevComponent } from './report/srcontrev';
import { sppartrevComponent } from './report/sppartrev';
import { qtsentComponent } from './report/qtsent';
import { sostatusComponent } from './report/sostatus';
import { srrptComponent } from './report/srrpt';
import { AmcComponent } from './amc/amc';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AmcListComponent } from './amc/amclist';
import { OfferrequestComponent } from './Offerrequest/Offerrequest.component';
import { OfferrequestlistComponent } from './Offerrequest/Offerrequestlist.component';
import { AmcInstrumentRendererComponent } from './amc/amc-instrument-renderer.component';
import { FilerendercomponentComponent } from './Offerrequest/filerendercomponent.component';
import { DistributordashboardComponent } from './distributordashboard/distributordashboard.component';
import { CustdashboardsettingsComponent } from './dashboardsettings/custdashboardsettings';
import { DistributordashboardsettingsComponent } from './distributordashboardsettings/distributordashboardsettings.component';
import { SparepartsrecommendedComponent } from './sparepartsrecommended/sparepartsrecommended.component';
import { CustspinventorylistComponent } from './custspinventory/Custspinventorylist.component';
import { CustSPInventoryComponent } from './custspinventory/custspinventory';
import { SparequotedetComponent } from './Offerrequest/sparequotedet.component';
import { PreventivemaintenancetableComponent } from './preventivemaintenancetable/preventivemaintenancetable.component';
import { PrevchklocpartelementvalueComponent } from './masterlist/prevchklocpartelementvalue.component';
import {
  DayService,
  MonthAgendaService,
  MonthService,
  RecurrenceEditorModule,
  ScheduleModule,
  TimelineMonthService,
  WeekService,
  WorkWeekService
} from '@syncfusion/ej2-angular-schedule';
import { EngineerschedulerComponent } from './engineerscheduler/engineerscheduler.component';
import { ChangepasswoardComponent } from './account/changepasswoard.component';
import { ForgotpasswoardComponent } from './account/forgotpasswoard.component';
import { AudittrailComponent } from './audittrail/audittrail.component';
import { AudittrailDetailsComponent } from './audittrail/audittraildetails';
import { ServiceRComponent } from './serviceRequest/ServicerequestRenderer';
import { NotificationspopupComponent } from './notificationspopup/notificationspopup.component';
import { LoaderComponent } from './loader/loader.component';
import { OfferRequestListRenderer } from './Offerrequest/offerrequestlistrenderer';
import { OfferRequeestProcessFileRenderer } from './Offerrequest/OfferRequeestProcessFileRenderer';
import { TravelexpenseComponent } from './travelexpense/travelexpense.component';
import { TravelexpenseListComponent } from './travelexpense/travelexpenseslist.component';
import { TravelexpenseItemComponent } from './travelexpense/travelexpenseitem.component';
import { TravelinvoiceComponent } from './travelinvoice/travelinvoice.component';
import { TravelInvoiceListComponent } from './travelinvoice/travelinvoicelist.component';
import { ImportDataComponent } from './importdata/import.component';
import { AdvancerequestformComponent } from './advancerequestform/advancerequestform.component';
import { AdvancerequestlistformComponent } from './advancerequestform/advancerequestformlist.component';
import { DistributorfilterComponent } from './distributorfilter/distributorfilter.component';
import { ServicereqestreportComponent } from './servicereqestreport/servicereqestreport.component';
import { ReportfilterComponent } from './reportfilter/reportfilter.component';
import { ServicecompletionreportComponent } from './servicecompletionreport/servicecompletionreport.component';
import { PendingquotationrequestComponent } from './pendingquotationrequest/pendingquotationrequest.component';
import { ServicecontractrevenuereportComponent } from './servicecontractrevenuereport/servicecontractrevenuereport.component';
import { CostofownershipComponent } from './costofownership/costofownership.component';
import { EnvServiceProvider } from './_services/env/env.service.provider';


@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    NavSideMenuComponent,
    HomeComponent,
    CounterComponent,
    FetchDataComponent,
    FooterComponent,
    LayoutComponent,
    AlertComponent,
    DistributorComponent,
    ContactComponent,
    DistributorRegionComponent,
    CustomerComponent,
    CustomerSiteComponent,
    SparePartComponent,
    InstrumentComponent,
    DistributorListComponent,
    DistributorRegionListComponent,
    RenderComponent,
    CustomerListComponent,
    InstrumentListComponent,
    SparePartListComponent,
    ContactListComponent,
    CustomerSiteListComponent,
    SearchComponent,
    lnkRenderComponent,
    InstrumentRonlyComponent,
    ProfileComponent,
    ProfileListComponent,
    UserProfileListComponent,
    UserProfileComponent,
    CurrencyListComponent,
    CurrencyComponent,
    CountryListComponent,
    CountryComponent,
    MasterListComponent,
    MasterListItemComponent,
    ModelContentComponent,
    MRenderComponent,
    ExportSparePartComponent,
    ServiceRequestComponent,
    ServiceRequestListComponent,
    ModelEngContentComponent,
    ModelEngActionContentComponent,
    ServiceReportComponent,
    ServiceReportListComponent,
    WorkdoneContentComponent,
    WorkTimeContentComponent,
    StaydetailsListComponent,
    StaydetailsComponent,
    VisadetailsListComponent,
    VisadetailsComponent,
    LocalexpensesComponent,
    LocalexpenseslistComponent,
    CustomersatisfactionsurveyComponent,
    CustomersatisfactionsurveylistComponent,
    TraveldetailsComponent,
    TraveldetailslistComponent,
    ReportListComponent,
    CustPayComponent,
    srcontrevComponent,
    sppartrevComponent,
    qtsentComponent,
    sostatusComponent,
    srrptComponent,
    AmcComponent,
    AmcListComponent,
    DashboardComponent,
    OfferrequestComponent,
    OfferrequestlistComponent,
    AmcInstrumentRendererComponent,
    FilerendercomponentComponent,
    DistributordashboardComponent,
    CustdashboardsettingsComponent,
    DistributordashboardsettingsComponent,
    SparepartsrecommendedComponent,
    CustSPInventoryComponent,
    CustspinventorylistComponent,
    SparequotedetComponent,
    PreventivemaintenancetableComponent,
    PrevchklocpartelementvalueComponent,
    EngineerschedulerComponent,
    ChangepasswoardComponent,
    ForgotpasswoardComponent,
    AudittrailComponent,
    AudittrailDetailsComponent,
    ServiceRComponent,
    NotificationspopupComponent,
    LoaderComponent,
    OfferRequestListRenderer,
    OfferRequeestProcessFileRenderer,
    TravelexpenseComponent,
    TravelexpenseListComponent,
    TravelexpenseItemComponent,
    TravelinvoiceComponent,
    TravelInvoiceListComponent,
    ImportDataComponent,
    AdvancerequestformComponent,
    AdvancerequestlistformComponent,
    DistributorfilterComponent,
    ServicereqestreportComponent,
    ReportfilterComponent,
    ServicecompletionreportComponent,
    PendingquotationrequestComponent,
    ServicecontractrevenuereportComponent,
    CostofownershipComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgSelectModule,
    NgbModule,
    Ng2TelInputModule,
    SignaturePadModule,
    ModalModule.forRoot(),
    ToastrModule.forRoot(),
    BsDatepickerModule.forRoot(),
    NgMultiSelectDropDownModule.forRoot(),
    AgGridModule.withComponents([]),
    ScheduleModule, RecurrenceEditorModule
  ],
  providers: [EnvServiceProvider, DecimalPipe, { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    fakeBackendProvider, DatePipe, DayService, WeekService, MonthService, WorkWeekService, MonthAgendaService, TimelineMonthService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
