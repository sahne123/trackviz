/// <reference path="definitions/jquery.d.ts" />
/// <reference path="definitions/leaflet.d.ts" />
/// <reference path="definitions/leaflet.label.d.ts" />
/// <reference path="definitions/leaflet.gpx.d.ts" />
/// <reference path="definitions/leaflet.MovingMarker.d.ts" />
/// <reference path="definitions/leaflet.extra-markers.d.ts" />
/// <reference path="definitions/moment-timezone.d.ts" />
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