import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvService {

  constructor() { }
  projectName = "External_EMV"
  apiUrl = 'https://localhost:44317/api';
  production = false;
  uiUrl = 'https://localhost:44378/';
  currencyConvert = ` https://xecdapi.xe.com/v1/convert_to.json`;
  custRoleCode = 'RCUST';
  distRoleCode = 'RDTSP';
  engRoleCode = 'RENG';
  configTypeCode = 'CONTY';
  location = 'PMCL';
  INS = 'INS';
  ANAS = 'ANAS';
  PRMN1 = 'PRMN1';
  PRMN2 = 'PRMN2';
  REWK = 'REWK';
  CRMA = 'CRMA';
  zohocodeapi = "https://accounts.zoho.com/oauth/v2/auth?scope=ZohoBooks.fullaccess.all&client_id=1000.0JAHNX3N4V33CK2BTWDZV374B0NMKY&response_type=code&redirect_uri=https://service.avantgardeinc.com/custpayrpt&access_type=offline";
  commonzohocodeapi = 'https://accounts.zoho.com/oauth/v2/auth?scope=ZohoBooks.fullaccess.all&client_id=1000.0JAHNX3N4V33CK2BTWDZV374B0NMKY&response_type=code&redirect_uri=https://service.avantgardeinc.com/';
  bookapi = 'https://books.zoho.com/api/v3';

}
