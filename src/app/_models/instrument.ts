export class Instrument {
  id: string;
  custSiteId: string;
  custSiteName: string;
  serialnos: string;
  insmfgdt: any;
  instype: string;
  insversion: string;
  image: string;
  baseCurrencyId: string;
  baseCurrencyAmt: any;
  shipdt: any;
  installdt: any;
  installby: string;
  installbyOther: string;
  engname: string;
  engcontact: string;
  engemail: string;
  warranty: string;
  wrntystdt: any;
  wrntyendt: any;
  configtypeid: string;
  configvalueid: string;
  operatorId: string;
  instruEngineerId: string;
  configuration: instrumentConfig[];
  cost: string;
  dateOfPurchase: string;
}

export class instrumentConfig {
  configtypeid: string;
  instrumentid: string;
  instrumentconfigid: string;
  configvalueid: string;
  sparepartid: string;
  insqty: number;
}
