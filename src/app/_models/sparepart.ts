export class SparePart {
  id: string;
  isActive: boolean;
  configTypeid: string;
  partNo: string;
  itemDesc: string;
  qty: number;
  partType: string;
  partTypeName: string;
  descCatalogue: string;
  hsCode: string;
  countryid: string;
  price: string;
  currencyid: string;
  image: string;
  isObselete: boolean;
  replacepPartNoId: string;
  configValueid: string;
  configValueName: string;
  insQty: string;
}

export class ExportSparePart {
 // id: string;
 // isActive: boolean;
 // configTypeid: string;
  partNo: string;
  itemDesc: string;
  qty: number;
  partType: string;
  partTypeName: string;
  descCatalogue: string;
  hsCode: string;
//  countryid: string;
  price: string;
//  currencyid: string;
//  image: string;
  isObselete: boolean;
//  replacepPartNoId: string;
 // configValueid: string;
  configValueName: string;
  countryName: string;
  currencyName: string;
}


export class Currency {
  id: string;
  code: string;
  name: string;
  ncode: string;
  minorUnit: string;
  symbol: string;
}

export class ConfigPartCombo {
  configTypeId: string;
  configValueId: string;
  partNo: string;
}
