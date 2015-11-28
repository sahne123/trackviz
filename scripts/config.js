var configClass = (function () {
    function configClass() {
        this.mapId = "map";
        this.gpxFile = "data/track.gpx";
        this.boundOptions = {
            paddingBottomRight: L.point(200, 10),
            paddingTopLeft: L.point(10, 10),
        };
        this.trackLabelOptions = {
            className: "trackTooltip",
            direction: "auto",
        };
        this.currentMarkerIconOptions = {
            icon: "glyphicon-screenshot",
            prefix: "glyphicon",
            shape: "square",
            markerColor: "green-dark",
        };
        this.subTrackOptions = {
            color: "red",
            opacity: 1,
        };
    }
    return configClass;
})();
