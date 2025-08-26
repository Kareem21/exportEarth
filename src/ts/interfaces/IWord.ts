export interface AttackData {
  startArray: {
    name: string,
    N: number, // Latitude
    E: number, // Longitude
  },
  endArray: {
    name: string,
    N: number, // Latitude  
    E: number, // Longitude
  }[]
}

export interface IWord {
  dom: HTMLElement,
  data?: AttackData[], // Dynamic attack data
  earth?: {
    radius?: number,
    rotateSpeed?: number,
    isRotation?: boolean
  },
  satellite?: {
    show?: boolean,
    rotateSpeed?: number,
    size?: number,
    number?: number
  },
  punctuation?: {
    circleColor?: number,
    lightColumn?: {
      startColor?: number,
      endColor?: number,
    },
  },
  flyLine?: {
    color?: number,
    flyLineColor?: number,
    speed?: number,
  }
}