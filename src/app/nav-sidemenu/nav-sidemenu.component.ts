import { Component, OnInit } from '@angular/core';
import { ListTypeItem, ProfileReadOnly, User } from '../_models';
import { AccountService, ListTypeService, NotificationService, ProfileService } from '../_services';
import { first } from "rxjs/operators";
import { Router } from "@angular/router";

declare function CustomMenu(): any;
@Component({
  selector: 'app-nav-sidemenu',
  templateUrl: './navsidemenu.html',

})
export class NavSideMenuComponent implements OnInit {
  user: User;
  profile: ProfileReadOnly;
  hasDistributor: boolean = false;
  hasCustomer: boolean = false;
  hasInstrument: boolean = false;
  hasSparePart: boolean = false;
  hasUserProfile: boolean = false;
  hasProfile: boolean = false;
  hasCurrency: boolean = false;
  hasCountry: boolean = false;
  hasSearch: boolean = false;
  hasMaster: boolean = false;
  hasexport: boolean = false;
  hasTravelDetails: boolean = false;
  hasStayDetails: boolean = false;
  hasVisaDetails: boolean = false;
  hasLocalExpenses: boolean = false;
  haspastservicereport: boolean = false;
  hascustomersatisfactionsurveylist: boolean = false
  serviceContractRevenueReport: boolean = false


  hasAmc: boolean = false;
  hasschedule: boolean = false;
  hasOfferRequest: boolean = false;
  hasServiceRequest: boolean = false;
  hasServiceReport: boolean = false;
  hasSparePartRecommended: boolean = false;
  hasCustomerSparePartsInventory: boolean = false;
  hasTravelExpenses: boolean = false;

  roles: ListTypeItem[];
  userrole: ListTypeItem[];
  settings: string
  hasDistributorSettings: boolean = false;
  hasCustomerSettings: boolean = false
  hascustomerdashboard: boolean = false;
  hasdistributordashboard: boolean = false;
  haspreventivemaintenance: boolean = false;
  hasdashboardsettings: boolean = false;
  hasAuditTrail: boolean = false;

  hasAdministrator: boolean = false;
  hasMasters: boolean = false;
  hasUtilities: boolean = false;
  hasTravel: boolean = false;
  hasReports: boolean = false;
  hasTransactions: boolean = false;
  hasTravelInvoice: boolean = false;
  hasAdvanceRequest: boolean = false;
  serviceRequestReport: boolean;
  hasServiceCompletionReport: boolean;
  pendingQuoteRequestReport: boolean;
  isAdmin: boolean;

