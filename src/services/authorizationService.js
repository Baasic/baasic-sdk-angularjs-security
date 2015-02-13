/* globals module */

(function (angular, module, undefined) {
    'use strict';
    var permissionHash = {};
    module.service('baasicAuthorizationService', ['$rootScope', 'baasicApp',
        function ($rootScope, baasicApp) {
            var app = baasicApp.get();
            var apiKey = app.getApiKey();
            permissionHash[apiKey] = {};
            return {
                getUser: function getUser() {
                    var user = app.getUser();
                    if ($rootScope.user === undefined &&
                            user.user !== undefined) {
                        $rootScope.user = user.user;
                    }
                    return user.user;
                },
                setUser: function setUser(user) {
                    if (user) {
                        app.setUser(user);
                        user.isAuthenticated = true;
                        $rootScope.user = user;
                    } else {
                        app.setUser(null);
                        this.resetPermissions();
                        $rootScope.user = {
                            isAuthenticated: false
                        };
                    }
                },
                updateUser: function updateUser(user) {
                    var currentUser = this.getUser();
					if (currentUser) {
						angular.extend(currentUser, user);
					} else {
						currentUser = user;
					}

                    this.setUser(currentUser);
                },
                getAccessToken: function getAccessToken() {
                    return app.getAccessToken();
                },
				updateAccessToken: function updateAccessToken(token) {
					return app.updateAccessToken(token);
				},
                resetPermissions: function () {
                    permissionHash[apiKey] = {};
                },
                hasPermission: function (authorization) {
                    if (permissionHash[apiKey].hasOwnProperty(authorization)) {
                        return permissionHash[apiKey][authorization];
                    }

                    var user = this.getUser();
                    if (user === undefined) {
                        return;
                    }

                    var hasPermission = false;

                    if (user.permissions) {
                        var tokens = authorization.split('.');
                        if (tokens.length > 0) {
                            var section = tokens[0];

                            var sectionPermissions = user.permissions[section];
                            if (sectionPermissions) {
                                if (tokens.length > 1) {
                                    var action = tokens[1].toLowerCase();
                                    for (var i = 0; i < sectionPermissions.length; i++) {
                                        if (sectionPermissions[i].toLowerCase() === action) {
                                            hasPermission = true;
                                            break;
                                        }
                                    }
                                } else {
                                    hasPermission = true;
                                }
                            }
                        }
                    }

                    permissionHash[apiKey][authorization] = hasPermission;
                    return hasPermission;
                }
            };
        }]);
}(angular, module));