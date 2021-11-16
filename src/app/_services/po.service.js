"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var http_1 = require("@angular/common/http");
var operators_1 = require("rxjs/operators");
var environment_1 = require("../../environments/environment");
var POService = /** @class */ (function () {
    function POService(router, http) {
        this.router = router;
        this.http = http;
        //this.distrubutorSubject = new BehaviorSubject<Distributor>();
        //this.user = this.distrubutorSubject.asObservable();
    }
    //public get userValue(): User {
    //    return this.userSubject.value;
    //}
    POService.prototype.save = function (po) {
        return this.http.post(environment_1.environment.apiUrl + "/po", po);
    };
    POService.prototype.getAll = function () {
        return this.http.get(environment_1.environment.apiUrl + "/po");
    };
    POService.prototype.getById = function (id) {
        return this.http.get(environment_1.environment.apiUrl + "/po/" + id);
    };
    POService.prototype.searchByKeyword = function (param, custSiteId) {
        param = param == "" ? "undefined" : param;
        return this.http.get(environment_1.environment.apiUrl + "/po/GetInstrumentBySerialNo/" + param + "/" + custSiteId);
    };
    POService.prototype.update = function (id, params) {
        return this.http.put(environment_1.environment.apiUrl + "/po", params)
            .pipe(operators_1.map(function (x) {
            // update stored user if the logged in user updated their own record
            //if (id == this.distributor.id) {
            //      // update local storage
            //      const user = { ...this.userValue, ...params };
            //      localStorage.setItem('user', JSON.stringify(user));
            //      // publish updated user to subscribers
            //      this.userSubject.next(user);
            //  }
            return x;
        }));
    };
    POService.prototype.delete = function (id) {
        return this.http.delete(environment_1.environment.apiUrl + "/po/" + id)
            .pipe(operators_1.map(function (x) {
            //// auto logout if the logged in user deleted their own record
            //if (id == this.userValue.id) {
            //    this.logout();
            //}
            return x;
        }));
    };
    POService.prototype.deleteConfig = function (deleteConfig) {
        return this.http.post(environment_1.environment.apiUrl + "/Instrumentconfig/RemoveInsConfigType", deleteConfig);
        //.pipe(map(x => {
        //  //// auto logout if the logged in user deleted their own record
        //  //if (id == this.userValue.id) {
        //  //    this.logout();
        //  //}
        //  return x;
        //}));
    };
    POService = __decorate([
        core_1.Injectable({ providedIn: 'root' }),
        __metadata("design:paramtypes", [router_1.Router,
            http_1.HttpClient])
    ], POService);
    return POService;
}());
exports.POService = POService;
//# sourceMappingURL=po.service.js.map