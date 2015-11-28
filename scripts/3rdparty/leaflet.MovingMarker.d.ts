/// <reference path="leaflet.d.ts" />
declare module L {
	export interface MovingMarker extends Marker {
		initialize(latlng, duration, options?);
		isRunning(): boolean;
		isPaused(): boolean;
		isEnded(): boolean;
		isStarted(): boolean; 
		start(): void;
		stop(): void;
		pause(): void;
		resume(): void;
		addLatLng(latlng, duration): void;
		moveTo(latlng, duration): void;
		addStation(pointIndex, duration): void;
	}
}