// Example React component showing how to use the 3D Earth module with dynamic dot speed control
import React, { useRef, useEffect, useState } from 'react';
import EarthModule from '3d-earth-module';

const Earth = ({ attackData }) => {
  const containerRef = useRef();
  const [isLoaded, setIsLoaded] = useState(false);
  const [earthInstance, setEarthInstance] = useState(null);
  const [dotSpeed, setDotSpeed] = useState(0.004);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize the Earth module
    const initEarth = async () => {
      try {
        const instance = new EarthModule();
        await instance.init({
          dom: containerRef.current,
          attackData: attackData || [
            {
              startArray: {
                name: 'Dubai',
                N: 25.2048, // Latitude
                E: 55.2708, // Longitude
              },
              endArray: [
                {
                  name: 'Russia',
                  N: 61.52401,
                  E: 105.318756,
                },
                {
                  name: 'USA',
                  N: 39.8283,
                  E: -98.5795,
                }
              ]
            }
          ],
          // Optional configuration
          animationSpeed: 1.0
        });
        
        setEarthInstance(instance);
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to initialize Earth:', error);
      }
    };

    initEarth();

    // Cleanup on unmount
    return () => {
      if (earthInstance) {
        earthInstance.destroy();
        setEarthInstance(null);
      }
      setIsLoaded(false);
    };
  }, []);

  // Update attack data when it changes
  useEffect(() => {
    if (isLoaded && attackData && earthInstance) {
      earthInstance.updateAttackData(attackData);
    }
  }, [attackData, isLoaded, earthInstance]);

  // Handle dot speed change
  const handleDotSpeedChange = (event) => {
    const newSpeed = parseFloat(event.target.value);
    setDotSpeed(newSpeed);
    
    if (earthInstance && isLoaded) {
      earthInstance.setDotSpeed(newSpeed);
    }
  };

  return (
    <div className="earth-container" style={{ width: '100%', height: '500px', position: 'relative' }}>
      {/* Dot Speed Control */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '10px',
        borderRadius: '5px',
        color: 'white',
        fontSize: '14px'
      }}>
        <div style={{ marginBottom: '8px' }}>
          Dot Speed: {dotSpeed.toFixed(3)}
        </div>
        <input
          type="range"
          min="0.001"
          max="0.1"
          step="0.001"
          value={dotSpeed}
          onChange={handleDotSpeedChange}
          style={{ width: '150px' }}
          disabled={!isLoaded}
        />
        <div style={{ marginTop: '5px', fontSize: '12px', opacity: 0.8 }}>
          <div>Slow ← → Fast</div>
        </div>
      </div>

      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          background: '#000'
        }} 
      />
      {!isLoaded && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '18px'
        }}>
          Loading Earth...
        </div>
      )}
    </div>
  );
};

export default Earth;

// Example usage in your SIEM application:
/*
const SIEMDashboard = () => {
  const [attacks, setAttacks] = useState([]);

  // Your SIEM data fetching logic
  useEffect(() => {
    // Simulate real-time attack data from your SIEM
    const fetchAttackData = () => {
      setAttacks([
        {
          startArray: {
            name: 'Attack Source: China',
            N: 35.8617,
            E: 104.1954,
          },
          endArray: [
            {
              name: 'Target: US Server',
              N: 39.8283,
              E: -98.5795,
            }
          ]
        },
        {
          startArray: {
            name: 'Attack Source: Russia', 
            N: 61.52401,
            E: 105.318756,
          },
          endArray: [
            {
              name: 'Target: EU Server',
              N: 54.526,
              E: 15.2551,
            }
          ]
        }
      ]);
    };

    fetchAttackData();
    // Set up real-time updates
    const interval = setInterval(fetchAttackData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>SIEM Attack Visualization</h1>
      <Earth attackData={attacks} />
    </div>
  );
};
*/