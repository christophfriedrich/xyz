export default _xyz => {

  _xyz.assignBtn = params => {

    _xyz.btnZoomIn = params.btnZoomIn;

    if (_xyz.btnZoomIn) _xyz.btnZoomIn.onclick = () => {
      let z = _xyz.map.getView().getZoom() + 1;
      _xyz.map.getView().setZoom(z);
      _xyz.view.chkZoomBtn(z);
    };

    _xyz.btnZoomOut = params.btnZoomOut;

    if (_xyz.btnZoomOut) _xyz.btnZoomOut.onclick = () => {
      let z = _xyz.map.getView().getZoom() - 1;
      _xyz.map.getView().setZoom(z);
      _xyz.view.chkZoomBtn(z);
    };

    // Disable zoom button at max/min zoom for locale.
    _xyz.view.chkZoomBtn = z => {
      /* used to check against the locales specified in the serverside workspace:
      if (_xyz.btnZoomIn) _xyz.btnZoomIn.disabled = !(z < _xyz.ws.locales[_xyz.locale].maxZoom);
      if (_xyz.btnZoomOut) _xyz.btnZoomOut.disabled = !(z > _xyz.ws.locales[_xyz.locale].minZoom);
      */
      // checks against the Map's View's maxZoom and minZoom properties
      if (_xyz.btnZoomIn)  _xyz.btnZoomIn.disabled  = !(z < _xyz.map.getView().getMaxZoom());
      if (_xyz.btnZoomOut) _xyz.btnZoomOut.disabled = !(z > _xyz.map.getView().getMinZoom());
    };
  
    _xyz.btnLocate = params.btnLocate;

    if (_xyz.btnLocate) _xyz.btnLocate.onclick = _xyz.locate.toggle;

  };

};