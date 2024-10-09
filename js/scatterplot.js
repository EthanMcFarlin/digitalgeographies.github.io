class Scatterplot {
    constructor(parentElement, amazonData, variableNumber, variableName) {
        this.parentElement = parentElement;
        this.amazonData = amazonData;
        this.variableNumber = variableNumber;
        this.variableName = variableName;

        this.stateAbbreviations = {
            "Alabama": "AL",
            "Alaska": "AK",
            "Arizona": "AZ",
            "Arkansas": "AR",
            "California": "CA",
            "Colorado": "CO",
            "Connecticut": "CT",
            "Delaware": "DE",
            "Florida": "FL",
            "Georgia": "GA",
            "Hawaii": "HI",
            "Idaho": "ID",
            "Illinois": "IL",
            "Indiana": "IN",
            "Iowa": "IA",
            "Kansas": "KS",
            "Kentucky": "KY",
            "Louisiana": "LA",
            "Maine": "ME",
            "Maryland": "MD",
            "Massachusetts": "MA",
            "Michigan": "MI",
            "Minnesota": "MN",
            "Mississippi": "MS",
            "Missouri": "MO",
            "Montana": "MT",
            "Nebraska": "NE",
            "Nevada": "NV",
            "New Hampshire": "NH",
            "New Jersey": "NJ",
            "New Mexico": "NM",
            "New York": "NY",
            "North Carolina": "NC",
            "North Dakota": "ND",
            "Ohio": "OH",
            "Oklahoma": "OK",
            "Oregon": "OR",
            "Pennsylvania": "PA",
            "Rhode Island": "RI",
            "South Carolina": "SC",
            "South Dakota": "SD",
            "Tennessee": "TN",
            "Texas": "TX",
            "Utah": "UT",
            "Vermont": "VT",
            "Virginia": "VA",
            "Washington": "WA",
            "West Virginia": "WV",
            "Wisconsin": "WI",
            "Wyoming": "WY",
            "District of Columbia": "DC"
        };

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 5, right: 40, bottom: 70, left: 50};

        let parentElement = document.getElementById(this.parentElement);

        vis.width = parentElement.offsetWidth - vis.margin.left - vis.margin.right;
        vis.height = parentElement.offsetHeight - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate(${vis.margin.left},${vis.margin.top})`);

        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "scatterTooltip")
            .attr('id', 'scatterTooltip');

        // axis groups
        vis.xAxisGroup = vis.svg.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);

        vis.yAxisGroup = vis.svg.append('g')
            .attr('class', 'axis y-axis');

        vis.xAxisText = vis.svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", vis.width)
            .attr("class", "scatterText")
            .attr("y", vis.height + vis.margin.top + 40)
            .text(vis.variableName);

        this.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.displayData = vis.amazonData.filter(function(d) {
            return (d[vis.variableName] > -999); // Assume this is your filtering logic for valid data points
        });

        vis.updateVis(["Warehouse", "Data Center"]);
    }

    updateVis(keys) {
        let vis = this;

        // Filter data based on keys
        let filteredData = vis.displayData.filter(d => keys.includes(d.Classification));


        vis.variableNumber = chosenSVIMeasure;

        // Update dynamic variable names
        vis.variableName = scaleDictionary[vis.variableNumber].name;

        // Create scales
        vis.x = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => +d[vis.variableName])])
            .range([0, vis.width]);

        vis.y = d3.scaleBand()
            .domain(filteredData.map(d => this.stateAbbreviations[d.STATE] || d.STATE))
            .range([0, vis.height])
            .padding(0.1);

        // Update axes
        vis.xAxisGroup
            .transition()
            .duration(1000)
            .call(d3.axisBottom(vis.x));

        vis.yAxisGroup
            .transition()
            .duration(1000)
            .call(d3.axisLeft(vis.y));

        // Update x-axis text
        vis.svg.selectAll(".scatterText")
            .data([vis.variableName])
            .join(
                enter => enter.append("text")
                    .attr("class", "scatterText")
                    .attr("text-anchor", "end")
                    .attr("x", vis.width)
                    .attr("y", vis.height + vis.margin.top + 40)
                    .text(d => d),
                update => update
                    .text(d => d)
            );

        // Draw scatter points
        let circles = vis.svg.selectAll("circle")
            .data(filteredData);

        circles.enter()
            .append("circle")
            .merge(circles)
            .on('mouseover', function (event, d) {
                d3.select(this)
                    .attr('stroke-width', 1.5)
                    .attr('stroke', 'black');

                const stateAbbr = vis.stateAbbreviations[d.STATE];
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                        <div>${vis.variableName}: <b>${d[vis.variableName]}</b><br>State: <b>${stateAbbr || d.STATE}</b></div>
                    `);
            })
            .on('mouseout', function (event, d) {
                d3.select(this)
                    .attr('stroke-width', 0);

                vis.tooltip
                    .style("opacity", 0);
            })
            .on('click', function (event, d) {
                // Use map.easeTo to navigate to the selected point on the map
                if (d.Latitude && d.Longitude) {
                    map.easeTo({
                        center: [d.Longitude, d.Latitude],
                        zoom: 14,  // Adjust zoom level as needed
                        duration: 1000 // Adjust animation duration as needed
                    });
                }
            })
            .transition()
            .duration(1000)
            .attr("cx", (d) => vis.x(+d[vis.variableName]))
            .attr("cy", (d) => vis.y(this.stateAbbreviations[d.STATE] || d.STATE) + vis.y.bandwidth() / 2)
            .attr("r", 5)
            .style("fill", (d) => {
                if (d.Classification === "Warehouse") {
                    return "#f097a0"; // color for Warehouse
                } else if (d.Classification === "Data Center") {
                    return "#b495f5"; // color for Data Center
                } else {
                    return "#69b3a2"; // default color for any other classification
                }
            });

        circles.exit().remove();
    }
}