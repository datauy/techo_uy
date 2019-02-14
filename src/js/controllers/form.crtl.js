pmb_im.controllers.controller('FormCtrl', ['$scope', '$state',
  '$cordovaGeolocation',
  '$stateParams',
  '$ionicPlatform',
  '$ionicPopup',
  'LocationsService',
  'DBService',
  '$ionicSlideBoxDelegate',
  '$ionicScrollDelegate',
  function($scope, $state, $cordovaGeolocation, $stateParams, $ionicPlatform, $ionicPopup, LocationsService, DBService, $ionicSlideBoxDelegate,
  $ionicScrollDelegate) {

    $scope.form = {};
    $scope.form.edad = 16;
    $scope.form.plan = "";
    $scope.form.lugar = "";
    $scope.form.turno = "";
    $scope.form.nivel_aprobado = "";
    

	  $scope.next = function() {
	    $ionicSlideBoxDelegate.next();
	  };

	  $scope.previous = function() {
	    $ionicSlideBoxDelegate.previous();
	  };

	  $scope.go_to_map = function(){
	    $state.go("app.map");
	  }

  }
]);
