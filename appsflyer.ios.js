"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("tns-core-modules/utils/utils");
var nsArrayToJSArray = utils_1.ios.collections.nsArrayToJSArray;
var _isDebugLocal = false;
var _conversionDataDelegate;
exports.initSdk = function (args) {
    return new Promise(function (resolve, reject) {
        try {
            if (typeof (AppsFlyerTracker) !== "undefined") {
                AppsFlyerTracker.sharedTracker().appleAppID = args.appId;
                AppsFlyerTracker.sharedTracker().appsFlyerDevKey = args.devKey;
                AppsFlyerTracker.sharedTracker().isDebug = args.isDebug === true;
                _isDebugLocal = AppsFlyerTracker.sharedTracker().isDebug;
                if (_isDebugLocal) {
                    console.log("AF-I :: appsFlyer.trackEvent: " + JSON.stringify(args));
                }
                if (args.onConversionDataSuccess || args.onConversionDataFailure) {
                    try {
                        _conversionDataDelegate = ConversionDataDelegate.initWithCallbacks(args.onConversionDataSuccess, args.onConversionDataFailure);
                        AppsFlyerTracker.sharedTracker().delegate = _conversionDataDelegate;
                    }
                    catch (e) {
                        console.error("AF-I :: delegate assignment Error: " + e);
                    }
                }
                AppsFlyerTracker.sharedTracker().trackAppLaunch();
                resolve({ status: "success" });
            }
            else {
                reject({ status: "failure", message: "AppsFlyerTracker is not defined" });
            }
        }
        catch (ex) {
            console.log("AF_IOS ::  Error: " + ex);
            reject(ex);
        }
    });
};
exports.trackEvent = function (args) {
    return new Promise(function (resolve, reject) {
        try {
            if (typeof (AppsFlyerTracker) !== "undefined") {
                if (_isDebugLocal) {
                    console.log("AF-I :: appsFlyer.initSdk: " + JSON.stringify(args));
                }
                AppsFlyerTracker.sharedTracker().trackEventWithValues(args.eventName, args.eventValues);
                resolve({ status: "success" });
            }
            else {
                reject({ status: "failure", message: "appsFlyerTracker is not defined, call 1st 'initSdk'" });
            }
        }
        catch (ex) {
            console.log("AF_IOS ::  Error: " + ex);
            reject(ex);
        }
    });
};
exports.setCustomerUserId = function (userId) {
    return new Promise(function (resolve, reject) {
        try {
            if (typeof (AppsFlyerTracker) !== "undefined") {
                AppsFlyerTracker.sharedTracker().customerUserID = userId;
                resolve({ status: "success" });
            }
            else {
                reject({ status: "failure", message: "appsFlyerTracker is not defined, call 1st 'initSdk'" });
            }
        }
        catch (ex) {
            console.log("AF_IOS ::  Error: " + ex);
            reject(ex);
        }
    });
};
var ConversionDataDelegate = (function (_super) {
    __extends(ConversionDataDelegate, _super);
    function ConversionDataDelegate() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ConversionDataDelegate.initWithCallbacks = function (successCallback, failureCallback) {
        var delegate = ConversionDataDelegate.new();
        delegate._successCallback = successCallback;
        delegate._failureCallback = failureCallback;
        return delegate;
    };
    ConversionDataDelegate.prototype.onConversionDataSuccess = function (installData) {
        if (!this._successCallback) {
            return;
        }
        if (typeof this._successCallback === 'function') {
            var data = {};
            if (installData && installData.allKeys) {
                var keys = void 0;
                try {
                    keys = nsArrayToJSArray(installData.allKeys);
                }
                catch (e) {
                    console.error("AF-I :: onConversionDataReceived allKeys Error: " + e);
                }
                if (keys && keys.length) {
                    for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                        var key = keys_1[_i];
                        try {
                            data[key] = installData.objectForKey(key);
                        }
                        catch (e) {
                            console.error("AF-I :: onConversionDataReceived objectForKey Error: " + e);
                        }
                    }
                }
            }
            this._successCallback(data);
        }
        else {
            console.error("AF-I :: onConversionDataReceived: callback is not a function");
        }
    };
    ConversionDataDelegate.prototype.onConversionDataFailure = function (error) {
        if (!this._failureCallback) {
            return;
        }
        if (typeof this._failureCallback === 'function') {
            try {
                this._failureCallback("" + error);
            }
            catch (e) {
                console.error("AF-I :: onConversionDataRequestFailure Error: " + e);
            }
        }
        else {
            console.error("AF-I :: onConversionDataRequestFailure: callback is not a function");
        }
    };
    ConversionDataDelegate.ObjCProtocols = [AppsFlyerTrackerDelegate];
    return ConversionDataDelegate;
}(NSObject));
