pmb_im.services.factory('ConfigService', ['$http', function($http) {

  var ConfigObj = {};
  ConfigObj.baseURL = "http://backend.techouy.thor.datauy.org";
  ConfigObj.ckanAllPolygonsURL = "/ckan";
  /*if(ionic.Platform.isWebView()){
    ConfigObj.baseURL = "http://backend.educacion.thor.datauy.org";
  } else {
    ConfigObj.baseURL = "/backend";
  }*/
  ConfigObj.AppName = "TECHOPARAMIPAIS - URUGUAY";


  return ConfigObj;

}]);
