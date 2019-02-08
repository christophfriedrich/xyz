export default (_xyz, layer) => () => {

  // Get table for the current zoom level.
  const table = layer.tableCurrent();

  // Return if layer should not be displayed.
  if (!layer.display) return;

  if (!table) {

    // Remove existing layer from map.
    if (layer.L) _xyz.map.removeLayer(layer.L);  

    return layer.loaded = false;
  }

  // Return from layer.get() if table is the same as layer table
  // AND the layer is already loaded.
  if (layer.table === table && layer.loaded) return;

  // Set table to layer.table.
  layer.table = table;

  // Create filter from legend and current filter.
  const filter = layer.filter && Object.assign({}, layer.filter.legend, layer.filter.current);

  let url = _xyz.host + '/api/layer/mvt/{z}/{x}/{y}?' + _xyz.utils.paramString({
    locale: layer.locale,
    layer: layer.key,
    table: layer.table,
    properties: layer.properties,
    filter: JSON.stringify(filter),
    token: _xyz.token
  });

  /**
  let options = {
    rendererFactory: _xyz.L.svg.tile,
    interactive: (layer.qID) || false,
    pane: layer.key,
    getFeatureId: f => f.properties.id,
    vectorTileLayerStyles: {}
  };

    // set style for each layer
  options.vectorTileLayerStyles[layer.key] = applyLayerStyle;
  **/

  // Create cat array for graduated theme.
  if (layer.style.theme && layer.style.theme.type === 'graduated') {
    layer.style.theme.cat_arr = Object.entries(layer.style.theme.cat).sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
  }

  // Remove layer.
  if (layer.L) _xyz.map.removeLayer(layer.L);

  var vectorSource = new _xyz.ol.source.VectorTile({
    format: new _xyz.ol.format.MVT(),
    url: url
  });
  layer.L = new _xyz.ol.layer.VectorTile({
    source: vectorSource,
    style: feature => _xyz.utils.convertStyleToOpenLayers(applyLayerStyle(feature))
  });
  _xyz.map.addLayer(layer.L);
  
  /**
    .on('error', err => console.error(err))
  **/
      
  _xyz.map.on('render', () => {
    if (layer.loader) layer.loader.style.display = 'block';
  });

  _xyz.map.on('rendercomplete', () => {

    if (layer.loader)  layer.loader.style.display = 'none';

    if (layer.attribution) _xyz.attribution.set(layer.attribution);

    layer.loaded = true;
  });

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
  
  // MVT layers don't support the normal "select" interaction, so we have to use a workaround: get the features at the clicked pixel
  layer.eventhandlers.mapClick = event => {

    // layerFilter makes sure we only search within layer.L and not any overlapping layers
    var features = _xyz.map.getFeaturesAtPixel(event.pixel, {layerFilter: candidate => candidate == layer.L});
    
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
      dbs: layer.dbs,
      locale: layer.locale,
      layer: layer.key,
      table: layer.table,
      qID: layer.qID,
      id: id,
      marker: _xyz.ol.proj.transform(event.coordinate, 'EPSG:3857', 'EPSG:4326'),
      edit: layer.edit
    });

    // force redraw of layer style
    layer.L.setStyle(layer.L.getStyle());
  };

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

  /**
    .on('mouseover', e => {
      e.target.setFeatureStyle(e.layer.properties.id, layer.style.highlight);
    })
    .on('mouseout', e => {
      e.target.setFeatureStyle(e.layer.properties.id, applyLayerStyle);
    })
  **/

  function applyLayerStyle(properties) {

    const highlighted = layer.highlighted === properties.get('id');
    const selected = layer.selected.has(properties.get('id'));

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

      return Object.assign({}, style, theme.cat[properties.get(theme.field)] || {});

    }

    // Graduated theme.
    if (theme.type === 'graduated') {

      theme.cat_style = {};

      // Iterate through cat array.
      for (let i = 0; i < theme.cat_arr.length; i++) {

        if (!properties.get(theme.field)) return style;

        // Break iteration is cat value is below current cat array value.
        if (parseFloat(properties.get(theme.field)) < parseFloat(theme.cat_arr[i][0])) break;

        // Set cat_style to current cat style after value check.
        theme.cat_style = theme.cat_arr[i][1];

      }

      // Assign style from base & cat_style.
      return Object.assign({}, style, theme.cat_style);

    }

  }

};