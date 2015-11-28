/// <reference path="3rdparty/jquery.d.ts" />
/// <reference path="3rdparty/leaflet.d.ts" />
/// <reference path="3rdparty/leaflet.label.d.ts" />
/// <reference path="3rdparty/leaflet.gpx.d.ts" />
/// <reference path="3rdparty/leaflet.MovingMarker.d.ts" />
/// <reference path="3rdparty/leaflet.extra-markers.d.ts" />
/// <reference path="definitions.d.ts" />
/// <reference path="config.ts" />
/// <reference path="helper.ts" />
/// <reference path="trackviz.ts" />

var conf = new configClass();
var helper = new helperClass();

var map = L.map(conf.mapId);
L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
	/* attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC', */
	maxZoom: 16
}).addTo(map);

var trackviz = new trackvizClass(map, conf.gpxFile);

$("#run").click( function(){
	trackviz.moveTo(trackviz.trackPoints[trackviz.trackPoints.length-1]);
});

$("#pause").click(function(){
	trackviz.stopMoving();
});