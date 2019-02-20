export default _xyz => {

  _xyz.locate.toggle = () => {

    _xyz.locate.active = !_xyz.locate.active;

    if (_xyz.btnLocate) _xyz.btnLocate.classList.toggle('active');

    let flyTo = true;

    // Create the geolocation marker and its layer if it doesn't exist yet.
    if (!_xyz.locate.L) {
      var geolocationMarker = new _xyz.ol.Feature({
        geometry: new _xyz.ol.geom.Point([0, 0])  // For now, initialise at coordinates [0,0]
      });
      geolocationMarker.setStyle(_xyz.utils.convertStyleToOpenLayers({marker: {type: 'geo'} }, geolocationMarker));

      /**
          iconSize: 30
      **/

      _xyz.locate.L = new _xyz.ol.layer.Vector({
        source: new _xyz.ol.source.Vector({
          features: [geolocationMarker]
        }),
        zindex: 100
      });
    }

    // Remove the geolocation marker if _xyz.locate is not active.
    if (!_xyz.locate.active) return _xyz.map.removeLayer(_xyz.locate.L);

    var marker = _xyz.locate.L.getSource().getFeatures()[0].getGeometry();
    var coords = marker.getCoordinates();
        
    // Add the geolocation marker if the latitude is not 0.
    if (coords[1] !== 0) {
      _xyz.map.addLayer(_xyz.locate.L);

      // Fly to marker location and set flyto to false to prevent map tracking.
      if (flyTo) {
        _xyz.map.getView().animate(
          { center: coords },
          { zoom: _xyz.ws.locales[_xyz.locale].maxZoom }
        );
      }
      flyTo = false;
    }

    // Create a geolocation watcher if it doesn't exist
    if (!_xyz.locate.watcher) {
      _xyz.locate.watcher = navigator.geolocation.watchPosition(
        pos => {
          
        // Log position.
          if (_xyz.log) console.log('pos: ' + [parseFloat(pos.coords.latitude), parseFloat(pos.coords.longitude)]);
                    
          // Change icon to fixed location.
          if (_xyz.btnLocate) _xyz.btnLocate.children[0].textContent = 'gps_fixed';

          // Reposition marker if _xyz.locate is active
          if (_xyz.locate.active) {
            let pos_ll = [parseFloat(pos.coords.latitude), parseFloat(pos.coords.longitude)];
            let pos_ol = _xyz.ol.proj.fromLonLat(pos_ll.reverse());
            _xyz.map.removeLayer(_xyz.locate.L);
            marker.setCoordinates(pos_ol);
            _xyz.map.addLayer(_xyz.locate.L);

            // Fly to pos_ll and set flyTo to false to prevent map tracking.
            if (flyTo) {
              _xyz.map.getView().animate(
                { center: pos_ol },
                { zoom: _xyz.ws.locales[_xyz.locale].maxZoom }
              );
            }
            flyTo = false;
          }
        },
        err => { console.error(err); },
        // optional parameter for navigator.geolocation
        {
        //enableHighAccuracy: false,
        //timeout: 3000,
        //maximumAge: 0
        }
      );
    }
  };

};