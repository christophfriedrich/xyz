export default (_xyz, layer) => () => {

  // Return if layer should not be displayed.
  if (!layer.display) return;

  if (layer.loaded) return;

  layer.xhr = new XMLHttpRequest();   
  
  // Create filter from legend and current filter.
  const filter = layer.filter && Object.assign({}, layer.filter.legend, layer.filter.current);
      
  layer.xhr.open('GET', _xyz.host + '/api/layer/geojson?' + _xyz.utils.paramString({
    locale: _xyz.locale,
    layer: layer.key,
    table: layer.table,
    cat: layer.style.theme && layer.style.theme.field,
    filter: JSON.stringify(filter),
    token: _xyz.token
  }));
  
  layer.xhr.setRequestHeader('Content-Type', 'application/json');
  layer.xhr.responseType = 'json';
  
  // Draw layer on load event.
  layer.xhr.onload = e => {

    // Remove layer from map if currently drawn.
    if (layer.L) _xyz.map.removeLayer(layer.L);
  
    if (e.target.status !== 200 || !layer.display) return;
        
    // Create feature collection for vector features.
    const geojson = {
      type: 'FeatureCollection',
      features: e.target.response
    };

    layer.loaded = true;

    // Create cat array for graduated theme.
    if (layer.style.theme) layer.style.theme.cat_arr = Object.entries(layer.style.theme.cat);
  
    // Add geoJSON feature collection to the map.
    const formatReader = new _xyz.ol.format.GeoJSON();
    const features = formatReader.readFeatures(geojson, {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
    layer.L = new _xyz.ol.layer.Vector({
      source: new _xyz.ol.source.Vector({ features: features }),
      style: feature => _xyz.utils.convertStyleToOpenLayers(applyLayerStyle(feature), feature)
    });
    _xyz.map.addLayer(layer.L);

    /**
      pane: layer.key,
      interactive: layer.qID ? true : false,
      pointToLayer: (point, latlng) => {
          
        let style = applyLayerStyle(point);
          
        return _xyz.L.marker(latlng, {
          pane: layer.key,
          icon: _xyz.L.icon({
            iconUrl: _xyz.utils.svg_symbols(style.marker),
            iconSize: style.marker.iconSize || 40,
            iconAnchor: style.marker.iconAnchor || [20,20]
          }),
          interactive: (layer.qID) ? true : false
        });
          
      }
    })
    **/

    if(layer.eventhandlers) {
      return;
    }

    layer.eventhandlers = {};
    
    layer.eventhandlers.mapClick = e => {
      {
        // layerFilter makes sure we only search within layer.L and not any overlapping layers
        var features = _xyz.map.getFeaturesAtPixel(e.pixel, {layerFilter: candidate => candidate == layer.L});
        
        if (!features) {
          return;
        }
        
        const id = features[0].get('id');

        if (layer.singleSelectOnly) {
          layer.selected = new Set([id]);
        } else {
          if(layer.selected.has(id)) {
            layer.selected.delete(id);
          } else {
            layer.selected.add(id);
          }
        }
          
        _xyz.locations.select({
          layer: layer.key,
          table: layer.table,
          id: id,
          marker: _xyz.ol.proj.transform(e.coordinate, 'EPSG:3857', 'EPSG:4326'),
          edit: layer.edit
        });

        // force redraw of layer style
        layer.L.setStyle(layer.L.getStyle());
      }
    };

    _xyz.map.on('click', layer.eventhandlers.mapClick);
      
    /**
      .on('mouseover', e => {
        e.layer.setStyle && e.layer.setStyle(layer.style.highlight);
      })
      .on('mouseout', e => {
        e.layer.setStyle && e.layer.setStyle(applyLayerStyle(e.layer.feature));
      })
    **/
          
    // Check whether layer.display has been set to false during the drawing process and remove layer from map if necessary.
    if (!layer.display) _xyz.map.removeLayer(layer.L);
    
  };
      
  layer.xhr.send();

  
  function applyLayerStyle(feature){

    let style = Object.assign({}, layer.style.default, layer.selected.has(feature.get('id')) ? layer.style.selected : {});

    // Return default style if no theme is set on layer.
    if (!layer.style.theme) return style;

    const theme = layer.style.theme;

    // Categorized theme.
    if (theme.type === 'categorized') {

      return Object.assign({}, style, theme.cat[feature.get('cat')] || {});
    
    }

    // Graduated theme.
    if (theme.type === 'graduated') {

      theme.cat_style = {};
    
      // Iterate through cat array.
      for (let i = 0; i < theme.cat_arr.length; i++) {
    
        // Break iteration is cat value is below current cat array value.
        if (parseFloat(feature.get('cat')) < parseFloat(theme.cat_arr[i][0])) break;
    
        // Set cat_style to current cat style after value check.
        theme.cat_style = theme.cat_arr[i][1];
    
      }
    
      // Assign style from base & cat_style.
      return Object.assign({}, style, theme.cat_style);
    
    }
    
  }

};