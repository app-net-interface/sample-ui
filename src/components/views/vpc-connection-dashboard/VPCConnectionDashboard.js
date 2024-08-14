/**
 * Copyright (c) 2024 Cisco Systems, Inc. and its affiliates
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http:www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import Select from 'react-select';
import { getGeoLocationForIP } from './GeoUtil';
import { convertGeoLocationToGeoData, initMap, setMarker, hideMap } from './MapUtil';
import './styles.css';
import DefaultLayout from '@/layout/DefaultLayout';

export const VPCConnectionDashboard = () => {
  const svgRef = useRef();
  const [selectedIP, setSelectedIP] = useState(null);
  const CANVAS_WIDTH = window.innerWidth;
  const CANVAS_HEIGHT = window.innerHeight;
  const nodeRadius = 25;
  // Geolocation can be enabled when we have the ability to either
  // 1 - have a domain name for CORS or 2 - Use a Server to serve GeoIP DB
  // Deploying with a domain name is important. 
  // CORS bypass is also an option but it's not working for some reason.
  const geoLocationEnabled = true

  const [data, setData] = useState(null);

  //tooltip related states 

  const [tooltipContent, setTooltipContent] = useState(null);
  const tooltipRef = useRef(null);
  const [tooltipX, setTooltipX] = useState(null);
  const [tooltipY, setTooltipY] = useState(null);


  useEffect(() => {
    fetch('/graphData.json')
      .then(response => response.json())
      .then(jsonData => setData(jsonData))
      .catch(error => console.error('Error loading JSON data:', error));
  }, []);


  useEffect(() => {
    if (!data)
      return;
    console.log("Data =", data)
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    const edgesGroup = svg.append('g');
    const nodesGroup = svg.append('g');
    const textGroup = svg.append('g');

    const edges = edgesGroup.selectAll('line')
      .data(data.edges)
      .enter()
      .append('line')
      .attr('class', 'edge')
      .attr('stroke-width', d => getWidthBasedOnCount(d.count))

    edges.on('mouseover', function (event, d) {
      setTooltipContent(d.count);
    })
      .on('mousemove', function (event) {
        setTooltipX(event.pageX);
        setTooltipY(event.pageY);
      })
      .on('mouseout', function () {
        setTooltipContent(null);
      });



    //edges.append("title")
    //  .text(d => d.count);

    const nodes = nodesGroup.selectAll('circle')
      .data(data.nodes)
      .enter()
      .append('circle')
      .attr('class', d => `node ${d.type}`)
      .attr('r', nodeRadius)

      .call(d3.drag()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded));

    const nodeText = textGroup.selectAll('text')
      .data(data.nodes)
      .enter()
      .append('text')
      .attr('class', 'node-text')
      .attr('dx', d => d.x)
      .attr('dy', d => d.y)
      .attr('font-size', '12px')
      .attr('text-anchor', 'middle')
      .text(d => d.id)

    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.edges).id(d => d.id).distance(5))
      .force('charge', d3.forceManyBody().strength(-10))
      .force('center', d3.forceCenter(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2))
      .force('collision', d3.forceCollide().radius(nodeRadius * 2));

    if (selectedIP) {
      const connectedNodes = data.edges.filter(e => e.source.id === selectedIP || e.target.id === selectedIP).map(e => e.source.id === selectedIP ? e.target.id : e.source.id);

      nodes
        .style('fill', d => d.id === selectedIP ? '#FF5733' : (d.type === 'public' ? '#007BFF' : '#52C41A'))
        .style('opacity', d => d.id === selectedIP || connectedNodes.includes(d.id) ? 1 : 0.1);
      edges
        .style('opacity', d => d.source.id === selectedIP || d.target.id === selectedIP ? 1 : 0.1);

      const selectedNode = data.nodes.find(d => d.id === selectedIP);
      if (selectedNode) {
        const connectedNodes = data.edges.filter(e => e.source.id === selectedIP || e.target.id === selectedIP).map(e => e.source.id === selectedIP ? e.target.id : e.source.id);

        nodes
          .style('fill', d => d.id === selectedIP ? '#FF5733' : (d.type === 'public' ? '#007BFF' : '#52C41A'))
          .style('opacity', d => d.id === selectedIP || connectedNodes.includes(d.id) ? 1 : 0.1);

        edges
          .style('opacity', d => d.source.id === selectedIP || d.target.id === selectedIP ? 1 : 0.1);

        nodeText
          .style('opacity', d => d.id === selectedIP || connectedNodes.includes(d.id) ? 1 : 0.1);


        selectedNode.fx = CANVAS_WIDTH / 2;
        selectedNode.fy = CANVAS_HEIGHT / 2;

        // Calculate positions for the connected nodes
        const circleRadius = 150;  // Define the distance you want from the central node
        const angleStep = 2 * Math.PI / connectedNodes.length;
        connectedNodes.forEach((nodeId, i) => {
          const node = data.nodes.find(d => d.id === nodeId);
          if (node) {
            node.fx = CANVAS_WIDTH / 2 + circleRadius * Math.cos(i * angleStep);
            node.fy = CANVAS_HEIGHT / 2 + circleRadius * Math.sin(i * angleStep);
          }
        });
        if (geoLocationEnabled) {

          initMap();

          getGeoLocationForIP(selectedIP).then(geoLocation => {
            // Fetch geolocations for all the connected nodes and plot them on the map
            connectedNodes.forEach(nodeId => {
              getGeoLocationForIP(nodeId).then(connectedGeo => {
                if (connectedGeo && connectedGeo.latitude && connectedGeo.longitude) {
                  setMarker(convertGeoLocationToGeoData(connectedGeo), false);
                }
              });
            });
            // Plot the selected IP on the map in the end, color it blue and center it here.
            if (geoLocation && geoLocation.latitude && geoLocation.longitude) {
              setMarker(convertGeoLocationToGeoData(geoLocation), true);
            }
          });
        }
        // Bulk fetch IP code 
        /*if (geoLocationEnabled) { 
        // Fetch and render geolocation for the selected IP
        getGeoLocationForIP([selectedIP]).then(selectedGeoLocations => {
          const geoLocation = selectedGeoLocations[0];
          if (geoLocation && geoLocation.latitude && geoLocation.longitude) {
              // Render the Google map centered on this location
              initMap(geoLocation.latitude, geoLocation.longitude);

              // Plot the selected IP on the map
              plotLocationOnMap(geoLocation.latitude, geoLocation.longitude);

              // Fetch geolocations for all the connected nodes
              getGeoLocationForIP(connectedNodes).then(connectedGeoLocations => {
                  connectedGeoLocations.forEach(connectedGeo => {
                      if (connectedGeo && connectedGeo.latitude && connectedGeo.longitude) {
                          plotLocationOnMap(connectedGeo.latitude, connectedGeo.longitude);
                      }
                  });
              });
          }
      });
    } 
    */
      }
    } else {
      nodes
        .style('fill', d => d.type === 'public' ? '#007BFF' : '#52C41A')
        .style('opacity', 0.8);
      //edges.style('opacity', 0.6);
      // Hide the map when IP is deselected
      hideMap();
    }

    simulation.nodes(data.nodes).on('tick', () => {
      edges.attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      nodes.attr('cx', d => d.x).attr('cy', d => d.y);
      nodeText.attr('dx', d => d.x).attr('dy', d => d.y);
    });

    simulation.force('link').links(data.edges);
    function getWidthBasedOnCount(count) {
      if (count < 20) {
        return 4;
      } else if (count < 50) {
        return 6;
      } else if (count < 100) {
        return 8;
      } else {
        return 10;
      }
    }
    function dragStarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragEnded(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
  }, [selectedIP, data]);

  if (!data) {
    return <div>Loading...</div>;
  }

  const sortedOptions = data.nodes.map(node => node.id).sort();
  const options = [{ value: '', label: 'All' }, ...sortedOptions.map(ip => ({ value: ip, label: ip }))];

  return (
    <DefaultLayout>
      <div>
        <Select
          options={options}
          onChange={e => setSelectedIP(e ? e.value : null)}
          placeholder="Select IP..."
          isClearable
          isSearchable
        />
        <svg ref={svgRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
          <g id="canvas"></g>
        </svg>
        <div id="map" style={{ width: '100%', height: '1000px' }}></div>
        <div id="node-info"></div>
        <div id="edge-info"></div>
        <div id="tooltip" ref={tooltipRef} style={{ display: tooltipContent ? 'block' : 'none', color: 'blue', fontSize: '20px', position: 'absolute', left: tooltipX, top: tooltipY, backgroundColor: 'white', border: '1px solid black', padding: '5px' }}>
          {tooltipContent}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default VPCConnectionDashboard;
