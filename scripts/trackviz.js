/// <reference path="app.ts" />
var trackvizClass = (function () {
    function trackvizClass(map, gpxFile) {
        this.isMoving = false;
        var self = this;
        self.map = map;
        self.gpxTrack = new L.GPX(gpxFile, { async: true });
        self.gpxTrack.on('loaded', function (e) {
            self.trackPoints = self.gpxTrack.get_trackpoints();
            $.grep(self.gpxTrack.getLayers().shift().getLayers(), function (e) {
                return typeof e.getLatLngs == "function";
            }).shift().bindLabel("", conf.trackLabelOptions);
            self.gpxTrack.on('mousemove', function (e) {
                var trackPoint = self.findNearestTrackPoint(e.latlng.lat, e.latlng.lng);
                //TODO: refactor time formating, take care of timezone support
                var date = trackPoint.meta.time;
                var month = date.getMonth() + 1;
                $(".trackTooltip").html('<p>Time: ' +
                    date.getDate() + '.' + month + '.' + date.getFullYear() +
                    ' ' + date.getHours() + ':' + date.getMinutes() +
                    '</p><p>Height: ' + trackPoint.meta.ele + '</p>');
            });
            self.gpxTrack.on('click', function (e) {
                self.moveTo(self.findNearestTrackPoint(e.latlng.lat, e.latlng.lng));
            });
            self.currentMarker = L.Marker.movingMarker(self.trackPoints, conf.movingDuration, {
                icon: L.ExtraMarkers.icon(conf.currentMarkerIconOptions),
            }).addTo(self.map);
            self.map.fitBounds(self.gpxTrack.getBounds(), conf.boundOptions);
        }).addTo(self.map);
    }
    trackvizClass.prototype.moveTo = function (destination) {
        var self = this;
        if (!self.currentMarker.isRunning()) {
            var currentTrackPoint = self.findNearestTrackPoint(self.currentMarker.getLatLng().lat, self.currentMarker.getLatLng().lng);
            var currentIndex = self.trackPoints.indexOf(currentTrackPoint);
            var destinationIndex = self.trackPoints.indexOf(destination);
            var track = self.trackPoints.slice(0);
            if (currentIndex < destinationIndex) {
                track = track.slice(currentIndex, destinationIndex + 1);
            }
            else {
                track = track.slice(destinationIndex, currentIndex + 1).reverse();
            }
            self.currentMarker.initialize(track, conf.movingDuration);
            self.currentMarker.start();
        }
    };
    trackvizClass.prototype.stopMoving = function () {
        var self = this;
        self.currentMarker.pause();
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
        ]).bindLabel("", conf.trackLabelOptions).addTo(self.map);
    };
    trackvizClass.prototype.getTrackPointByLatlng = function (latlng) {
        var self = this;
        return $.grep(self.trackPoints, function (e) {
            return (e.lat == latlng.lat && e.lng == latlng.lng);
        }).shift();
    };
    trackvizClass.prototype.findNearestTrackPoint = function (lat, lng) {
        var self = this;
        var nearest = self.getTrackPointByLatlng(L.latLng(lat, lng));
        if (typeof nearest !== "undefined")
            return nearest;
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
    return trackvizClass;
})();
