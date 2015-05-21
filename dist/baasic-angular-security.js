(function (angular, undefined) { /* exported module */
    /** 
     * @description The angular.module is a global place for creating, registering or retrieving modules. All modules should be registered in an application using this mechanism. An angular module is a container for the different parts of your app - services, directives etc. In order to use `baasic.security` module functionality it must be added as a dependency to your app.
     * @copyright (c) 2015 Mono
     * @license MIT
     * @author Mono
     * @module baasic.security 
     * @example
     (function (Main) {
     'use strict';
     var dependencies = [
     'baasic.api',
     'baasic.membership',
     'baasic.security',
     'baasic.appSettings',
     'baasic.article',
     'baasic.dynamicResource',
     'baasic.keyValue',
     'baasic.valueSet'
     ];
     Main.module = angular.module('myApp.Main', dependencies);
     }
     (MyApp.Modules.Main = {})); 
     */

    var module = angular.module('baasic.security', ['baasic.api']);

    /* globals module */
    /** 
     * @description `baasicRecaptcha` directive allows you to use the reCaptcha inside your project.
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
    }(angular, module));
    /**
     * @copyright (c) 2015 Mono
     * @license MIT
     * @author Mono
     * @overview 
     ***Notes:**
     - To enable reCaptcha, you need to [register for an API key pair](https://www.google.com/recaptcha/admin#list) and configure your Baasic application using the obtained Public and Private Key. Intended module should be assigned to `recaptchaKey` constant which is predefined with Public Key value, while Private Key should be set-up through Application Dashboard under the Application Settings section.
     */


    /* globals module */
    /**
     * @module baasicAuthorizationService
     * @description Baasic Authorization Service provides an easy way to consume Baasic Application Authorization REST API end-points.
     * @copyright (c) 2015 Mono
     * @license MIT
     * @author Mono
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
                 * Gets the currently logged in user.
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
                 * Sets the current user information. If no user information is provided, the user information will be cleared from the storage and rootScope.
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
                 username : '<username>',
                 password : '<password>',
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
    }(angular, module));


    /* globals module */
    /**
     * @module baasicPermissionsRouteService
     * @description Baasic Permissions Route Service provides Baasic route templates which can be expanded to Baasic REST URIs. Various services can use Baasic Permissions Route Service to obtain a needed routes while other routes will be obtained through HAL. By convention, all route services use the same function names as their corresponding services.
     */
    (function (angular, module, undefined) {
        'use strict';
        module.service('baasicPermissionsRouteService', ['baasicUriTemplateService', function (uriTemplateService) {
            return {
                /**
                 * Parses find route which can be expanded with additional options. Supported items are: 
                 * - `section` - Section abbreviation which identifies part of the application for which security privileges can be retrieved and managed.
                 * - `searchQuery` - A string value used to identify access policy resources using the phrase search. 
                 * - `sort` - A string used to set the access policy property to sort the result collection by.				
                 * @method        
                 * @example 
                 baasicPermissionsRouteService.find(
                 'sectionName'
                 ).expand(
                 {searchQuery: '<search-phrase>'}
                 );
                 **/
                find: function (section) {
                    return uriTemplateService.parse('permissions/sections/{section}/{?searchQuery,sort}', section);
                },
                /**
                 * Parses getActions route which can be expanded with additional options. Supported items are: 
                 * - `searchQuery` - A string value used to identify access action resources using the phrase search.  
                 * - `sort` - A string used to set the access action property to sort the result collection by.				
                 * @method        
                 * @example 
                 baasicPermissionsRouteService.getActions.expand(
                 {searchQuery: '<search-phrase>'}
                 );
                 **/
                getActions: uriTemplateService.parse('permissions/actions/{?searchQuery,sort}'),
                /**
                 * Parses getRoles route which can be expanded with additional options. Supported items are: 
                 * - `searchQuery` - A string value used to identify access policy resources using the phrase search.   
                 * - `sort` - A string used to set the access policy property to sort the result collection by.	
                 * - `page` - A value used to set the page number, i.e. to retrieve certain access policy subset from the storage.
                 * - `rpp` - A value used to limit the size of result set per page.				
                 * @method        
                 * @example 
                 baasicPermissionsRouteService.getRoles.expand(
                 {searchQuery: '<search-phrase>'}
                 );
                 **/
                getRoles: uriTemplateService.parse('roles/{?searchQuery,page,rpp,sort}'),
                /**
                 * Parses getUsers route which can be expanded with additional options. Supported items are: 
                 * - `searchQuery` - A string value used to identify access policy resources using the phrase search.     
                 * - `sort` - A string used to set the access policy property to sort the result collection by.	
                 * - `page` - A value used to set the page number, i.e. to retrieve certain access policy subset from the storage.
                 * - `rpp` - A value used to limit the size of result set per page.				
                 * @method        
                 * @example 
                 baasicPermissionsRouteService.getRoles.expand(
                 {searchQuery: '<search-phrase>'}
                 );
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
                 * @example 
                 baasicPermissionsRouteService.parse(
                 '<route>/{?embed,fields,options}'
                 ).expand(
                 {embed: '<embedded-resource>'}
                 );
                 **/
                parse: uriTemplateService.parse
            };
        }]);
    }(angular, module));
    /**
     * @copyright (c) 2015 Mono
     * @license MIT
     * @author Mono
     * @overview 
     ***Notes:**
     - Refer to the [REST API documentation](https://github.com/Baasic/baasic-rest-api/wiki) for detailed information about available Baasic REST API end-points.
     - [URI Template](https://github.com/Baasic/uritemplate-js) syntax enables expanding the Baasic route templates to Baasic REST URIs providing it with an object that contains URI parameters.
     - All end-point objects are transformed by the associated route service.
     */
    /* globals module */
    /**
     * @module baasicPermissionsService
     * @description Baasic Permissions Service provides an easy way to consume Baasic Application Permissions REST API end-points. In order to obtain a needed routes `baasicPermissionsService` uses `baasicPermissionsRouteService`.
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
                /**
                 * Returns a promise that is resolved once the find action has been performed. Success response returns a list of access policies that match the specified search parameters.
                 * @method        
                 * @example 
                 baasicPermissionsService.find('<section-name>', {
                 search : '<search-phrase>'
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
                 * Returns a promise that is resolved once the getActions action has been performed. Success response returns a list of access policies that match the specified search parameters.
                 * @method        
                 * @example 
                 baasicPermissionsService.find({
                 pageNumber : 1,
                 pageSize : 10,
                 orderBy : '<field>',
                 orderDirection : '<asc|desc>',
                 search : '<search-phrase>'
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
                 orderBy : '<field>',
                 orderDirection : '<asc|desc>',
                 search : '<search-phrase>'
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
                                name: item.username,
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
                                username: ''
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
                 * Returns a promise that is resolved once the create action has been performed; this action creates a new permission resource.
                 * @method        
                 * @example 
                 // readAction and updateActions are resources previously fetched using getActions.
                 baasicPermissionsService.create({
                 actions : [readAction, updateAction],
                 section : '<section-name>',
                 username : '<username>'
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
                 * Returns a promise that is resolved once the remove action has been performed. If the action is successfully complete, an access policy assigned to the specified role and section will be removed. This route uses HAL enabled objects to obtain routes and therefore it doesn't apply `baasicPermissionsService` route template. Here is an example of how a route can be obtained from HAL enabled objects:
                 ```
                 var params = baasicApiService.removeParams(permission);
                 var uri = params['model'].links('delete').href;
                 ```
                 * @method        
                 * @example 
                 // permission is a resource previously fetched using get action.
                 baasicPermissionsService.remove(permission)
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
                 baasicPermissionsService.createPermission('<section-Name>', actionCollection, subjectItem);
                 **/
                createPermission: function (section, actionCollection, membershipItem) {
                    var permission = {
                        dirty: true,
                        role: membershipItem.roleName,
                        username: membershipItem.username,
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

                        if (item.section === permission.section && ((!isEmpty(item.role) && !isEmpty(permission.role) && item.role === permission.role) || (!isEmpty(item.username) && !isEmpty(permission.username) && item.username === permission.username))) {
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
                 * Returns a promise that is resolved once the togglePermission action has been completed. The action will internally either call a `remove` or `create` action based on given criteria.
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
                 * @example baasicPermissionsService.getModulePermissions('<section-name>');
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
                },
                /**
                 * Provides direct access to `baasicPermissionsRouteService`.
                 * @method        
                 * @example baasicPermissionsService.routeService.get.expand(expandObject);
                 **/
                routeService: permissionsRouteService
            };
        }]);
    }(angular, module));
    /**
     * @copyright (c) 2015 Mono
     * @license MIT
     * @author Mono
     * @overview 
     ***Notes:**
     - Refer to the [REST API documentation](https://github.com/Baasic/baasic-rest-api/wiki) for detailed information about available Baasic REST API end-points.
     - All end-point objects are transformed by the associated route service.
     */
    /* globals module, Recaptcha */
    /**
     * @module baasicRecaptchaService
     * @description `baasicRecaptchaService` provides an easy way to consume ReCapctcha REST API end-points. For more information please visit [reCaptcha documentation](https://code.google.com/p/recaptcha/wiki/HowToSetUpRecaptcha).
     * @copyright (c) 2015 Mono
     * @license MIT
     * @author Mono
     */
    (function (angular, module, undefined) {
        'use strict';
        module.service('baasicRecaptchaService', ['recaptchaKey', function (recaptchaKey) {
            return {
                /**
                 * Creates a new reCaptcha instance with provided options and injects a reCaptcha DOM onto a given element.
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
                 * Communicates with reCaptcha service and provides a reCaptcha challenge identifier.
                 * @method        
                 * @example baasicRecaptchaService.challenge();
                 **/
                challenge: function () { /* jshint camelcase: false */
                    return Recaptcha.get_challenge();
                },
                /**
                 * Communicates with reCaptcha service and returns users response to a reCaptcha challenge.
                 * @method        
                 * @example baasicRecaptchaService.response();
                 **/
                response: function () { /* jshint camelcase: false */
                    return Recaptcha.get_response();
                },
                /**
                 * Communicates with reCaptcha service and displays a new reCaptcha challenge.
                 * @method        
                 * @example baasicRecaptchaService.reload();
                 **/
                reload: function () {
                    Recaptcha.reload();
                },
                /**
                 * Communicates with reCaptcha service and unloads a reCaptcha instance.
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