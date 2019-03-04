pmb_im.controllers.controller('ChartsController',
['$scope','$state','CkanService','$ionicScrollDelegate',
function($scope,$state,CkanService,$ionicScrollDelegate) {

  $scope.dataOrMapButtonText = "Ver mapa";
  $scope.total_people = 0;
  $scope.total_stablishments = 0;
  $scope.total_houses = 0;
  $scope.area = "";
  $scope.filters = {};
  $scope.colors = [];
  //Número viviendas
  $scope.porcentajeMenosCiencuentaViviendas = 0;
  $scope.porcentajeEntreCiencuentaCienViviendas = 0;
  $scope.porcentajeEntreCienDoscientasViviendas = 0;
  $scope.porcentajeMasDoscientasViviendas = 0;
  //porcentaje techos precarios
  $scope.porcentajeMenosCuarentaTechosPrecarios = 0;
  $scope.porcentajeEntreCuarentaSesentaTechosPrecarios = 0;
  $scope.porcentajeMasSesentaTechosPrecarios = 0;
  //porcentaje contadores eléctricos
  $scope.porcentajeMenosCuarentaContadoresElectricos = 0;
  $scope.porcentajeEntreCuarentaSesentaContadoresElectricos = 0;
  $scope.porcentajeMasSesentaContadoresElectricos = 0;
  //porcentaje zanjas
  $scope.porcentajeMenosCuarentaZanjas = 0;
  $scope.porcentajeEntreCuarentaSesentaZanjas = 0;
  $scope.porcentajeMasSesentaZanjas = 0

  //porcentaje alumbrado
  $scope.porcentajeAlumbradoSi = 0;
  $scope.porcentajeAlumbradoNo = 0;
  //porcentaje alumbrado
  $scope.porcentajeBasuralSi = 0;
  $scope.porcentajeBasuralNo = 0;

  $scope.$on("$ionicView.beforeEnter", function() {
    if(CkanService.filtrosActivos!=null){
      $scope.filters = CkanService.filtrosActivos;
    }else{
      $scope.filters.a_o = {uno: false, ocho: true};
    }
    document.getElementById("spinner").style.display = "block";
    if(CkanService.asentamientosActivos){
      $scope.setChartsData();
    }else{
      //Si todavía no cargué nada traigo todo 2018 por defecto
      CkanService.getAllData("2018").then(function (response) {
        CkanService.asentamientosActivos = response;
        $scope.setChartsData();
      });
    }
  });

  /** FILTERS JS */
  $scope.submitFilters = function(){
    //// TODO: $scope.filters.a_o empty
    if ( !$scope.filters.hasOwnProperty('a_o') ) {
      $scope.filters['a_o'] = {ocho: true};
    }
    document.getElementById("spinner").style.display = "block";
    console.log($scope.filters);
    CkanService.getData($scope.filters).then(function (asentamientos) {
      CkanService.asentamientosActivos = asentamientos;
      CkanService.filtrosActivos = $scope.filters;
      //CkanService.filtrosActivos = $scope.cloneArray($scope.filters);
      $scope.resetDataWhenFilter();
      //reload charts
      $scope.setChartsData();
    });
  };

  $scope.resetDataWhenFilter = function(){
    $scope.total_people = 0;
    $scope.total_stablishments = 0;
    $scope.total_houses = 0;
    $scope.area = "";
    //Número viviendas
    $scope.porcentajeMenosCiencuentaViviendas = 0;
    $scope.porcentajeEntreCiencuentaCienViviendas = 0;
    $scope.porcentajeEntreCienDoscientasViviendas = 0;
    $scope.porcentajeMasDoscientasViviendas = 0;
    //porcentaje techos precarios
    $scope.porcentajeMenosCuarentaTechosPrecarios = 0;
    $scope.porcentajeEntreCuarentaSesentaTechosPrecarios = 0;
    $scope.porcentajeMasSesentaTechosPrecarios = 0;
    //porcentaje contadores eléctricos
    $scope.porcentajeMenosCuarentaContadoresElectricos = 0;
    $scope.porcentajeEntreCuarentaSesentaContadoresElectricos = 0;
    $scope.porcentajeMasSesentaContadoresElectricos = 0;
    //porcentaje zanjas
    $scope.porcentajeMenosCuarentaZanjas = 0;
    $scope.porcentajeEntreCuarentaSesentaZanjas = 0;
    $scope.porcentajeMasSesentaZanjas = 0
  }

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
    if(a_o=="2018"){
      if($scope.filters.a_o.ocho == true){
        $scope.filters.a_o.uno = false;
      }else{
        $scope.filters.a_o.uno = true;
      }
    }
    if(a_o=="2011"){
      if($scope.filters.a_o.uno == true){
        $scope.filters.a_o.ocho = false;
      }else{
        $scope.filters.a_o.ocho = true;
      }
    }
    console.log($scope.filters.a_o);
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

  $scope.setAreaData = function(){
    var deptos = ["Todas","Montevideo","Artigas","Canelones","Cerro Largo","Colonia","Durazno","Flores","Florida",
                  "Lavalleja","Maldonado","Paysandú","Río Negro","Rivera","Rocha","Salto","San José","Soriano","Tacuarembó","Treinta y Tres"];
    if(CkanService.filtrosActivos){
      if(CkanService.filtrosActivos.depto){
        $scope.area = deptos[CkanService.filtrosActivos.depto];
      }else{
        $scope.area = "Todas";
      }
    }else{
      $scope.area = "Todas";
    }
  }

  $scope.getTotalAsentamientos = function(){
    if(CkanService.asentamientosActivos){
      return CkanService.asentamientosActivos.length;
    }else{
      return "";
    }
  }

  /*Charts*/
  $scope.setChartsData = function(){
    $scope.setChartsDataValues();
    $scope.setChartsHistory();
    document.getElementById("spinner").style.display = "none";
  }

  $scope.setChartsHistoryValues = function(asentamientos2018,asentamientos2011){
    //Porcentaje alumbrado
    var alumbradoSi2018 = 0;
    var alumbradoNo2018 = 0;
    var alumbradoSi2011 = 0;
    var alumbradoNo2011 = 0;
    //Porcentaje paradas
    var paradasSi2018 = 0;
    var paradasNo2018 = 0;
    var paradasSi2011 = 0;
    var paradasNo2011 = 0;
    //Porcentaje placas nombres
    var placasSi2018 = 0;
    var placasNo2018 = 0;
    var placasSi2011 = 0;
    var placasNo2011 = 0;
    //Porcentaje arbolado
    var arboladoSi2018 = 0;
    var arboladoNo2018 = 0;
    var arboladoSi2011 = 0;
    var arboladoNo2011 = 0;

    asentamientos2018.forEach(function(asentamiento,key){
      //Calcular alumbrado
      if(asentamiento.alumbrado_asent==1){
        alumbradoSi2018 += 1;
      }else{
        alumbradoNo2018 += 1;
      }
      //parada_asent
      if(asentamiento.parada_asent==1){
        paradasSi2018 += 1;
      }else{
        paradasNo2018 += 1;
      }
      //placas_asent
      if(asentamiento.placas_asent==1){
        placasSi2018 += 1;
      }else{
        placasNo2018 += 1;
      }
      //arbolado_asent
      if(asentamiento.arbolado_asent==1){
        arboladoSi2018 += 1;
      }else{
        arboladoNo2018 += 1;
      }
    });

    asentamientos2011.forEach(function(asentamiento,key){
      //Calcular alumbrado
      if(asentamiento.alumbrado_asent==1){
        alumbradoSi2011 += 1;
      }else{
        alumbradoNo2011 += 1;
      }
      //parada_asent
      if(asentamiento.parada_asent==1){
        paradasSi2011 += 1;
      }else{
        paradasNo2011 += 1;
      }
      //placas_asent
      if(asentamiento.placas_asent==1){
        placasSi2011 += 1;
      }else{
        placasNo2011 += 1;
      }
      //arbolado_asent
      if(asentamiento.arbolado_asent==1){
        arboladoSi2011 += 1;
      }else{
        arboladoNo2011 += 1;
      }
    });

    //alumbrado chart data
    $scope.porcentajeAlumbradoSi2018 = $scope.redondear(alumbradoSi2018*100/asentamientos2018.length);
    $scope.porcentajeAlumbradoSi2011 = $scope.redondear(alumbradoSi2011*100/asentamientos2011.length);

    //paradas chart data
    $scope.porcentajeParadasSi2018 = $scope.redondear(paradasSi2018*100/asentamientos2018.length);
    $scope.porcentajeParadasSi2011 = $scope.redondear(paradasSi2011*100/asentamientos2011.length);

    //placas
    $scope.porcentajePlacasSi2018 = $scope.redondear(placasSi2018*100/asentamientos2018.length);
    $scope.porcentajePlacasSi2011 = $scope.redondear(placasSi2011*100/asentamientos2011.length);

    //arbolado
    $scope.porcentajeArboladoSi2018 = $scope.redondear(arboladoSi2018*100/asentamientos2018.length);
    $scope.porcentajeArboladoNo2018 = $scope.redondear(arboladoNo2018*100/asentamientos2018.length);
    $scope.porcentajeArboladoSi2011 = $scope.redondear(arboladoSi2011*100/asentamientos2011.length);
    $scope.porcentajeArboladoNo2011 = $scope.redondear(arboladoNo2011*100/asentamientos2011.length);
  }

  $scope.setChartsHistory = function(){
    //Lo primero es saber que datos ya tengo cargados para cargar los del otro año
    console.log("La data cargada pertenece a "+CkanService.lastLoadedDataYear);
    var yearToLoad = "2011";
    var asentamientos2018 = CkanService.asentamientosActivos;
    var asentamientos2011 = null;
    if(CkanService.lastLoadedDataYear=="2011"){
      yearToLoad = "2018";
      asentamientos2011 = CkanService.asentamientosActivos;
      asentamientos2018 = null;
    }
    //Cargo el año que me falta
    if(Object.keys($scope.filters).length > 0){
      //Hay filtros activos
      $scope.filters['a_o'] = {ocho: false, uno: false};
      //Hay filtros, entonces cargo la data para el año que falta pero con esos filtros
      //Invierto el año en los filtros
      if(yearToLoad=="2018"){
        $scope.filters.a_o.uno=false;
        $scope.filters.a_o.ocho=true;
      }
      if(yearToLoad=="2011"){
        $scope.filters.a_o.uno=true;
        $scope.filters.a_o.ocho=false;
      }
      CkanService.getData($scope.filters).then(function (response) {
        $scope.filters.a_o = {};
        if(yearToLoad=="2018"){
          //Invierto el año en los filtros para que queden igual de nuevo
          $scope.filters.a_o.uno=true;
          $scope.filters.a_o.ocho=false;
          asentamientos2018 = response;
        }
        if(yearToLoad=="2011"){
          $scope.filters.a_o.uno=false;
          $scope.filters.a_o.ocho=true;
          asentamientos2011 = response;
        }
        $scope.setChartsHistoryValues(asentamientos2018,asentamientos2011);
      });
    }else{
      //No hay filtros, entonces cargo la data total para el año que falta
      CkanService.getAllData(yearToLoad).then(function (response) {
        if(yearToLoad=="2018"){
          asentamientos2018 = response;
        }
        if(yearToLoad=="2011"){
          asentamientos2011 = response;
        }
        $scope.setChartsHistoryValues(asentamientos2018,asentamientos2011);
      });
    }
  }

  $scope.setChartsDataValues = function(){
    $scope.setAreaData();
    var cantidadViviendas = 0;
    var cantidadPersonas = 0;
    //Número de viviendas
    var menosDeCiencuentaViviendas = 0;
    var entreCinquentaCienViviendas = 0;
    var entreCienDoscientasViviendas = 0;
    var masDeDocientasViviendas = 0;
    //Porcentaje de techos precarios
    var menosCuarentaTechosPrecarios = 0;
    var entreCuarentaSesentaTechosPrecarios = 0;
    var masSesentaTechosPrecarios = 0;
    //Porcentaje de paredes precarias
    var menosCuarentaParedesPrecarios = 0;
    var entreCuarentaSesentaParedesPrecarios = 0;
    var masSesentaParedesPrecarios = 0;
    //Porcentaje de suelos precarias
    var menosCuarentaSuelosPrecarios = 0;
    var entreCuarentaSesentaSuelosPrecarios = 0;
    var masSesentaSuelosPrecarios = 0;
    //Porcentaje de contadores eléctricos
    var menosCuarentaContadoresElectricos = 0;
    var entreCuarentaSesentaContadoresElectricos = 0;
    var masSesentaContadoresElectricos = 0;
    //Porcentaje de zanjas
    var menosCuarentaZanjas = 0;
    var entreCuarentaSesentaZanjas = 0;
    var masSesentaZanjas = 0;

    //Porcentaje alumbrado
    var alumbradoSi = 0;
    var alumbradoNo = 0;
    //Porcentaje basurales
    var basuralSi = 0;
    var basuralNo = 0;
    //Porcentaje paradas
    var paradasSi = 0;
    var paradasNo = 0;
    //Porcentaje placas nombres
    var placasSi = 0;
    var placasNo = 0;
    //Porcentaje arbolado
    var arboladoSi = 0;
    var arboladoNo = 0;

    console.log(CkanService.asentamientosActivos);
    CkanService.asentamientosActivos.forEach(function(asentamiento,key){

      //Total personas
      cantidadPersonas += Number(asentamiento.estim_personas_ajust);

      //Calcular número de viviendas por asentamiento y total
      //O asentamiente así hacemos el código inclusive
      //Maldito nando
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

      //Calcular teches precaries
      if(asentamiento.p_techos_prec<40){
        menosCuarentaTechosPrecarios += 1;
      }
      if(asentamiento.p_techos_prec>=40 && asentamiento.p_techos_prec<=60){
        entreCuarentaSesentaTechosPrecarios += 1;
      }
      if(asentamiento.p_techos_prec>60){
        masSesentaTechosPrecarios += 1;
      }

      //Calcular paredes precaries
      if(asentamiento.p_paredes_prec<40){
        menosCuarentaParedesPrecarios += 1;
      }
      if(asentamiento.p_paredes_prec>=40 && asentamiento.p_paredes_prec<=60){
        entreCuarentaSesentaParedesPrecarios += 1;
      }
      if(asentamiento.p_paredes_prec>60){
        masSesentaParedesPrecarios += 1;
      }

      //Calcular suelos precaries
      /*Comentado porque no existe en los datos
      if(asentamiento.p_suelos_prec<40){
        menosCuarentaSuelosPrecarios += 1;
      }
      if(asentamiento.p_suelos_prec>=40 && asentamiento.p_suelos_prec<=60){
        entreCuarentaSesentaSuelosPrecarios += 1;
      }
      if(asentamiento.p_suelos_prec>60){
        masSesentaSuelosPrecarios += 1;
      }*/

      //Calcular contadores eléctricos
      if(asentamiento.p_contelect<40){
        menosCuarentaContadoresElectricos += 1;
      }
      if(asentamiento.p_contelect>=40 && asentamiento.p_contelect<=60){
        entreCuarentaSesentaContadoresElectricos += 1;
      }
      if(asentamiento.p_contelect>60){
        masSesentaContadoresElectricos += 1;
      }

      //Calcular zanjas
      if(asentamiento.p_c_drenaje<40){
        menosCuarentaZanjas += 1;
      }
      if(asentamiento.p_c_drenaje>=40 && asentamiento.p_c_drenaje<=60){
        entreCuarentaSesentaZanjas += 1;
      }
      if(asentamiento.p_c_drenaje>60){
        masSesentaZanjas += 1;
      }

      //Calcular alumbrado
      if(asentamiento.alumbrado_asent==1){
        alumbradoSi += 1;
      }else{
        alumbradoNo += 1;
      }

      //basurales
      if(asentamiento.basural_asent==1){
        basuralSi += 1;
      }else{
        basuralNo += 1;
      }

      //parada_asent
      if(asentamiento.parada_asent==1){
        paradasSi += 1;
      }else{
        paradasNo += 1;
      }

      //placas_asent
      if(asentamiento.placas_asent==1){
        placasSi += 1;
      }else{
        placasNo += 1;
      }

      //arbolado_asent
      if(asentamiento.arbolado_asent==1){
        arboladoSi += 1;
      }else{
        arboladoNo += 1;
      }

      //Total viviendas
      cantidadViviendas += Number(asentamiento.nro_viviendas);
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

    //techos precarios chart data
    $scope.porcentajeMenosCuarentaTechosPrecarios = $scope.redondear(menosCuarentaTechosPrecarios*100/$scope.total_stablishments);
    $scope.porcentajeEntreCuarentaSesentaTechosPrecarios = $scope.redondear(entreCuarentaSesentaTechosPrecarios*100/$scope.total_stablishments);
    $scope.porcentajeMasSesentaTechosPrecarios = $scope.redondear(masSesentaTechosPrecarios*100/$scope.total_stablishments);
    $scope.techosLabels = ["< 40", "40 - 60", "> 60"];
    $scope.techosData = [menosCuarentaTechosPrecarios, entreCuarentaSesentaTechosPrecarios, masSesentaTechosPrecarios];

    //paredes precarios chart data
    $scope.porcentajeMenosCuarentaParedesPrecarios = $scope.redondear(menosCuarentaParedesPrecarios*100/$scope.total_stablishments);
    $scope.porcentajeEntreCuarentaSesentaParedesPrecarios = $scope.redondear(entreCuarentaSesentaParedesPrecarios*100/$scope.total_stablishments);
    $scope.porcentajeMasSesentaParedesPrecarios = $scope.redondear(masSesentaParedesPrecarios*100/$scope.total_stablishments);
    $scope.paredesLabels = ["< 40", "40 - 60", "> 60"];
    $scope.paredesData = [menosCuarentaParedesPrecarios, entreCuarentaSesentaParedesPrecarios, masSesentaParedesPrecarios];

    //Suelos precarios
    /*Comentado porque no está en los datos del CKAN
    $scope.porcentajeMenosCuarentaSuelosPrecarios = $scope.redondear(menosCuarentaSuelosPrecarios*100/$scope.total_stablishments);
    $scope.porcentajeEntreCuarentaSesentaSuelosPrecarios = $scope.redondear(entreCuarentaSesentaSuelosPrecarios*100/$scope.total_stablishments);
    $scope.porcentajeMasSesentaSuelosPrecarios = $scope.redondear(masSesentaSuelosPrecarios*100/$scope.total_stablishments);
    $scope.suelosLabels = ["< 40", "40 - 60", "> 60"];
    $scope.suelosData = [menosCuarentaSuelosPrecarios, entreCuarentaSesentaSuelosPrecarios, masSesentaSuelosPrecarios];
    */

    //contadores eléctricos chart data
    $scope.porcentajeMenosCuarentaContadoresElectricos = $scope.redondear(menosCuarentaContadoresElectricos*100/$scope.total_stablishments);
    $scope.porcentajeEntreCuarentaSesentaContadoresElectricos = $scope.redondear(entreCuarentaSesentaContadoresElectricos*100/$scope.total_stablishments);
    $scope.porcentajeMasSesentaContadoresElectricos = $scope.redondear(masSesentaContadoresElectricos*100/$scope.total_stablishments);
    $scope.contadoresLabels = ["< 40", "40 - 60", "> 60"];
    $scope.contadoresData = [menosCuarentaContadoresElectricos, entreCuarentaSesentaContadoresElectricos, masSesentaContadoresElectricos];

    //zanjas drenaje chart data
    $scope.porcentajeMenosCuarentaZanjas = $scope.redondear(menosCuarentaZanjas*100/$scope.total_stablishments);
    $scope.porcentajeEntreCuarentaSesentaZanjas = $scope.redondear(entreCuarentaSesentaZanjas*100/$scope.total_stablishments);
    $scope.porcentajeMasSesentaZanjas = $scope.redondear(masSesentaZanjas*100/$scope.total_stablishments);
    $scope.zanjasLabels = ["< 40", "40 - 60", "> 60"];
    $scope.zanjasData = [menosCuarentaZanjas, entreCuarentaSesentaZanjas, masSesentaZanjas];

    //alumbrado chart data
    $scope.porcentajeAlumbradoSi = $scope.redondear(alumbradoSi*100/$scope.total_stablishments);
    $scope.porcentajeAlumbradoNo = $scope.redondear(alumbradoNo*100/$scope.total_stablishments);
    $scope.alumbradoLabels = ["Si", "No"];
    $scope.alumbradoData = [alumbradoSi, alumbradoNo];

    //basural chart data
    $scope.porcentajeBasuralSi = $scope.redondear(basuralSi*100/$scope.total_stablishments);
    $scope.porcentajeBasuralNo = $scope.redondear(basuralNo*100/$scope.total_stablishments);
    $scope.basuralLabels = ["Si", "No"];
    $scope.basuralData = [basuralSi, basuralNo];

    //paradas chart data
    $scope.porcentajeParadasSi = $scope.redondear(paradasSi*100/$scope.total_stablishments);
    $scope.porcentajeParadasNo = $scope.redondear(paradasNo*100/$scope.total_stablishments);
    $scope.paradasLabels = ["Si", "No"];
    $scope.paradasData = [paradasSi, paradasNo];

    //placas
    $scope.porcentajePlacasSi = $scope.redondear(placasSi*100/$scope.total_stablishments);
    $scope.porcentajePlacasNo = $scope.redondear(placasNo*100/$scope.total_stablishments);
    $scope.placasLabels = ["Si", "No"];
    $scope.placasData = [placasSi, placasNo];

    //arbolado
    $scope.porcentajeArboladoSi = $scope.redondear(arboladoSi*100/$scope.total_stablishments);
    $scope.porcentajeArboladoNo = $scope.redondear(arboladoNo*100/$scope.total_stablishments);
    $scope.arboladoLabels = ["Si", "No"];
    $scope.arboladoData = [arboladoSi, arboladoNo];

    //Colores
    $scope.colors = ['#0092dd', '#1cc7bd', '#feb429', '#c85757'];
  }

  $scope.redondear = function(value){
    return Math.round( value * 10 ) / 10;
  }

  $scope.switchStates = function(){
    $state.go("app.map");
  }

  $scope.cloneArray = function(obj){
    if (Object.prototype.toString.call(obj) === '[object Array]') {
        var out = [], i = 0, len = obj.length;
        for ( ; i < len; i++ ) {
            out[i] = arguments.callee(obj[i]);
        }
        return out;
    }
    if (typeof obj === 'object') {
        var out = {}, i;
        for ( i in obj ) {
            out[i] = arguments.callee(obj[i]);
        }
        return out;
    }
    return obj;
  }

}]);
