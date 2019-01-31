export default (_xyz, layer) => () => {

  // Get table for the current zoom level.
  const table = layer.tableCurrent();

  // Return if layer should not be displayed.
  if (!layer.display) return;

  if (!table) {

    // Remove layer from map if currently drawn.
    if (layer.L) _xyz.map.removeLayer(layer.L);

    layer.loaded = false;

    return;

  }

  // Return from layer.get() if table is the same as layer table.
  if (layer.table === table && layer.loaded) return;

  // Set layer table to be table from tables array.
  layer.table = table;

  // Create filter from legend and current filter.
  const filter = layer.filter && Object.assign({}, layer.filter.legend, layer.filter.current);
  
  // Get bounds for request.
  const bounds = _xyz.ol.proj.transformExtent(_xyz.map.getView().calculateExtent(_xyz.map.getSize()), 'EPSG:3857', 'EPSG:4326');

  if (layer.xhr) {
    layer.xhr.abort();
    layer.xhr.onload = null;
  }

  // Create XHR for fetching data from middleware.
  layer.xhr = new XMLHttpRequest();
      
  // Build XHR request.
  layer.xhr.open('GET', _xyz.host + '/api/layer/cluster?' + _xyz.utils.paramString({
    locale: layer.locale,
    layer: layer.key,
    table: layer.table,
    kmeans: layer.cluster_kmeans,// * window.devicePixelRatio,
    dbscan: layer.cluster_dbscan,// * window.devicePixelRatio,
    theme: layer.style.theme && layer.style.theme.type,
    cat: layer.style.theme && layer.style.theme.field,
    size: layer.style.theme && layer.style.theme.size,
    filter: JSON.stringify(filter),
    west: bounds[0],
    south: bounds[1],
    east: bounds[2],
    north: bounds[3],
    token: _xyz.token
  }));

  layer.xhr.setRequestHeader('Content-Type', 'application/json');
  layer.xhr.responseType = 'json';
    
  // Process XHR onload.
  layer.xhr.onload = e => {

    if (layer.loader) layer.loader.style.display = 'none';

    // Check for existing layer and remove from map.
    if (layer.L) _xyz.map.removeLayer(layer.L);
           
    // Data is returned and the layer is still current.
    if (e.target.status !== 200 || !layer.display) return;

    if (layer.attribution) _xyz.attribution.set(layer.attribution);
    
    const cluster = e.target.response;

    const param = {
      max_size:
        cluster.reduce((max_size, f) => Math.max(max_size, f.properties.size), 0)
    };

      // Create cat array for graduated theme.
    if (layer.style.theme && layer.style.theme.type === 'graduated') {
      layer.style.theme.cat_arr = Object.entries(layer.style.theme.cat).sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
    }
    
    // Add cluster as VectorLayer with lots of Point features.
    const features = cluster.map(f => new _xyz.ol.Feature({
      geometry: new _xyz.ol.geom.Point(_xyz.ol.proj.fromLonLat([f.geometry.coordinates[0], f.geometry.coordinates[1]], 'EPSG:3857')),
      properties: f.properties
    }));
    layer.L = new _xyz.ol.layer.Vector({
      source: new _xyz.ol.source.Vector({ features: features }),
      style: feature => _xyz.utils.convertStyleToOpenLayers(applyMarkerStyle(feature), feature)
    });
    _xyz.map.addLayer(layer.L);

    /**
    layer.L = _xyz.L.geoJson(cluster, {
      pointToLayer: (point, latlng) => {
      **/
        
    let applyMarkerStyle = (point) => {
      {
        const latlng = undefined;  // dummy
        param.marker = layer.style.marker;

        // Set tooltip for desktop if corresponding layer has hover property.
        // let tooltip = (layer.style.theme && layer.style.theme.hover && _xyz.view.mode === 'desktop') || false;

        if(point.get('properties').size > 1) param.marker = layer.style.markerMulti;

        // Return marker if no theme is set.
        if (!layer.style.theme) return marker(latlng, layer, point, param);


        // Categorized theme
        if (layer.style.theme.type === 'categorized') {

          // Get cat style from theme if cat is defined.
          param.cat_style = layer.style.theme.cat[point.get('properties').cat] || {};

          // Assign marker from base & cat_style.
          param.marker = Object.assign({}, param.marker, param.cat_style);

          return marker(latlng, layer, point, param);
        }

        // Graduated theme.
        if (layer.style.theme.type === 'graduated') {

          param.cat_style = {};
    
          // Iterate through cat array.
          for (let i = 0; i < layer.style.theme.cat_arr.length; i++) {
    
            // Break iteration is cat value is below current cat array value.
            if (point.get('properties').cat < parseFloat(layer.style.theme.cat_arr[i][0])) break;
    
            // Set cat_style to current cat style after value check.
            param.cat_style = layer.style.theme.cat_arr[i][1];
          }
  
          // Assign marker from base & cat_style.
          param.marker = Object.assign({}, param.marker, param.cat_style);

          return marker(latlng, layer, point, param);
        }


        // Competition theme.
        if (layer.style.theme.type === 'competition') {

          // Set counter for point to 0.
          let size = point.get('properties').size;

          // Create a new cat_style with an empty layers object to store the competition layers.
          param.cat_style = {
            layers: {}
          };

          // Iterate through cats in competition theme.
          //Object.keys(point.get('properties').cat).forEach(comp => {
          Object.entries(point.get('properties').cat).sort((a, b) => a[1] - b[1]).forEach(comp => {

            // Check for the competition cat in point properties.
            if (layer.style.theme.cat[comp[0]]) {
              
              // Add a cat layer to the marker obkject.
              // Calculate the size of the competition layer.
              // Competition layer added first must be largest.
              param.cat_style.layers[size / point.get('properties').size] = layer.style.theme.cat[comp[0]].fillColor;

            }
            
            // Reduce the current size by the size of layer just added to marker.
            size -= comp[1];

          });

          // Assign marker from base & cat_style.
          param.marker = Object.assign({}, param.marker, param.cat_style);

          return marker(latlng, layer, point, param);
        }
            
      }
    };

    /**
      .on('click', e => {
        let
          count = e.layer.feature.properties.count,
          lnglat = e.layer.feature.geometry.coordinates;
    
        const xhr = new XMLHttpRequest();
      
        xhr.open('GET', _xyz.host + '/api/location/select/cluster?' + _xyz.utils.paramString({
          locale: _xyz.locale,
          layer: layer.key,
          table: layer.table,
          filter: JSON.stringify(layer.filter.current),
          count: count > 99 ? 99 : count,
          lnglat: lnglat,
          token: _xyz.token
        }));
    
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.responseType = 'json';
      
        xhr.onload = e => {
      
          if (e.target.status !== 200) return;
        
          let cluster = e.target.response;
    
          if (cluster.length > 1) return _xyz.locations.select_list(cluster, lnglat, layer);
      
          if (cluster.length === 1) return _xyz.locations.select({
            locale: layer.locale,
            layer: layer.key,
            table: layer.table,
            id: cluster[0].id,
            marker: cluster[0].lnglat,
            edit: layer.edit
          });
      
        };
      
        xhr.send();
      })
      .addTo(_xyz.map);
    **/

    function marker(latlng, layer, point, param){

      return param;

      /**
      param.icon = _xyz.utils.svg_symbols(param.marker);

      // Define iconSize base on the point size in relation to the max_size.
      let iconSize = layer.cluster_logscale ?
        point.get('properties').count === 1 ?
          layer.style.markerMin :
          layer.style.markerMin + layer.style.markerMax / Math.log(param.max_size) * Math.log(point.get('properties').size) :
        point.get('properties').count === 1 ?
          layer.style.markerMin :
          layer.style.markerMin + layer.style.markerMax / param.max_size * point.get('properties').size;

      // return new _xyz.ol.geom.Point(_xyz.ol.proj.fromLonLat(latlng));
      return _xyz.L.marker(latlng, {
        pane: layer.key,
        // offset base on size draws bigger cluster first.
        zIndexOffset: parseInt(1000 - 1000 / param.max_size * point.get('properties').size),
        icon: _xyz.L.icon({
          iconUrl: param.icon,
          iconSize: iconSize
        }),
        interactive: (layer.qID) ? true : false
      });
      **/
    }

  };
    
  layer.xhr.send();

};