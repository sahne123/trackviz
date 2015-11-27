var map = L.map('map');

L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
	/* attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC', */
	maxZoom: 16
}).addTo(map);

var boundOptions = {
  paddingBottomRight: [200,10], 
  paddingTopLeft:     [10,10],
};

var labelOptions = {
	className: "trackTooltip",
	direction: "auto",
	/* offset: []  */
};

var showPoint;
var gpxTrack = new L.GPX(
  'track.gpx', 
  { 
    async: true,
  }
).on('loaded', function(e) {
  var gpx = e.target;
  trackPoints = gpx.get_trackpoints();
  
  showPoint = L.marker(trackPoints[0], {
    icon: L.divIcon({
      className: 'leaflet-div-icon showpoint',
      html: 'x',
      iconSize: 10,
    })
  }).addTo(map);
  
  $.grep(gpx.getLayers().shift().getLayers(), function(e){ 
    return typeof e.getLatLngs == "function";
	}).shift().bindLabel("", labelOptions);
   
	gpx.on('mousemove', updateTooltip);
	gpx.on('click', movetomouse);

  map.fitBounds(gpx.getBounds(), boundOptions);
}).addTo(map);

$("#run").click( function(){
  var trackPoints = gpxTrack.get_trackpoints();
	moveTo(trackPoints[trackPoints.length-1], trackPoints, showPoint);
});

$("#pause").click( function(){
  clearTimeout(moveTimer);
  ismoving=false;
});

$("#reset").click( function(){
	var trackPoints = gpxTrack.get_trackpoints();
  clearTimeout(moveTimer);
  ismoving=false;
  showPoint.setLatLng( L.latLng(trackPoints[0].lat,trackPoints[0].lng) ).update();
});

/**
 *  Könnte interessant sein: https://github.com/turban/Leaflet.Photo
 *  
 * 
 * 
 */
/*
var Esri_WorldStreetMap = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
});

var Esri_NatGeoWorldMap = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
	maxZoom: 16
});

L.tileLayer('http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 16,
	attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
}).addTo(map);
*/