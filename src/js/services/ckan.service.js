pmb_im.services.factory('CkanService', ['$http', 'leafletData','ConfigService', function($http, leafletData, ConfigService) {

  return {
      lastPinsResponse: null,

      getAllPolygons: function () {
          return $http.get(ConfigService.ckanAllPolygonsURL, { headers: {'Authorization': 'd7e78b6e-3eed-4d69-8387-ab0196121a51'} });
      }
  }

}]);
