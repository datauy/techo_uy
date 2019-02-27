pmb_im.controllers.controller('AbsController',
['$scope',
function($scope) {
  $scope.menuClick = function() {
    document.getElementById("menu-btn").checked = false;
  };
}]);
