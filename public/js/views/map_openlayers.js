// if ( window.history.replaceState ) {
//   window.history.replaceState( null, null, window.location.href );
// }

_xyz().init({
  host: document.head.dataset.dir,
  //token: API token,
  map_id: 'xyz_map1',
  locale: 'GB',
  scrollWheelZoom: true,
  view: {
    lat: 51.5073,
    lng: -0.12755,
    z: 10,
  },
  bounds: {
    north: 51.686,
    east: 0.236,
    south: 51.28,
    west: -0.489
  },
  minZoom: 10,
  maxZoom: 17,
  showScaleBar: true,
  maskBounds: true,
  btnZoomIn: document.getElementById('btnZoomIn1'),
  btnZoomOut: document.getElementById('btnZoomOut1'),
  callback: Grid
});

/*
_xyz().init({
  host: document.head.dataset.dir,
  //token: API token,
  map_id: 'xyz_map1',
  locale: 'NE',
  btnZoomIn: document.getElementById('btnZoomIn1'),
  btnZoomOut: document.getElementById('btnZoomOut1'),
  callback: mvt_select
});
*/

_xyz().init({
  host: document.head.dataset.dir,
  //token: API token,
  map_id: 'xyz_map2',
  locale: 'NE',
  scrollWheelZoom: true,
  btnZoomIn: document.getElementById('btnZoomIn2'),
  btnZoomOut: document.getElementById('btnZoomOut2'),
  callback: mvt_select2
});

function LocatePopup(_xyz){

  _xyz.locate.toggle();

  _xyz2.locations.select_popup = location => {
    let container = document.getElementById('location_info_container');
    container.innerHTML = '';
    container.appendChild(location.info_table);
  };

}


function Grid(_xyz) {

  _xyz.layers.list.grid.grid_size = 'gen_female__11';
  
  _xyz.layers.list.grid.grid_color = 'gen_male__11';
  
  _xyz.layers.list.grid.grid_ratio = true;

  _xyz.layers.list.grid.show();

  _xyz.layers.list.grid.style.setLegend(document.getElementById('location_info_container1'));

}

function Legends(_xyz) {

  _xyz.layers.list.retail_points.style.setTheme('Retailer');

  _xyz.layers.list.retail_points.style.setLegend(document.getElementById('location_info_container2'));

  _xyz.layers.list.oa.style.setTheme('Population \'11');

  _xyz.layers.list.oa.style.setLegend(document.getElementById('location_info_container2'));

}

function Offices(_xyz) {

  _xyz.layers.list.offices.singleSelectOnly = true;

  _xyz.layers.list.offices.show();

  _xyz.locations.select_output = location => {
    document.getElementById('location_info_container1').innerHTML = location.infoj[1].value;
  };

}

function Offices2(_xyz) {

  _xyz.layers.list.offices.show();

  _xyz.locations.select_output = location => {
    document.getElementById('location_info_container2').innerHTML = location.infoj[1].value;
  };

}

function mvt_select(_xyz) {

  _xyz.layers.list.COUNTRIES.style.theme = null;

  _xyz.layers.list.COUNTRIES.show();

  _xyz.locations.select_popup = location => {

    let container = document.getElementById('location_info_container1');
    container.innerHTML = '';
    container.appendChild(location.info_table);
  
  };

}

function mvt_select2(_xyz) {

  _xyz.layers.list.COUNTRIES.singleSelectOnly = true;

  //_xyz.layers.list.COUNTRIES.style.theme = null;

  _xyz.layers.list.COUNTRIES.show();

  _xyz.locations.select_popup = location => {

    let container = document.getElementById('location_info_container2');
    container.innerHTML = '';
    container.appendChild(location.info_table);
  
  };

}