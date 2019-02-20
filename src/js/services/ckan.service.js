pmb_im.services.factory('CkanService', ['$http', 'leafletData','ConfigService', function($http, leafletData, ConfigService) {

  return {
      lastPinsResponse: null,
      asentamientosActivos:null,

      getAllPolygons: function () {
          return $http.get(ConfigService.ckanAllPolygonsURL, { headers: {'Authorization': 'd7e78b6e-3eed-4d69-8387-ab0196121a51'} }).then(function (response) {
            return response.data.result.records;
          });
      },
      getPolygonsById: function (ids) {
          //return $http.get(ConfigService.ckanSQL, { headers: {'Authorization': 'd7e78b6e-3eed-4d69-8387-ab0196121a51'} });
          var activePolygons = [];
          return $http.get('polygons.json').then(function (response) {
            for (var i = 0; i < response.data.length; i++) {
              var agregar = 1;
              if(ids.indexOf( parseInt(response.data[i]['COD_AST']) ) != -1){
                activePolygons.push(response.data[i]);
              }
            }
            return activePolygons;
          });
      },
      getData: function (filters) {
        var query = "SELECT * from ";
        if (filters.a_o && filters.a_o.uno) {
          query += '"090341a0-dfba-43fd-bc82-da90394a883d" ';
        }
        else {
          //Fallback 2018
          query += '"090341a0-dfba-43fd-bc82-da90394a883d" ';
        }
        // TODO: Ver que haya filtros o devolver todo
        console.log(filters);
        if (Object.keys(filters).length) {
          query += 'where ';
          queryArr = [];
          var asentamientosActivos = [];
          for( var filterGroup in filters ){
            if(!filters.hasOwnProperty(filterGroup)) continue;
            switch (filterGroup) {
              case 'tipo':
                if (filters.tipo.urbano && filters.tipo.rural ) continue;
                // TODO: Agregar campo a planilla
                else if (filters.tipo.urbano) queryArr.push("tipo_asentamiento = 1");
                else if (filters.tipo.rural) queryArr.push("tipo_asentamiento = 2");
              break;
              case 'vivendas_no':
                var viviArr = [];
                if (filters[filterGroup].uno) viviArr.push("nro_viviendas <= 50");
                if (filters[filterGroup].dos) viviArr.push("nro_viviendas > 50 AND nro_viviendas <= 100");
                if (filters[filterGroup].tres) viviArr.push("nro_viviendas > 100 AND nro_viviendas <= 200");
                if (filters[filterGroup].cuatro) viviArr.push("nro_viviendas > 200");
                queryArr.push(viviArr.join(' OR '));
                break;
              case 'p_techos_prec':
              case 'p_paredes_prec':
              case 'vivendas_suelos':
              case 'p_contelect':
              case 'p_c_drenaje':
              var pArr = [];
              if (filters[filterGroup].cuarenta) pArr.push(filterGroup+" <= 40");
              if (filters[filterGroup].sesenta) pArr.push(filterGroup+" > 40 AND 60 <= "+filterGroup);
              if (filters[filterGroup].cien) pArr.push(filterGroup+" > 60");
              queryArr.push(pArr.join(' OR '));
              break;
              case 'entorno':
              break;

            }
          }
          query += queryArr.join(' AND ');
        }
        //var resp = $http.post(ConfigService.ckanSQL, { headers: {'Authorization': 'd7e78b6e-3eed-4d69-8387-ab0196121a51'} });
        console.log('Query -> '+query);
        return $http.post('/ckanSql', {sql: query}).then(function (response) {
          console.log(response);
          /*for (var i = 0; i < response.data.length; i++) {
            var agregar = 1;
            var ast = response.data[i];
            if (query.tipo_asentamiento && query.tipo_asentamiento != ast.tipo_asentamiento) {
              agregar = 0;
            }
            //otros Filtros

            if (agregar) asentamientosActivos.push(ast);
            console.log(asentamientosActivos);
          }*/
          return response.data.result.records;
        });
      },
      getDataById: function (id2018) {
        console.log('DATABYID');
          var url = '/ckanData';
          var params = {
            resource_id: 'a3c8a073-ce32-434b-a751-f35c7b750968',
            limit:1,
            q: id2018
          };
          console.log(params);
          return $http.post(url, params).then(function (response) {//,{withCredentials: true, headers: {'Content-Type': 'application/json', 'Authorization': 'd7e78b6e-3eed-4d69-8387-ab0196121a51'}}).then(function (response) {
            console.log("termina POST");
            console.log(response);
            return response;
          });
      },
      getAllData: function (rid) {
        console.log('ALLDATA');
          var url = '/ckanData';
          return $http.post(url, { resource_id: rid, limit:700 }).then(function (response) {//,{withCredentials: true, headers: {'Content-Type': 'application/json', 'Authorization': 'd7e78b6e-3eed-4d69-8387-ab0196121a51'}}).then(function (response) {
            return response.data.result.records;
          });
      },
      queryData: function (query) {
        console.log('DATABYQUERY');
        return $http.post('/ckanSql', {sql: query}).then(function (response) {
          console.log('BYQUERY');
          console.log(response);
          return response.data.result.records;
        });
      },
  }
}]);
