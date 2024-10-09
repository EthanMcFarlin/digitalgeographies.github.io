class Timeline {

    constructor(parentElement, data){
        // Save reference to current instance
        const vis = this;

        vis.parentElement = parentElement;
        vis.data = data;
        vis.displayData = data;

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



        let stack = d3.stack()
            .keys(["Warehouses", "Data_Centers"]);

        let stackedData = stack(vis.displayData);

        vis.svg.selectAll(".layer")
            .data(stackedData)
            .enter().append("g")
            .attr("class", "layer")
            .attr("fill", d => vis.color(d.key))
            .selectAll("rect")
            .data(d => d)
            .enter().append("rect")
            .attr("x", d => vis.x(d.data.Year))
            .attr("y", d => vis.y(d[1]))
            .attr("height", d => vis.y(d[0]) - vis.y(d[1]))
            .attr("width", vis.x.bandwidth());

        vis.brush = d3.brushX()
            .extent([[0, 0], [vis.width, vis.height]])
            .on("brush end", event => vis.brushed(event));

        vis.svg.append("g")
            .attr("class", "x brush")
            .call(vis.brush)
            .selectAll("rect")
            .attr("y", -6)
            .attr("height", vis.height + 7);



    }

    updateVis(receivedKeys) {

        let vis = this;

        console.log(receivedKeys);

        let stack = d3.stack().keys(receivedKeys);

        let stackedData = stack(vis.displayData);

        vis.color.domain(receivedKeys);

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
            .attr("y", vis.height) // Initially start from the bottom during transition
            .attr("height", 0) // Initially zero height during transition
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
        let selection = event.selection;
        if (!selection) {
            map.setFilter('centers-layer', null);  // Clears the filter if no selection
            return;
        }

        let [x0, x1] = selection;
        let indices = vis.displayData.map(d => d.Year);
        let rangeStart = Math.floor(x0 / vis.x.step());
        let rangeEnd = Math.floor(x1 / vis.x.step());

        let year0 = indices[Math.max(0, Math.min(rangeStart, indices.length - 1))];
        let year1 = indices[Math.max(0, Math.min(rangeEnd, indices.length - 1))];

        if (year0 != null && year1 != null) {
            map.setFilter('centers-layer', ['all',
                ['has', 'Year'],
                ['>=', ['number', ['get', 'Year']], year0],
                ['<=', ['number', ['get', 'Year']], year1]
            ]);
        } else {
            console.warn("Can't apply filter: year0 or year1 is null");
        }
    }

}