  constructor(
    private accountService: AccountService,
    private profileService: ProfileService,
    private router: Router,
    private listTypeService: ListTypeService,
    private notificationService: NotificationService
  ) {
    this.notificationService.listen().subscribe((data) => {
      if (data != "loggedin") return;
      setTimeout(() => {
        this.ngOnInit();
      }, 1000);
    })
  }
  ngOnInit(): void {

    this.user = this.accountService.userValue;
    this.profileService.getUserProfile(this.user.userProfileId);
    this.profile = JSON.parse(localStorage.getItem('userprofile'));

    this.isAdmin = this.user.isAdmin;

    if (this.profile != null) {
      if (this.profile.permissions.filter(x => x.screenCode == 'SDIST').length > 0) {
        this.hasDistributor = this.profile.permissions.filter(x => x.screenCode == 'SDIST')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'SDIST')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'SDIST')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'SDIST')[0].delete == true
      }
      if (this.profile.permissions.filter(x => x.screenCode == 'SCUST').length > 0) {
        this.hasCustomer = this.profile.permissions.filter(x => x.screenCode == 'SCUST')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'SCUST')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'SCUST')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'SCUST')[0].delete == true
      }
      if (this.profile.permissions.filter(x => x.screenCode == 'SINST').length > 0) {
        this.hasInstrument = this.profile.permissions.filter(x => x.screenCode == 'SINST')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'SINST')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'SINST')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'SINST')[0].delete == true
      }
      if (this.profile.permissions.filter(x => x.screenCode == 'SCDLE').length > 0) {
        this.hasschedule = this.profile.permissions.filter(x => x.screenCode == 'SCDLE')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'SCDLE')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'SCDLE')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'SCDLE')[0].delete == true
      }

      if (this.profile.permissions.filter(x => x.screenCode == 'SSPAR').length > 0) {
        this.hasSparePart = this.profile.permissions.filter(x => x.screenCode == 'SSPAR')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'SSPAR')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'SSPAR')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'SSPAR')[0].delete == true
      }
      if (this.profile.permissions.filter(x => x.screenCode == 'ADREQ').length > 0) {
        this.hasAdvanceRequest = this.profile.permissions.filter(x => x.screenCode == 'ADREQ')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'ADREQ')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'ADREQ')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'ADREQ')[0].delete == true
      }

      if (this.profile.permissions.filter(x => x.screenCode == 'URPRF').length > 0) {
        this.hasUserProfile = this.profile.permissions.filter(x => x.screenCode == 'URPRF')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'URPRF')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'URPRF')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'URPRF')[0].delete == true
      }

      if (this.profile.permissions.filter(x => x.screenCode == 'SCURR').length > 0) {
        this.hasCurrency = this.profile.permissions.filter(x => x.screenCode == 'SCURR')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'SCURR')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'SCURR')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'SCURR')[0].delete == true
      }

      if (this.profile.permissions.filter(x => x.screenCode == 'SCOUN').length > 0) {
        this.hasCountry = this.profile.permissions.filter(x => x.screenCode == 'SCOUN')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'SCOUN')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'SCOUN')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'SCOUN')[0].delete == true
      }

      if (this.profile.permissions.filter(x => x.screenCode == 'SSRCH').length > 0) {
        this.hasSearch = this.profile.permissions.filter(x => x.screenCode == 'SSRCH')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'SSRCH')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'SSRCH')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'SSRCH')[0].delete == true
      }

      if (this.profile.permissions.filter(x => x.screenCode == 'PROF').length > 0) {
        this.hasProfile = this.profile.permissions.filter(x => x.screenCode == 'PROF')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'PROF')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'PROF')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'PROF')[0].delete == true
      }

      if (this.profile.permissions.filter(x => x.screenCode == 'MAST').length > 0) {
        this.hasMaster = this.profile.permissions.filter(x => x.screenCode == 'MAST')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'MAST')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'MAST')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'MAST')[0].delete == true
      }

      if (this.profile.permissions.filter(x => x.screenCode == 'SAMC').length > 0) {
        this.hasAmc = this.profile.permissions.filter(x => x.screenCode == 'SAMC')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'SAMC')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'SAMC')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'SAMC')[0].delete == true
      }
      if (this.profile.permissions.filter(x => x.screenCode == 'OFREQ').length > 0) {
        this.hasOfferRequest = this.profile.permissions.filter(x => x.screenCode == 'OFREQ')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'OFREQ')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'OFREQ')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'OFREQ')[0].delete == true
      }
      if (this.profile.permissions.filter(x => x.screenCode == 'SRREQ').length > 0) {
        this.hasServiceRequest = this.profile.permissions.filter(x => x.screenCode == 'SRREQ')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'SRREQ')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'SRREQ')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'SRREQ')[0].delete == true
      }
      if (this.profile.permissions.filter(x => x.screenCode == 'SRREP').length > 0) {
        this.hasServiceReport = this.profile.permissions.filter(x => x.screenCode == 'SRREP')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'SRREP')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'SRREP')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'SRREP')[0].delete == true
      }
      if (this.profile.permissions.filter(x => x.screenCode == 'CTSPI').length > 0) {
        this.hasCustomerSparePartsInventory = this.profile.permissions.filter(x => x.screenCode == 'CTSPI')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'CTSPI')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'CTSPI')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'CTSPI')[0].delete == true
      }
      if (this.profile.permissions.filter(x => x.screenCode == 'TREXP').length > 0) {
        this.hasTravelExpenses = this.profile.permissions.filter(x => x.screenCode == 'TREXP')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'TREXP')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'TREXP')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'TREXP')[0].delete == true
      }
      if (this.profile.permissions.filter(x => x.screenCode == 'TRINV').length > 0) {
        this.hasTravelInvoice = this.profile.permissions.filter(x => x.screenCode == 'TRINV')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'TRINV')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'TRINV')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'TRINV')[0].delete == true
      }
      if (this.profile.permissions.filter(x => x.screenCode == 'SPRCM').length > 0) {
        this.hasSparePartRecommended = this.profile.permissions.filter(x => x.screenCode == 'SPRCM')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'SPRCM')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'SPRCM')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'SPRCM')[0].delete == true
      }

      if (this.profile.permissions.filter(x => x.screenCode == 'TRDET').length > 0) {
        this.hasTravelDetails = this.profile.permissions.filter(x => x.screenCode == 'TRDET')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'TRDET')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'TRDET')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'TRDET')[0].delete == true
      }

      if (this.profile.permissions.filter(x => x.screenCode == 'STDET').length > 0) {
        this.hasStayDetails = this.profile.permissions.filter(x => x.screenCode == 'STDET')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'STDET')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'STDET')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'STDET')[0].delete == true
      }

      if (this.profile.permissions.filter(x => x.screenCode == 'VADET').length > 0) {
        this.hasVisaDetails = this.profile.permissions.filter(x => x.screenCode == 'VADET')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'VADET')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'VADET')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'VADET')[0].delete == true
      }

      if (this.profile.permissions.filter(x => x.screenCode == 'LCEXP').length > 0) {
        this.hasLocalExpenses = this.profile.permissions.filter(x => x.screenCode == 'LCEXP')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'LCEXP')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'LCEXP')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'LCEXP')[0].delete == true
      }

      if (this.profile.permissions.filter(x => x.screenCode == 'CTSS').length > 0) {
        this.hascustomersatisfactionsurveylist = this.profile.permissions.filter(x => x.screenCode == 'CTSS')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'CTSS')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'CTSS')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'CTSS')[0].delete == true
      }

      if (this.profile.permissions.filter(x => x.screenCode == 'CUSDH').length > 0) {
        this.hascustomerdashboard = this.profile.permissions.filter(x => x.screenCode == 'CUSDH')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'CUSDH')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'CUSDH')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'CUSDH')[0].delete == true
      }
      if (this.profile.permissions.filter(x => x.screenCode == 'DISDH').length > 0) {
        this.hasdistributordashboard = this.profile.permissions.filter(x => x.screenCode == 'DISDH')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'DISDH')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'DISDH')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'DISDH')[0].delete == true
      }
      if (this.profile.permissions.filter(x => x.screenCode == 'PRVMN').length > 0) {
        this.haspreventivemaintenance = this.profile.permissions.filter(x => x.screenCode == 'PRVMN')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'PRVMN')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'PRVMN')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'PRVMN')[0].delete == true
      }

      if (this.profile.permissions.filter(x => x.screenCode == 'DHSET').length > 0) {
        this.hasdashboardsettings = this.profile.permissions.filter(x => x.screenCode == 'DHSET')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'DHSET')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'DHSET')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'DHSET')[0].delete == true
      }

      if (this.profile.permissions.filter(x => x.screenCode == 'AUDIT').length > 0) {
        this.hasAuditTrail = this.profile.permissions.filter(x => x.screenCode == 'AUDIT')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'AUDIT')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'AUDIT')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'AUDIT')[0].delete == true
      }


      if (this.profile.permissions.filter(x => x.screenCode == 'SRQRP').length > 0) {
        this.serviceRequestReport = this.profile.permissions.filter(x => x.screenCode == 'SRQRP')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'SRQRP')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'SRQRP')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'SRQRP')[0].delete == true
      }

      if (this.profile.permissions.filter(x => x.screenCode == 'SRCMR').length > 0) {
        this.hasServiceCompletionReport = this.profile.permissions.filter(x => x.screenCode == 'SRCMR')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'SRCMR')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'SRCMR')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'SRCMR')[0].delete == true
      }

      if (this.profile.permissions.filter(x => x.screenCode == 'PDQRQ').length > 0) {
        this.pendingQuoteRequestReport = this.profile.permissions.filter(x => x.screenCode == 'PDQRQ')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'PDQRQ')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'PDQRQ')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'PDQRQ')[0].delete == true
      }


      if (this.profile.permissions.filter(x => x.screenCode == 'SRCRR').length > 0) {
        this.serviceContractRevenueReport = this.profile.permissions.filter(x => x.screenCode == 'SRCRR')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'SRCRR')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'SRCRR')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'SRCRR')[0].delete == true
      }

      if (this.profile.permissions.filter(x => x.screenCode == 'PSRRP').length > 0) {
        this.haspastservicereport = this.profile.permissions.filter(x => x.screenCode == 'PSRRP')[0].create == true
          || this.profile.permissions.filter(x => x.screenCode == 'PSRRP')[0].update == true
          || this.profile.permissions.filter(x => x.screenCode == 'PSRRP')[0].read == true
          || this.profile.permissions.filter(x => x.screenCode == 'PSRRP')[0].delete == true
      }


    }
    if (this.user.isAdmin) {
      this.hasDistributor = true;
      this.hasCustomer = true;
      this.hasCountry = true;
      this.hasCurrency = true;
      this.hasSparePart = true;
      this.hasInstrument = true;
      this.hasSearch = true;
      this.hasUserProfile = true;
      this.hasexport = true;
      this.hasProfile = true;
      this.hasTravelDetails = true;
      this.hasAmc = true;
      this.hasVisaDetails = true;
      this.hasOfferRequest = true;
      this.hasLocalExpenses = true;
      this.hasServiceRequest = true;
      this.hasStayDetails = true;
      this.hasServiceReport = true;
      this.hascustomersatisfactionsurveylist = true;
      this.hasSparePartRecommended = true;
      this.hasMaster = true;
      this.hasschedule = true;
      this.hasCustomerSparePartsInventory = true;
      this.hascustomerdashboard = true;
      this.hasdistributordashboard = true;
      this.haspreventivemaintenance = true;
      this.hasdashboardsettings = true;
      this.hasTravelExpenses = true;
      this.hasTravelInvoice = true;
      this.hasAuditTrail = true;
      this.hasAdvanceRequest = true;
      this.pendingQuoteRequestReport = true;
      this.hasServiceCompletionReport = true;
      this.serviceRequestReport = true;
      this.serviceContractRevenueReport = true;
      this.haspastservicereport = true;
    }

    if (this.hasMaster || this.hasProfile || this.hasUserProfile) {
      this.hasAdministrator = true;
    }

    if (
      this.hasCurrency || this.hasCountry || this.hasDistributor || this.hasCustomer || this.hasInstrument || this.hasSparePart
      || this.hasOfferRequest
    ) {
      this.hasMasters = true;
    }

    if (this.hasSearch || this.hasexport || this.hasAuditTrail || this.hascustomersatisfactionsurveylist || this.haspastservicereport) {
      this.hasUtilities = true;
    }

    if (this.hasTravelDetails || this.hasStayDetails || this.hasVisaDetails || this.hasLocalExpenses) {
      this.hasTravel = true;
    }

    if (
      this.hasServiceReport || this.hasAmc || this.hasServiceRequest || this.hasCustomerSparePartsInventory || this.hasSparePartRecommended
      || this.hasschedule || this.hasTravelExpenses || this.hasTravelInvoice || this.hasAdvanceRequest || this.hascustomersatisfactionsurveylist
    ) {
      this.hasTransactions = true;
    }

    if (this.serviceRequestReport || this.hasServiceCompletionReport || this.pendingQuoteRequestReport || this.serviceContractRevenueReport) {
      this.hasReports = true;
    }

    CustomMenu()
  }

  navigate(url) {
    this.router.navigate([url])
  }
}
