"use strict";
/**
 * Mailmodo Events plugin for getanaltyics.io
 * by Alex Miller https://github.com/fotoflo
 *
 * @link https://getanalytics.io/plugins/mailmodo/
 * @param {object} pluginConfig - Plugin settings
 * @param {string} pluginConfig.token - The mailmodo api key
 * @return {object} Analytics plugin
 * @example
 *
 * mailmodoPlugin({
 *   token: 'abcdef123'
 * })
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
function mailmodoPlugin(pluginConfig) {
    if (pluginConfig === void 0) { pluginConfig = { token: null }; }
    if (!pluginConfig.token) {
        console.error("Mailmodo API token is required for all events, please add it to the pluginConfig");
        return;
    }
    var userTraits = {
        userId: null,
        email: null,
    };
    var track = function (event, properties) {
        if (!userTraits.email) {
            console.error("User email is required for Mailmodo events");
            return;
        }
        properties = __assign(__assign({}, properties), userTraits);
        return callMailmodoApi({ event: event, email: userTraits.email, properties: properties });
    };
    var identify = function (userId, traits) {
        if (!userId) {
            console.error("User id is required for all events");
            return;
        }
        if (!traits.email) {
            console.error("User email is required for Mailmodo events");
            return;
        }
        userTraits = __assign(__assign(__assign({}, userTraits), traits), { userId: userId });
        return track("identify", userTraits);
    };
    var page = function (properties) {
        return track("page", properties);
    };
    var reset = function () {
        var result = track("logout", userTraits);
        userTraits = {
            userId: null,
            email: null,
        };
        return result;
    };
    function callMailmodoApi(_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var response, error_1;
            var event = _b.event, email = _b.email, properties = _b.properties;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        // https://www.mailmodo.com/developers/93cba3fa7f1ea-add-event
                        if (!pluginConfig.token) {
                            console.error("Mailmodo API token is required for all events, please add it to the pluginConfig");
                            return [2 /*return*/];
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch("https://api.mailmodo.com/v1/event/".concat(event), {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    mmApiKey: pluginConfig.token,
                                },
                                body: JSON.stringify({
                                    email: email,
                                    event_properties: properties,
                                }),
                            })];
                    case 2:
                        response = _c.sent();
                        if (!response.ok) {
                            throw new Error("HTTP error! Status: ".concat(response.status));
                        }
                        return [4 /*yield*/, response.json()];
                    case 3: return [2 /*return*/, _c.sent()];
                    case 4:
                        error_1 = _c.sent();
                        console.error("".concat(new Date(), " - Error during ").concat(event, " API call:"), error_1);
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    var plugin = {
        name: "mailmodo",
        config: pluginConfig,
        track: track,
        identify: identify,
        page: page,
        reset: reset,
    };
    return plugin;
}
exports.default = mailmodoPlugin;
