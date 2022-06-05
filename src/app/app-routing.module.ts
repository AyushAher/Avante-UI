import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { DistributorComponent } from './distributor/distributor';
import { DistributorListComponent } from './distributor/distributorlist';
import { DistributorRegionComponent } from './distributorRegion/distributor-region';
import { ContactComponent } from './contact/contact';
import { AuthGuard } from './_helpers';
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
// import { PreventivemaintenancetablelistComponent } from './preventivemaintenancetable/preventivemaintenancetablelist.component';
// import {PreventivemaintenancetableComponent} from "./preventivemaintenancetable/preventivemaintenancetable.component";

const accountModule = () => import('./account/account.module').then(x => x.AccountModule);

//const usersModule = () => import('./users/users.module').then(x => x.UsersModule);

const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'distributorlist', component: DistributorListComponent, canActivate: [AuthGuard] },
  { path: 'distributor', component: DistributorComponent, canActivate: [AuthGuard] },
  { path: 'distributor/:id', component: DistributorComponent, canActivate: [AuthGuard] },
  { path: 'contact/:type/:id', component: ContactComponent, canActivate: [AuthGuard] },
  { path: 'contact/:type/:id/:cid', component: ContactComponent, canActivate: [AuthGuard] },
  { path: 'contact/:type/:id/:cid/:did', component: ContactComponent, canActivate: [AuthGuard] },
  { path: 'contactlist/:type/:id', component: ContactListComponent, canActivate: [AuthGuard] },
  { path: 'contactlist/:type/:id/:cid', component: ContactListComponent, canActivate: [AuthGuard] },
  { path: 'distregionlist/:id', component: DistributorRegionListComponent, canActivate: [AuthGuard] },
  { path: 'distributorregion', component: DistributorRegionComponent, canActivate: [AuthGuard] },
  { path: 'distributorregion/:id', component: DistributorRegionComponent, canActivate: [AuthGuard] },
  { path: 'distributorregion/:id/:rid', component: DistributorRegionComponent, canActivate: [AuthGuard] },
  { path: 'customer', component: CustomerComponent, canActivate: [AuthGuard] },
  { path: 'customerlist', component: CustomerListComponent, canActivate: [AuthGuard] },
  { path: 'customer/:id', component: CustomerComponent, canActivate: [AuthGuard] },
  { path: 'customersitelist/:id', component: CustomerSiteListComponent, canActivate: [AuthGuard] },
  { path: 'customersite/:id/:cid', component: CustomerSiteComponent, canActivate: [AuthGuard] },
  { path: 'customersite/:id', component: CustomerSiteComponent, canActivate: [AuthGuard] },
  { path: 'instrument', component: InstrumentComponent, canActivate: [AuthGuard] },
  { path: 'instrumentlist', component: InstrumentListComponent, canActivate: [AuthGuard] },
  { path: 'instrument/:id', component: InstrumentComponent, canActivate: [AuthGuard] },
  { path: 'sparepart', component: SparePartComponent, canActivate: [AuthGuard] },
  { path: 'sparepart/:id', component: SparePartComponent, canActivate: [AuthGuard] },
  { path: 'sparepartlist', component: SparePartListComponent, canActivate: [AuthGuard] },
  { path: 'search', component: SearchComponent, canActivate: [AuthGuard] },
  { path: 'profilelist', component: ProfileListComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'profile/:id', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'userprofilelist', component: UserProfileListComponent, canActivate: [AuthGuard] },
  { path: 'userprofile', component: UserProfileComponent, canActivate: [AuthGuard] },
  { path: 'userprofile/:id', component: UserProfileComponent, canActivate: [AuthGuard] },
  { path: 'currencylist', component: CurrencyListComponent, canActivate: [AuthGuard] },
  { path: 'currency', component: CurrencyComponent, canActivate: [AuthGuard] },
  { path: 'currency/:id', component: CurrencyComponent, canActivate: [AuthGuard] },
  { path: 'instrumentRonly/:id', component: InstrumentRonlyComponent, canActivate: [AuthGuard] },
  { path: 'countrylist', component: CountryListComponent, canActivate: [AuthGuard] },
  { path: 'country', component: CountryComponent, canActivate: [AuthGuard] },
  { path: 'country/:id', component: CountryComponent, canActivate: [AuthGuard] },
  { path: 'masterlist', component: MasterListComponent, canActivate: [AuthGuard] },
  { path: 'masterlistitem', component: MasterListItemComponent, canActivate: [AuthGuard] },
  { path: 'masterlistitem/:id', component: MasterListItemComponent, canActivate: [AuthGuard] },
  { path: 'exportsparepart', component: ExportSparePartComponent, canActivate: [AuthGuard] },
  { path: 'servicerequest', component: ServiceRequestComponent, canActivate: [AuthGuard] },
  { path: 'servicerequest/:id', component: ServiceRequestComponent, canActivate: [AuthGuard] },
  { path: 'servicerequestlist', component: ServiceRequestListComponent, canActivate: [AuthGuard] },
  { path: 'servicereport', component: ServiceReportComponent, canActivate: [AuthGuard] },
  { path: 'servicereport/:id', component: ServiceReportComponent, canActivate: [AuthGuard] },
  { path: 'servicereportlist', component: ServiceReportListComponent, canActivate: [AuthGuard] },
  {
    path: "traveldetails",
    component: TraveldetailsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "traveldetails/:id",
    component: TraveldetailsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "traveldetailslist",
    component: TraveldetailslistComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "staydetails",
    component: StaydetailsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "staydetails/:id",
    component: StaydetailsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "staydetailslist",
    component: StaydetailsListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "visadetails",
    component: VisadetailsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "visadetails/:id",
    component: VisadetailsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "visadetailslist",
    component: VisadetailsListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "localexpenses",
    component: LocalexpensesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "localexpenses/:id",
    component: LocalexpensesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "localexpenseslist",
    component: LocalexpenseslistComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "customersatisfactionsurvey",
    component: CustomersatisfactionsurveyComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "customersatisfactionsurvey/:id",
    component: CustomersatisfactionsurveyComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "customersatisfactionsurveylist",
    component: CustomersatisfactionsurveylistComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "report",
    component: ReportListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "custpayrpt",
    component: CustPayComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "srcontrev",
    component: srcontrevComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "sppartrev",
    component: sppartrevComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "qtsent",
    component: qtsentComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "sostatus",
    component: sostatusComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "srrpt",
    component: srrptComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "amc",
    component: AmcComponent,
    canActivate: [AuthGuard],
  },

  {
    path: "amclist",
    component: AmcListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "amc/:id",
    component: AmcComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "offerrequest",
    component: OfferrequestComponent,
    canActivate: [AuthGuard],
  },

  {
    path: "offerrequestlist",
    component: OfferrequestlistComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "offerrequest/:id",
    component: OfferrequestComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "custdashboard",
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "distdashboard",
    component: DistributordashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "custdashboardsettings",
    component: CustdashboardsettingsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "distdashboardsettings",
    component: DistributordashboardsettingsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "sparepartsrecommended",
    component: SparepartsrecommendedComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "customerspinventorylist",
    component: CustspinventorylistComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "customerspinventory",
    component: CustSPInventoryComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "customerspinventory/:id",
    component: CustSPInventoryComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "preventivemaintenancetable",
    component: PreventivemaintenancetableComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "preventivemaintenancetable/:id",
    component: PreventivemaintenancetableComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "schedule",
    component: EngineerschedulerComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "audittrail",
    component: AudittrailComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "audittrail/:id",
    component: AudittrailDetailsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "schedule/:id",
    component: EngineerschedulerComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "usernotifications",
    component: NotificationspopupComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "travelexpense",
    component: TravelexpenseComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "travelexpense/:id",
    component: TravelexpenseComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "travelexpenselist",
    component: TravelexpenseListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "travelinvoice",
    component: TravelinvoiceComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "travelinvoice/:id",
    component: TravelinvoiceComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "travelinvoicelist",
    component: TravelInvoiceListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "advancerequestform",
    component: AdvancerequestformComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "advancerequestform/:id",
    component: AdvancerequestformComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "advancerequestformlist",
    component: AdvancerequestlistformComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "servicerequestreport",
    component: ServicereqestreportComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "servicecompletionreport",
    component: ServicecompletionreportComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "servicecontractrevenuereport",
    component: ServicecontractrevenuereportComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "pendingquotationrequest",
    component: PendingquotationrequestComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "engdashboard",
    component: EngdashboardComponent,
    canActivate: [AuthGuard],
  },
  { path: 'account', loadChildren: accountModule },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
