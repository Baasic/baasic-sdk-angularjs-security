(function (angular, undefined) { /* exported module */
    /** 
     * @description The angular.module is a global place for creating, registering or retrieving modules. All modules should be registered in an application using this mechanism. An angular module is a container for the different parts of your app - services, directives etc. In order to use `baasic.security` module functionality it must be added as a dependency to your app.
     * @copyright (c) 2015 Mono-Software
     * @license MIT
     * @author Mono-Software
     * @module baasic.security 
     * @example
     (function (Main) {
     "use strict";
     var dependencies = [
     "baasic.api",
     "baasic.membership",
     "baasic.security",
     "baasic.appSettings",
     "baasic.article",
     "baasic.dynamicResource",
     "baasic.keyValue",
     "baasic.valueSet"
     ];
     Main.module = angular.module("myApp.Main", dependencies);
     }
     (MyApp.Modules.Main = {})); 
     */

    var module = angular.module('baasic.security', ['baasic.api']);

    /* globals module */
    /** 
     * @description At a high level, directives are markers on a DOM element (such as an attribute, element name, comment or CSS class) that tell AngularJS's HTML compiler to attach a specified behavior to that DOM element or even transform the DOM element and its children. For more information please visit official AngularJS [documentation](https://docs.angularjs.org/guide/directive). `baasicRecaptcha` directive allows you to use the reCaptcha inside your project.
     * @copyright (c) 2015 Mono-Software
     * @license MIT
     * @author Mono-Software
     * @module baasicRecaptcha
     * @example <div baasic-recaptcha></div> 
     */
    (function (angular, module, undefined) {
        'use strict';
        module.directive('baasicRecaptcha', ['baasicRecaptchaService', function (recaptchaService) {
            return {
                restrict: 'A',
                link: function (scope, elem) {
                    recaptchaService.create(elem, {
                        theme: 'clean'
                    });

                    scope.$on('$destroy', function () {
                        if (recaptchaService) {
                            recaptchaService.destroy();
                        }
                    });
                }
            };
        }]);
    }(angular, module)); /* globals module */
    /**
     * @module baasicAuthorizationService
     * @description Baasic Authorization Service provides an easy way to consume Baasic application authorization features.
     * @copyright (c) 2015 Mono-Software
     * @license MIT
     * @author Mono-Software
     */
    (function (angular, module, undefined) {
        'use strict';
        var permissionHash = {};
        module.service('baasicAuthorizationService', ['$rootScope', 'baasicApp', function ($rootScope, baasicApp) {
            var app = baasicApp.get();
            var apiKey = app.getApiKey();
            permissionHash[apiKey] = {};
            return {
                /**
                 * Returns the currently logged in user.
                 * @method        
                 * @example baasicAuthorizationService.getUser();
                 **/
                getUser: function getUser() {
                    var user = app.getUser();
                    if ($rootScope.user === undefined && user.user !== undefined) {
                        $rootScope.user = user.user;
                    }
                    return user.user;
                },
                /**
                 * Sets the current user information. If no user information is provided, the user information is cleared from the storage and rootScope.
                 * @method        
                 * @example baasicAuthorizationService.setUser(null);
                 **/
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
                /**
                 * Updates current user information with new data.
                 * @method        
                 * @example
                 baasicLoginService.loadUserData()
                 .success(function (data) {
                 // Update user information with refreshed data
                 baasicAuthorizationService.updateUser(data);
                 })
                 .error(function (data) {})
                 .finally (function () {});
                 **/
                updateUser: function updateUser(user) {
                    var currentUser = this.getUser();
                    if (currentUser) {
                        angular.extend(currentUser, user);
                    } else {
                        currentUser = user;
                    }

                    this.setUser(currentUser);
                },
                /**
                 * Retrives current user's access token.
                 * @method        
                 * @example baasicAuthorizationService.getAccessToken();
                 **/
                getAccessToken: function getAccessToken() {
                    return app.getAccessToken();
                },
                /**
                 * Stores access token information.
                 * @method        
                 * @example
                 baasicLoginService.login({
                 userName : "userName"
                 password : "password"
                 options : ['session', 'sliding']
                 })
                 .success(function (data) {
                 // Store token information
                 baasicAuthorizationService.updateAccessToken(data);
                 })
                 .error(function (data, status) {})
                 .finally (function () {});
                 **/
                updateAccessToken: function updateAccessToken(token) {
                    return app.updateAccessToken(token);
                },
                /**
                 * Retrives user permission hash. This action should be performed when user information is updated.
                 * @method        
                 * @example
                 baasicLoginService.loadUserData()
                 .success(function (data) {
                 baasicAuthorizationService.resetPermissions();
                 baasicAuthorizationService.updateUser(data);
                 })
                 .error(function (data) {})
                 .finally (function () {});
                 **/
                resetPermissions: function () {
                    permissionHash[apiKey] = {};
                },
                /**
                 * Checks if current user has permissions to perform a certain action. To optimize performance this information is cached and can be reset using the resetPermissions action. Permissions cache should be reset when updated user information is set.
                 * @method        
                 * @example
                 baasicLoginService.loadUserData()
                 .success(function (data) {
                 baasicAuthorizationService.resetPermissions();
                 baasicAuthorizationService.updateUser(data);
                 })
                 .error(function (data) {})
                 .finally (function () {});
                 **/
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
    }(angular, module)); /* globals module */
    /**
     * @module baasicPermissionsRouteService
     * @description Baasic Permissions Route Service provides Baasic route templates which can then be expanded to Baasic REST URI's through the [URI Template](https://github.com/Baasic/uritemplate-js) by providing it with an object that contains URI parameters. `baasicPermissionsService` uses `baasicPermissionsRouteService` to obtain a part of needed routes while the other part is obtained through HAL. Route services by convention use the same function names as their corresponding services.
     * @copyright (c) 2015 Mono-Software
     * @license MIT
     * @author Mono-Software
     */
    (function (angular, module, undefined) {
        'use strict';
        module.service('baasicPermissionsRouteService', ['baasicUriTemplateService', function (uriTemplateService) {
            return {
                /**
                 * Parses find route which can be expanded with additional options. Supported items are: 
                 * - `section` - Name of the permission section.
                 * - `searchQuery` - A string referencing resource properties using the phrase or query search.   
                 * - `sort` - A string used to set the role property to sort the result collection by.				
                 * @method        
                 * @example baasicPermissionsRouteService.find("sectionName").expand({searchQuery: "searchTerm"});               
                 **/
                find: function (section) {
                    return uriTemplateService.parse('permissions/sections/{section}/{?searchQuery,sort}', section);
                },
                /**
                 * Parses getActions route which can be expanded with additional options. Supported items are: 
                 * - `searchQuery` - A string referencing resource properties using the phrase or query search.   
                 * - `sort` - A string used to set the role property to sort the result collection by.				
                 * @method        
                 * @example baasicPermissionsRouteService.getActions.expand({searchQuery: "searchTerm"});               
                 **/
                getActions: uriTemplateService.parse('permissions/actions/{?searchQuery,sort}'),
                /**
                 * Parses getRoles route which can be expanded with additional options. Supported items are: 
                 * - `searchQuery` - A string referencing resource properties using the phrase or query search.   
                 * - `sort` - A string used to set the role property to sort the result collection by.	
                 * - `page` - A value used to set the page size, i.e. to retrieve certain resource subset from the storage.
                 * - `rpp` - A value used to limit the size of result set per page.				
                 * @method        
                 * @example baasicPermissionsRouteService.getRoles.expand({searchQuery: "searchTerm"});               
                 **/
                getRoles: uriTemplateService.parse('roles/{?searchQuery,page,rpp,sort}'),
                /**
                 * Parses getUsers route which can be expanded with additional options. Supported items are: 
                 * - `searchQuery` - A string referencing resource properties using the phrase or query search.   
                 * - `sort` - A string used to set the role property to sort the result collection by.	
                 * - `page` - A value used to set the page size, i.e. to retrieve certain resource subset from the storage.
                 * - `rpp` - A value used to limit the size of result set per page.				
                 * @method        
                 * @example baasicPermissionsRouteService.getRoles.expand({searchQuery: "searchTerm"});               
                 **/
                getUsers: uriTemplateService.parse('users/{?searchQuery,page,rpp,sort}'),
                /**
                 * Parses create permission route; this URI template doesn't expose any additional properties.
                 * @method        
                 * @example baasicPermissionsRouteService.create.expand({});               
                 **/
                create: uriTemplateService.parse('permissions/'),
                /**
                 * Parses and expands URI templates based on [RFC6570](http://tools.ietf.org/html/rfc6570) specifications. For more information please visit the project [GitHub](https://github.com/Baasic/uritemplate-js) page.
                 * @method tags.parse
                 * @example baasicPermissionsRouteService.parse("route/{?embed,fields,options}").expand({embed: "embeddedResource"});
                 **/
                parse: uriTemplateService.parse
            };
        }]);
    }(angular, module)); /* globals module */
    /**
     * @module baasicPermissionsService
     * @description Baasic Permissions Service provides an easy way to consume Baasic application permissions features.
     * @copyright (c) 2015 Mono-Software
     * @license MIT
     * @author Mono-Software
     */
    (function (angular, module, undefined) {
        'use strict';
        module.service('baasicPermissionsService', ['$q', '$filter', 'baasicApiHttp', 'baasicApiService', 'baasicConstants', 'baasicPermissionsRouteService', 'baasicAuthorizationService', function ($q, $filter, baasicApiHttp, baasicApiService, baasicConstants, permissionsRouteService, authService) {
            var _orderBy = $filter('orderBy');

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
                /**
                 * Returns a promise that is resolved once the find action has been performed. Success response returns a list of access policies that match the specified search paramteres.
                 * @method        
                 * @example 
                 baasicPermissionsService.find("sectionName", {
                 search : "searchTerm"
                 })
                 .success(function (collection) {
                 // perform success action here
                 })
                 .error(function (response, status, headers, config) {
                 // perform error handling here
                 });
                 **/
                find: function (section, options) {
                    var params = angular.extend({}, options);
                    params.section = section;
                    return baasicApiHttp.get(permissionsRouteService.find().expand(baasicApiService.findParams(params)));
                },
                /**
                 * Returns a promise that is resolved once the getActions action has been performed. Success response returns a list of access policies that match the specified search paramteres.
                 * @method        
                 * @example 
                 baasicPermissionsService.find({
                 pageNumber : 1,
                 pageSize : 10,
                 orderBy : "publishDate",
                 orderDirection : "desc",
                 search : "searchTerm"
                 })
                 .success(function (collection) {
                 // perform success action here
                 })
                 .error(function (response, status, headers, config) {
                 // perform error handling here
                 });
                 **/
                getActions: function (options) {
                    return baasicApiHttp.get(permissionsRouteService.getActions.expand(baasicApiService.findParams(options)));
                },
                /**
                 * Returns a promise that is resolved once the getPermissionSubjects action has been performed. Success response returns a list of matching user and role resources.
                 * @method        
                 * @example 
                 baasicPermissionsService.getPermissionSubjects({
                 orderBy : 'name',
                 orderDirection : 'asc',
                 search : 'searchTerm'
                 })
                 .success(function (collection) {
                 // perform success action here
                 })
                 .error(function (response, status, headers, config) {
                 // perform error handling here
                 });
                 **/
                getPermissionSubjects: function (options) {
                    var membershipCollection = [];
                    var resolvedTasks = 0;
                    var deferred = $q.defer();

                    function ensureTaskCount() {
                        resolvedTasks++;
                        if (resolvedTasks === 2) {
                            deferred.resolve(membershipCollection);
                            resolvedTasks = 0;
                        }
                    }

                    getUsers(options).success(function (collection) {
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

                    getRoles(options).success(function (collection) {
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
                /**
                 * Returns a promise that is resolved once the create action has been performed.
                 * @method        
                 * @example 
                 // readAction and updateActions are resources previously fetched using getActions.
                 baasicPermissionsService.create({
                 actions : [readAction, updateAction],
                 section : "Users",
                 userName : "userName"
                 })
                 .success(function (data) {
                 // perform success action here
                 })
                 .error(function (response, status, headers, config) {
                 // perform error handling here
                 });
                 **/
                create: function (data) {
                    return baasicApiHttp.post(permissionsRouteService.create.expand(), baasicApiService.createParams(data)[baasicConstants.modelPropertyName]);
                },
                /**
                 * Returns a promise that is resolved once the remove action has been performed. If the action is successfully completed an access policy assigned to the specified role and section will be removed.
                 * @method        
                 * @example 
                 // Existing resource is a resource previously fetched using get action.
                 baasicPermissionsService.remove(existingResource)
                 .success(function (data) {
                 // perform success action here
                 })
                 .error(function (response, status, headers, config) {
                 // perform error handling here
                 });
                 **/
                remove: function (data) {
                    var params = baasicApiService.removeParams(data);
                    var action = data.actions[0];
                    var operation = !isEmpty(data.role) ? 'Role' : 'User';
                    return baasicApiHttp.delete(params[baasicConstants.modelPropertyName].links('delete' + action.abrv + operation).href);
                },
                /**
                 * Creates a new in-memory permission object.
                 * @method        
                 * @example 
                 // action collection are lookup items fetched using baasicLookupService.get action.
                 var actionCollection;
                 return baasicLookupService.get()
                 .success(function (data) {
                 actionCollection = data;
                 })
                 .error(function (data, status, headers, config) {});
                 // subjectItem is an item fetched using baasicPermissionsService.getPermissionSubjects action.
                 baasicPermissionsService.createPermission("sectionName", actionCollection, subjectItem);
                 **/
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
                /**
                 * Finds a permission in a given permission collection.
                 * @method        
                 * @example baasicPermissionsService.findPermission(permissionObj, permissionCollection);
                 **/
                findPermission: function (permission, permissionCollection) {
                    for (var i = 0; i < permissionCollection.length; i++) {
                        var item = permissionCollection[i];

                        if (item.section === permission.section && ((!isEmpty(item.role) && !isEmpty(permission.role) && item.role === permission.role) || (!isEmpty(item.userName) && !isEmpty(permission.userName) && item.userName === permission.userName))) {
                            return item;
                        }
                    }
                    return undefined;
                },
                /**
                 * Checks if a permission object exists in a given permission collection.
                 * @method        
                 * @example baasicPermissionsService.exists(permissionObj, permissionCollection);
                 **/
                exists: function (permission, permissionCollection) {
                    return this.findPermission(permission, permissionCollection) !== undefined;
                },
                /**
                 * Returns a promise that is resolved once the togglePermission action has been completed. The action will internally either call a remove or create action based on given criteria.
                 * @method        
                 * @example baasicPermissionsService.togglePermission(permissionObj, action);
                 **/
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
                /**
                 * Fetches and returns and object containing all existing module permissions.
                 * @method        
                 * @example baasicPermissionsService.getModulePermissions("sectionName");
                 **/
                getModulePermissions: function (section) {
                    var permission = {
                        update: authService.hasPermission(firstCharToLowerCase(section) + '.update'),
                        create: authService.hasPermission(firstCharToLowerCase(section) + '.create'),
                        remove: authService.hasPermission(firstCharToLowerCase(section) + '.delete'),
                        read: authService.hasPermission(firstCharToLowerCase(section) + '.read'),
                        full: authService.hasPermission(firstCharToLowerCase(section) + '.full')
                    };
                    return permission;
                }
            };
        }]);
    }(angular, module)); /* globals module, Recaptcha */
    /**
     * @module baasicRecaptchaService
     * @description `baasicRecaptchaService` provides an easy way to consume ReCapctcha features.
     * @copyright (c) 2015 Mono-Software
     * @license MIT
     * @author Mono-Software
     */
    (function (angular, module, undefined) {
        'use strict';
        module.service('baasicRecaptchaService', ['recaptchaKey', function (recaptchaKey) {
            return {
                /**
                 * Creates a new reCaptcha instance.
                 * @method        
                 * @example baasicRecaptchaService.create(element, {theme: 'clean'});
                 **/
                create: function (elem, options) {
                    var id = elem.attr('id');
                    if (!id) {
                        id = 'recaptcha-' + Math.random() * 10000;
                        elem.attr('id', id);
                    }
                    Recaptcha.create(recaptchaKey, id, options);
                },
                /**
                 * Returns a new reCaptcha challenge.
                 * @method        
                 * @example baasicRecaptchaService.challenge();
                 **/
                challenge: function () { /* jshint camelcase: false */
                    return Recaptcha.get_challenge();
                },
                /**
                 * Returns a user response.
                 * @method        
                 * @example baasicRecaptchaService.response();
                 **/
                response: function () { /* jshint camelcase: false */
                    return Recaptcha.get_response();
                },
                /**
                 * Reloads reCaptcha challenge.
                 * @method        
                 * @example baasicRecaptchaService.reload();
                 **/
                reload: function () {
                    Recaptcha.reload();
                },
                /**
                 * Destroys reCaptcha instance.
                 * @method        
                 * @example baasicRecaptchaService.destroy();
                 **/
                destroy: function () {
                    Recaptcha.destroy();
                }
            };
        }]);
    }(angular, module));
})(angular);