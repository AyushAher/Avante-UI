export class Instrument {
  id: string;
  custsiteid: string;
  serialnos: string;
  insmfgdt: string;
  instype: string;
  insversion: string;
  image: string;
  shipdt: string;
  installdt: string;
  installby: string;
  engname: string;
  engcontact: string;
  engemail: string;
  wrranty: string;
  wrntystdt: string;
  wrntyendt: string;
  configuration: instrumentConfig;
}

export class instrumentConfig {
  configtypeid: string;
  instrumentd: string;
}
