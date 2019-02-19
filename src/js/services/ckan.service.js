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
        if (filters.a_o.uno) {
          query += '"a3c8a073-ce32-434b-a751-f35c7b750968" ';
        }
        else {
          query += '"a3c8a073-ce32-434b-a751-f35c7b750968" ';
        }
        // TODO: Ver que haya filtros o devolver todo
        console.log(filters);
        if (Object.keys(filters).length) {
          query += 'where ';
          var asentamientosActivos = [];
          for( var filterGroup in filters ){
            if(!filters.hasOwnProperty(filterGroup)) continue;
            switch (filterGroup) {
              case 'tipo':
              if (filters.tipo.urbano && filters.tipo.rural ) continue;
              // TODO: Agregar campo a planilla
              else if (filters.tipo.urbano) query += "tipo_asentamiento = 1 ";
              else if (filters.tipo.rural) query += "tipo_asentamiento = 2 ";
              break;
              /*case 'viviendas':
              var viviendasQuery = '';
              for( var viviendasFilter in filters.viviendas ){
              var viviendasnum = '';
              if ( viviendasFilter == 'no' ) {
              if (filters.vivendas.no.uno) viviendasnum = ''
              break;
              case 'entorno':
              break;*/

            }
          }
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
