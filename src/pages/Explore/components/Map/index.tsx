import { useEffect, useState, useRef } from "react";
import * as atlas from "azure-maps-control";
import "azure-maps-control/dist/atlas.min.css";

import { useExploreSelector } from "../../state/hooks";
import {
  useMosaicLayer,
  useItemBoundsLayer,
  useMapEvents,
  useZoomEvents,
  useMapControls,
  useMapZoomToLayer,
  useMapZoomToExtent,
  useCollectionBoundsLayer,
  useUrlState,
  useSlider
} from "./hooks";
import { ZoomMessage, ExtentMessage, MapMessage } from "../controls/MapMessages";

import PlaceSearchControl from "./components/PlaceSearch";
import {
  IStyleFunctionOrObject,
  IProgressIndicatorStyleProps,
  IProgressIndicatorStyles,
  ProgressIndicator,
} from "@fluentui/react";
import MapSettingsControl from "./components/MapSettingsControl";
import { DEFAULT_MAP_STYLE } from "pages/Explore/utils/constants";
import LegendControl from "./components/LegendControl";


const mapContainerId: string = "viewer-map";
export const sliderMapContainerId: string = 'slider-map'

const ExploreMap = () => {
  const mapRef = useRef<atlas.Map | null>(null);
  const { center, zoom} = useExploreSelector(s => s.map);
  const { compareMode, queryToCompare, query } = useExploreSelector(s => s.mosaic)
  const [mapReady, setMapReady] = useState<boolean>(false);
  const mapHandlers = useMapEvents(mapRef);
  const slider = useSlider(mapRef);
  // Initialize the map
  useEffect(() => {
    const onReady = () => setMapReady(true);

    if (!mapRef.current) {
      const map = new atlas.Map(mapContainerId, {
        view: "Auto",
        center: center,
        zoom: zoom,
        language: "en-US",
        showFeedbackLink: false,
        showLogo: false,
        style: DEFAULT_MAP_STYLE,
        renderWorldCopies: true,
        authOptions: {
          authType: atlas.AuthenticationType.subscriptionKey,
          subscriptionKey: process.env.REACT_APP_AZMAPS_KEY,
        },
      });

      map.events.add("ready", onReady);
      map.events.add("moveend", mapHandlers.onMapMove);
      map.events.add("styledata", mapHandlers.onStyleDataLoaded);
      map.events.add("data", mapHandlers.onDataEvent);

      mapRef.current = map;
    }
  }, [
    center,
    zoom,
    mapHandlers.onMapMove,
    mapHandlers.onStyleDataLoaded,
    mapHandlers.onDataEvent,
  ]);

  useItemBoundsLayer(mapRef, mapReady);
  useCollectionBoundsLayer(mapRef, mapReady);
  useMosaicLayer(mapRef, mapReady);
  useZoomEvents(mapRef);
  useMapControls(mapRef, mapReady);
  useUrlState();

  const { zoomToLayer, showZoomMsg } = useMapZoomToLayer();
  const zoomMsg = <ZoomMessage onClick={zoomToLayer} />;

  const { showExtentMsg, zoomToExtent } = useMapZoomToExtent(mapRef);
  const extentMsg = <ExtentMessage onClick={zoomToExtent} />;
  const compareMsg = <MapMessage><span>{query.name} / {queryToCompare.name? queryToCompare.name : 'Not selected'}</span></MapMessage>
  const loadingIndicator = (
    <ProgressIndicator barHeight={1} styles={progressIndicatorStyles} />
  );

  return (
    <div style={mapContainerStyle}>
      {(mapHandlers.areTilesLoading || slider.areTilesToCompareLoading) && loadingIndicator}
      {showZoomMsg && zoomMsg}
      {!showZoomMsg && compareMode && compareMsg}
      {showExtentMsg && extentMsg}
      <PlaceSearchControl mapRef={mapRef} />
      <MapSettingsControl mapRef={mapRef} />
      <LegendControl />
      <div id={mapContainerId} style={{ width: "100%", height: "100%"}} />
      <div id={sliderMapContainerId} style={{ width: "100%", height: "100%", position: 'absolute', top: 0, left: 0, visibility: (compareMode)? 'visible': 'hidden' }} />
    </div>
  );
};

export default ExploreMap;

const mapContainerStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  position: "relative",
};

const progressIndicatorStyles: IStyleFunctionOrObject<
  IProgressIndicatorStyleProps,
  IProgressIndicatorStyles
> = {
  root: { position: "absolute", width: "100%", zIndex: 1 },
  itemProgress: { padding: 0 },
};
