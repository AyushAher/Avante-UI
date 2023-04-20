(function (window) {
    window.__env = window.__env || {};
    window.__env.apiUrl = 'https://localhost:5001/api';
    window.__env.uiUrl = 'https://localhost:44378/';

    // window.__env.apiUrl = 'https://service.avantgardeinc.com/api/api';
    // window.__env.uiUrl = 'https://service.avantgardeinc.com/';

    window.__env.currencyConvert = ` https://xecdapi.xe.com/v1/convert_to.json`;

    window.__env.custRoleCode = 'RCUST';
    window.__env.baseCurrencyCode = 'USD';
    window.__env.distRoleCode = 'RDTSP';
    window.__env.engRoleCode = 'RENG';

    window.__env.configTypeCode = 'CONTY';
    window.__env.location = 'PMCL';
    window.__env.INS = 'INS';
    window.__env.ANAS = 'ANAS';
    window.__env.PRMN1 = 'PRMN1';
    window.__env.PRMN2 = 'PRMN2';
    window.__env.REWK = 'REWK';
    window.__env.CRMA = 'CRMA';

    window.__env.zohocodeapi = "https://accounts.zoho.com/oauth/v2/auth?scope=ZohoBooks.fullaccess.all&client_id=1000.0JAHNX3N4V33CK2BTWDZV374B0NMKY&response_type=code&redirect_uri=https://service.avantgardeinc.com/custpayrpt&access_type=offline";
    window.__env.commonzohocodeapi = 'https://accounts.zoho.com/oauth/v2/auth?scope=ZohoBooks.fullaccess.all&client_id=1000.0JAHNX3N4V33CK2BTWDZV374B0NMKY&response_type=code&redirect_uri=https://service.avantgardeinc.com/';
    window.__env.bookapi = 'https://books.zoho.com/api/v3';


}(this));