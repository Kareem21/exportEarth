/**
 * Earth.jsx - Production-ready SIEM Dashboard Earth Visualization Component
 *
 * This component integrates the 3D Earth Module into a React SIEM dashboard.
 * It handles real-time attack data visualization with optimized performance.
 *
 * Usage:
 *   import Earth from './Earth';
 *
 *   function SIEMDashboard() {
 *     const [attackData, setAttackData] = useState([]);
 *
 *     // Your data fetching logic here
 *     useEffect(() => {
 *       // Fetch SIEM data and call setAttackData
 *     }, []);
 *
 *     return <Earth attackData={attackData} />;
 *   }
 */

import React, { useEffect, useRef, useState } from 'react';
import EarthModule from '3d-earth-module';

function Earth({ attackData, maxAttacks = 20, className = '' }) {
  const containerRef = useRef(null);
  const earthInstanceRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Initialize the Earth Module once on mount
   */
  useEffect(() => {
    const initEarth = async () => {
      try {
        if (!containerRef.current) return;

        const earth = new EarthModule();
        await earth.init({
          dom: containerRef.current,
          attackData: attackData || [],
          animationSpeed: 1.5, // Slightly faster animations for SIEM
          maxConcurrentAttacks: maxAttacks, // Limit displayed attacks for performance
          updateDebounce: 500, // Debounce rapid updates (500ms)
          enableDifferentialUpdates: true, // Enable smart diffing
        });

        earthInstanceRef.current = earth;
        setIsLoaded(true);
        setError(null);
      } catch (err) {
        console.error('Failed to initialize Earth visualization:', err);
        setError('Failed to load Earth visualization. Please refresh the page.');
        setIsLoaded(false);
      }
    };

    initEarth();

    // Cleanup on unmount
    return () => {
      if (earthInstanceRef.current) {
        try {
          earthInstanceRef.current.destroy();
          earthInstanceRef.current = null;
        } catch (err) {
          console.error('Error destroying Earth instance:', err);
        }
      }
      setIsLoaded(false);
    };
  }, []); // Initialize only once

  /**
   * Update visualization when attack data changes
   */
  useEffect(() => {
    if (isLoaded && earthInstanceRef.current && attackData) {
      try {
        earthInstanceRef.current.updateAttackData(attackData);
      } catch (err) {
        console.error('Error updating attack data:', err);
      }
    }
  }, [attackData, isLoaded]);

  return (
    <div
      className={`earth-visualization-container ${className}`}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: '#000',
        overflow: 'hidden',
      }}
    >
      {/* Earth Container */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
        }}
      />

      {/* Loading Overlay */}
      {!isLoaded && !error && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '18px',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              fontSize: '24px',
              marginBottom: '10px',
              fontWeight: 'bold',
            }}
          >
            Loading Earth Visualization
          </div>
          <div style={{ fontSize: '14px', opacity: 0.7 }}>
            Initializing 3D scene and loading assets...
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ff4444',
            fontSize: '18px',
            zIndex: 1000,
            padding: '20px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
          <div style={{ fontSize: '20px', marginBottom: '10px', fontWeight: 'bold' }}>
            Visualization Error
          </div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>
            {error}
          </div>
        </div>
      )}

      {/* Attack Count Badge (Optional) */}
      {isLoaded && !error && attackData && attackData.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: 'rgba(0, 0, 0, 0.8)',
            padding: '8px 16px',
            borderRadius: '4px',
            color: 'white',
            fontSize: '14px',
            zIndex: 100,
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '2px' }}>
            Active Attacks
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff4444' }}>
            {Math.min(attackData.length, maxAttacks)}
            {attackData.length > maxAttacks && (
              <span style={{ fontSize: '12px', opacity: 0.7, marginLeft: '4px' }}>
                / {attackData.length}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Earth;

/**
 * EXAMPLE USAGE IN YOUR SIEM DASHBOARD:
 *
 * import Earth from './Earth';
 *
 * function SIEMDashboard() {
 *   const [attackData, setAttackData] = useState([]);
 *
 *   // Fetch real-time SIEM data
 *   useEffect(() => {
 *     const fetchSIEMData = async () => {
 *       try {
 *         const response = await fetch('/api/siem/attacks');
 *         const data = await response.json();
 *
 *         // Transform your SIEM data to the required format
 *         const transformedData = data.map(attack => ({
 *           startArray: {
 *             name: attack.sourceLocation,
 *             N: attack.sourceLatitude,
 *             E: attack.sourceLongitude,
 *           },
 *           endArray: attack.targets.map(target => ({
 *             name: target.location,
 *             N: target.latitude,
 *             E: target.longitude,
 *           }))
 *         }));
 *
 *         setAttackData(transformedData);
 *       } catch (error) {
 *         console.error('Failed to fetch SIEM data:', error);
 *       }
 *     };
 *
 *     // Initial fetch
 *     fetchSIEMData();
 *
 *     // Poll for updates every 10 seconds
 *     const interval = setInterval(fetchSIEMData, 10000);
 *
 *     return () => clearInterval(interval);
 *   }, []);
 *
 *   return (
 *     <div style={{ width: '100vw', height: '100vh' }}>
 *       <Earth attackData={attackData} maxAttacks={20} />
 *     </div>
 *   );
 * }
 *
 *
 * ATTACK DATA FORMAT:
 *
 * const exampleAttackData = [
 *   {
 *     startArray: {
 *       name: 'Beijing',       // Attacker location
 *       N: 39.9042,           // Latitude
 *       E: 116.4074,          // Longitude
 *     },
 *     endArray: [             // Can have multiple targets
 *       {
 *         name: 'New York',
 *         N: 40.7128,
 *         E: -74.0060,
 *       },
 *       {
 *         name: 'London',
 *         N: 51.5074,
 *         E: -0.1278,
 *       }
 *     ]
 *   },
 *   {
 *     startArray: {
 *       name: 'Moscow',
 *       N: 55.7558,
 *       E: 37.6173,
 *     },
 *     endArray: [
 *       {
 *         name: 'Washington DC',
 *         N: 38.9072,
 *         E: -77.0369,
 *       }
 *     ]
 *   }
 * ];
 *
 *
 * PROPS:
 *
 * - attackData: Array of attack objects (required)
 *   Format: { startArray: {name, N, E}, endArray: [{name, N, E}, ...] }
 *
 * - maxAttacks: Number (optional, default: 20)
 *   Maximum number of concurrent attacks to display for performance
 *
 * - className: String (optional, default: '')
 *   Additional CSS classes for the container
 *
 *
 * PERFORMANCE TIPS:
 *
 * 1. Limit concurrent attacks (maxAttacks prop) to 10-20 for best performance
 * 2. Update frequency: Poll every 10-30 seconds (not every second)
 * 3. The module automatically debounces rapid updates (500ms)
 * 4. Labels are cached - same cities render faster on subsequent updates
 * 5. Differential updates skip re-rendering if data hasn't changed
 */
