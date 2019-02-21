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
      pointToLayer: (point, latlng) => {
          
        let style = applyLayerStyle(point);
          
        return _xyz.L.marker(latlng, {
          pane: layer.key,
          icon: _xyz.L.icon({
            iconUrl: _xyz.utils.svg_symbols(style.marker),
            iconSize: style.marker.iconSize || 40,
            iconAnchor: style.marker.iconAnchor || [20,20]  // should be [0.5, 0.5] for OpenLayers
          }),
          interactive: (layer.qID) ? true : false
        });
          
      }
    })
    **/

    // if layer isn't selectable, we don't need hover and click events
    if(layer.qID == undefined) {
      return;
    }

    // if event handlers are already defined, we shouldn't do that again
    if(layer.eventhandlers) {
      return;
    }

    // init object
    layer.eventhandlers = {};
    
    // define click handler
    layer.eventhandlers.mapClick = e => {
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
    };

    // event needs to be on the MAP, not the layer
    _xyz.map.on('click', layer.eventhandlers.mapClick);

    layer.eventhandlers.mapPointermove = event => {
      const previous = layer.highlighted;
      const features = _xyz.map.getFeaturesAtPixel(event.pixel, {layerFilter: candidate => candidate == layer.L});
      const toBeHighlighted = features != null && event.originalEvent.target.tagName == 'CANVAS';  // any features detected and directly under cursor?

      layer.highlighted = (toBeHighlighted ? features[0].get('id') : null);
      _xyz.map.getTargetElement().style.cursor = (toBeHighlighted ? 'pointer' : '');
      
      if(layer.highlighted !== previous) {
        // force redraw of layer style
        layer.L.setStyle(layer.L.getStyle());
      }
    };

    _xyz.map.on('pointermove', layer.eventhandlers.mapPointermove);
      
    // Check whether layer.display has been set to false during the drawing process and remove layer from map if necessary.
    if (!layer.display) _xyz.map.removeLayer(layer.L);
    
  };
      
  layer.xhr.send();

  
  function applyLayerStyle(feature){

    const highlighted = (layer.highlighted === feature.get('id'));
    const selected = layer.selected.has(feature.get('id'));

    let style = Object.assign(
      {},
      layer.style.default,
      highlighted ? layer.style.highlight : {},
      selected ? layer.style.selected : {},
      selected && highlighted ? layer.style.highlight : {}
    );

    style.zIndex = (highlighted && selected ? 40 : (highlighted ? 30 : (selected ? 20 : 10)));

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