(function (angular, undefined) {
    var module = angular.module("baasic.baasicSecurity", ["baasic.baasicApi"]);

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
                        var token = user.accessToken;
                        delete user.accessToken;

                        app.set_user(user, token);
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
                    if (!user.accessToken) {
                        user.accessToken = this.getAccessToken();
                    }

                    var currentUser = this.getUser();
                    angular.extend(currentUser, user);

                    this.setUser(currentUser);
                },
                getAccessToken: function getAccessToken() {
                    return app.get_accessToken();
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
                    return uriTemplateService.parse("permissions/section/" + section + "/{?searchQuery,sort}");
                },
                get: function (section) {
                    return uriTemplateService.parse("permissions/section/" + section + "/{id}");
                },
                getActions: uriTemplateService.parse("permissions/actions/{?searchQuery,sort}"),
                getRoles: uriTemplateService.parse("role/{?searchQuery,page,rpp,sort}"),
                getUsers: uriTemplateService.parse("user/{?searchQuery,page,rpp,sort}"),
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

            function getRoles(data) {
                return baasicApiHttp.get(permissionsRouteService.getRoles.expand(baasicApiService.findParams(data)));
            }

            function getUsers(data) {
                return baasicApiHttp.get(permissionsRouteService.getUsers.expand(baasicApiService.findParams(data)));
            }

            function firstCharToLowerCase(text) {
                return text.replace(/^./, function (char) {
                    return char.toLowerCase();
                });
            }

            return {
                routeService: permissionsRouteService,
                find: function (section, data) {
                    return baasicApiHttp.get(permissionsRouteService.find(section).expand(baasicApiService.findParams(data)));
                },
                get: function (section, data) {
                    return baasicApiHttp.get(permissionsRouteService.get(section).expand(baasicApiService.getParams(data)));
                },
                getActions: function (data) {
                    return baasicApiHttp.get(permissionsRouteService.getActions.expand(baasicApiService.findParams(data)));
                },
                getPermissionSubjects: function (data) {
                    var membershipCollection = [];

                    var userTask = getUsers(data).success(function (collection) {
                        angular.forEach(collection.item, function (item) {
                            var membershipItem = {
                                name: item.username,
                                role: ''
                            };
                            angular.extend(membershipItem, item);
                            membershipCollection.push(membershipItem);
                        });
                    });

                    var roleTask = getRoles(data).success(function (collection) {
                        angular.forEach(collection.item, function (item) {
                            var membershipItem = {
                                name: item.name,
                                roleName: item.name,
                                username: ''
                            };
                            angular.extend(membershipItem, item);
                            membershipCollection.push(membershipItem);
                        });
                    });

                    return $q.all([userTask, roleTask]).then(function () {
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
                        username: membershipItem.userName,
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

                        if (item.section === permission.section && ((!isEmpty(item.role) && !isEmpty(permission.role) && item.role === permission.role) || (!isEmpty(item.username) && !isEmpty(permission.username) && item.username === permission.username))) {
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
                        read: authService.hasPermission(firstCharToLowerCase(section) + ".read")
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