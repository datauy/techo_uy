pmb_im.controllers.controller('ChartsController',
['$scope','CkanService','$ionicScrollDelegate',
function($scope,CkanService,$ionicScrollDelegate) {

  $scope.total_people = 0;
  $scope.total_stablishments = 0;
  $scope.total_houses = 0;
  $scope.area = "Durazno, Durazno";
  $scope.filters = {};
  $scope.viviendasLabels = [];
  $scope.viviendasData = [];
  $scope.colors = [];
  $scope.porcentajeMenosCiencuentaViviendas = 0;
  $scope.porcentajeEntreCiencuentaCienViviendas = 0;
  $scope.porcentajeEntreCienDoscientasViviendas = 0;
  $scope.porcentajeMasDoscientasViviendas = 0;



  $scope.$on("$ionicView.beforeEnter", function() {
    $scope.setChartsData();
  });

  /** FILTERS JS */
  $scope.submitFilters = function(){
    //// TODO: $scope.filters.a_o empty
    if ( !$scope.filters.hasOwnProperty('a_o') ) {
      $scope.filters['a_o'] = {ocho: true};
    }
    CkanService.getData($scope.filters).then(function (asentamientos) {
      CkanService.asentamientosActivos = asentamientos;
      CkanService.filtrosActivos = $scope.filters;
      //reload charts
      $scope.setChartsData();
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


  /*Charts*/
  $scope.setChartsData = function(){
    console.log(CkanService.asentamientosActivos);
    var cantidadViviendas = 0;
    var cantidadPersonas = 0;
    var menosDeCiencuentaViviendas = 0;
    var entreCinquentaCienViviendas = 0;
    var entreCienDoscientasViviendas = 0;
    var masDeDocientasViviendas = 0;
    CkanService.asentamientosActivos.forEach(function(asentamiento,key){
      cantidadPersonas += asentamiento.estim_personas_ajust;
      if(asentamiento.nro_viviendas<50){
        menosDeCiencuentaViviendas += 1;
      }
      if(asentamiento.nro_viviendas>=50 && asentamiento.nro_viviendas<100){
        entreCinquentaCienViviendas += 1;
      }
      if(asentamiento.nro_viviendas>=100 && asentamiento.nro_viviendas<=200){
        entreCienDoscientasViviendas += 1;
      }
      if(asentamiento.nro_viviendas>200){
        masDeDocientasViviendas += 1;
      }
      cantidadViviendas += asentamiento.nro_viviendas;
    })
    $scope.total_houses = cantidadViviendas;
    $scope.total_people = cantidadPersonas;
    $scope.total_stablishments = CkanService.asentamientosActivos.length;
    //Numero de viviendas
    $scope.porcentajeMenosCiencuentaViviendas = $scope.redondear(menosDeCiencuentaViviendas*100/$scope.total_stablishments);
    $scope.porcentajeEntreCiencuentaCienViviendas = $scope.redondear(entreCinquentaCienViviendas*100/$scope.total_stablishments);
    $scope.porcentajeEntreCienDoscientasViviendas = $scope.redondear(entreCienDoscientasViviendas*100/$scope.total_stablishments);
    $scope.porcentajeMasDoscientasViviendas = $scope.redondear(masDeDocientasViviendas*100/$scope.total_stablishments);
    $scope.viviendasLabels = ["< 50", "50 - 100", "100 - 200", "> 200"];
    $scope.viviendasData = [menosDeCiencuentaViviendas, entreCinquentaCienViviendas, entreCienDoscientasViviendas, masDeDocientasViviendas];
    $scope.colors = ['#0092dd', '#1cc7bd', '#feb429', '#c85757'];
  }

  $scope.redondear = function(value){
    return Math.round( value * 10 ) / 10;
  }


}]);
