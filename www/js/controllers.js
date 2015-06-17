angular.module('ionicParseApp.controllers', [])

.controller('AppController', function($scope, $state, $rootScope, $ionicHistory, $stateParams) {
    if ($stateParams.clear) {
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
    }

    $scope.logout = function() {
        Parse.User.logOut();
        $rootScope.user = null;
        $rootScope.isLoggedIn = false;
        $rootScope.imgURI = undefined;
        $state.go('welcome', {
            clear: true
        });
    };
})

.controller('WelcomeController', function($scope, $state, $rootScope, $ionicHistory, $stateParams) {
    if ($stateParams.clear) {
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
    }

    $scope.login = function() {
        $state.go('app.login');
    };

    $scope.signUp = function() {
        $state.go('app.register');
    };

    if ($rootScope.isLoggedIn) {
        $state.go('app.home');
    }
})

.controller('CreaterController', function($scope, $state, $rootScope, $cordovaCamera, $ionicHistory ) {
  $scope.imgURI = undefined;
  if ($rootScope.isLoggedIn) {
    $scope.takePicture = function() {
        var options = {
            quality : 75,
            destinationType : Camera.DestinationType.DATA_URL,
            sourceType : Camera.PictureSourceType.CAMERA,
            allowEdit : true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 300,
            targetHeight: 300,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };

        $cordovaCamera.getPicture(options).then(function(imageData) {
            $scope.imgURI = "data:image/jpeg;base64," + imageData;
            //do other stuff
        }, function(err) {
            // An error occured. Show a message to the user
        });
    }
    $scope.sendData = function(){
      var Picture = Parse.Object.extend("Picture");
      var picture = new Picture();
      picture.set("name", $scope.user.nameOfChain)
      picture.set("image64", $scope.imgURI)
      picture.set("chain", $scope.user.chainLength)
      picture.set("nextuser", $scope.user.usertosendto)
      picture.set("currentUser", Parse.User.current().get('username'))
      picture.save(null, {
        success: function(picture) {
          //execute succes
        },
        error: function(picture, error) {
          // Execute any logic that should take place if the save fails.
          // error is a Parse.Error with an error code and message.
        }
      });
      $scope.imgURI = undefined;
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $state.go('app.home', {
          clear: true
      });
    }
  }
})

.controller('FriendController', function($scope, $state, $rootScope, $ionicHistory){
  //http://timothywalters-devthoughts.blogspot.com/2014/06/friend-request-in-javascript-using.html <-- use this to help
  $scope.user = {};
  if ($rootScope.isLoggedIn) {
    var RequestStatus = {
      requested: 'requested',
      rejected: 'rejected',
      approved: 'approved'
    };

    var FriendRequest = Parse.Object.extend("FriendRequest");
    var friendRequest = new FriendRequest();
    var currentUser = Parse.User.current();
    var userQuery = new Parse.Query(Parse.User);

    $scope.sendInfo = function(){
      userQuery.equalTo("username", $scope.user.userSearched);
      userQuery.find({
          success: function (friend) {
            alert("Successfully retrieved " + friend.length + "people");
          },
          error: function (error) {
              //Show if no user was found to match


          }
      });
      /*friendRequest.set("username", currentUser)
      friendRequest.save(null, {
        success: function(friendRequest) {
          //execute succes
        },
        error: function(friendRequest, error) {
          // Execute any logic that should take place if the save fails.
          // error is a Parse.Error with an error code and message.
        }
      });*/
      $scope.imgURI = undefined;
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $state.go('app.home', {
          clear: true
      });
    }
  }
})

.controller('RequestController', function($scope, $state, $rootScope, $ionicHistory) {
  //http://timothywalters-devthoughts.blogspot.com/2014/06/friend-request-in-javascript-using.html <-- use this to help
  $scope.user = {};
  if ($rootScope.isLoggedIn) {
    var Picture = Parse.Object.extend("Picture");
    var userQuery = new Parse.Query(Picture);

    //$scope.sendData = function(){
      userQuery.equalTo("nextuser", Parse.User.current().get('username'));
      userQuery.find({
          success: function (friend) {
            $scope.pictureRecieveds = friend
            /*for(var i = 0; i<friend.length; i++){
              var object = friend[i];
              $scope.pictureRecieved = object.get('nextuser');
              //alert(object.id + ' - ' + object.get('nextuser'));
            }*/
          },
          error: function (error) {
              alert(error);
          }
      });
      $scope.doRefresh = function() {
        userQuery.equalTo("nextuser", Parse.User.current().get('username'));
        userQuery.find({
            success: function (friend) {
              $scope.pictureRecieveds = friend
              /*for(var i = 0; i<friend.length; i++){
                var object = friend[i];
                $scope.pictureRecieved = object.get('nextuser');
                //alert(object.id + ' - ' + object.get('nextuser'));
              }*/
              $scope.$broadcast('scroll.refreshComplete');
            },
            error: function (err) {
              //do something if error
            }
        });
      };
      /*$scope.doClick = function(){
        $state.go('app.view');
      }*/
      //$scope.imgURI = undefined;
      /*$ionicHistory.nextViewOptions({
        disableBack: true
      });
      $state.go('app.home', {
          clear: true
      });*/
    //}
  }
})

