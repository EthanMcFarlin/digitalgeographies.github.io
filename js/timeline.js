class Timeline {

    constructor(parentElement, data){
        const vis = this;
        vis.parentElement = parentElement;
        vis.data = data;
        vis.displayData = data; // Initialize displayData with all data

        vis.initVis();
    }

    initVis() {
        const vis = this;

        vis.margin = {top: 20, right: 15, bottom: 40, left: 50};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.x = d3.scaleBand()
            .range([0, vis.width])
            .domain(vis.displayData.map(d => d.Year))
            .padding(0.1);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0])
            .domain([0, d3.max(vis.displayData, d => d.Total)]);

        vis.color = d3.scaleOrdinal()
            .domain(["Warehouses", "Data_Centers"])
            .range(["#EF97A0", "#B495F5"]);

        vis.xAxis = d3.axisBottom(vis.x).tickValues(vis.x.domain().filter((d, i) => i % 3 === 0));
        vis.svg.append("g")
            .attr("transform", "translate(0," + vis.height + ")")
            .call(vis.xAxis);

        vis.yAxis = d3.axisLeft(vis.y);
        vis.yAxisGroup = vis.svg.append("g") // Store the y-axis group to update it later
            .attr("class", "y-axis")
            .call(vis.yAxis);

        // Initialize brush
        vis.brush = d3.brushX()
            .extent([[0, 0], [vis.width, vis.height]])
            .on("brush end", event => vis.brushed(event));

        vis.svg.append("g")
            .attr("class", "x brush")
            .call(vis.brush)
            .selectAll("rect")
            .attr("y", -6)
            .attr("height", vis.height + 7);

        // Initialize the visualization with all categories
        this.updateVis(["Warehouses", "Data_Centers"]);
    }

    updateVis(receivedKeys) {
        const vis = this;

        if (receivedKeys.length === 0) {
            vis.svg.selectAll(".layer").remove();
            return;
        }

        // Recalculation of the stack based on filtered keys
        let stack = d3.stack().keys(receivedKeys);
        let stackedData = stack(vis.displayData);

        // Update the y-axis scale domain based on the selected categories
        vis.y.domain([0, d3.max(vis.displayData, d =>
            d3.sum(receivedKeys.map(key => d[key]))
        )]);

        // Update y-axis to reflect new domain
        vis.yAxisGroup // Use the stored y-axis group for updates
            .transition()
            .duration(500)
            .call(vis.yAxis.scale(vis.y));

        // Update data on the timeline
        let layers = vis.svg.selectAll(".layer")
            .data(stackedData, d => d.key);

        let layersEnter = layers.enter().append("g")
            .attr("class", "layer")
            .attr("fill", d => vis.color(d.key));

        let rects = layersEnter.merge(layers)
            .selectAll("rect")
            .data(d => d);

        rects.enter().append("rect")
            .attr("x", d => vis.x(d.data.Year))
            .attr("y", vis.height)
            .attr("height", 0)
            .attr("width", vis.x.bandwidth())
            .merge(rects)
            .transition().duration(1000)
            .attr("x", d => vis.x(d.data.Year))
            .attr("y", d => vis.y(d[1]))
            .attr("height", d => vis.y(d[0]) - vis.y(d[1]));

        layers.exit().remove();
    }

    brushed(event) {
        const vis = this;
        const selection = event.selection;
        if (!selection) {
            map.setFilter('centers-layer', null);
            return;
        }

        // Get the selection boundaries and map them to data indices
        const [x0, x1] = selection;
        const step = vis.x.step();
        const yearData = vis.displayData.map(d => d.Year);

        const rangeStart = Math.floor(x0 / step);
        const rangeEnd = Math.floor(x1 / step);

        const year0 = yearData[Math.max(0, Math.min(rangeStart, yearData.length - 1))];
        const year1 = yearData[Math.max(0, Math.min(rangeEnd, yearData.length - 1))];

        // Determine the filter criteria based on the checkboxes
        const showWarehouses = document.getElementById('layer1').checked;
        const showDataCenters = document.getElementById('layer2').checked;

        let typeFilter = ['any'];
        if (showWarehouses) typeFilter.push(['==', ['get', 'Classification'], 'Warehouse']);
        if (showDataCenters) typeFilter.push(['==', ['get', 'Classification'], 'Data Center']);

        // Apply brush-based filtering logic
        if (year0 != null && year1 != null && typeFilter.length > 1) {
            map.setFilter('centers-layer', ['all',
                ['>=', ['number', ['get', 'Year']], year0],
                ['<=', ['number', ['get', 'Year']], year1],
                typeFilter
            ]);
        } else {
            map.setFilter('centers-layer', null);
        }
    }
}