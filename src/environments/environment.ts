// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  //for dev:

  // production: false,
  // apiUrl: 'https://localhost:44317/api',
  // uiUrl: 'https://localhost:44378/',

  // for prod

  production: true,
  apiUrl: 'https://service.avantgardeinc.com/api/api',
  uiUrl: 'https://service.avantgardeinc.com/',

  custRoleCode: 'RCUST',
  distRoleCode: 'RDTSP',
  engRoleCode: 'RENG',
  configTypeCode: 'CONTY',
  location: 'PMCL',


  INS: 'INS',
  ANAS: 'ANAS',
  PRMN1: 'PRMN1',
  PRMN2: 'PRMN2',
  REWK: 'REWK',
  CRMA: 'CRMA',

  // zohocodeapi: 'https://accounts.zoho.com/oauth/v2/auth?scope=ZohoBooks.fullaccess.all&client_id=1000.5H07NQJOLXW69IEHWG3GICTVU8L51W&response_type=code&redirect_uri=http://localhost:4200/custpayrpt&access_type=offline',
  // commonzohocodeapi: 'https://accounts.zoho.com/oauth/v2/auth?scope=ZohoBooks.fullaccess.all&client_id=1000.5H07NQJOLXW69IEHWG3GICTVU8L51W&response_type=code&redirect_uri=http://localhost:4200/',

  zohocodeapi: "https://accounts.zoho.com/oauth/v2/auth?scope=ZohoBooks.fullaccess.all&client_id=1000.0JAHNX3N4V33CK2BTWDZV374B0NMKY&response_type=code&redirect_uri=https://service.avantgardeinc.com/custpayrpt&access_type=offline",
  commonzohocodeapi: 'https://accounts.zoho.com/oauth/v2/auth?scope=ZohoBooks.fullaccess.all&client_id=1000.0JAHNX3N4V33CK2BTWDZV374B0NMKY&response_type=code&redirect_uri=https://service.avantgardeinc.com/',

  // client: "1000.B3E6SJ92Q73ECGWMH78XIANG9CA2XB",
  // secret: "fe6678494763975fc429bccfc9361a3d8ca53407ef",
  // redirecturl: "https://service.avantgardeinc.com/custpayrpt",
  bookapi: 'https://books.zoho.com/api/v3',
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
