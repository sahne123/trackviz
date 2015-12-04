/// <reference path="app.ts" />

class trackvizClass {
	
	public trackPoints: Array<L.trackPoint>;
	
	private currentMarker: L.MovingMarker;
	private mouseMarker: L.Marker;
	private map: L.Map;
	private gpxTrack;
	private trackPolyline: L.Polyline;
	private isMoving: boolean = false;
	private movingTimer: number;
	private subTrack: L.LayerGroup<any>;
	
	public constructor(map: L.Map, gpxFile: string) {
		var self = this;
		
		self.map = map;	
		self.gpxTrack = new L.GPX(gpxFile, {async: true});
		
		self.gpxTrack.on('loaded', function(e){
			self.trackPoints = self.gpxTrack.get_trackpoints();
			self.trackPolyline = $.grep(self.gpxTrack.getLayers().shift().getLayers(), function(e: any){
				return typeof e.getLatLngs == "function";
			}).shift();
			
			self.gpxTrack.on('click', function(e:L.LeafletMouseEvent) {
				self.moveTo(self.findNearestTrackPoint(e.latlng.lat, e.latlng.lng));
			});
			
			self.currentMarker = L.Marker.movingMarker(self.trackPoints, conf.movingDuration, 
			{
				icon: L.ExtraMarkers.icon(conf.currentMarkerIconOptions),
			}).addTo(self.map);
			
			if( conf.enableHoverTooltip ) {
				self.setHoverTooltip();
			}
			
			if( conf.enableMovingTooltip ) {
				self.setMovingTooltip();
			}
				
			self.map.fitBounds(self.gpxTrack.getBounds(), conf.boundOptions);
		}).addTo(self.map);
	}
	
	public moveTo(destination: L.trackPoint) {
		var self = this;
		if(!self.currentMarker.isRunning()) {
			var currentTrackPoint = self.findNearestTrackPoint(self.currentMarker.getLatLng().lat, self.currentMarker.getLatLng().lng);
			if( currentTrackPoint != destination ) {
				var currentIndex = self.trackPoints.indexOf(currentTrackPoint);
				var destinationIndex = self.trackPoints.indexOf(destination);
				var track = self.trackPoints.slice(0);
				if( currentIndex < destinationIndex ) {
					track = track.slice(currentIndex, destinationIndex+1);
				} else {
					track = track.slice(destinationIndex, currentIndex+1).reverse();
				}
				
				self.currentMarker.initialize(track, conf.movingDuration);
				self.currentMarker.start();
			}
		}	
	}
	
	public stopMoving() {
		var self = this;
		self.currentMarker.pause();
	}
	
	private setHoverTooltip() {
		var self = this;
		self.trackPolyline.bindLabel("", conf.trackLabelOptions);
		
		self.mouseMarker = L.marker(self.trackPoints[0],{
			icon: L.divIcon({
				html: '#',
			}),
			opacity: 0,
		});
		
		if( conf.enableMouseMarker ) {
			self.setMouseMarker();
		}
		
		self.trackPolyline.on('mousemove', function(e:L.LeafletMouseEvent) {
			var trackTooltip = $(conf.trackLabelIdentifier);
			var trackPoint = self.findNearestTrackPoint(e.latlng.lat, e.latlng.lng);
			if(!self.currentMarker.isRunning()) {
				if( trackTooltip.hasClass("hidden") ) {
					trackTooltip.removeClass("hidden");
				}
				trackTooltip.html( self.getTooltipContent(trackPoint) );
			} else {
				if( !trackTooltip.hasClass("hidden") ) {
					trackTooltip.addClass("hidden");
				}
			}
		});
	}
	
	private setMouseMarker() {
		var self = this;
		self.mouseMarker.on('mouseover', function(){
			self.trackPolyline.fire('mouseover');
		});
		self.mouseMarker.on('mousemove', function(){
			self.trackPolyline.fire('mousemove');
		});
		self.mouseMarker.on('mouseout', function(){
			self.trackPolyline.fire('mouseout');
		});
	}
	
	private setMovingTooltip() {
		var self = this;
		self.currentMarker.bindLabel("", conf.currentMarkerLabelOptions);
		var updateCurrentMarkerTooltipTimer;
		self.currentMarker.on('start', function() {
			clearTimeout(updateCurrentMarkerTooltipTimer);
			$(conf.trackLabelIdentifier).addClass("hidden");
			var tooltip = $(conf.currentMarkerLabelIdentifier);
			if(tooltip.hasClass("hidden")) {
				tooltip.removeClass("hidden");
			}
			tooltip.removeClass("fadeOut");
			(function update() {
				var curLatLng = self.currentMarker.getLatLng();
				var trackPoint = self.findNearestTrackPoint(curLatLng.lat, curLatLng.lng);
				// TODO:
				// makes problems on crossing routes because the 
				// nearest trackpoint is maybe not the last passed/next to pass
				tooltip.html( self.getTooltipContent(trackPoint) );
				tooltip.css("margin-left", Math.floor(tooltip.outerWidth()/2) * -1);
				if( self.currentMarker.isRunning() ) {
					updateCurrentMarkerTooltipTimer = setTimeout(function(){
						update();
					}, 100);
				}
			})();
		});
		self.currentMarker.on('end', function() {
			clearTimeout(updateCurrentMarkerTooltipTimer);
			updateCurrentMarkerTooltipTimer = setTimeout(function() {
				$(conf.currentMarkerLabelIdentifier).addClass("fadeOut");
			}, 1000);
		});
	}
	
	private highlightSubTrack(start: L.trackPoint, end: L.trackPoint) {
		var self = this;
		var startIndex = self.trackPoints.indexOf(start);
		var endIndex = self.trackPoints.indexOf(end);
		var track = self.trackPoints.slice(startIndex, endIndex+1);
		
		if(self.subTrack) {
			self.map.removeLayer(self.subTrack);
		}
		self.subTrack = new L.FeatureGroup([
			new L.Polyline( track, conf.subTrackOptions)				
		]).bindLabel("", conf.trackLabelOptions).addTo(self.map);
	}
	
	private getTooltipContent(trackPoint: L.trackPoint) {
		var self = this;
		var date = moment(trackPoint.meta.time).tz(conf.timezone);
		
		return 	'<i class="glyphicon glyphicon-calendar" ></i> ' + date.format('L') + '<br/>' +
				'<i class="glyphicon glyphicon-time" ></i> ' + date.format('HH:mm:ss') + '<br/>' +
				'<i class="glyphicon glyphicon-dashboard" ></i> ' + Math.round(trackPoint.meta.ele) + 'm';
	}
	
	private getTrackPointByLatlng(latlng: L.LatLng) { 
		var self = this;
		return $.grep(self.trackPoints, function(e){
			return (e.lat == latlng.lat && e.lng == latlng.lng);
		}).shift();
	}
	
	private findNearestTrackPoint(lat: number, lng: number) {
		var self = this;
		var nearest = self.getTrackPointByLatlng(L.latLng(lat, lng));
		if(typeof nearest !== "undefined")
			return nearest;
		
		var shortestDistance = 9999;
		self.trackPoints.forEach( function(trackPoint){
			var distance = helper.getDistance(lat, lng, trackPoint.lat, trackPoint.lng);
			if(shortestDistance > distance) {
				shortestDistance = distance;
				nearest = trackPoint;
			}
		});
		return nearest;
	}
}