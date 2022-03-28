import * as React from 'react';

// prodURL = 'https://noaaflaskapi.herokuapp.com/station/'
// localURL = 'http://127.0.0.1:5000/'

function ControlPanel(props) {
  return !props.station ? (
    <div className="control-panel">
      <h2>Operational Weather Suitability</h2>
      <p>NOAA GHCN Stations Climate Normals</p>
      <p>Click on a Station for Climate Chart - Data: <a href="https://www.ncdc.noaa.gov/cdo-web/" target="_blank" rel="noopener noreferrer">NOAA Climate Data</a></p>
      <hr style={{width: '800px', marginLeft: '-100px', marginTop: '26px'}}/>
      <br />
    </div>
  ) 
    : ( 
    
      <div className="control-panel">
        <h2>Operational Weather Suitability</h2>
        <p>NOAA GHCN Stations Climate Normals</p>
        <p>Click on a Station for Climate Chart - Data: <a href="https://www.ncdc.noaa.gov/cdo-web/" target="_blank" rel="noopener noreferrer">NOAA Climate Data</a></p>
        <hr style={{width: '800px', marginLeft: '-100px', marginBottom: '10px', marginTop: '26px'}}/>
        <br />
        <div style={{position: 'absolute'}}>
          <iframe src={`https://noaaflaskapi.herokuapp.com/station/${props.station}`}></iframe>
        </div>
        
      </div>
    
    ); 
    // extended panel for additional chart display
    // ( 
    
    //   <div className="control-panel">
    //     <h2>Operational Weather Suitability</h2>
    //     <p>NOAA GHCN Stations Climate Normals</p>
    //     <p>Click on a Station for Climate Chart - Data: <a href="https://www.ncdc.noaa.gov/cdo-web/" target="_blank" rel="noopener noreferrer">NOAA Climate Data</a></p>
    //     <hr style={{width: '800px', marginLeft: '-100px'}}/>
    //     <br />
    //     <div style={{position: 'absolute'}}>
    //       <iframe src={`https://noaaflaskapi.herokuapp.com/station/${props.station}`}></iframe>
    //     </div>
    //     <div style={{position: 'absolute'}}>
    //     <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
      
    //     <hr style={{width: '800px', marginLeft: '-100px'}}/>
    //     <p></p>
    //     </div>
    //   </div>
    
    // );
    
}

export default React.memo(ControlPanel);
