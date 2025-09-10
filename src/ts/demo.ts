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
    
    // Initialize with demo data
    await earthModule.init({
      dom: canvasContainer,
      // Optional: You can provide custom attack data here
      // attackData: [...],
      animationSpeed: 1.0
    });

    // Hide loading screen once initialized
    if (loadingElement) {
      loadingElement.classList.add('out');
      setTimeout(() => {
        loadingElement.style.display = 'none';
      }, 500);
    }

    console.log('3D Earth visualization initialized successfully');

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