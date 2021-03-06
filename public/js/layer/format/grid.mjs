import _xyz from '../../_xyz.mjs';

import L from 'leaflet';

export default function(){

  const layer = this;
  layer.loaded = false;

  // Set locale to check whether locale is still current when data is returned from backend.
  const locale = _xyz.locale;

  if(!layer.table || !layer.display)  return _xyz.layers.check(layer);

  const xhr = new XMLHttpRequest(); 
        
  // Open & send vector.xhr;
  let bounds = _xyz.map.getBounds();

  xhr.open('GET', _xyz.host + '/api/layer/grid?' + _xyz.utils.paramString({
    locale: _xyz.locale,
    layer: layer.key,
    table: layer.table,
    size: layer.grid_size,
    color: layer.grid_color,
    west: bounds.getWest(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    north: bounds.getNorth(),
    token: _xyz.token
  }));

  // Draw layer on load event.
  xhr.onload = e => {

    if (e.target.status === 200 && layer.display && locale === _xyz.locale) {

      // Check for existing layer and remove from map.
      if (layer.L) _xyz.map.removeLayer(layer.L);

      // Add geoJSON feature collection to the map.
      layer.L = new L.geoJson(processGrid(JSON.parse(e.target.responseText)), {
        pointToLayer: function (feature, latlng) {

          // Distribute size between min, avg and max.
          let size = feature.properties.size <= layer.sizeAvg ?
            7 + 7 / layer.sizeAvg * feature.properties.size :
            14 + 7 / (layer.sizeMax - layer.sizeAvg) * (feature.properties.size - layer.sizeAvg);

          // set to no value colour.
          feature.properties.hxcolor = '#C0C0C0';

          if (parseFloat(feature.properties.color)) {

            // set to min colour.
            feature.properties.hxcolor = layer.style.range[0];

            for (let i = 0; i < layer.colorBins.length; i++) {

              // Break iteration is cat value is below current cat array value.
              if (feature.properties.color < layer.colorBins[i]) break;
    
              // Set cat_style to current cat style after value check.
              feature.properties.hxcolor = layer.style.range[i + 1];
             
            }

          }

          // Return L.Marker with icon as style to pointToLayer.
          return L.marker(
            latlng,
            {
              icon: L.icon({
                iconSize: size,
                iconUrl: _xyz.utils.svg_symbols({
                  type: 'dot',
                  style: {
                    color: feature.properties.hxcolor
                  }
                })
              }),
              pane: layer.key,
              interactive: false
            });
        }
      }).addTo(_xyz.map);

      _xyz.layers.check(layer);

    }
  };
    
  xhr.send();


  function processGrid(data){
    let dots = {
      type: 'FeatureCollection',
      features: []
    };
    layer.sizeAvg = 0;
    layer.colorAvg = 0;
    data.map(function(record){

      // 0 lat
      // 1 lon
      // 2 size
      // 3 color
      if (parseFloat(record[2]) > 0) {
        record[2] = isNaN(record[2]) ? record[2] : parseFloat(record[2]);
        record[3] = isNaN(record[3]) ? record[3] : parseFloat(record[3]);

        // Check for grid_ratio
        if (layer.grid_ratio && record[3] > 0) record[3] /= record[2];

        layer.sizeAvg += parseFloat(record[2]);
        layer.colorAvg += isNaN(record[3]) ? 0 : parseFloat(record[3]);

        dots.features.push({
          'geometry': {
            'type': 'Point',
            'coordinates': [record[0],record[1]]
          },
          'type': 'Feature',
          'properties': {
            'size': parseFloat(record[2]),
            'color': isNaN(record[3]) ? record[3] : parseFloat(record[3])
          }
        });
      }
    });

    layer.sizeMin = getMath(data, 2, 'min');
    layer.sizeAvg /= dots.features.length;
    layer.sizeMax = getMath(data, 2, 'max');

    layer.colorMin = getMath(data, 3, 'min');
    layer.colorAvg /= dots.features.length;
    layer.colorMax = getMath(data, 3, 'max');

    layer.colorBins = [];

    let n = layer.style.range.length;

    for (var i = 1; i < n; i++) {

      if (i < (n / 2)) {
        layer.colorBins.push(layer.colorMin + ((layer.colorAvg - layer.colorMin) / (n / 2) * i));
      }

      if (i === (n / 2)) {
        layer.colorBins.push(layer.colorAvg);
      }

      if (i > (n / 2)) {
        layer.colorBins.push(layer.colorAvg + ((layer.colorMax - layer.colorAvg) / (n / 2) * (i - (n / 2))));
      }
      
    }


    let digits = layer.grid_ratio ? 2 : 0;
    document.getElementById('grid_legend_size__min').textContent = layer.sizeMin.toLocaleString('en-GB', {maximumFractionDigits: 0});
    if (document.getElementById('grid_legend_size__avg')) document.getElementById('grid_legend_size__avg').textContent = layer.sizeAvg.toLocaleString('en-GB', {maximumFractionDigits: 0});
    document.getElementById('grid_legend_size__max').textContent = layer.sizeMax.toLocaleString('en-GB', {maximumFractionDigits: 0});
    document.getElementById('grid_legend_color__min').textContent = layer.colorMin.toLocaleString('en-GB', {maximumFractionDigits: digits});
    if (document.getElementById('grid_legend_color__avg')) document.getElementById('grid_legend_color__avg').textContent = layer.colorAvg.toLocaleString('en-GB', {maximumFractionDigits: digits});
    document.getElementById('grid_legend_color__max').textContent = layer.colorMax.toLocaleString('en-GB', {maximumFractionDigits: digits});

    return dots;
  }

  // Apply maths function to a column in a two dimensional array of numbers.
  function getMath(arr, idx, type) {
    
    // Filter numbers from array column idx.
    let numbers = arr.filter(n => isFinite(n[idx]));
    
    // Apply math function to the filtered numbers array.
    return Math[type].apply(null, numbers.map(val => val[idx]));
  }
}