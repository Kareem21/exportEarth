// Demo initialization script for the 3D Earth visualization
import { EarthModule } from './EarthModule';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', async () => {
  const loadingElement = document.getElementById('loading');
  const canvasContainer = document.getElementById('earth-canvas');

  if (!canvasContainer) {
    console.error('Canvas container element not found');
    return;
  }

  try {
    // Create EarthModule instance
    const earthModule = new EarthModule();

    // Custom attack data to demonstrate label caching
    const customAttackData = [
      {
        startArray: { name: 'Beijing', N: 39.9042, E: 116.4074 },
        endArray: [
          { name: 'New York', N: 40.7128, E: -74.0060 },
          { name: 'London', N: 51.5074, E: -0.1278 }
        ]
      },
      {
        startArray: { name: 'Moscow', N: 55.7558, E: 37.6173 },
        endArray: [
          { name: 'Tokyo', N: 35.6762, E: 139.6503 },
          { name: 'Sydney', N: -33.8688, E: 151.2093 }
        ]
      },
      {
        startArray: { name: 'Tehran', N: 35.6892, E: 51.3890 },
        endArray: [
          { name: 'Paris', N: 48.8566, E: 2.3522 },
          { name: 'Berlin', N: 52.5200, E: 13.4050 }
        ]
      }
    ];

    // Initialize with NEW FEATURES:
    // - maxConcurrentAttacks: limits attacks shown
    // - updateDebounce: batches rapid updates
    // - enableDifferentialUpdates: smart diffing
    await earthModule.init({
      dom: canvasContainer,
      attackData: customAttackData,
      animationSpeed: 1.5,
      maxConcurrentAttacks: 20,      // Test: limit to 20 attacks
      updateDebounce: 500,            // Test: debounce updates by 500ms
      enableDifferentialUpdates: true // Test: skip updates if data unchanged
    });

    // Hide loading screen once initialized
    if (loadingElement) {
      loadingElement.classList.add('out');
      setTimeout(() => {
        loadingElement.style.display = 'none';
      }, 500);
    }

    console.log('🌍 3D Earth visualization initialized with optimizations!');
    console.log('📊 Features enabled:');
    console.log('  ✅ Label caching (reuses city textures)');
    console.log('  ✅ Differential updates (skips if data unchanged)');
    console.log('  ✅ Debouncing (500ms)');
    console.log('  ✅ Attack limiting (max 20)');

    // DEMONSTRATION: Simulate real-time SIEM updates
    // This will show label caching & differential updates in action
    let updateCount = 0;
    setInterval(() => {
      updateCount++;

      // Alternate between 2 attack patterns
      // Pattern 1 uses same cities (tests label caching)
      // Pattern 2 is identical to Pattern 1 (tests differential updates - should skip)
      const pattern1 = [
        {
          startArray: { name: 'Beijing', N: 39.9042, E: 116.4074 },
          endArray: [{ name: 'New York', N: 40.7128, E: -74.0060 }]
        },
        {
          startArray: { name: 'Moscow', N: 55.7558, E: 37.6173 },
          endArray: [{ name: 'London', N: 51.5074, E: -0.1278 }]
        }
      ];

      const pattern2 = [
        {
          startArray: { name: 'Tehran', N: 35.6892, E: 51.3890 },
          endArray: [{ name: 'Paris', N: 48.8566, E: 2.3522 }]
        },
        {
          startArray: { name: 'Beijing', N: 39.9042, E: 116.4074 },
          endArray: [{ name: 'Tokyo', N: 35.6762, E: 139.6503 }]
        }
      ];

      // Every 3rd update, send identical data (should be skipped by differential)
      const newData = updateCount % 3 === 0 ? pattern1 : (updateCount % 2 === 0 ? pattern2 : pattern1);

      console.log(`🔄 Update #${updateCount} - Pattern: ${updateCount % 3 === 0 ? 'identical (should skip)' : updateCount % 2 === 0 ? '2' : '1'}`);
      earthModule.updateAttackData(newData);

    }, 5000); // Update every 5 seconds

    console.log('⏱️  Real-time updates starting in 5 seconds...');
    console.log('💡 Watch console for update patterns and caching in action!');

  } catch (error) {
    console.error('Failed to initialize 3D Earth visualization:', error);

    // Show error in loading screen
    if (loadingElement) {
      const loadingText = loadingElement.querySelector('div:last-child');
      if (loadingText) {
        loadingText.textContent = 'Failed to load. Check console for details.';
      }
    }
  }
});
