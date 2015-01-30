(function (angular, undefined) {
    var module = angular.module("baasic.security", ["baasic.api"]);

    module.config(["$provide", function config($provide) {}]);

    (function (angular, module, undefined) {
        "use strict";
        module.directive("baasicRecaptcha", ["baasicRecaptchaService", function (recaptchaService) {
            return {
                restrict: 'A',
                link: function (scope, elem, attrs) {
                    recaptchaService.create(elem, {
                        theme: "clean"
                    });

                    scope.$on("$destroy", function () {
                        if (recaptchaService) {
                            recaptchaService.destroy();
                        }
                    });
                }
            };
        }]);
    }(angular, module));
    (function (angular, module, undefined) {
        "use strict";
        var permissionHash = {};
        module.service("baasicAuthorizationService", ["$rootScope", "baasicApp", function ($rootScope, baasicApp) {
            var app = baasicApp.get();
            var apiKey = app.get_apiKey();
            permissionHash[apiKey] = {};
            return {
                getUser: function getUser() {
                    var user = app.get_user();
                    if ($rootScope.user === undefined && user.user !== undefined) {
                        $rootScope.user = user.user;
                    }
                    return user.user;
                },
                setUser: function setUser(user) {
                    if (user) {
                        app.set_user(user);
                        user.isAuthenticated = true;
                        $rootScope.user = user;
                    } else {
                        app.set_user(null);
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
                    return app.get_accessToken();
                },
                updateAccessToken: function updateAccessToken(token) {
                    return app.update_accessToken(token);
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
                        var tokens = authorization.split(".");
                        if (tokens.length > 0) {
                            var section = tokens[0];

                            var sectionPermissions = user.permissions[section];
                            if (sectionPermissions) {
                                if (tokens.length > 1) {
                                    var action = tokens[1].toLowerCase();
                                    for (var i = 0; i < sectionPermissions.length; i++) {
                                        if (sectionPermissions[i].toLowerCase() == action) {
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
    (function (angular, module, undefined) {
        "use strict";
        module.service("baasicPermissionsRouteService", ["baasicUriTemplateService", function (uriTemplateService) {
            return {
                find: function (section) {
                    return uriTemplateService.parse("permissions/sections/{section}/{?searchQuery,sort}");
                },
                getActions: uriTemplateService.parse("permissions/actions/{?searchQuery,sort}"),
                getRoles: uriTemplateService.parse("roles/{?searchQuery,page,rpp,sort}"),
                getUsers: uriTemplateService.parse("users/{?searchQuery,page,rpp,sort}"),
                create: uriTemplateService.parse("permissions/"),
                parse: uriTemplateService.parse
            };
        }]);
    }(angular, module));
    (function (angular, module, undefined) {
        "use strict";
        module.service("baasicPermissionsService", ["$q", "$filter", "baasicApiHttp", "baasicApiService", "baasicConstants", "baasicPermissionsRouteService", "baasicAuthorizationService", function ($q, $filter, baasicApiHttp, baasicApiService, baasicConstants, permissionsRouteService, authService) {
            var _orderBy = $filter('orderBy');
            var _filter = $filter('filter');

            function isEmpty(data) {
                return data === undefined || data === null || data === '';
            }

            function getRoles(options) {
                return baasicApiHttp.get(permissionsRouteService.getRoles.expand(baasicApiService.findParams(options)));
            }

            function getUsers(options) {
                return baasicApiHttp.get(permissionsRouteService.getUsers.expand(baasicApiService.findParams(options)));
            }

            function firstCharToLowerCase(text) {
                return text.replace(/^./, function (char) {
                    return char.toLowerCase();
                });
            }

            return {
                routeService: permissionsRouteService,
                find: function (section, options) {
                    var params = angular.extend({}, options);
                    params.section = section;
                    return baasicApiHttp.get(permissionsRouteService.find().expand(baasicApiService.findParams(params)));
                },
                getActions: function (options) {
                    return baasicApiHttp.get(permissionsRouteService.getActions.expand(baasicApiService.findParams(options)));
                },
                getPermissionSubjects: function (options) {
                    var membershipCollection = [];
                    var resolvedTasks = 0;
                    var deferred = $q.defer();

                    function ensureTaskCount() {
                        resolvedTasks++;
                        if (resolvedTasks == 2) {
                            deferred.resolve(membershipCollection);
                            resolvedTasks = 0;
                        }
                    }

                    var userTask = getUsers(options).success(function (collection) {
                        angular.forEach(collection.item, function (item) {
                            var membershipItem = {
                                name: item.userName,
                                role: ''
                            };
                            angular.extend(membershipItem, item);
                            membershipCollection.push(membershipItem);
                        });
                        ensureTaskCount();
                    }).error(function (data, status, headers, config) {
                        if (status !== undefined && status !== 403) {
                            deferred.reject({
                                data: data,
                                status: status,
                                headers: headers,
                                config: config
                            });
                        }
                        ensureTaskCount();
                    });

                    var roleTask = getRoles(options).success(function (collection) {
                        angular.forEach(collection.item, function (item) {
                            var membershipItem = {
                                name: item.name,
                                roleName: item.name,
                                userName: ''
                            };
                            angular.extend(membershipItem, item);
                            membershipCollection.push(membershipItem);
                        });
                        ensureTaskCount();
                    }).error(function (data, status, headers, config) {
                        if (status !== undefined && status !== 403) {
                            deferred.reject({
                                data: data,
                                status: status,
                                headers: headers,
                                config: config
                            });
                        }
                        ensureTaskCount();
                    });

                    return deferred.promise.then(function () {
                        return _orderBy(membershipCollection, 'name');
                    });
                },
                create: function (data) {
                    return baasicApiHttp.post(permissionsRouteService.create.expand(), baasicApiService.createParams(data)[baasicConstants.modelPropertyName]);
                },
                remove: function (data) {
                    var params = baasicApiService.removeParams(data);
                    var action = data.actions[0];
                    var operation = !isEmpty(data.role) ? 'Role' : 'User';
                    return baasicApiHttp.delete(params[baasicConstants.modelPropertyName].links('delete' + action.abrv + operation).href);
                },
                preparePermissions: function (queryUtility, actionCollection, permissionCollection, selectedPermissions) {
                    var that = this;
                    //Apply search parameters to the selected items & create new mixed collection
                    var newPermissionCollection = angular.copy(_filter(selectedPermissions, function (item) {
                        if (!isEmpty(queryUtility.pagingInfo.search)) {
                            return item.name.indexOf(queryUtility.pagingInfo.search) > -1;
                        }
                        return true;
                    }));
                    angular.forEach(permissionCollection, function (permission) {
                        angular.forEach(actionCollection, function (lookupAction) {
                            //Add missing actions to the permission
                            var items = _filter(permission.actions, function (action) {
                                return action.abrv === lookupAction.abrv;
                            });
                            if (items.length === 0) {
                                var newAction = {
                                    checked: false
                                };
                                angular.extend(newAction, lookupAction);
                                permission.actions.push(newAction);
                            } else {
                                angular.forEach(items, function (item) {
                                    item.checked = true;
                                });
                            }
                        });
                        permission.actions = _orderBy(permission.actions, 'name');
                        //Push existing permission to mixed collection and fix the HAL links for selected permissions
                        var newPermission = that.findPermission(permission, newPermissionCollection);
                        if (newPermission === undefined) {
                            newPermissionCollection.push(permission);
                        } else {
                            angular.extend(newPermission, permission);
                        }
                    });
                    return newPermissionCollection;
                },
                createPermission: function (section, actionCollection, membershipItem) {
                    var permission = {
                        dirty: true,
                        role: membershipItem.roleName,
                        userName: membershipItem.userName,
                        section: section,
                        actions: []
                    };
                    angular.forEach(actionCollection, function (lookupAction) {
                        var newAction = {
                            checked: false
                        };
                        angular.extend(newAction, lookupAction);
                        permission.actions.push(newAction);
                    });
                    return permission;
                },
                findPermission: function (permission, permissionCollection) {
                    for (var i = 0; i < permissionCollection.length; i++) {
                        var item = permissionCollection[i];

                        if (item.section === permission.section && ((!isEmpty(item.role) && !isEmpty(permission.role) && item.role === permission.role) || (!isEmpty(item.userName) && !isEmpty(permission.userName) && item.userName === permission.userName))) {
                            return item;
                        }
                    }
                    return undefined;
                },
                exists: function (permission, permissionCollection) {
                    return !(this.findPermission(permission, permissionCollection) === undefined);
                },
                togglePermission: function (permission, action) {
                    var requestPermission = {};
                    angular.extend(requestPermission, permission);
                    requestPermission.actions = [action];

                    var operation;
                    if (!action.checked) {
                        operation = this.remove;
                    } else {
                        operation = this.create;
                    }
                    return operation(requestPermission);
                },
                getModulePermissions: function (section) {
                    var permission = {
                        update: authService.hasPermission(firstCharToLowerCase(section) + ".update"),
                        create: authService.hasPermission(firstCharToLowerCase(section) + ".create"),
                        remove: authService.hasPermission(firstCharToLowerCase(section) + ".delete"),
                        read: authService.hasPermission(firstCharToLowerCase(section) + ".read"),
                        full: authService.hasPermission(firstCharToLowerCase(section) + ".full")
                    };
                    return permission;
                }
            };
        }]);
    }(angular, module));
    (function (angular, module, undefined) {
        "use strict";
        module.service("baasicRecaptchaService", ["recaptchaKey", function (recaptchaKey) {
            return {
                create: function (elem, options) {
                    var id = elem.attr("id");
                    if (!id) {
                        id = "recaptcha-" + Math.random() * 10000;
                        elem.attr("id", id);
                    }
                    Recaptcha.create(recaptchaKey, id, options);
                },
                challenge: function () {
                    return Recaptcha.get_challenge();
                },
                response: function () {
                    return Recaptcha.get_response();
                },
                reload: function () {
                    Recaptcha.reload();
                },
                destroy: function () {
                    Recaptcha.destroy();
                }
            };
        }]);
    }(angular, module));
})(angular);