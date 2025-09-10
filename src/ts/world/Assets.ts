/**
 * Resource files - import images as bundled assets
 */

// Import all required images
import gradientImg from '../../../static/images/earth/gradient.png';
import redCircleImg from '../../../static/images/earth/redCircle.png';
import labelImg from '../../../static/images/earth/label-old.png';
import apertureImg from '../../../static/images/earth/aperture.png';
import glowImg from '../../../static/images/earth/glow.png';
import lightColumnImg from '../../../static/images/earth/light_column.png';
import aircraftImg from '../../../static/images/earth/aircraft.png';
import earthImg from '../../../static/images/earth/earth.jpg';

interface ITextures {
  name: string
  url: string
}

export interface IResources {
  textures?: ITextures[],
}

const textures: ITextures[] = [
  { name: 'gradient', url: gradientImg },
  { name: 'redCircle', url: redCircleImg },
  { name: 'label', url: labelImg },
  { name: 'aperture', url: apertureImg },
  { name: 'glow', url: glowImg },
  { name: 'light_column', url: lightColumnImg },
  { name: 'aircraft', url: aircraftImg },
  { name: 'earth', url: earthImg }
];

const resources: IResources = {
  textures
}

export {
  resources
}