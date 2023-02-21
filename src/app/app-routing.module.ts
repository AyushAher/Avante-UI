import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { DistributorComponent } from './distributor/distributor';
import { DistributorListComponent } from './distributor/distributorlist';
import { DistributorRegionComponent } from './distributorRegion/distributor-region';
import { ContactComponent } from './contact/contact';
import { AuthGuard, TextValidator } from './_helpers';
import { CustomerComponent } from './customer/customer';
import { CustomerSiteComponent } from './customersite/customersite';
import { SparePartComponent } from './spareparts/sparepart';
import { InstrumentComponent } from './instrument/instrument';
import { DistributorRegionListComponent } from './distributorRegion/distregionlist';
import { CustomerListComponent } from './customer/customerlist';
import { InstrumentListComponent } from './instrument/instrumentlist';
import { SparePartListComponent } from './spareparts/sparepartlist';
import { ContactListComponent } from './contact/contactlist';
import { CustomerSiteListComponent } from './customersite/customersitelist';
import { SearchComponent } from './search/search';
import { InstrumentRonlyComponent } from './instrumentReadonly/instrument';
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
import { ExportSparePartComponent } from './spareparts/export';
import { ServiceRequestComponent } from './serviceRequest/serviceRequest';
import { ServiceRequestListComponent } from './serviceRequest/serviceRequestlist';
import { ServiceReportComponent } from './serviceReport/serviceReport';
import { ServiceReportListComponent } from './serviceReport/serviceReportlist';
import { StaydetailsComponent } from "./Staydetails/staydetails/staydetails.component";
import { StaydetailsListComponent } from "./Staydetails/staydetailslist/staydetailslist.component";
import { VisadetailsListComponent } from "./Visadetails/visadetailslist/visadetailslist.component";
import { VisadetailsComponent } from "./Visadetails/visadetails/visadetails.component";
import { LocalexpensesComponent } from "./LocalExpenses/localexpenses/localexpenses.component";
import { LocalexpenseslistComponent } from "./LocalExpenses/localexpenseslist/localexpenseslist.component";
import { CustomersatisfactionsurveyComponent } from "./customersatisfactionsurvey/customersatisfactionsurvey/customersatisfactionsurvey.component";
import { CustomersatisfactionsurveylistComponent } from "./customersatisfactionsurvey/customersatisfactionsurveylist/customersatisfactionsurveylist.component";
import { TraveldetailslistComponent } from "./traveldetails/traveldetailslist/traveldetailslist.component";
import { TraveldetailsComponent } from "./traveldetails/traveldetails/traveldetails.component";
import { ReportListComponent } from './report/reportlist';
import { CustPayComponent } from './report/custpay';
import { srcontrevComponent } from './report/srcontrev';
import { sppartrevComponent } from './report/sppartrev';
import { qtsentComponent } from './report/qtsent';
import { sostatusComponent } from './report/sostatus';
import { srrptComponent } from './report/srrpt';
import { DashboardComponent } from "./dashboard/dashboard.component";
import { AmcComponent } from "./amc/amc";
import { AmcListComponent } from "./amc/amclist";
import { OfferrequestComponent } from "./Offerrequest/Offerrequest.component";
import { OfferrequestlistComponent } from "./Offerrequest/Offerrequestlist.component";
import { DistributordashboardComponent } from "./distributordashboard/distributordashboard.component";
import { CustdashboardsettingsComponent } from "./dashboardsettings/custdashboardsettings";
import { DistributordashboardsettingsComponent } from "./distributordashboardsettings/distributordashboardsettings.component";
import { SparepartsrecommendedComponent } from "./sparepartsrecommended/sparepartsrecommended.component";
import { CustspinventorylistComponent } from "./custspinventory/Custspinventorylist.component";
import { CustSPInventoryComponent } from "./custspinventory/custspinventory";
import { PreventivemaintenancetableComponent } from "./preventivemaintenancetable/preventivemaintenancetable.component";
import { EngineerschedulerComponent } from "./engineerscheduler/engineerscheduler.component";
import { AudittrailComponent } from "./audittrail/audittrail.component";
import { AudittrailDetailsComponent } from "./audittrail/audittraildetails";
import { NotificationspopupComponent } from './notificationspopup/notificationspopup.component';
import { TravelexpenseComponent } from './travelexpense/travelexpense.component';
import { TravelexpenseListComponent } from './travelexpense/travelexpenseslist.component';
import { TravelInvoiceListComponent } from './travelinvoice/travelinvoicelist.component';
import { TravelinvoiceComponent } from './travelinvoice/travelinvoice.component';
import { ImportdataService } from './_services/importdata.service';
import { ImportDataComponent } from './importdata/import.component';
import { AdvancerequestformComponent } from './advancerequestform/advancerequestform.component';
import { AdvancerequestlistformComponent } from './advancerequestform/advancerequestformlist.component';
import { ServicereqestreportComponent } from './servicereqestreport/servicereqestreport.component';
import { ServicecompletionreportComponent } from './servicecompletionreport/servicecompletionreport.component';
import { PendingquotationrequestComponent } from './pendingquotationrequest/pendingquotationrequest.component';
import { ServicecontractrevenuereportComponent } from './servicecontractrevenuereport/servicecontractrevenuereport.component';
import { CostofownershipComponent } from './costofownership/costofownership.component';
import { EngdashboardComponent } from './engdashboard/engdashboard.component';
import { PastservicereportComponent } from './pastservicereport/pastservicereport.component';
import { PastservicereportlistComponent } from './pastservicereport/pastservicereportlist.component';
// import { PreventivemaintenancetablelistComponent } from './preventivemaintenancetable/preventivemaintenancetablelist.component';
// import {PreventivemaintenancetableComponent} from "./preventivemaintenancetable/preventivemaintenancetable.component";

