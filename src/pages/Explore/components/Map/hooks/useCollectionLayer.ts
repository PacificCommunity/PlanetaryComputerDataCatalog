import * as atlas from "azure-maps-control";
import { useExploreSelector } from "pages/Explore/state/hooks";
import { useEffect } from "react";
import {
  collectionLineLayer,
  collectionOutlineLayer,
  stacCollectionDatasource,
  pacificPolygonLayer,
  pacificDatasource
} from "../../../utils/layers";
import { MAX_ZOOM_FOR_COLLECTION_OUTLINE } from "pages/Explore/utils/constants";
import { spatialExtentToMultipolygon } from "utils/collections";


// Show highlighted stac item result footprint on the map
const useCollectionBoundsLayer = (
  mapRef: React.MutableRefObject<atlas.Map | null>,
  mapReady: boolean
) => {
  const collection = useExploreSelector(s => s.mosaic.collection);
  const { showCollectionOutline, zoom } = useExploreSelector(s => s.map);
  useEffect(() => {
    const map = mapRef.current;

    if (!mapReady || !map) return;

    if (!map.sources.getSources().includes(stacCollectionDatasource)) {
      map.sources.add(stacCollectionDatasource);
      map.layers.add(collectionLineLayer, "labels");
      map.layers.add(collectionOutlineLayer, collectionLineLayer);
    }
    if (!map.sources.getSources().includes(pacificDatasource)) {
      map.sources.add(pacificDatasource)
      pacificDatasource.importDataFromUrl('/data/eez.geojson');
      map.layers.add(pacificPolygonLayer)
    }
  }, [mapRef, mapReady]);

  useEffect(() => {
    const bbox = collection?.extent.spatial.bbox;
    if (!bbox) {
      stacCollectionDatasource.clear();
    } else {
      stacCollectionDatasource.clear();
      const multiPoly = spatialExtentToMultipolygon(bbox);

      if (multiPoly) {
        stacCollectionDatasource.add(multiPoly);
      }

      // Sync the line layers with the visibility setting, or if the zoom level is low
      const isCollectionBoundsVisible =
        showCollectionOutline && zoom <= MAX_ZOOM_FOR_COLLECTION_OUTLINE;
      collectionLineLayer.setOptions({ visible: isCollectionBoundsVisible });
      collectionOutlineLayer.setOptions({ visible: isCollectionBoundsVisible });
    }
  }, [mapRef, collection, showCollectionOutline, zoom]);
};

export default useCollectionBoundsLayer;
