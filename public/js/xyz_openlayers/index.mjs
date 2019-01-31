import _xyz_instance from '../_xyz.mjs';

import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import {defaults} from 'ol/interaction';
import * as proj from 'ol/proj';
import {ScaleLine} from 'ol/control.js';
import {Feature} from 'ol';
import {Polygon} from 'ol/geom';
import * as source from 'ol/source';
import * as style from 'ol/style';
import * as format from 'ol/format';
import * as layer from 'ol/layer';
import * as interaction from 'ol/interaction';
import * as condition from 'ol/events/condition';
import * as geom from 'ol/geom';

import * as utils from '../utils/_utils.mjs';

import assignBtn from './src/assignBtn.mjs';

import getWorkspace from './src/getWorkspace.mjs';

import attribution from './src/attribution.mjs';

import _layer from './src/layer/_layer.mjs';

/**
import _location from './src/location/_location.mjs';

import _draw from './src/draw/_draw.mjs';
**/

import loadLocale from './src/loadLocale.mjs';

/**
import locate from './src/locate.mjs';
**/
import init from './src/init.mjs';

export default () => {
    
  const _xyz = _xyz_instance();

  _xyz.ol = {};
  _xyz.ol.Map = Map;
  _xyz.ol.View = View;
  _xyz.ol.TileLayer = TileLayer;
  _xyz.ol.XYZ = XYZ;
  _xyz.ol.interactionDefaults = defaults;
  _xyz.ol.proj = proj;
  _xyz.ol.ScaleLine = ScaleLine;
  _xyz.ol.Feature = Feature;
  _xyz.ol.Polygon = Polygon;
  _xyz.ol.source = source;
  _xyz.ol.style = style;
  _xyz.ol.format = format;
  _xyz.ol.layer = layer;
  _xyz.ol.interaction = interaction;
  _xyz.ol.condition = condition;
  _xyz.ol.geom = geom;

  _xyz.utils = utils;

  assignBtn(_xyz);

  attribution(_xyz);

  getWorkspace(_xyz);

  _layer(_xyz);
  /**

  _location(_xyz);

  _draw(_xyz);
  **/

  loadLocale(_xyz);

  /**
  locate(_xyz);
  */
  init(_xyz);

  return _xyz;

};