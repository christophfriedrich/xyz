export default _xyz => {

  _xyz.init = params => {

    // Set XYZ Host.
    _xyz.host = params.host;

    if (!_xyz.host) return console.error('XYZ host not defined!');

    if (params.token) _xyz.token = params.token;

    _xyz.assignBtn(params);

    // Get workspace from XYZ host.
    // Proceed with init from callback.
    _xyz.getWorkspace(init);

    function init(){
      // Set XYZ map DOM.
      _xyz.map_dom = document.getElementById(params.map_id);

      if (!_xyz.map_dom) return console.error('XYZ map not defined!');

      // Create attribution in map DOM.
      _xyz.attribution.create();

      /**
      // Remove existing Leaflet map object.
      if (_xyz.map) _xyz.map.remove();
      */

      /**
        renderer: _xyz.L.svg(),
      */

      // Set locale from params or to first in workspace.
      _xyz.locale = _xyz.hooks.current.locale || params.locale || Object.keys(_xyz.ws.locales)[0];

      // Set locale hook.
      if (_xyz.hooks.set) _xyz.hooks.set('locale', _xyz.locale);

      // Assign params to locale.
      // This makes it possible to override client side workspace entries.
      const locale = Object.assign({}, _xyz.ws.locales[_xyz.locale], params);

      // Create OpenLayers Map object
      _xyz.map = new _xyz.ol.Map({
        target: params.map_id,
        interactions: _xyz.ol.interactionDefaults({ mouseWheelZoom: params.scrollWheelZoom || false }),
        controls: [],
        view: new _xyz.ol.View({
          // Set view if defined in workspace.
          center: _xyz.ol.proj.fromLonLat([
            _xyz.hooks.current.lng || locale.view.lng || 0,
            _xyz.hooks.current.lat || locale.view.lat || 0
          ]),
          zoom: _xyz.hooks.current.z || locale.view.z || 5,
          // Set min, max zoom and bounds.
          minZoom: locale.minZoom,
          maxZoom: locale.maxZoom,
          extent: _xyz.ol.proj.transformExtent([locale.bounds.west, locale.bounds.south, locale.bounds.east, locale.bounds.north], 'EPSG:4326', 'EPSG:3857')
        })
      });

      if(locale.showScaleBar) {
        // Add scale bar to map
        var sl = new _xyz.ol.ScaleLine();
        _xyz.map.addControl(sl);
      }

      if(locale.maskBounds) {
        // Grey out area outside bbox
        const world = [[90,180], [90,-180], [-90,-180], [-90,180]].map(c => c.reverse()); // coordinate order in OL: long,lat
        const bbox = [[locale.bounds.north,locale.bounds.east], [locale.bounds.north,locale.bounds.west], [locale.bounds.south,locale.bounds.west], [locale.bounds.south,locale.bounds.east]].map(c => c.reverse());
        // in OpenLayers the first coordinate must be repeated in the end
        world.push(world[0]);
        bbox.push(bbox[0]);
        const style = new _xyz.ol.style.Style({
          stroke: new _xyz.ol.style.Stroke({width: 1}),  // width=0 doesn't work for some reason...
          fill: new _xyz.ol.style.Fill({color: [204, 204, 204, 0.8]})  // corresponds to #cccccc
        });
        const worldWithHole = new _xyz.ol.Polygon([world, bbox]).transform('EPSG:4326', 'EPSG:3857');
        const feature = new _xyz.ol.Feature(worldWithHole);
        const source = new _xyz.ol.source.Vector({ features: [feature] });
        const layer = new _xyz.ol.layer.Vector({ source: source, style: style });
        _xyz.map.addLayer(layer);
      }

      // Check whether zoom buttons should be disabled for initial view.
      if (_xyz.view.chkZoomBtn) _xyz.view.chkZoomBtn(_xyz.map.getView().getZoom());

      // Fire viewChangeEnd after map move and zoomend
      _xyz.map.on('moveend', () => viewChangeEndTimer());
  
      // Use timeout to prevent the viewChangeEvent to be executed multiple times.
      let timer;
      function viewChangeEndTimer() {
        clearTimeout(timer);
        timer = setTimeout(viewChangeEnd, 500);
      }
  
      function viewChangeEnd() {
        // Set view hooks when method is available.
        if (_xyz.hooks.setView) _xyz.hooks.setView(_xyz.map.getCenter(), _xyz.map.getZoom());
  
        // Reload layers.
        // layer.get() will return if reload is not required.
        Object.values(_xyz.layers.list).forEach(layer => layer.get());
      }

      // Load locale.
      _xyz.loadLocale(locale);

      /**
      // Continue with callback if provided.
      if (params.callback) params.callback(_xyz);
      */

    };
  };
  

};