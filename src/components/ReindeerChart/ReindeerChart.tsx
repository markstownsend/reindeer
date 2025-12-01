import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface ReindeerChartProps {
  width?: number;
  height?: number;
}

export const ReindeerChart: React.FC<ReindeerChartProps> = ({ 
  width = 800, 
  height = 600 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    
    // Clear existing content
    svg.selectAll('*').remove();

    // Initial placeholder visualization
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height / 2)
      .attr('text-anchor', 'middle')
      .attr('class', 'fill-white text-xl')
      .text('Reindeer Chart Placeholder');
      
    // Draw the central axis
    svg.append('line')
      .attr('x1', width / 2)
      .attr('y1', 0)
      .attr('x2', width / 2)
      .attr('y2', height)
      .attr('stroke', '#666')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5');

  }, [width, height]);

  return (
    <div className="w-full h-full flex justify-center items-center bg-gray-800 p-4 rounded-lg">
      <svg 
        ref={svgRef}
        width={width}
        height={height}
        className="bg-gray-900 rounded shadow-lg"
      />
    </div>
  );
};
