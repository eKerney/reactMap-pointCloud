import * as React from 'react';
import ReactDOM from "react-dom";
import Map, {Source, Layer, Popup} from 'react-map-gl';
import { MapContext } from 'react-map-gl/dist/esm/components/map';
import DeckGL from '@deck.gl/react';
import {render} from 'react-dom';
import { H3HexagonLayer } from "@deck.gl/geo-layers";
import {ScatterplotLayer} from '@deck.gl/layers';
import {HexagonLayer} from '@deck.gl/aggregation-layers';
import {CSVLoader} from '@loaders.gl/csv';
import {useState, useEffect, useMemo, useCallback, useRef} from 'react';
//import { QueryClient, QueryClientProvider, useQuery } from 'react-query'
import ControlPanel from './control-panel';
import {PointCloudLayer} from '@deck.gl/layers';
import {COORDINATE_SYSTEM, OrbitView, LinearInterpolator} from '@deck.gl/core';
import {LASLoader} from '@loaders.gl/las';
import {load, registerLoaders} from '@loaders.gl/core';
import {GeoJsonLayer, PolygonLayer} from '@deck.gl/layers';
import {scaleThreshold} from 'd3-scale';

registerLoaders([LASLoader]);

const HEX_DATA = "https://raw.githubusercontent.com/chriszrc/foss4g-2021-react-mapbox/main/deck-layers-map/public/data/hex_radio_coverage.json";
const stationData = 'https://raw.githubusercontent.com/eKerney/reactMapTest/main/src/noaaAptEditedCol.csv';
const testData = 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv';
const lazData = 'https://rockyweb.usgs.gov/vdelivery/Datasets/Staged/Elevation/LPC/Projects/MI_WayneCo_2009/laz/MI_WayneCo_2009_000883.laz'
const lasData = 'https://github.com/eKerney/reactMap-pointCloud/raw/main/src/ca2018_wildfire_ql2_Job716930.las'
const weatherData = 'https://raw.githubusercontent.com/eKerney/reactMap-pointCloud/main/data/weatherPolyData.json';

  export default function App() {

    const pointCloudLAS = new PointCloudLayer({
      id: 'PointCloudLayer2',
      data: lasData,
      loaders: [LASLoader],
      loadOptions: {
        fetch: (lasData, {
          mode: 'no-cors',
        })
      },
      /* props from PointCloudLayer class */
      // getColor: d => d.color,
      // getNormal: d => d.normal,
      // getPosition: d => d.position,
      // material: true,
      pointSize: 2,
      // sizeUnits: 'pixels',
      /* props inherited from Layer class */
      // autoHighlight: false,
      coordinateOrigin: [-122.48140549, 41.386852],
      // coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
      // highlightColor: [0, 0, 128, 128],
      // modelMatrix: null,
      // opacity: 1,
      pickable: false,
      // visible: true,
      // wrapLongitude: false,
    });
    const pointCloudData = new PointCloudLayer({
      id: 'PointCloudLayer',
      data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/pointcloud.json',
      /* props from PointCloudLayer class */
      getColor: d => d.color,
      getNormal: d => d.normal,
      getPosition: d => d.position,
      // material: true,
      pointSize: 2,
      // sizeUnits: 'pixels',
      /* props inherited from Layer class */
      // autoHighlight: false,
      coordinateOrigin: [-122.4, 37.74],
      coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
      // highlightColor: [0, 0, 128, 128],
      // modelMatrix: null,
      // opacity: 1,
      pickable: false,
      // visible: true,
      // wrapLongitude: false,
    });
    // station point locations layer
    const noaaStations = new ScatterplotLayer({
      id: 'scatterplot-layer',
      data: fetch(stationData)
        .then(response => response.arrayBuffer())
        .then(buffer => CSVLoader.parse(buffer)),
      pickable: true,
      opacity: 0.3,
      stroked: true,
      filled: true,
      radiusScale: 6,   
      radiusMinPixels: 7, 
      radiusMaxPixels: 100,
      lineWidthMinPixels: 1,
      getPosition: d => [d['lon'], d['lat']],
      getRadius: d => Math.sqrt(d.exits),
      getFillColor: d => [(255-(d['elevation']*.1)), (140+(d['elevation']*.001)), (d['elevation']* .50)],
      getLineColor: d => [0, 0, 0, 0],
      autoHighlight: true,
      highlightColor: [0, 255, 0]
      //onHover: (info, event) => console.log('Hovered:', info.object),
      //onClick: (info, event) => onClick(info)
    });  
    // specs for hex aggrgation layer
    const colorRange = [
      [1, 152, 189],
      [73, 227, 206],
      [216, 254, 181],
      [254, 237, 177],
      [254, 173, 84],
      [209, 55, 78]
    ];
    const material = {
      ambient: 0.64,
      diffuse: 0.6,
      shininess: 32,
      specularColor: [51, 51, 51]
    };
    const radius = 60000, upperPercentile = 100, coverage = 1;
    // end of hex specs
    const stationsHex = [ 
      new HexagonLayer({
        id: 'heatmap',
        colorRange,
        coverage,
        data: fetch(stationData)
              .then(response => response.arrayBuffer())
              .then(buffer => CSVLoader.parse(buffer)),
        elevationRange: [0, 300000],
        elevationScale: 5,
        extruded: true,
        getPosition: d => [d.lon,d.lat],
        pickable: true,
        radius,
        upperPercentile,
        material,
        opacity: 0.1,
        transitions: {
          elevationScale: 3000
        }
      }),
      noaaStations,
     ];

     const radioHex = new HexagonLayer({
      id: "H3 Radio Sources",
      data: HEX_DATA,
      pickable: true,
      wireframe: false,
      filled: true,
      extruded: true,
      elevationRange: [0, 3000],
      elevationScale: 1000,
      getPosition: (d) => d.hex,
      getFillColor: (d) => [255, (1 - d.count / 50) * 255, 0],
      getElevation: (d) => d.count,
      opacity: 0.2,
    });

    const radioHex2 = new H3HexagonLayer({
      id: "H3 Radio Sources",
      data: HEX_DATA,
      pickable: true,
      wireframe: false,
      filled: true,
      extruded: true,
      elevationScale: 10000,
      getHexagon: (d) => d.hex,
      getFillColor: (d) => [255, (1 - d.count / 50) * 255, 0],
      getElevation: (d) => d.count,
      opacity: 0.5,
    });

    const weatherHex = new H3HexagonLayer({
      id: "weatherDataHex",
      data: 'https://raw.githubusercontent.com/eKerney/reactMap-pointCloud/main/data/weatherPolyData.json',
      pickable: true,
      wireframe: false,
      filled: true,
      extruded: true,
      elevationScale: 10000,
      getHexagon: (d) => d.properties.h3_index,
      getFillColor: [255, 100, 100],
      getElevation: 10000,
      opacity: 0.5,
    });

     const weatherGeo1 = new GeoJsonLayer({
        id: 'geojson1',
        data: 'https://raw.githubusercontent.com/eKerney/reactMap-pointCloud/main/data/weatherPolyData.json',
        opacity: 0.7,
        stroked: false,
        filled: true,
        extruded: true,
        wireframe: true,
        getElevation: d => ((d.properties.windSpeed * d.properties.precipChance)/d.properties.temperature)**6 * 1000,
        getFillColor: d => [(500 - (d.properties.temperature**4/100000)), 
        ((d.properties.precipChance**4/100)), 255], 
        getLineColor: [255, 255, 255],
        pickable: true
      });
    const weatherGeo2 =
      new GeoJsonLayer({
        id: 'geojson2',
        data: 'https://raw.githubusercontent.com/eKerney/reactMap-pointCloud/main/data/weatherPolyData.json',
        opacity: 0.1,
        stroked: false,
        filled: false,
        extruded: true,
        wireframe: true,
        getElevation: d => ((d.properties.windSpeed * d.properties.temperature)/d.properties.precipChance) * 200,
        getFillColor: d => [(500 - (d.properties.temperature**4/100000)), ((d.properties.precipChance**4/100)), 0], 
        getLineColor: [255, 255, 255],
        pickable: true
      });

    //const layers = [weatherGeo1, weatherGeo2, pointCloudData, radioHex];
    const layers = [weatherHex];
    const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiZXJpY2tlcm5leSIsImEiOiJja2FjbTNiMXcwMXp1MzVueDFjdDNtcW92In0.LW0qdB-2FmA3UK51M67fAQ';
    const [viewState, setViewState] = React.useState({
      longitude: -97.5,
      latitude: 27.8,
      zoom: 10,
      pitch: 60,
      bearing: -60,
    });
  const getTooltip = info => {
    if (!info.object) {
      return null;
    }
    return`\
    ${info.object.desc}
    ${info.object.id}
    ${info.object.elevation} elev m.`;
  };
  const [hoverInfo, setHoverInfo] = useState();  
  const deckRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [toggle, setToggle] = useState(false);
  const [showPopup, setShowPopup] = React.useState(true);
  const [features, setFeatures] = useState({});

  return (
    <>
    <DeckGL 
      ref={deckRef}
      initialViewState={viewState} 
      controller={true}
      layers={[...layers]}
      ContextProvider={MapContext.Provider}
      onClick={({ x, y, coordinate, object}) => {
        // TODO: figure out how to get rid of extra click event
        if (object) {
          setSelected({ x, y, coordinate, object });
        } else {
          // clicked off an object
          setSelected(null);
        }
      }}
      getTooltip={getTooltip} 
    >
      <Map reuseMaps
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{width: '100vw', height: '100vh'}}
        mapStyle="mapbox://styles/erickerney/cl0l6ydmk000d14slnsws819a"
        mapboxAccessToken={MAPBOX_ACCESS_TOKEN}   
      >
       {/* {selected && (
          <Popup
            longitude={selected.coordinate[0]}
            latitude={selected.coordinate[1]}
            closeButton={false}
            anchor="right"
            offsetLeft={10}
            closeOnClick={true}
            onOpen = {(e, i) => console.log(selected.object)}
          >
            <div className="tooltip interactive">
              {showPopup && (
                <div>
                 <iframe 
                 src={`http://127.0.0.1:5000/${selected.object.desc}`} />
                </div>
              )}
            </div>
          </Popup>
        )} */}
        </Map>

    </DeckGL>
    {/* <ControlPanel station={selected && selected.object.desc} /> */}

    </>
  );
}
