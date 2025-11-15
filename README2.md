# 3D Earth Module - Build and Deploy Guide

This guide explains how to build the 3D Earth Module and use it in your React frontend via Azure Artifacts.

## Prerequisites

- Node.js (v14 or higher)
- Yarn package manager
- Access to your Azure Artifacts feed

## Building the Module

### 1. Install Dependencies

```bash
yarn install
```

### 2. Build the Module for NPM Distribution

```bash
yarn build-module
```

This command:
- Compiles TypeScript to JavaScript
- Bundles all dependencies (except React/React-DOM)
- Inlines all assets (images, shaders) into the bundle
- Creates UMD module compatible with various module systems
- Outputs to `/dist` folder with:
  - `index.js` - Main bundle
  - `index.d.ts` - TypeScript definitions (if generated)
  - Source maps for debugging

### 3. Verify Build Output

Check that the `/dist` folder contains:
```bash
ls -la dist/
# Should show: index.js, index.js.map, and any type definitions
```

## Publishing to Azure Artifacts

### Option 1: Using npm (Recommended)

1. **Configure npm to use your Azure Artifacts feed:**

```bash
# Add Azure Artifacts registry
npm config set registry https://pkgs.dev.azure.com/{organization}/_packaging/{feed}/npm/registry/

# Authenticate (this will open a browser)
npx vsts-npm-auth -config .npmrc
```

2. **Update package.json version:**

```bash
# Bump version (choose one)
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```

3. **Publish to Azure Artifacts:**

```bash
npm publish
```

### Option 2: Manual Upload via Azure DevOps UI

1. Build the module: `yarn build-module`
2. Go to Azure DevOps → Artifacts → Your Feed
3. Click "Connect to feed" → npm
4. Follow the instructions to publish manually

## Using the Module in Your React App

### 1. Install from Azure Artifacts

In your React project:

```bash
# Configure npm to use your Azure Artifacts feed (one-time setup)
npm config set registry https://pkgs.dev.azure.com/{organization}/_packaging/{feed}/npm/registry/

# Authenticate
npx vsts-npm-auth -config .npmrc

# Install the module
npm install 3d-earth-module
# or
yarn add 3d-earth-module
```

### 2. Import and Use in Your Component

See the example `Earth.jsx` file in the root of this repository for a complete React integration example.

Basic usage:

```jsx
import React, { useEffect, useRef } from 'react';
import EarthModule from '3d-earth-module';

function SIEMDashboard() {
  const containerRef = useRef(null);
  const earthInstanceRef = useRef(null);

  useEffect(() => {
    const initEarth = async () => {
      const earth = new EarthModule();
      await earth.init({
        dom: containerRef.current,
        attackData: yourSIEMData,
        maxConcurrentAttacks: 20,      // Limit displayed attacks
        updateDebounce: 500,            // Debounce rapid updates
        enableDifferentialUpdates: true // Enable smart diffing
      });
      earthInstanceRef.current = earth;
    };

    if (containerRef.current) {
      initEarth();
    }

    return () => {
      if (earthInstanceRef.current) {
        earthInstanceRef.current.destroy();
      }
    };
  }, []);

  // Update with new SIEM data
  useEffect(() => {
    if (earthInstanceRef.current) {
      earthInstanceRef.current.updateAttackData(yourSIEMData);
    }
  }, [yourSIEMData]);

  return <div ref={containerRef} style={{ width: '100%', height: '600px' }} />;
}
```

## Module Configuration Options

### `init(options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `dom` | HTMLElement | **Required** | Container element for the visualization |
| `attackData` | AttackData[] | Demo data | Initial attack data to display |
| `animationSpeed` | number | 2.0 | Animation speed multiplier (0.5-2.0) |
| `maxConcurrentAttacks` | number | 0 (unlimited) | Maximum number of attacks to display |
| `updateDebounce` | number | 0 (no debounce) | Debounce updateAttackData calls (ms) |
| `enableDifferentialUpdates` | boolean | true | Enable smart diffing for updates |

### Attack Data Format

```typescript
interface AttackData {
  startArray: {
    name: string,    // Attacker location name
    N: number,       // Latitude
    E: number,       // Longitude
  },
  endArray: {
    name: string,    // Target location name
    N: number,       // Latitude
    E: number,       // Longitude
  }[]
}
```

## Performance Optimizations

The module includes several performance optimizations for real-time SIEM dashboards:

### 1. Label Caching
- City labels are cached by name
- Subsequent appearances of the same city reuse existing textures
- Eliminates expensive html2canvas re-rendering

### 2. Differential Updates
- Compares old vs new data before updating
- Skips updates if data hasn't changed
- Reduces unnecessary re-renders

### 3. Attack Limiting
- Set `maxConcurrentAttacks` to cap displayed attacks
- Automatically slices incoming data to limit
- Prevents performance degradation with high attack volumes

### 4. Debouncing
- Set `updateDebounce` to batch rapid updates
- Useful when receiving frequent SIEM data updates
- Reduces update frequency while maintaining data freshness

## Recommended Settings for SIEM Dashboards

```javascript
await earth.init({
  dom: containerRef.current,
  attackData: siemData,
  maxConcurrentAttacks: 20,        // Show max 20 attacks
  updateDebounce: 1000,             // Update at most once per second
  enableDifferentialUpdates: true,  // Enable smart updates
  animationSpeed: 1.5               // Slightly faster animations
});
```

## Development Workflow

### Local Development
```bash
# Start dev server (demo mode)
yarn dev
# Visit http://localhost:8088
```

### Testing Changes
```bash
# 1. Make changes to src/
# 2. Build module
yarn build-module

# 3. In your React app, link locally for testing
cd /path/to/exportEarth
npm link

cd /path/to/your-react-app
npm link 3d-earth-module

# 4. When done testing, unlink
npm unlink 3d-earth-module
```

### Production Build
```bash
# Build, version, and publish
yarn build-module
npm version patch
npm publish
```

## Troubleshooting

### Build Fails
- Check Node.js version: `node --version` (should be v14+)
- Clear dependencies: `rm -rf node_modules && yarn install`
- Check for TypeScript errors: `yarn lint`

### Module Not Found After Publishing
- Verify package name in package.json matches your import
- Check Azure Artifacts feed permissions
- Re-authenticate: `npx vsts-npm-auth -config .npmrc`

### Performance Issues in Production
- Reduce `maxConcurrentAttacks` (try 10-15)
- Increase `updateDebounce` (try 2000-3000ms)
- Check browser console for errors or warnings

### Textures/Assets Not Loading
- Assets are inlined during build - check `dist/index.js` size
- If bundle is too large, assets may not be properly inlined
- Check webpack.module.config.js asset/inline configuration

## Support

For issues or questions:
- Check the main README.md for architecture details
- Review CLAUDE.md for development guidelines
- See example/Earth.jsx for reference implementation

## Version History

- **1.0.0** - Initial release with basic functionality
- **1.1.0** - Added performance optimizations (label caching, differential updates)
- **1.2.0** - Added debouncing and attack limiting for SIEM dashboards
