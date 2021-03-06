import _xyz from '../../../_xyz.mjs';

export default layer => {
    
  if(!layer.display) layer.show();
    
  layer.header.classList.add('edited');
  _xyz.dom.map.style.cursor = 'crosshair';
    
  layer.edit.vertices = L.featureGroup().addTo(_xyz.map);
  layer.edit.trail = L.featureGroup().addTo(_xyz.map);
  layer.edit.path = L.featureGroup().addTo(_xyz.map);

  // Define origin outside click event.
  let origin_lnglat;
    
  _xyz.map.on('click', e => {
       
    // First point is origin.
    if(!origin_lnglat){

      // Define rectangle origin.
      origin_lnglat = [e.latlng.lng, e.latlng.lat];

      // Add circle marker to vertices layer.       
      layer.edit.vertices.addLayer(
        L.circleMarker(e.latlng, _xyz.style.defaults.vertex)
      );

      // Set mousemove event to show trail.
      _xyz.map.on('mousemove', e => {
        
        // Remove trail layer on mouse move.
        layer.edit.trail.clearLayers();

        layer.edit.trail.addLayer(
          L.rectangle(
            [[origin_lnglat[1], origin_lnglat[0]], [e.latlng.lat, e.latlng.lng]],
            _xyz.style.defaults.trail
          )
        );
      });

      return;
    }

    // Get marker for selection.
    const centre = layer.edit.trail.getBounds().getCenter();
    const marker = [centre.lng.toFixed(5), centre.lat.toFixed(5)];
                                        
    const xhr = new XMLHttpRequest();
    xhr.open('POST', _xyz.host + '/api/location/edit/draw?token=' + _xyz.token);
    xhr.setRequestHeader('Content-Type', 'application/json');
                
    xhr.onload = e => {

      layer.get();
                
      if (e.target.status !== 200) return;
                   
      _xyz.locations.select({
        layer: layer.key,
        table: layer.table,
        id: e.target.response,
        marker: marker
      });

    };
    
    // Send rectangle geometry to endpoint.
    xhr.send(JSON.stringify({
      locale: _xyz.locale,
      layer: layer.key,
      table: layer.table,
      geometry: layer.edit.trail.toGeoJSON().features[0].geometry
    }));

    _xyz.state.finish();

  });
};