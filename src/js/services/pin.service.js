pmb_im.services.factory('PinService', ['$http', 'leafletData','ConfigService', function($http, leafletData, ConfigService) {

  var pinsURL = ConfigService.baseURL + "/sites/tomamos_una/files/json/users_geo.json";
  var apiURL = ConfigService.baseURL + "/api/"

  proj4.defs('EPSG:32721', '+proj=utm +zone=21 +south +ellps=WGS84 +datum=WGS84 +units=m +no_defs');



/**
   * Constructor, with class name
   */
  function Pin(_data) {
    angular.extend(this, _data);
  }

  Pin.convertLatLongProj = function(lat,lon,scope) {
   var _geoJson = {
             "type": "FeatureCollection",
             "crs": { "type": "name",
                     "properties": {
                             "name": 'urn:ogc:def:crs:EPSG::32721'
                           }
                     },
             "features": [
               { "type": "Feature",
               "geometry":{
                      "type":"Point",
                      "coordinates":[lat,lon]
                  },
               "properties":{
                   }
               }
             ]
           };
      var _latlng;
      var point = L.Proj.geoJson(_geoJson, {
        'pointToLayer': function(feature, latlng) {
          _latlng = latlng;
          return latlng;
        }
      });
    return _latlng;
  };


  Pin.getAll = function(){
    return $http.get(pinsURL, {cache: false, params: {hash_id:Math.random()}});
  }

  Pin.sendUserLocation = function(latitude,longitude,username,password,uid){
    var body = 'user='+username+'&password='+password+'&lat='+latitude+'&lon='+longitude+"&uid="+uid;
    return $http.post(apiURL + 'send_user_position', body,{withCredentials: true, headers: {'Content-Type': 'application/x-www-form-urlencoded'}});

  }


    Pin._all = [];
    Pin.current = {};
    Pin.lastPinsResponse = null;




    /**
     * Static method, assigned to class
     * Instance ('this') is not available in static context
     */
    Pin.build = function(_data) {

      return new Pin(
        _data
      );
    };

    Pin.prototype.setLatLng = function (latlng) {

      this.lat = latlng.lat;
      this.lon = latlng.lng;
    };

    /**
     * Return the constructor function
     */
    return Pin;

}]);
