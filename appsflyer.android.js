"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var appModule = require("tns-core-modules/application");
var utils_1 = require("tns-core-modules/utils/utils");
var stringSetToStringArray = utils_1.ad.collections.stringSetToStringArray;
var _isDebugLocal = false;
var _appsFlyerConversionListener = undefined;
exports.initSdk = function (args) {
    return new Promise(function (resolve, reject) {
        try {
            if (typeof (com.appsflyer.AppsFlyerLib) !== "undefined") {
                var appsFlyerLibInstance = com.appsflyer.AppsFlyerLib.getInstance();
                _isDebugLocal = args.isDebug === true;
                appsFlyerLibInstance.setDebugLog(_isDebugLocal);
                if (_isDebugLocal) {
                    console.log("AF-A :: appsFlyer.initSdk: " + JSON.stringify(args));
                }
                if (args.onConversionDataSuccess || args.onConversionDataFailure) {
                    try {
                        _appsFlyerConversionListener = new com.appsflyer.AppsFlyerConversionListener({
                            _successCallback: args.onConversionDataSuccess,
                            _failureCallback: args.onConversionDataFailure,
                            onConversionDataSuccess: function (conversionData) {
                                if (!this._successCallback) {
                                    return;
                                }
                                if (typeof this._successCallback === 'function') {
                                    try {
                                        var data = {};
                                        for (var _i = 0, _a = stringSetToStringArray(conversionData.keySet()); _i < _a.length; _i++) {
                                            var key = _a[_i];
                                            data[key] = conversionData.get(key);
                                        }
                                        this._successCallback(data);
                                    }
                                    catch (e) {
                                        console.error("AF-A :: onInstallConversionDataLoaded Error: " + e);
                                    }
                                }
                                else {
                                    console.error("AF-A :: onInstallConversionDataLoaded: callback is not a function");
                                }
                            },
                            onConversionDataFailure: function (error) {
                                if (!this._failureCallback) {
                                    return;
                                }
                                if (typeof this._failureCallback === 'function') {
                                    try {
                                        this._failureCallback(error);
                                    }
                                    catch (e) {
                                        console.error("AF-A :: onInstallConversionFailure Error: " + e);
                                    }
                                }
                                else {
                                    console.error("AF-A :: onInstallConversionFailure: callback is not a function");
                                }
                            },
                            onAttributionFailure: function (param0) { },
                            onAppOpenAttribution: function (param0) { },
                        });
                    }
                    catch (e) {
                        console.error("AF-A :: registerConversionListener Error:" + e);
                    }
                }
                appsFlyerLibInstance.init(args.devKey, _appsFlyerConversionListener, (appModule.android.currentContext || com.tns.NativeScriptApplication.getInstance()));
                _trackAppLaunch(appsFlyerLibInstance);
                appsFlyerLibInstance.startTracking(com.tns.NativeScriptApplication.getInstance());
                resolve({ status: "success" });
            }
            else {
                reject({ status: "failure", message: "com.appsflyer.AppsFlyerLib is not defined" });
            }
        }
        catch (ex) {
            console.log("Error: " + ex);
            reject(ex);
        }
    });
};
function _trackAppLaunch(_instance) {
    console.log("AppsFlyer :: NativeScript :: trackAppLaunch is called");
    var c = appModule.android.currentContext || com.tns.NativeScriptApplication.getInstance();
    _instance.trackEvent(c, null, null);
}
exports.trackEvent = function (args) {
    return new Promise(function (resolve, reject) {
        try {
            var appsFlyerLibInstance = com.appsflyer.AppsFlyerLib.getInstance();
            if (_isDebugLocal) {
                console.log("AF-A :: appsFlyer.trackEvent: " + JSON.stringify(args));
            }
            var c = appModule.android.currentContext || com.tns.NativeScriptApplication.getInstance();
            appsFlyerLibInstance.trackEvent(c, args.eventName, exports._toValue(args.eventValues));
            resolve({ status: "success" });
        }
        catch (ex) {
            console.log("AF-A :: Error: " + ex);
            reject(ex);
        }
    });
};
exports.setCustomerUserId = function (userId) {
    return new Promise(function (resolve, reject) {
        try {
            var appsFlyerLibInstance = com.appsflyer.AppsFlyerLib.getInstance();
            appsFlyerLibInstance.setCustomerUserId(userId);
            resolve({ status: "success" });
        }
        catch (ex) {
            console.log("AF-A :: Error: " + ex);
            reject(ex);
        }
    });
};
exports._toHashMap = function (obj) {
    var node = new java.util.HashMap();
    for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
            if (obj[property] !== null) {
                switch (typeof obj[property]) {
                    case 'object':
                        node.put(property, exports._toHashMap(obj[property]));
                        break;
                    case 'boolean':
                        node.put(property, java.lang.Boolean.valueOf(String(obj[property])));
                        break;
                    case 'number':
                        if (Number(obj[property]) === obj[property] && obj[property] % 1 === 0) {
                            node.put(property, java.lang.Long.valueOf(String(obj[property])));
                        }
                        else {
                            node.put(property, java.lang.Double.valueOf(String(obj[property])));
                        }
                        break;
                    case 'string':
                        node.put(property, String(obj[property]));
                        break;
                }
            }
        }
    }
    return node;
};
exports._toValue = function (val) {
    var returnVal = null;
    if (val !== null) {
        switch (typeof val) {
            case 'object':
                returnVal = exports._toHashMap(val);
                break;
            case 'boolean':
                returnVal = java.lang.Boolean.valueOf(String(val));
                break;
            case 'number':
                if (Number(val) === val && val % 1 === 0) {
                    returnVal = java.lang.Long.valueOf(String(val));
                }
                else {
                    returnVal = java.lang.Double.valueOf(String(val));
                }
                break;
            case 'string':
                returnVal = String(val);
                break;
        }
    }
    return returnVal;
};
