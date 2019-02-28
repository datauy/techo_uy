pmb_im.controllers.controller('MapController', ['$scope', '_',
  '$state',
  '$cordovaCamera',
  '$cordovaGeolocation',
  '$compile',
  '$ionicModal',
  '$ionicPopup',
  'leafletData',
  'ConfigService',
  'LocationsService',
  'CkanService',
  'PinService',
  'AuthService',
  'UserService',
  'DBService',
  '$timeout',
  '$interval',
  '$location',
  'ErrorService',
  '$ionicSlideBoxDelegate',
  '$ionicScrollDelegate',
  'PopUpService',
  'ConnectivityService',
  '$cordovaInAppBrowser',
  'MapService',
  'ModalService',
  'SemaphoreService',
  'ValidationService',
  function(
    $scope,
    _,
    $state,
    $cordovaCamera,
    $cordovaGeolocation,
    $compile,
    $ionicModal,
    $ionicPopup,
    leafletData,
    ConfigService,
    LocationsService,
    CkanService,
    PinService,
    AuthService,
    UserService,
    DBService,
    $timeout,
    $interval,
    $location,
    ErrorService,
    $ionicSlideBoxDelegate,
    $ionicScrollDelegate,
    PopUpService,
    ConnectivityService,
    $cordovaInAppBrowser,
    MapService,
    ModalService,
    SemaphoreService,
    ValidationService
  ) {

    /**
     * Once state loaded, get put map on scope.
     */
    $scope.dataOrMapButtonText = "Ver datos";
    $scope.asentamientos_layers = new Array();
    $scope.baseURL = ConfigService.baseURL;
    $scope.AppName = ConfigService.AppName;
    $scope.user_cached_image = "./img/icon-user-anonymous.png";
    $scope.one_value_popup = null;
    $scope.myIntervals = new Array();
    $scope.filters = {};
    $scope.astVulnera = {
      //'0': { color: '#27BF00', name: 'Vulnerabilidad urbana baja' },
      '0': { color: '#1cc7bd', name: 'Bajo', icon: 'img/pin-green.svg' },
      '1': { color: '#1cc7bd', name: 'Bajo', icon: 'img/pin-green.svg' },
      //'2': { color: '#A9CB00', name: 'Vulnerabilidad urbana media' },
      '2': { color: '#0092dd', name: 'Mediano', icon: 'img/pin-blue.svg' },
      '3': { color: '#0092dd', name: 'Mediano', icon: 'img/pin-blue.svg' },
      //'4': { color: '#D87600', name: 'Vulnerabilidad urbana alta' },
      '4': { color: '#feb429', name: 'Alto', icon: 'img/pin-yellow.svg' },
      '5': { color: '#feb429', name: 'Alto', icon: 'img/pin-yellow.svg' },
      //'6': { color: '#E50010', name: 'Vulnerabilidad urbana muy alta' }
      '6': { color: '#c85757', name: 'Extremo', icon: 'img/pin-red.svg' }
    };

    $scope.$on("$ionicView.beforeEnter", function() {
      ModalService.checkNoModalIsOpen();
      DBService.initDB();
      if(ConnectivityService.isOnline()){
        $scope.check_user_logged();
      }else{
        $scope.set_offline_user();
      }
      if(ConnectivityService.isOnline()){
        document.getElementById("spinner").style.display = "block";
        $scope.create_online_map();
      }
    });

    $scope.$on("$ionicView.afterEnter", function() {
      var map = leafletData.getMap();
      if(LocationsService.initial_lat!=""){
        MapService.centerMapOnCoords(LocationsService.initial_lat, LocationsService.initial_lng, 10);
      }else{
        MapService.centerMapOnCoords(-32.462703, -55.701468, 7);
      }
      if ( window.innerWidth <= 768 ){
        document.getElementById("filters").style.display = "none";
      }
      //$scope.loadDefautFilters();
    });


    $scope.openWebsite = function(url) {
      var options = {
                location: 'no',
                clearcache: 'yes',
                toolbar: 'no'
            };

     $cordovaInAppBrowser.open(url, '_blank', options)
          .then(function(event) {
            // success
          })
          .catch(function(event) {
            // error
        });
    }

    $scope.create_online_map = function(){
      $scope.map = {
        defaults: {
          tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          minZoom: 1,
          maxZoom: 18,
          zoomControlPosition: 'bottomright',
        },
        markers: {},
        events: {
          map: {
            enable: ['context'],
            logic: 'emit'
          }
        },
        center: {
        }
      };
      $scope.loadPinsLayer();
      $scope.map.center = {
          lat: -34.901113,
          lng: -56.164531,
          zoom: 10
        };
      leafletData.getMap().then(function(map) {
        map.on('moveend', $scope.hideOffScreenPins);
      });
    };



  $scope.next = function() {
    $ionicSlideBoxDelegate.next();
  };

  $scope.previous = function() {
    $ionicSlideBoxDelegate.previous();
  };

  $scope.back_to_map = function(back_to_map){
    if(back_to_map){
      //LocationsService.initial_lat = $scope.report.lat;
      //LocationsService.initial_lng = $scope.report.lon;
      ModalService.checkNoModalIsOpen();
      document.getElementById("spinner-inside-modal").style.display = "none";
      //$scope.addReportsLayer();
    }else{
      document.getElementById("spinner-inside-modal").style.display = "none";
    }
  }


  $scope.image = null;

  $scope.addImage = function(isFromAlbum, isUserPhoto, isCommentPhoto, isNewUserPhoto) {
    //alert("addImage");
    $scope.isUserPhoto = isUserPhoto;
    $scope.isCommentPhoto = isCommentPhoto;
    $scope.isNewUserPhoto = isNewUserPhoto;

    var source = Camera.PictureSourceType.CAMERA;
    var fix_orientation = true;
    var save_to_gallery = true;
    if(isFromAlbum==1){
      source = Camera.PictureSourceType.PHOTOLIBRARY;
      fix_orientation = false;
      save_to_gallery = false;
    }

    var options = {
      quality: 90,
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: source,
      allowEdit: false,
      correctOrientation : fix_orientation,
      encodingType: Camera.EncodingType.JPEG,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: save_to_gallery,
      targetWidth: 500,
      targetHeight: 500
    };


    $cordovaCamera.getPicture(options).then(function(imageData) {
      onImageSuccess(imageData);

      function onImageSuccess(fileURI) {
        window.FilePath.resolveNativePath(fileURI, function(result) {
          // onSuccess code
          //alert(result);
          fileURI = 'file://' + result;
          if(result.startsWith("file://")){
            fileURI = result;
          }
          if($scope.isUserPhoto==1){
            //UserService.add_photo(fileURI);
            $scope.profile.picture_url = fileURI;
          }else{
            if($scope.isCommentPhoto==1){
              $scope.comment.file = fileURI;
            }else if($scope.isNewUserPhoto==1){
              $scope.newuser.picture_url = fileURI;
            }
          }
          $scope.imgURI = fileURI;
          //createFileEntry(fileURI);
        }, function(error) {
          alert("Error resolveNativePath" + error);
        });

      }

      function createFileEntry(fileURI) {
        window.resolveLocalFileSystemURL(fileURI, copyFile, fail);
      }

      // 5
      function copyFile(fileEntry) {
        var name = fileEntry.fullPath.substr(fileEntry.fullPath.lastIndexOf('/') + 1);
        var newName = makeid() + name;

        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(fileSystem2) {
            fileEntry.copyTo(
              fileSystem2,
              newName,
              onCopySuccess,
              fail
            );
          },
          fail);
      }

      // 6
      function onCopySuccess(entry) {
        $scope.$apply(function() {
          $scope.image = entry.nativeURL;
        });
      }

      function fail(error) {

      }

      function makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 5; i++) {
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
      }

    }, function(err) {
      //console.log(err);
    });
  };

  $scope.urlForImage = function() {
    var imageURL = "http://placehold.it/200x200";
    if ($scope.image) {
      var name = $scope.image.substr($scope.image.lastIndexOf('/') + 1);
      imageURL = cordova.file.dataDirectory + name;
    }
    //console.log("ImageURL = " + imageURL);
    return imageURL;
  };


    $scope.scrollMe = function(anchor_id){
      $location.hash(anchor_id);
      var handle  = $ionicScrollDelegate.$getByHandle('content');
      handle.anchorScroll();
    }

    $scope.set_active_option = function(buttonid) {
      document.getElementById(buttonid).className = "option-active";
    }

    $scope.hide_special_divs = function(){
    }

    $scope.close_report_detail_modal = function(){
      ModalService.checkNoModalIsOpen();
      $scope.report_detail_id = null;
    }


    /**
     * Center map on user's current position
     */
    $scope.locate = function() {

      $cordovaGeolocation
        .getCurrentPosition()
        .then(function(position) {
          $scope.map.center.lat = position.coords.latitude;
          $scope.map.center.lng = position.coords.longitude;
          $scope.map.center.zoom = 15;

          $scope.map.markers.now = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            message: "You Are Here",
            focus: true,
            draggable: false
          };

        }, function(err) {
          // error
          //console.log("Location error!");
          //console.log(err);
        });

    };



    $scope.addMapControls = function() {

      document.getElementById('map_crosshair').style.display = "block";
      document.getElementById('map_crosshair_button').style.display = "block";

    };


    $scope.changeUserLocationPin = function(lat,lon,uid){
      if($scope.online_user_geo_array[uid]){
        layer = $scope.online_user_geo_array[uid];
        var newLatLng = new L.LatLng(lat, lon);
        layer.setLatLng(newLatLng);
      }
    }

    $scope.removeAllPins = function() {
      leafletData.getMap().then(function(map) {
          $scope.asentamientos_layers.forEach(function(layer,key){
                map.removeLayer(layer);
          })
      })
    }

    $scope.hideOffScreenPins = function() {
      /*leafletData.getMap().then(function(map) {
        var mapBounds = map.getBounds();
        $scope.usersVisible = [];
          $scope.online_user_geo_array.forEach(function(layer,key){
            var shouldBeVisible = mapBounds.contains(layer.getLatLng());
            if (!shouldBeVisible) {
                map.removeLayer(layer);
            } else if (shouldBeVisible) {
                map.addLayer(layer);
                $scope.usersVisible.push(layer.feature);
            }
          })
      });*/
    }

    $scope.loadPinsLayer = function(){
      document.getElementById("spinner").style.display = "block";
        CkanService.getAllData('090341a0-dfba-43fd-bc82-da90394a883d').then(function (response) {
          CkanService.asentamientosActivos = response;
          $scope.updatePins();
        });
    }

    $scope.getTotalAsentamientos = function(){
      if(CkanService.asentamientosActivos){
        return CkanService.asentamientosActivos.length;
      }else{
        return "656";
      }
    }

  $scope.getOnlyCoordinatesPolygon = function(wkt_geom){
    wkt_geom = wkt_geom.replace("Polygon ((","");
    wkt_geom = wkt_geom.replace("))","");
    var pointsArray = wkt_geom.split(",");
    var polygonPointsCoordinates = new Array();
    pointsArray.forEach(function(point,key){
      point = point.trim();
      var coordinatesArray = point.split(" ");
      var lat = coordinatesArray[1];
      var lon = coordinatesArray[0];
      var newCoordinates = PinService.convertLatLongProj(lat,lon,$scope);
      var latlon = [newCoordinates.lat, newCoordinates.lng];
      polygonPointsCoordinates.push(latlon);
    });
    return polygonPointsCoordinates;
  }

  $scope.getOnlyCoordinatesMultiPolygon = function(wkt_geom){
    var all_polygons = new Array();
    wkt_geom = wkt_geom.replace("MultiPolygon (((","");
    wkt_geom = wkt_geom.replace(")))","");
    var polygons = wkt_geom.split(")),((");
    polygons.forEach(function(polygon,key){
      polygon = polygon.replace("((","");
      polygon = polygon.replace("))","");
      var pointsArray = polygon.split(",");
      var polygonPointsCoordinates = new Array();
      pointsArray.forEach(function(point,key2){
        point = point.trim();
        var coordinatesArray = point.split(" ");
        var lat = parseFloat(coordinatesArray[1]);
        var lon = parseFloat(coordinatesArray[0]);
        /*var newCoordinates = PinService.convertLatLongProj(lat,lon,$scope);
        var latlon = [newCoordinates.lat, newCoordinates.lng];*/
        if(!isNaN(lat) && !isNaN(lon)){
          var latlon = [lat, lon];
          polygonPointsCoordinates.push(latlon);
        }
      });
      all_polygons.push(polygonPointsCoordinates);
    });
    return all_polygons;
  }

  $scope.getTypeOfMapObject = function(wkt_geom){
    if(wkt_geom){
      if(wkt_geom.startsWith("MultiPolygon")){
        return "MultiPolygon";
      }
      if(wkt_geom.startsWith("Polygon")){
        return "Polygon";
      }
    }else{
      return "Unknown";
    }

  }

    //PARA CONTROLAR EL ENTER EN ALGUNOS FORMS
    /*$scope.key_press = function(event,stage){
      var keyCode = event.keyCode;
      if(stage=='private_chat'){
        if(keyCode==13){
          try {
            if(cordova===null){

            }else if(cordova&&cordova.plugins.Keyboard){
              cordova.plugins.Keyboard.close();
            }
          }
          catch(err) {
          }

        }
      }
    }*/


    $scope.timeConverter = function(UNIX_timestamp){
      var a = new Date(UNIX_timestamp * 1000);
      var months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Setiembre','Octubre','Noviembre','Diciembre'];
      var year = a.getFullYear();
      //var month = months[a.getMonth()];
      var month = a.getMonth();
      if(month<10){
        month = "0"+month;
      }
      var day = a.getDate();
      if(day<10){
        day = "0"+day;
      }
      var hour = a.getHours();
      if(hour<10){
        hour = "0"+hour;
      }
      var min = a.getMinutes();
      if(min<10){
        min = "0"+min;
      }
      var sec = a.getSeconds();
      var time = day + '/' + month + '/' + year + ' ' + hour + ':' + min;
      return time;
    }



    // Suggestion
    $scope.model = [];
    $scope.externalModel = [];
    $scope.selectedItems = [];
    $scope.preselectedSearchItems = [];
    $scope.clickedValueModel = "";
    $scope.removedValueModel = "";


    $scope.itemsRemoved = function(callback) {
      $scope.removedValueModel = callback;
    };

    $scope.user_options = function(){
      /*var menu = document.getElementById("user-options-menu");
      if(menu.style.display=="block"){
        menu.style.display = "none";
      }else{
        //console.log(UserService.name);
        var name = UserService.name;
        if(name==null){
          //No esta logueado
          $scope.show_anonymous_menu();
        }else{
          //Está logueado
          $scope.show_user_menu();
        }
      }*/
    }

    $scope.show_anonymous_menu = function(){
      /*var menu = document.getElementById("user-options-menu");
      var html = "<div id='auth_options'><div class='nonauth-link' ng-click='show_login_modal()'>Iniciar sesión</div>";
      html = html + "<div class='nonauth-link' ng-click='show_sign_up_modal()'>Registrarse</div></div>";
      menu.innerHTML = html;
      $compile(menu)($scope); //<---- recompilation
      menu.style.height = '120px';
      menu.style.width = '150px';
      menu.style.display = "block";*/
    }

    $scope.show_user_menu = function(){
      /*var menu = document.getElementById("user-options-menu");
      var html = UserService.name + "<div id='auth_options'><div class='user-logged-link' ng-click='show_edit_profile_modal()'>Mi perfil</div>";
      //html = html + "<div class='user-logged-link' ng-click='change_password()'>Cambiar contraseña</div>";
      html = html + "<div class='user-logged-link' ng-click='sign_out()'>Cerrar sesión</div></div>";
      menu.innerHTML = html;
      $compile(menu)($scope); //<---- recompilation
      menu.style.height = '220px';
      menu.style.width = '200px';
      menu.style.display = "block";*/
    };

    $scope.create_field_array = function(name,type,value){
      var field = new Array();
      field.name = name;
      field.type = type;
      field.value = value;
      return field;
    };

    $scope.create_field_array_with_twoFields = function(name,type,value,secondValue){
      var field = new Array();
      field.name = name;
      field.type = type;
      field.value = value;
      field.secondValue = secondValue;
      return field;
    };

    $scope.fix_fb_image_link = function(url){
      if(url.indexOf("http://graph.facebook.com") >= 0){
        var parts = url.split("http://graph.facebook.com");
        var newUrl = "http://graph.facebook.com"+parts[1];
        return newUrl;
      }
      return url;
    };

    $scope.log_in = function(user, password){
      if(SemaphoreService.takeIfAvailable("submit-form")){
        if(ConnectivityService.isOnline()){
          document.getElementById("spinner-inside-modal").style.display = "block";
          var fields = new Array();
          fields.push($scope.create_field_array("Usuario","notNull",user));
          fields.push($scope.create_field_array("Contraseña","notNull",password));
          if(ErrorService.check_fields(fields,"error_container")){
            AuthService.log_in(user,password).then(function(resp) {
              if(ErrorService.http_response_is_successful(resp,"error_container")){
                photo = $scope.fix_fb_image_link($scope.getObjectDataFromResponse(resp).Photo);
                if(photo=="anon"){
                  photo="url(./img/icon-user-anonymous.png)";
                }
                UserService.save_user_data($scope.getObjectDataFromResponse(resp).Name, $scope.nonauth.password, photo, $scope.getObjectDataFromResponse(resp).ShowLocation, $scope.getObjectDataFromResponse(resp).Uid, $scope.getObjectDataFromResponse(resp).Estado, $scope.getObjectDataFromResponse(resp).Gender, $scope.getObjectDataFromResponse(resp).InterestedIn);
                DBService.saveUser($scope.getObjectDataFromResponse(resp).Name,$scope.nonauth.password,photo,$scope.getObjectDataFromResponse(resp).ShowLocation,$scope.getObjectDataFromResponse(resp).Uid,$scope.getObjectDataFromResponse(resp).Estado, $scope.getObjectDataFromResponse(resp).Gender, $scope.getObjectDataFromResponse(resp).InterestedIn);
                $scope.set_user_picture(1);
                document.getElementById("spinner-inside-modal").style.display = "none";
                SemaphoreService.makeAvailableAgain("submit-form");
                $scope.close_login_modal();
              }else{
                SemaphoreService.makeAvailableAgain("submit-form");
                document.getElementById("spinner-inside-modal").style.display = "none";
              }
            }, function(resp) {
              //console.log(err);
              //alert("Error en sign_in");
              document.getElementById("spinner-inside-modal").style.display = "none";
              SemaphoreService.makeAvailableAgain("submit-form");
              ErrorService.show_error_message("error_container",resp.statusText);
            });
          }else{
            document.getElementById("spinner-inside-modal").style.display = "none";
            SemaphoreService.makeAvailableAgain("submit-form");
          }

        }else{
          SemaphoreService.makeAvailableAgain("submit-form");
          PopUpService.show_alert("Sin conexión a internet","Para iniciar sesión debe estar conectado a internet");
        }
      }
    }

    $scope.log_in_background = function(user, password){
      AuthService.log_in(user,password).then(function(resp) {
        if(ErrorService.http_response_is_successful_ajax(resp)){
          photo = $scope.fix_fb_image_link($scope.getObjectDataFromResponse(resp).Photo);
          if(photo=="anon"){
            photo="url(./img/icon-user-anonymous.png)";
          }
          UserService.save_user_data($scope.getObjectDataFromResponse(resp).Name, password, photo, $scope.getObjectDataFromResponse(resp).ShowLocation, $scope.getObjectDataFromResponse(resp).Uid, $scope.getObjectDataFromResponse(resp).Estado, $scope.getObjectDataFromResponse(resp).Gender, $scope.getObjectDataFromResponse(resp).InterestedIn);
          DBService.saveUser($scope.getObjectDataFromResponse(resp).Name,password,photo,$scope.getObjectDataFromResponse(resp).ShowLocation,$scope.getObjectDataFromResponse(resp).Uid,$scope.getObjectDataFromResponse(resp).Estado, $scope.getObjectDataFromResponse(resp).Gender, $scope.getObjectDataFromResponse(resp).InterestedIn);

          $scope.set_user_picture(1);
          return 1;
        }else{
          return 0;
        }

      }, function(resp) {
        //console.log(err);
        //ErrorService.show_error_message_popup(resp.statusText);
        return 0;
      });
    }



    $scope.sign_out = function(){
      UserService.erase_user_data();
      DBService.eraseUser();
      document.getElementById("spinner").style.display = "none";
      $scope.set_user_picture(0);
      /*document.getElementById("user-options-menu").style.display="none";*/
    }

    $scope.show_edit_profile_modal = function(){
      //Cargar el modal con la info del usuario logueado y con el submit a edit_profile_ok
      if(SemaphoreService.takeIfAvailable("open-modal")){
        document.getElementById("spinner").style.display = "block";
        $scope.newuser = new Array();
        $scope.newuser.email = UserService.email;
        $scope.newuser.gender = UserService.gender;
        $scope.newuser.username = UserService.name;
        $scope.newuser.interested = UserService.interested;
        $scope.newuser.status = UserService.status;
        $scope.newuser.show_location = UserService.show_location;
        $scope.actual_photo = UserService.picture_url;
        if($scope.actual_photo!=null){
        }else{
          $scope.actual_photo = "./img/icon-user-anonymous.png";
        }
        if($scope.actual_photo=="url(./img/icon-user-anonymous.png)"){
          $scope.actual_photo = "./img/icon-user-anonymous.png";
        }
        ModalService.checkNoModalIsOpen();
          if(ValidationService.isMobileDevice()){
            $ionicModal.fromTemplateUrl('templates/edit_profile_with_photo.html', {
                scope: $scope,
                hardwareBackButtonClose: false,
                animation: 'slide-in-up',
                //focusFirstInput: true
              }).then(function(modal) {
                  document.getElementById("spinner").style.display = "none";
                  ModalService.activeModal = modal;
                  ModalService.activeModal.show();
                  SemaphoreService.makeAvailableAgain("open-modal");
              });
          }else{
            $ionicModal.fromTemplateUrl('templates/edit_profile_with_photo_desktop.html', {
              scope: $scope,
              hardwareBackButtonClose: false,
              animation: 'slide-in-up',
              //focusFirstInput: true
            }).then(function(modal) {
                document.getElementById("spinner").style.display = "none";
                ModalService.activeModal = modal;
                ModalService.activeModal.show();
                SemaphoreService.makeAvailableAgain("open-modal");
            });
          }
        }

    }

    $scope.readURL = function (input,type) {
      if (input.files && input.files[0]) {
        if(type==1){
          $scope.newuser.picture_url = input.files[0];
            }else if (type==2){
          $scope.comment.photo = input.files[0];
        }else{
          $scope.report.file = input.files[0];
        }
        var reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById("myImage").src = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }

    }

    $scope.close_edit_profile_modal = function(){
      //Cargar el modal con la info del usuario logueado y con el submit a update_user
      ModalService.checkNoModalIsOpen();
    }

    $scope.edit_profile_ok = function(){
      $scope.edit_profile();
    }

    $scope.getObjectDataFromResponse = function(response){
      if(response.data){
        return response.data;
      }else{
        return response;
      }
    }

    $scope.edit_profile = function(){
      if(SemaphoreService.takeIfAvailable("submit-form")){
        if(ConnectivityService.isOnline()){
          document.getElementById("spinner-inside-modal").style.display = "block";
          /*var fields = new Array();
          fields.push($scope.create_field_array("Correo electrónico","email",new_email));
          //fields.push($scope.create_field_array("Contraseña","notNull",password));
          fields.push($scope.create_field_array("Cédula de Identidad","iddoc_uy",id_doc));
          fields.push($scope.create_field_array("Nombre y apellido","two_words",fullname));*/
          /*if(ErrorService.check_fields(fields,"error_container")){*/
          $scope.newuser.password = UserService.password;
            var edit_request = AuthService.edit_user($scope.newuser);
            if($scope.newuser.picture_url==null || $scope.newuser.picture_url=="" || !ValidationService.isMobileDevice()){
              edit_request.success(function(resp){
                document.getElementById("sent_label").innerHTML = "Enviado: 100%";
                //console.log(resp);
                if(ErrorService.http_response_is_successful(resp,"error_container")){
                  UserService.save_user_data($scope.getObjectDataFromResponse(resp).Name, $scope.newuser.password, $scope.getObjectDataFromResponse(resp).Photo, $scope.getObjectDataFromResponse(resp).ShowLocation, $scope.getObjectDataFromResponse(resp).Uid, $scope.getObjectDataFromResponse(resp).Estado, $scope.getObjectDataFromResponse(resp).Gender, $scope.getObjectDataFromResponse(resp).InterestedIn);
                  DBService.saveUser($scope.getObjectDataFromResponse(resp).Name,$scope.newuser.password,$scope.getObjectDataFromResponse(resp).Photo,$scope.getObjectDataFromResponse(resp).ShowLocation,$scope.getObjectDataFromResponse(resp).Uid,$scope.getObjectDataFromResponse(resp).Estado, $scope.getObjectDataFromResponse(resp).Gender, $scope.getObjectDataFromResponse(resp).InterestedIn);
                  document.getElementById("spinner-inside-modal").style.display = "none";
                  SemaphoreService.makeAvailableAgain("submit-form");
                  $scope.close_edit_profile_modal();
                  $scope.check_user_logged();
                }else{
                  SemaphoreService.makeAvailableAgain("submit-form");
                  document.getElementById("spinner-inside-modal").style.display = "none";
                }
              })
              .error(function(data, status, headers,config){
                ErrorService.show_error_message("error_container",status);
                document.getElementById("spinner-inside-modal").style.display = "none";
                SemaphoreService.makeAvailableAgain("submit-form");
              })
            }else{
              edit_request.then(function(result) {
                var data = JSON.parse(result.response);
                if(ErrorService.http_data_response_is_successful(data,"error_container")){
                  data = $scope.getObjectDataFromResponse(data);
                  UserService.save_user_data(data.Name, $scope.newuser.password, data.Photo, data.ShowLocation, data.Uid, data.Estado, data.Gender, data.InterestedIn);
                  DBService.saveUser(data.Name,$scope.newuser.password,data.Photo,data.ShowLocation,data.Uid,data.Estado, data.Gender, data.InterestedIn);
                  SemaphoreService.makeAvailableAgain("submit-form");
                  document.getElementById("spinner-inside-modal").style.display = "none";
                  $scope.close_edit_profile_modal();
                  $scope.check_user_logged();
                }else{
                  SemaphoreService.makeAvailableAgain("submit-form");
                  document.getElementById("spinner-inside-modal").style.display = "none";
                }
              }, function(error) {
                var alert = "Código: " + error.code;
                alert = alert + " Origen: " + error.source;
                alert = alert + " Destino: " + error.target;
                alert = alert + " http_status: " + error.http_status;
                alert = alert + " Body: " + error.body;
                alert = alert + " Exception: " + error.exception;
                ErrorService.show_error_message("error_container","Hubo un error en el envío: " + alert);
                SemaphoreService.makeAvailableAgain("submit-form");
                document.getElementById("spinner-inside-modal").style.display = "none";
              }, function(progress) {
                  $timeout(function() {
                    $scope.uploadProgress = (progress.loaded / progress.total) * 100;
                    document.getElementById("sent_label").innerHTML = "Enviado: " + Math.round($scope.uploadProgress) + "%";
                  });
              });
            }
          /*}else{
            document.getElementById("spinner-inside-modal").style.display = "none";
          }*/
        }else{
          SemaphoreService.makeAvailableAgain("submit-form");
          PopUpService.show_alert("Sin conexión a internet","Para editar su perfil debe estar conectado a internet");
        }
      }
    }


    $scope.show_login_modal = function(){
      //Cargar el modal con el form de login y ahi llama al sign_in
      if(SemaphoreService.takeIfAvailable("open-modal")){
        $scope.nonauth = new Array();
        $scope.nonauth.user = "";
        $scope.nonauth.password = "";
        ModalService.checkNoModalIsOpen();
        $ionicModal.fromTemplateUrl('templates/log_in.html', {
            scope: $scope,
            hardwareBackButtonClose: false,
            animation: 'slide-in-up',
            //focusFirstInput: true
          }).then(function(modal) {
              $scope.hide_special_divs();
              ModalService.activeModal = modal;
              SemaphoreService.makeAvailableAgain("open-modal");
              ModalService.activeModal.show();
          });
      }
    }

    $scope.login_ok = function(){
      $scope.log_in($scope.nonauth.user,$scope.nonauth.password);
    }

    $scope.close_login_modal = function(){
      ModalService.checkNoModalIsOpen();
    }



    $scope.show_sign_up_modal = function(){
      //cargar el modal con el form de sign_up y de ahi llamar al sign_up
      if(SemaphoreService.takeIfAvailable("open-modal")){
        $scope.newuser = new Array();
        $scope.newuser.email = "";
        $scope.newuser.password = "";
        $scope.newuser.fullname = "";
        $scope.newuser.id_doc = "";
        $scope.newuser.telephone = "";
        $scope.newuser.photo = "";
        ModalService.checkNoModalIsOpen();
        if(ValidationService.isMobileDevice()){
          $ionicModal.fromTemplateUrl('templates/sign_up.html', {
              scope: $scope,
              hardwareBackButtonClose: false,
              animation: 'slide-in-up',
              //focusFirstInput: true
            }).then(function(modal) {
                $scope.hide_special_divs();
                ModalService.activeModal = modal;
                SemaphoreService.makeAvailableAgain("open-modal");
                ModalService.activeModal.show();
            });
        }else{
          $ionicModal.fromTemplateUrl('templates/sign_up_desktop.html', {
              scope: $scope,
              hardwareBackButtonClose: false,
              animation: 'slide-in-up',
              //focusFirstInput: true
            }).then(function(modal) {
                $scope.hide_special_divs();
                ModalService.activeModal = modal;
                SemaphoreService.makeAvailableAgain("open-modal");
                ModalService.activeModal.show();
            });
        }

      }
    }

    $scope.close_sign_up_modal = function(){
      ModalService.checkNoModalIsOpen();
    }

    $scope.sign_up = function(){
      if(SemaphoreService.takeIfAvailable("submit-form")){
        if(ConnectivityService.isOnline()){
          document.getElementById("spinner-inside-modal").style.display = "block";
          var fields = new Array();
          /*fields.push($scope.create_field_array("Correo electrónico","email",$scope.newuser.email));
          fields.push($scope.create_field_array("Contraseña","notNull",$scope.newuser.password));
          fields.push($scope.create_field_array("Usuario","notNull",$scope.newuser.username));
          fields.push($scope.create_field_array("Género","notNull",$scope.newuser.gender));
          fields.push($scope.create_field_array("Interesado en","notNull",$scope.newuser.interested));
          fields.push($scope.create_field_array("Estado","notNull",$scope.newuser.status));
          fields.push($scope.create_field_array("Mostrar ubicación","notNull",$scope.newuser.show_location));
          fields.push($scope.create_field_array_with_twoFields("'Contraseña' y 'Confirmar contraseña'","equalsTo",$scope.newuser.password, $scope.newuser.repassword));*/
          //if(ErrorService.check_fields(fields,"error_container")){
            if($scope.newuser.picture_url!=null && $scope.newuser.picture_url!="" && ValidationService.isMobileDevice()){
              AuthService.create_user($scope.newuser).then(function(data){
                document.getElementById("sent_label").innerHTML = "Enviado: 100%";
                if(ErrorService.http_data_response_is_successful(data,"error_container")){
                  data = $scope.getObjectDataFromResponse(data);
                  UserService.save_user_data(data.name, data.email, $scope.newuser.password, data.identity_document, data.phone, data.picture_url);
                  UserService.save_user_data(data.Name, $scope.newuser.password, data.Photo, data.ShowLocation, data.Uid, data.Estado, data.Gender, data.InterestedIn);
                  DBService.saveUser(data.Name,password,data.Photo,data.ShowLocation,data.Uid,data.Estado, data.Gender, data.InterestedIn);
                  SemaphoreService.makeAvailableAgain("submit-form");
                  document.getElementById("spinner-inside-modal").style.display = "none";
                  $scope.close_edit_profile_modal();
                  $scope.check_user_logged();
                }else{
                  SemaphoreService.makeAvailableAgain("submit-form");
                  document.getElementById("spinner-inside-modal").style.display = "none";
                }
              },function(err){
                SemaphoreService.makeAvailableAgain("submit-form");
                document.getElementById("spinner-inside-modal").style.display = "none";
              });
            }else{
                AuthService.create_user($scope.newuser).then(function(resp) {
                if(ErrorService.http_response_is_successful(resp,"error_container")){
                  UserService.save_user_data($scope.getObjectDataFromResponse(resp).Name, $scope.newuser.password, $scope.getObjectDataFromResponse(resp).Photo, $scope.getObjectDataFromResponse(resp).ShowLocation, $scope.getObjectDataFromResponse(resp).Uid, $scope.getObjectDataFromResponse(resp).Estado, $scope.getObjectDataFromResponse(resp).Gender, $scope.getObjectDataFromResponse(resp).InterestedIn);
                  DBService.saveUser($scope.getObjectDataFromResponse(resp).Name,$scope.newuser.password,$scope.getObjectDataFromResponse(resp).Photo,$scope.getObjectDataFromResponse(resp).ShowLocation,$scope.getObjectDataFromResponse(resp).Uid,$scope.getObjectDataFromResponse(resp).Estado, $scope.getObjectDataFromResponse(resp).Gender, $scope.getObjectDataFromResponse(resp).InterestedIn);
                  //$scope.set_user_picture(1);
                  SemaphoreService.makeAvailableAgain("submit-form");
                  document.getElementById("spinner-inside-modal").style.display = "none";
                  $scope.close_sign_up_modal();
                  var alertPopup = $ionicPopup.alert({
                   title: "Usuario creado con éxito",
                   template: $scope.getObjectDataFromResponse(resp).message
                  });
                  alertPopup.then(function(res) {
                    //return false;
                  });
                  $scope.check_user_logged();
                }else{
                  SemaphoreService.makeAvailableAgain("submit-form");
                  document.getElementById("spinner-inside-modal").style.display = "none";
                }
              }, function(resp) {
                SemaphoreService.makeAvailableAgain("submit-form");
                document.getElementById("spinner-inside-modal").style.display = "none";
                ErrorService.show_error_message("error_container",resp.statusText);
              });
            }
          /*}else{
            document.getElementById("spinner-inside-modal").style.display = "none";
          }*/
        }else{
          SemaphoreService.makeAvailableAgain("submit-form");
          PopUpService.show_alert("Sin conexión a internet","Para iniciar registrarse debe estar conectado a internet");
        }
      }
    }

    $scope.sign_up_ok = function(){
      //console.log($scope.newuser);
      $scope.sign_up();
    }

    $scope.check_user_logged = function(){
      var name = UserService.name;
      if(name==null){
          //Si Hay un usuario guardado
          var user = DBService.getUser();
          user.then(function (doc) {
            if(doc.name!=null && doc.name!="" && doc.name!="undefined"){
              $scope.log_in_background(doc.name, doc.password);
            }else{
              $scope.set_user_picture(0);
            }
          }).catch(function (err) {
            $scope.set_user_picture(0);
          });
      }else{
        //Está logueado
        if(UserService.picture_url==null || UserService.picture_url==""){
          //El usuario no tiene foto definida
          $scope.set_user_picture(0);
        }else{
          //El usuario tiene foto
          $scope.set_user_picture(1);
        }
      }
    }

    $scope.set_offline_user = function(){
      var name = UserService.name;
      if(name==null){
          //Si Hay un usuario guardado
          var user = DBService.getUser();
          user.then(function (doc) {
            if(doc.name!=null && doc.name!="" && doc.name!="undefined"){
              UserService.save_user_data(doc.name, doc.password, doc.picture_url, doc.show_location);
            }else{
              $scope.set_user_picture(0);
            }
          }).catch(function (err) {
            $scope.set_user_picture(0);
          });
      }else{
        //Está logueado
        if(UserService.picture_url==null || UserService.picture_url==""){
          //El usuario no tiene foto definida
          $scope.set_user_picture(0);
        }else{
          //El usuario tiene foto
          $scope.set_user_picture(1);
        }
      }
    }



    $scope.set_user_picture = function(hasPhoto){
      var picture = document.getElementById("user_picture");
      if(hasPhoto==0){
        //picture.style.backgroundImage = "url(./img/icon-user-anonymous.png)";
        $scope.user_cached_image="./img/icon-user-anonymous.png";
      }else{
        if(UserService.picture_url!=null && UserService.picture_url!=""){
          //alert(UserService.picture_url);
          $scope.user_cached_image=UserService.picture_url;
          //picture.style.backgroundImage = "url(" + UserService.picture_url + ")";
        }else{
          //picture.style.backgroundImage = "url(./img/icon-user-anonymous.png)";
          $scope.user_cached_image="./img/icon-user-anonymous.png";
        }
      }

    }

    $scope.find_me = function(){
        $scope.set_active_option("button-find-me");
        $scope.hide_special_divs();
        var posOptions = {timeout: 10000, enableHighAccuracy: true};
        $cordovaGeolocation
          .getCurrentPosition(posOptions)
          .then(function (position) {
                $scope.map.center.lat  = position.coords.latitude;
                $scope.map.center.lng = position.coords.longitude;
                LocationsService.save_new_report_position(position.coords.latitude,position.coords.longitude);
                if(ConnectivityService.isOnline()){
                  $scope.map.center.zoom = 18;
                }else{
                  $scope.map.center.zoom = 16;
                }
                $scope.map.markers.now = {
                  lat:position.coords.latitude,
                  lng:position.coords.longitude,
                  message: "<p align='center'>Te encuentras aquí <br/> <a ng-click='new_report(1);'>Iniciar reporte en tu posición actual</a></p>",
                  focus: true,
                  draggable: false,
                  getMessageScope: function() { return $scope; }
                };
                //$scope.map.markers.now.openPopup();
              }, function(err) {
                // error
                //console.log("Location error!");
                //console.log(err);
                //ErrorService.show_error_message_popup("No hemos podido geolocalizarlo. ¿Tal vez olvidó habilitar los servicios de localización en su dispositivo?")
                $scope.openCouncilSelector();
              });

          };

        /** FILTERS JS */
        $scope.submitFilters = function(){
          document.getElementById("spinner").style.display = "block";
          //// TODO: $scope.filters.a_o empty
          if ( !$scope.filters.hasOwnProperty('a_o') ) {
            $scope.filters['a_o'] = {ocho: true};
          }
          CkanService.getData($scope.filters).then(function (asentamientos) {
            CkanService.asentamientosActivos = asentamientos;
            CkanService.filtrosActivos = $scope.filters;
            document.getElementById("spinner").style.display = "block";
            //reload PinS
            $scope.updatePins();
          });
        };

        $scope.toggleGroup = function(group) {
          if ($scope.isGroupShown(group)) {
            $scope.shownGroup = null;
          } else {
            $scope.shownGroup = group;
          }
        };
        $scope.isGroupShown = function(group) {
          return $scope.shownGroup === group;
        };

        $scope.mapIcon = function() {
          return {
            iconUrl: '',
            iconSize:     [37, 41], // size of the icon
            iconAnchor:   [18, 36], // point of the icon which will correspond to marker's location
            popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
          };
        }

        $scope.switchStates = function(){
          $state.go("app.data");
        }

        $scope.updatePins = function() {
          leafletData.getMap().then(function(map) {
            if ( $scope.asentamientos_layers.length > 0 ){
              $scope.asentamientos_layers.forEach(function(layer,key){
                map.removeLayer(layer);
                delete $scope.asentamientos_layers[key];
              })
            }
            CkanService.asentamientosActivos.forEach(function(feature){
              var latlngs = {};
              if($scope.getTypeOfMapObject(feature.wkt_geom)=="Polygon"){
                latlngs = $scope.getOnlyCoordinatesPolygon(feature.wkt_geom);
                //var polygon = L.polygon(latlngs, {color: 'red'}).bindPopup(feature.nombre + " - " + feature.id2018).addTo(map);
                //$scope.asentamientos_layers[feature.id2018] = polygon;
              }
              else if($scope.getTypeOfMapObject(feature.wkt_geom)=="MultiPolygon"){
                latlngs = $scope.getOnlyCoordinatesMultiPolygon(feature.wkt_geom);
                if(latlngs.length==1){
                  latlngs = latlngs[0];
                }
              }
              //var astColor = '#b175fb';
              var astColor = '#1cc7bd';
              var astVulner = 'No registrado';
              var astPin = 'img/pin-green.svg';
              /*if ( feature.vulnera_urb ) {
                astColor = $scope.astVulnera[feature.vulnera_urb].color;
                astvulner = $scope.astVulnera[feature.vulnera_urb].name;
                astPin = $scope.astVulnera[feature.vulnera_urb].icon;
              }*/
              //Popup
              var astPopup = '<div class="popup-header">'+
              '<div class="popup-ast-nombre">'+feature.nombre +"</div>"+
              '<div class="popup-ast-nombre-otro">'+feature.nombre_otro +"</div>"+
              '</div>'+
              '<ul class="popup-body">'+
              '<li><label>Año de creación</label><div class="popup-value">'+
              feature.y_creacion+'<div class="popup-value"></li>'+
              '<!--<li><label>Vulnerabilidad</label><div class="popup-value" style="color:'+astColor+'">'+
              feature.vulnera_urb+'<div class="popup-value"></li>'+
              '<li><label>Número estimado de personas</label><div class="popup-value">'+
              feature.estim_personas_ajust+'<div class="popup-value"></li>-->'+
              '<li><label>Número estimado de viviendas</label><div class="popup-value">'+
              feature.nro_viviendas+'<div class="popup-value"></li>'+
              '</ul><div class="popup-footer"><a href="#">Click para ver más detalles</a></div>';

              var polygon = L.polygon(latlngs, {color: astColor}).bindPopup(astPopup).addTo(map);

              $scope.asentamientos_layers.push(polygon);
              //console.log(feature);
              //Custom icons for polygons
              var astIcon = $scope.mapIcon();
              astIcon.iconUrl = astPin;
              /*El cálculo de centroides de los polígonos deja el sistema muy lento, se generan datos y se cargan a la planilla*/
              //var astBounds = polygon.getBounds();// Verificar que bounds no esté vacío: .getCenter();
              if (feature.cent_lat && feature.cent_long) {
                var astMarker = L.marker([feature.cent_lat,feature.cent_long], {icon: L.icon(astIcon)}).bindPopup(astPopup).addTo(map);
                $scope.asentamientos_layers.push(astMarker);
              }
            });
            document.getElementById("filter-total").innerHTML = CkanService.asentamientosActivos.length;
            document.getElementById("spinner").style.display = "none";
            //$scope.hideOffScreenPins();
          });
        }
        $scope.toggleFilters = function() {
          if (document.getElementById("filters").style.display == "none") {
            document.getElementById("filters").style.display = 'block';
          }
          else {
            document.getElementById("filters").style.display = 'none';
          }
        }
        $scope.filterA_o = function(a_o){
          if ( $scope.filters.a_o[a_o] == true ){
            if ( a_o == 'uno' ){
              $scope.filters.a_o.ocho = false;
            }
            else {
              $scope.filters.a_o.uno = false;
            }
          }
        }
        $scope.filterChange = function(totalDiv, sumar){
          console.log(totalDiv+': '+sumar);
          if (sumar) {
            document.getElementById(totalDiv).textContent = parseInt(document.getElementById(totalDiv).textContent) + 1;
            document.getElementById('filters-applied').textContent = parseInt(document.getElementById('filters-applied').textContent) + 1;
          }
          else {
            document.getElementById(totalDiv).textContent = parseInt(document.getElementById(totalDiv).textContent) - 1;
            document.getElementById('filters-applied').textContent = parseInt(document.getElementById('filters-applied').textContent) - 1;
          }
        }
        $scope.loadDefautFilters = function(){
          $scope.filters.a_o.ocho = true;
          $scope.filters.tipo.urbano = true;
          $scope.filters.tipo.rural = true;
          $scope.filters.vivendas_no.uno = true;
          $scope.filters.vivendas_no.dos = true;
          $scope.filters.vivendas_no.tres = true;
          $scope.filters.vivendas_no.cuatro = true;
          $scope.filters.p_techos_prec.cien = true;
          $scope.filters.p_techos_prec.cuarenta = true;
          $scope.filters.p_techos_prec.sesenta = true;
          $scope.filters.p_paredes_prec.cien = true;
          $scope.filters.p_paredes_prec.cuarenta = true;
          $scope.filters.p_paredes_prec.sesenta = true;
          $scope.filters.p_contelect.cien = true;
          $scope.filters.p_contelect.cuarenta = true;
          $scope.filters.p_contelect.sesenta = true;
          $scope.filters.p_c_drenaje.cien = true;
          $scope.filters.p_c_drenaje.cuarenta = true;
          $scope.filters.p_c_drenaje.sesenta = true;
          $scope.filters.p_calle_materiales.cien = true;
          $scope.filters.p_calle_materiales.cuarenta = true;
          $scope.filters.p_calle_materiales.sesenta = true;
          $scope.filters.p_acera_materiales.cien = true;
          $scope.filters.p_acera_materiales.cuarenta = true;
          $scope.filters.p_acera_materiales.sesenta = true;
          $scope.filters.alumbrado_asent = true;
          $scope.filters.basural_asent = true;
          $scope.filters.parada_asent = true;
          $scope.filters.placas_asent = true;
          $scope.filters.arbolado.cien = true;
          $scope.filters.arbolado.cincuenta = true;
        };
  }

]);
