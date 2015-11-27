var configClass = (function () {
    function configClass() {
        this.mapId = "map";
        this.gpxFile = "data/track.gpx";
        this.boundOptions = {
            paddingBottomRight: L.point(200, 10),
            paddingTopLeft: L.point(10, 10),
        };
        this.labelOptions = {
            className: "trackTooltip",
            direction: "auto",
        };
        this.subTrackOptions = {
            color: "red",
            opacity: 1,
        };
    }
    return configClass;
})();
;;var helperClass = (function () {
    function helperClass() {
    }
    helperClass.prototype.getDistance = function (lat1, lon1, lat2, lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = this.deg2rad(lat2 - lat1); // deg2rad below
        var dLon = this.deg2rad(lon2 - lon1);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d;
    };
    helperClass.prototype.deg2rad = function (deg) {
        return deg * (Math.PI / 180);
    };
    return helperClass;
})();
;/// <reference path="app.ts" />
var trackvizClass = (function () {
    function trackvizClass(map, gpxFile) {
        this.isMoving = false;
        var self = this;
        self.map = map;
        self.gpxTrack = new L.GPX(gpxFile, { async: true });
        self.gpxTrack.on('loaded', function (e) {
            self.trackPoints = self.gpxTrack.get_trackpoints();
            self.currentMarker = L.marker(self.trackPoints[0], {
                icon: L.divIcon({
                    className: 'leaflet-div-icon showpoint',
                    html: 'x',
                })
            }).addTo(map);
            $.grep(self.gpxTrack.getLayers().shift().getLayers(), function (e) {
                return typeof e.getLatLngs == "function";
            });
            self.gpxTrack.on('mousemove', self.updateTooltip);
            self.gpxTrack.on('click', self.moveToMousePosition);
            self.map.fitBounds(self.gpxTrack.getBounds(), conf.boundOptions);
        }).addTo(self.map);
    }
    //TODO: refactor with https://github.com/ewoken/Leaflet.MovingMarker
    trackvizClass.prototype.moveTo = function (destination) {
        var self = this;
        if (!self.isMoving) {
            self.isMoving = true;
            var currentTrackPoint = self.getTrackPointByLatlng(self.currentMarker.getLatLng());
            var trackPointIndex = self.trackPoints.indexOf(currentTrackPoint);
            var bBackwards = currentTrackPoint.meta.time > destination.meta.time ? true : false;
            (function move(bBackwards) {
                var iteration = bBackwards ? -1 : +1;
                trackPointIndex = trackPointIndex + iteration;
                currentTrackPoint = self.trackPoints[trackPointIndex];
                if ((!bBackwards && currentTrackPoint.meta.time <= destination.meta.time) ||
                    (bBackwards && currentTrackPoint.meta.time >= destination.meta.time)) {
                    self.currentMarker.setLatLng(L.latLng(currentTrackPoint.lat, currentTrackPoint.lng)).update();
                    self.movingTimer = setTimeout(function () { move(bBackwards); }, 1);
                }
                else {
                    self.isMoving = false;
                }
            })(bBackwards);
        }
    };
    trackvizClass.prototype.stopMoving = function () {
        var self = this;
        clearTimeout(self.movingTimer);
        self.isMoving = false;
    };
    trackvizClass.prototype.highlightSubTrack = function (start, end) {
        var self = this;
        var startIndex = self.trackPoints.indexOf(start);
        var endIndex = self.trackPoints.indexOf(end);
        var track = self.trackPoints.slice(startIndex, endIndex + 1);
        if (self.subTrack) {
            self.map.removeLayer(self.subTrack);
        }
        self.subTrack = new L.FeatureGroup([
            new L.Polyline(track, conf.subTrackOptions)
        ]).bindLabel("", conf.labelOptions).addTo(self.map);
    };
    trackvizClass.prototype.getTrackPointByLatlng = function (latlng) {
        var self = this;
        return $.grep(self.trackPoints, function (e) {
            return (e.lat == latlng.lat && e.lng == latlng.lng);
        }).shift();
    };
    trackvizClass.prototype.findNearestTrackPoint = function (lat, lng) {
        var self = this;
        var nearest;
        var shortestDistance = 9999;
        self.trackPoints.forEach(function (trackPoint) {
            var distance = helper.getDistance(lat, lng, trackPoint.lat, trackPoint.lng);
            if (shortestDistance > distance) {
                shortestDistance = distance;
                nearest = trackPoint;
            }
        });
        return nearest;
    };
    trackvizClass.prototype.moveToMousePosition = function (e) {
        var self = this;
        self.moveTo(self.findNearestTrackPoint(e.latlng.lat, e.latlng.lng));
    };
    trackvizClass.prototype.updateTooltip = function (e) {
        var self = this;
        var trackPoint = self.findNearestTrackPoint(e.latlng.lat, e.latlng.lng);
        //TODO: refactor time formating, take care of timezone support
        var date = trackPoint.meta.time;
        var month = date.getMonth() + 1;
        $(".trackTooltip").html('<p>Time: ' +
            date.getDate() + '.' + month + '.' + date.getFullYear() +
            ' ' + date.getHours() + ':' + date.getMinutes() +
            '</p><p>Height: ' + trackPoint.meta.ele + '</p>');
    };
    return trackvizClass;
})();
;/// <reference path="3rdparty/jquery.d.ts" />
/// <reference path="3rdparty/leaflet.d.ts" />
/// <reference path="3rdparty/leaflet.label.d.ts" />
/// <reference path="3rdparty/leaflet.gpx.d.ts" />
/// <reference path="definitions.ts" />
/// <reference path="config.ts" />
/// <reference path="helper.ts" />
/// <reference path="trackviz.ts" />
var foo = 'bar';
var conf = new configClass();
var helper = new helperClass();
var map = L.map(conf.mapId);
L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
    /* attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC', */
    maxZoom: 16
}).addTo(map);
var trackviz = new trackvizClass(map, conf.gpxFile);
$("#run").click(function () {
    trackviz.moveTo(trackviz.trackPoints[trackviz.trackPoints.length - 1]);
});
$("#pause").click(trackviz.stopMoving);
