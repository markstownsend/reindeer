import type { Selection } from "d3-selection";

/**
 * Wraps a D3 render function with error handling.
 * On error, displays a message in the SVG layer and logs to console.
 */
export function safeRender(
  layer: Selection<SVGGElement, unknown, null, undefined>,
  renderFn: () => void,
  layerName: string,
): void {
  try {
    renderFn();
  } catch (error) {
    console.error(`ReindeerChart: Error rendering ${layerName}:`, error);
    layer
      .append("text")
      .attr("x", 10)
      .attr("y", 20)
      .attr("class", "fill-red-400 text-xs")
      .text(`Error rendering ${layerName}`);
  }
}
