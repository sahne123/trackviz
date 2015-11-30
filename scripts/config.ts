class configClass {
	
	public mapId: string;
	public gpxFile: string;
	public enableMovingTooltip: boolean;
	public enableHoverTooltip: boolean;
	public movingDuration: number;
	
	public boundOptions: L.Map.FitBoundsOptions;
	public trackLabelIdentifier: string;
	public trackLabelOptions: L.LabelOptions;
	public subTrackOptions: L.PolylineOptions;
	public currentMarkerIconOptions: L.ExtraMarkersOptions;
	public currentMarkerLabelIdentifier: string;
	public currentMarkerLabelOptions: L.LabelOptions;
	
	public constructor() {
		
		this.mapId = "map";
		this.gpxFile = "data/track.gpx";
		this.enableMovingTooltip = true;
		this.enableHoverTooltip = true;
		this.movingDuration = 5000;
		
		this.boundOptions = {
			paddingBottomRight: L.point(200,10), 
			paddingTopLeft: L.point(10,10),
		}; 
		
		this.trackLabelIdentifier = ".trackTooltip";
		this.trackLabelOptions = {
			className: "trackTooltip",
			direction: "right",
			/* noHide: true, */
			/* offset: []  */
		};
		
		this.currentMarkerIconOptions = {
			icon: "glyphicon-screenshot",
			prefix: "glyphicon",
			shape: "square",
			markerColor: "green-dark",
		}
		
		this.currentMarkerLabelIdentifier = ".currentMarkerTooltip";
		this.currentMarkerLabelOptions = {
			className: "leaflet-label-bottom currentMarkerTooltip animated hidden",
			direction: "right",
			pane: "popupPane",
			offset: L.point(0, 5),
			noHide: true,
		}
		
		this.subTrackOptions = {
			color: "red",
			opacity: 1,
		}
		
	}
}