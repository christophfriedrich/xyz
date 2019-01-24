import _xyz_instance from '../_xyz.mjs';

import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';

/*
import L from 'leaflet';

import 'leaflet.vectorgrid';

import * as utils from '../utils/_utils.mjs';

import assignBtn from './src/assignBtn.mjs';

import getWorkspace from './src/getWorkspace.mjs';

import attribution from './src/attribution.mjs';

import _layer from './src/layer/_layer.mjs';

import _location from './src/location/_location.mjs';

import _draw from './src/draw/_draw.mjs';

import loadLocale from './src/loadLocale.mjs';

import locate from './src/locate.mjs';
*/
import init from './src/init.mjs';

export default () => {
    
  const _xyz = _xyz_instance();

  _xyz.ol = {};
  _xyz.ol.Map = Map;
  _xyz.ol.View = View;
  _xyz.ol.TileLayer = TileLayer;
  _xyz.ol.XYZ = XYZ;


  /*
  _xyz.L = L;

  _xyz.utils = utils;

  assignBtn(_xyz);

  attribution(_xyz);

  getWorkspace(_xyz);

  _layer(_xyz);

  _location(_xyz);

  _draw(_xyz);

  loadLocale(_xyz);

  locate(_xyz);
  */
  init(_xyz);

  return _xyz;

};