/**
 * Returns an SVG path string for an activity type shape, centered at (0,0).
 * All shapes fit within a circle of the given radius.
 */
export function activityShapePath(type: string | undefined, r: number): string {
  switch (type) {
    case "call": // Diamond
      return `M0,${-r} L${r},0 L0,${r} L${-r},0 Z`;
    case "email": // Square
      return `M${-r},${-r} L${r},${-r} L${r},${r} L${-r},${r} Z`;
    case "demo": // Triangle
      return `M0,${-r} L${r},${r} L${-r},${r} Z`;
    case "workshop": { // Star (5-point)
      const inner = r * 0.4;
      const pts: string[] = [];
      for (let i = 0; i < 5; i++) {
        const outerAngle = (i * 72 - 90) * (Math.PI / 180);
        const innerAngle = ((i * 72 + 36) - 90) * (Math.PI / 180);
        pts.push(`${Math.cos(outerAngle) * r},${Math.sin(outerAngle) * r}`);
        pts.push(`${Math.cos(innerAngle) * inner},${Math.sin(innerAngle) * inner}`);
      }
      return `M${pts.join("L")}Z`;
    }
    default: // "meeting" or unknown → Circle approximated as path
      return circlePath(r);
  }
}

function circlePath(r: number): string {
  return `M0,${-r} A${r},${r} 0 1,1 0,${r} A${r},${r} 0 1,1 0,${-r} Z`;
}
