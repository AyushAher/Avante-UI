// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  //for dev:

  // production: false,
  // apiUrl: 'https://localhost:44317/api',
  // uiUrl: 'https://localhost:44378/',
  // configTypeCode: "CONTY",// "f0bf6d8d-739a-11eb-adfc-0a91af0598e6" //"4c155b3e-7526-11eb-97d1-1c39472d435b"
  //
  // custRoleCode: "RCUST",
  // distRoleCode: "RDTSP",
  // engRoleCode: "RENG",
  //
  // INS: "INS",
  // ANAS: "ANAS",
  // PRMN1: "PRMN1",
  // PRMN2: "PRMN2",
  // REWK:"REWK",
  // CRMA: "CRMA",
  //
  // zohocodeapi: "https://accounts.zoho.com/oauth/v2/auth?scope=ZohoBooks.fullaccess.all&client_id=1000.5H07NQJOLXW69IEHWG3GICTVU8L51W&response_type=code&redirect_uri=http://localhost:4200/custpayrpt&access_type=offline",
  // zohoaccessapi:"https://accounts.zoho.com/oauth/v2/token?code={0}&client_id=1000.5H07NQJOLXW69IEHWG3GICTVU8L51W&client_secret=2f54ec5f719c6ee911a367c16211f8d3576378d013&redirect_uri=http://localhost:4200/custpayrpt&grant_type=authorization_code",
  //
  // client: "1000.UI60D3EU4DEZJZOS0G873SEAUPNY0A",
  // secret: "4192fa27f500e7a8a0b23f960d2d78d26de84c56c3",
  // redirecturl: "http://localhost:4200/custpayrpt",
  // bookapi: "https://books.zoho.com/api/v3",
  //
  // // client: "1000.UI60D3EU4DEZJZOS0G873SEAUPNY0A",
  // // secret: "4192fa27f500e7a8a0b23f960d2d78d26de84c56c3",
  // // redirecturl: "https://localhost:44378/custpayrpt",

  // for prod

  production: true,
  apiUrl: 'https://service.avantgardeinc.com/api/api',
  uiUrl: 'https://service.avantgardeinc.com/',

  custRoleCode: "RCUST",
  distRoleCode: "RDTSP",
  engRoleCode: "RENG",
  configTypeCode: "CONTY",// "f0bf6d8d-739a-11eb-adfc-0a91af0598e6" //"4c155b3e-7526-11eb-97d1-1c39472d435b"
  location: "PMCL",


  INS: "INS",
  ANAS: "ANAS",
  PRMN1: "PRMN1",
  PRMN2: "PRMN2",
  REWK: "REWK",
  CRMA: "CRMA",

  // zohocodeapi: "https://accounts.zoho.com/oauth/v2/auth?scope=ZohoBooks.fullaccess.all&client_id=1000.0JAHNX3N4V33CK2BTWDZV374B0NMKY&response_type=code&redirect_uri=https://service.avantgardeinc.com/custpayrpt&access_type=offline",
  // zohoaccessapi: "https://accounts.zoho.com/oauth/v2/token?code={0}&client_id=1000.B3E6SJ92Q73ECGWMH78XIANG9CA2XB&client_secret=fe6678494763975fc429bccfc9361a3d8ca53407ef&redirect_uri=https://service.avantgardeinc.com/custpayrpt&grant_type=authorization_code",
  zohocodeapi: "https://accounts.zoho.com/oauth/v2/auth?scope=ZohoBooks.fullaccess.all&client_id=1000.0JAHNX3N4V33CK2BTWDZV374B0NMKY&response_type=code&redirect_uri=https://service.avantgardeinc.com/custpayrpt&access_type=offline&prompt=consent",
  // client: "1000.B3E6SJ92Q73ECGWMH78XIANG9CA2XB",
  // secret: "fe6678494763975fc429bccfc9361a3d8ca53407ef",
  // redirecturl: "https://service.avantgardeinc.com/custpayrpt",
  bookapi: "https://books.zoho.com/api/v3",
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