.controller('ViewController', function($scope, $state,$stateParams, $rootScope) {
  if ($rootScope.isLoggedIn){
    var Pic = Parse.Object.extend("Picture");
    var queryThatPic = new Parse.Query(Pic);
    queryThatPic.equalTo("objectId", $stateParams.viewid)
    queryThatPic.find({
        success: function (love) {
          //alert(friend.id)
          $scope.thingone = love;
          //alert(object.length)
          //alert(friend.id)
          //$scope.image = friend.get('image64')
        },
        error: function (error) {
            alert(error);
        }
    });
  }
})

.controller('HomeController', function($scope, $state, $rootScope) {

  if (!$rootScope.isLoggedIn) {
        $state.go('welcome');
    }
})

.controller('LoginController', function($scope, $state, $rootScope, $ionicLoading, $ionicHistory) {
    $scope.user = {
        username: null,
        password: null
    };

    $scope.error = {};

    $scope.login = function() {
        $scope.loading = $ionicLoading.show({
            content: 'Logging in',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });

        var user = $scope.user;
        Parse.User.logIn(('' + user.username).toLowerCase(), user.password, {
            success: function(user) {
                $ionicLoading.hide();
                $rootScope.user = user;
                $rootScope.isLoggedIn = true;
                $ionicHistory.nextViewOptions({
                  disableBack: true
                });
                $state.go('app.home', {
                    clear: true
                });

            },
            error: function(user, err) {
                $ionicLoading.hide();
                // The login failed. Check error to see why.
                if (err.code === 101) {
                    $scope.error.message = 'Invalid login credentials';
                } else {
                    $scope.error.message = 'An unexpected error has ' +
                        'occurred, please try again.';
                }
                $scope.$apply();
            }
        });
    };

    $scope.forgot = function() {
        $state.go('app.forgot');
    };
})

.controller('ForgotPasswordController', function($scope, $state, $ionicLoading) {
    $scope.user = {};
    $scope.error = {};
    $scope.state = {
        success: false
    };

    $scope.reset = function() {
        $scope.loading = $ionicLoading.show({
            content: 'Sending',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });

        Parse.User.requestPasswordReset($scope.user.email, {
            success: function() {
                // TODO: show success
                $ionicLoading.hide();
                $scope.state.success = true;
                $scope.$apply();
            },
            error: function(err) {
                $ionicLoading.hide();
                if (err.code === 125) {
                    $scope.error.message = 'Email address does not exist';
                } else {
                    $scope.error.message = 'An unknown error has occurred, ' +
                        'please try again';
                }
                $scope.$apply();
            }
        });
    };

    $scope.login = function() {
        $state.go('app.login');
    };
})

.controller('RegisterController', function($scope, $state, $ionicLoading, $rootScope, $ionicHistory) {
    $scope.user = {};
    $scope.error = {};

    $scope.register = function() {

        // TODO: add age verification step

        $scope.loading = $ionicLoading.show({
            content: 'Sending',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });

        var user = new Parse.User();
        user.set("username", $scope.user.username);
        user.set("password", $scope.user.password);
        user.set("email", $scope.user.email);

        user.signUp(null, {
            success: function(user) {
                $ionicLoading.hide();
                $rootScope.user = Parse.User.current();
                $rootScope.isLoggedIn = true;
                $ionicHistory.nextViewOptions({
                  disableBack: true
                });
                $state.go('app.home', {
                    clear: true
                });
            },
            error: function(user, error) {
                $ionicLoading.hide();
                if (error.code === 125) {
                    $scope.error.message = 'Please specify a valid email ' +
                        'address';
                } else if (error.code === 202) {
                    $scope.error.message = 'The username is already ' +
                        'registered';
                } else {
                    $scope.error.message = error.message;
                }
                $scope.$apply();
            }
        });
    };
})

.controller('MainController', function($scope, $state, $rootScope, $stateParams, $ionicHistory) {
    if ($stateParams.clear) {
        $ionicHistory.clearHistory();
    }

    $scope.rightButtons = [{
        type: 'button-positive',
        content: '<i class="icon ion-navicon"></i>',
        tap: function(e) {
            $scope.sideMenuController.toggleRight();
        }
    }];

    $scope.logout = function() {
        Parse.User.logOut();
        $rootScope.user = null;
        $rootScope.isLoggedIn = false;
        $rootScope.imgURI = undefined;
        $state.go('welcome', {
            clear: true
        });
    };

    $scope.toggleMenu = function() {
        $scope.sideMenuController.toggleRight();
    };
})
