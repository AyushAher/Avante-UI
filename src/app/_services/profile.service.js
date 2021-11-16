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
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var environment_1 = require("../../environments/environment");
var ProfileService = /** @class */ (function () {
    function ProfileService(router, http) {
        this.router = router;
        this.http = http;
        this.profileSubject = new rxjs_1.BehaviorSubject(JSON.parse(localStorage.getItem('userprofile')));
        //this.user = this.distrubutorSubject.asObservable();
        this.userprofile = this.profileSubject.asObservable();
    }
    Object.defineProperty(ProfileService.prototype, "userProfileValue", {
        get: function () {
            return this.profileSubject.value;
        },
        enumerable: true,
        configurable: true
    });
    //isAllowedRoles(profilePermission: any) {
    //  let permission: any = [];
    //  var isSearch = profilePermission
    //}
    ProfileService.prototype.save = function (profile) {
        return this.http.post(environment_1.environment.apiUrl + "/Profiles", profile);
    };
    ProfileService.prototype.getAll = function () {
        return this.http.get(environment_1.environment.apiUrl + "/Profiles");
    };
    ProfileService.prototype.getById = function (id) {
        return this.http.get(environment_1.environment.apiUrl + "/Profiles/" + id);
    };
    ProfileService.prototype.getUserProfile = function (value) {
        var _this = this;
        //debugger;
        this.http.get(environment_1.environment.apiUrl + "/UserProfiles/" + value).
            pipe(operators_1.first())
            .subscribe({
            next: function (data) {
                _this.getById(data.object.profileId).pipe(operators_1.first())
                    .subscribe({
                    next: function (pdata) {
                        localStorage.setItem('userprofile', JSON.stringify(pdata.object));
                        _this.profileSubject.next(pdata.object);
                    }
                });
            },
            error: function (error) {
            }
        });
    };
    ProfileService.prototype.update = function (id, params) {
        return this.http.put(environment_1.environment.apiUrl + "/Profiles", params)
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
    ProfileService.prototype.delete = function (id) {
        return this.http.delete(environment_1.environment.apiUrl + "/Profiles/" + id)
            .pipe(operators_1.map(function (x) {
            //// auto logout if the logged in user deleted their own record
            //if (id == this.userValue.id) {
            //    this.logout();
            //}
            return x;
        }));
    };
    ProfileService = __decorate([
        core_1.Injectable({ providedIn: 'root' }),
        __metadata("design:paramtypes", [router_1.Router,
            http_1.HttpClient])
    ], ProfileService);
    return ProfileService;
}());
exports.ProfileService = ProfileService;
//# sourceMappingURL=profile.service.js.map