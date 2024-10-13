class Timeline {

    constructor(parentElement, data){
        const vis = this;
        vis.parentElement = parentElement;
        vis.data = data;
        vis.displayData = data; // Initialize displayData for consistency

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
        vis.svg.append("g")
            .call(vis.yAxis);

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

        // Stacking process with received keys
        let stack = d3.stack().keys(receivedKeys);
        let stackedData = stack(vis.displayData);

        vis.color.domain(receivedKeys);

        // Update scales with filtered data
        vis.x.domain(vis.displayData.map(d => d.Year));
        vis.y.domain([0, d3.max(vis.displayData, d =>
            d3.sum(receivedKeys.map(key => d[key]))
        )]);

        // Update layers based on the filtered data and keys
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
            .merge(rects) // Merge with existing rectangles
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
            // Clear the filter if no brushing selection
            map.setFilter('centers-layer', null);
            return;
        }

        // Get the boundaries of the selection
        const [x0, x1] = selection;
        const yearData = vis.displayData.map(d => d.Year);
        const step = vis.x.step();

        // Determine selected years
        const rangeStart = Math.floor(x0 / step);
        const rangeEnd = Math.floor(x1 / step);

        const year0 = yearData[Math.max(0, Math.min(rangeStart, yearData.length - 1))];
        const year1 = yearData[Math.max(0, Math.min(rangeEnd, yearData.length - 1))];

        // Determine which keys (stack layers) are currently visible
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
            // As a fallback, default to applying no specific year range filter
            map.setFilter('centers-layer', null);
        }
    }
}