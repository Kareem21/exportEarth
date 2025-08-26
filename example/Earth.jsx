// Example React component showing how to use the 3D Earth module
import React, { useRef, useEffect, useState } from 'react';
import EarthModule from '3d-earth-module';

const Earth = ({ attackData }) => {
  const containerRef = useRef();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize the Earth module
    const initEarth = async () => {
      try {
        await EarthModule.init({
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
          earth: {
            radius: 50,
            rotateSpeed: 0.002,
            isRotation: true
          },
          satellite: {
            show: true,
            rotateSpeed: -0.01,
            size: 1,
            number: 2
          },
          punctuation: {
            circleColor: 0x3892ff,
            lightColumn: {
              startColor: 0xe4007f,
              endColor: 0xffffff,
            },
          },
          flyLine: {
            color: 0xf3ae76,
            flyLineColor: 0xff7714,
            speed: 0.004,
          }
        });
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to initialize Earth:', error);
      }
    };

    initEarth();

    // Cleanup on unmount
    return () => {
      EarthModule.destroy();
      setIsLoaded(false);
    };
  }, []);

  // Update attack data when it changes
  useEffect(() => {
    if (isLoaded && attackData) {
      EarthModule.updateAttackData(attackData);
    }
  }, [attackData, isLoaded]);

  return (
    <div className=\"earth-container\" style={{ width: '100%', height: '500px' }}>
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