const accountModule = () => import('./account/account.module').then(x => x.AccountModule); 

//const usersModule = () => import('./users/users.module').then(x => x.UsersModule);

const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'distributorlist', component: DistributorListComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'distributor', component: DistributorComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'distributor/:id', component: DistributorComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'contact/:type/:id', component: ContactComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'contact/:type/:id/:cid', component: ContactComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'contact/:type/:id/:cid/:did', component: ContactComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'contactlist/:type/:id', component: ContactListComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'contactlist/:type/:id/:cid', component: ContactListComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'distregionlist/:id', component: DistributorRegionListComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'distributorregion', component: DistributorRegionComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'distributorregion/:id', component: DistributorRegionComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'distributorregion/:id/:rid', component: DistributorRegionComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'customer', component: CustomerComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'customerlist', component: CustomerListComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'customer/:id', component: CustomerComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'customersitelist/:id', component: CustomerSiteListComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'customersite/:id/:cid', component: CustomerSiteComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'customersite/:id', component: CustomerSiteComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'instrument', component: InstrumentComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'instrumentlist', component: InstrumentListComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'instrument/:id', component: InstrumentComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'sparepart', component: SparePartComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'sparepart/:id', component: SparePartComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'sparepartlist', component: SparePartListComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'search', component: SearchComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'profilelist', component: ProfileListComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'profile/:id', component: ProfileComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'userprofilelist', component: UserProfileListComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'userprofile', component: UserProfileComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'userprofile/:id', component: UserProfileComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'currencylist', component: CurrencyListComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'currency', component: CurrencyComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'currency/:id', component: CurrencyComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'instrumentRonly/:id', component: InstrumentRonlyComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'countrylist', component: CountryListComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'country', component: CountryComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'country/:id', component: CountryComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'masterlist', component: MasterListComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'masterlistitem', component: MasterListItemComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'masterlistitem/:id', component: MasterListItemComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'exportsparepart', component: ExportSparePartComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'servicerequest', component: ServiceRequestComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'servicerequest/:id', component: ServiceRequestComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'servicerequestlist', component: ServiceRequestListComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'servicereport', component: ServiceReportComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'servicereport/:id', component: ServiceReportComponent, canActivate: [AuthGuard, TextValidator] },
  { path: 'servicereportlist', component: ServiceReportListComponent, canActivate: [AuthGuard, TextValidator] },
  {
    path: "traveldetails",
    component: TraveldetailsComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "traveldetails/:id",
    component: TraveldetailsComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "traveldetailslist",
    component: TraveldetailslistComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "staydetails",
    component: StaydetailsComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "staydetails/:id",
    component: StaydetailsComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "staydetailslist",
    component: StaydetailsListComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "visadetails",
    component: VisadetailsComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "visadetails/:id",
    component: VisadetailsComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "visadetailslist",
    component: VisadetailsListComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "localexpenses",
    component: LocalexpensesComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "localexpenses/:id",
    component: LocalexpensesComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "localexpenseslist",
    component: LocalexpenseslistComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "customersatisfactionsurvey",
    component: CustomersatisfactionsurveyComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "customersatisfactionsurvey/:id",
    component: CustomersatisfactionsurveyComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "customersatisfactionsurveylist",
    component: CustomersatisfactionsurveylistComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "report",
    component: ReportListComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "custpayrpt",
    component: CustPayComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "srcontrev",
    component: srcontrevComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "sppartrev",
    component: sppartrevComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "qtsent",
    component: qtsentComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "sostatus",
    component: sostatusComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "srrpt",
    component: srrptComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "amc",
    component: AmcComponent,
    canActivate: [AuthGuard, TextValidator],
  },

  {
    path: "amclist",
    component: AmcListComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "amc/:id",
    component: AmcComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "offerrequest",
    component: OfferrequestComponent,
    canActivate: [AuthGuard, TextValidator],
  },

  {
    path: "offerrequestlist",
    component: OfferrequestlistComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "offerrequest/:id",
    component: OfferrequestComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "custdashboard",
    component: DashboardComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "distdashboard",
    component: DistributordashboardComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "custdashboardsettings",
    component: CustdashboardsettingsComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "distdashboardsettings",
    component: DistributordashboardsettingsComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "sparepartsrecommended",
    component: SparepartsrecommendedComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "customerspinventorylist",
    component: CustspinventorylistComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "customerspinventory",
    component: CustSPInventoryComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "customerspinventory/:id",
    component: CustSPInventoryComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "preventivemaintenancetable",
    component: PreventivemaintenancetableComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "preventivemaintenancetable/:id",
    component: PreventivemaintenancetableComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "schedule",
    component: EngineerschedulerComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "audittrail",
    component: AudittrailComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "audittrail/:id",
    component: AudittrailDetailsComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "schedule/:id",
    component: EngineerschedulerComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "usernotifications",
    component: NotificationspopupComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "travelexpense",
    component: TravelexpenseComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "travelexpense/:id",
    component: TravelexpenseComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "travelexpenselist",
    component: TravelexpenseListComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "travelinvoice",
    component: TravelinvoiceComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "travelinvoice/:id",
    component: TravelinvoiceComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "travelinvoicelist",
    component: TravelInvoiceListComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "advancerequestform",
    component: AdvancerequestformComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "advancerequestform/:id",
    component: AdvancerequestformComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "advancerequestformlist",
    component: AdvancerequestlistformComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "pastservicereport",
    component: PastservicereportComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "pastservicereport/:id",
    component: PastservicereportComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "pastservicereportlist",
    component: PastservicereportlistComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "servicerequestreport",
    component: ServicereqestreportComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "servicecompletionreport",
    component: ServicecompletionreportComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "servicecontractrevenuereport",
    component: ServicecontractrevenuereportComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "pendingquotationrequest",
    component: PendingquotationrequestComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  {
    path: "engdashboard",
    component: EngdashboardComponent,
    canActivate: [AuthGuard, TextValidator],
  },
  { path: 'account', loadChildren: accountModule },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
