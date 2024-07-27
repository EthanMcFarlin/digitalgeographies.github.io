class doubleHistogram {

    constructor(parentElement, amazonData, variableNumber, variableName) {
        this.parentElement = parentElement;
        this.amazonData = amazonData;
        this.variableNumber = variableNumber;
        this.variableName = variableName;

        this.initVis()
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 5, right: 50, bottom: 60, left: 70};

        let parentElement = document.getElementById(this.parentElement);

        vis.width = parentElement.offsetWidth - vis.margin.left - vis.margin.right;
        vis.height = parentElement.offsetHeight - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'barTooltip')

        // axis groups
        vis.xAxisGroup = vis.svg.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate (0,${vis.height})`);

        vis.yAxisGroup = vis.svg.append('g')
            .attr('class', 'axis y-axis');

        vis.gridLineGroup = vis.svg.append('g')
            .attr("class", "grid")

        vis.xAxisText = vis.svg.append("text")
            .attr("text-anchor", "end")
            .attr("class", "axisTitle")
            .attr("x", vis.width)
            .attr("y", vis.height + vis.margin.top + 30)
            .text(vis.variableName);

        vis.yAxisText = vis.svg.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("class", "axisTitle")
            .attr("y", -vis.margin.left + 30)
            .attr("x", -vis.margin.top - 70)
            .text("# of Tracts with Facilities")

        vis.titleText = vis.svg.append('g')
            .attr('class', 'title bar-title')
            .append('text')
            .text(vis.variableName + ' Frequency Distribution')
            .attr('transform', `translate(${vis.width / 2}, 10)`)
            .attr('text-anchor', 'middle');

        vis.refLine = vis.svg.append("line")
            .attr("x1", 0 )
            .attr("x2", 0 )
            .attr("y1", 0)
            .attr("y2", 0)
            .attr("stroke", "#fc8403")
            .attr("opacity", 0.8)
            .attr("stroke-width", "3")

        vis.svg.append("circle").attr("cx",function(d) {return ( (vis.width / 2) - 140)}).attr("cy",35).attr("r", 6).style("fill", "#f097a0").attr("class", "histCircleLegend")
        vis.svg.append("circle").attr("cx",function(d) {return ( (vis.width / 2) + 20)}).attr("cy",35).attr("r", 6).style("fill", "#b495f5").attr("class", "histCircleLegend")
        vis.svg.append("text").attr("x",function(d) {return ( (vis.width / 2) - 120)}).attr("y", 40).text("Warehouses").style("font-size", "15px").attr("class","histTextLegend")
        vis.svg.append("text").attr("x",function(d) {return ( (vis.width / 2) + 40)}).attr("y", 40).text("Data Centers").style("font-size", "15px").attr("class","histTextLegend")

        this.wrangleData();
    }

    wrangleData(){
        let vis = this

        vis.displayData = vis.amazonData.filter(function(d) {
            return (d[vis.variableName] > -999);
        })

        if (vis.variableName === "EP_UNINSUR.x") {
            vis.displayData = vis.displayData.filter(function(d) {
                return (d[vis.variableName] < 100);
            })
        }

        vis.updateVis()

    }

    updateVis(){
        let vis = this;

        // console.log("update vis");

        vis.variableNumber = chosenSVIMeasure;
        vis.variableName = scaleDictionary[vis.variableNumber].name;

        vis.titleText
            .text(vis.variableName + ' Frequency Distribution')

        vis.x = d3.scaleLinear()
            //.domain( d3.extent(vis.displayData, function(d) { return d.SPL_THEMES }) )
            //.domain([d3.min(vis.displayData, d => d.SPL_THEMES), d3.max(vis.displayData, d => d.SPL_THEMES)] )
            .domain([scaleDictionary[vis.variableNumber].min * 0.9, scaleDictionary[vis.variableNumber].max * 1.1]) // use display data for entire domain, otherwise you're lying with data
            .range([0, vis.width]);

        vis.xAxisGroup
            .transition()
            .duration(1000)
            .call(
                d3.axisBottom(vis.x)
                .ticks(8)
            );

        // set the parameters for the histogram
        vis.histogram = d3.histogram()
            .value(function(d) { return +d[vis.variableName]; })   // I need to give the vector of value
            .domain(vis.x.domain())  // then the domain of the graphic
            .thresholds(vis.x.ticks(40)); // then the numbers of bins

        vis.bins1 = vis.histogram(vis.displayData.filter( function(d){return d.Classification === "Warehouse"} ));
        vis.bins2 = vis.histogram(vis.displayData.filter( function(d){return d.Classification === "Data Center"} ));

        vis.y = d3.scaleLinear()
            .range([vis.height, 80]);

        vis.y.domain([0, d3.max(vis.bins1, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously

        vis.yAxisGroup
            .transition()
            .duration(1000)
            .call(
                d3.axisLeft(vis.y)
                .ticks(5)
            );

        vis.GridLine = () => d3.axisLeft().scale(vis.y);

        vis.gridLineGroup
            .call(vis.GridLine()
                .tickSize(-vis.width,0,0)
                .tickFormat("")
                .ticks(5)
            );

        // vis.textGroup = vis.svg.append("g")
        //     .data(vis.displayData)
        //
        // vis.textGroup
        //     .enter()
        //     .append("text")
        //     .merge(vis.textGroup)
        //     .transition()
        //         .duration(1000)
        //         .attr("text-anchor", "end")
        //         .attr("class", "axisTitle")
        //         .attr("x", vis.width)
        //         .attr("y", vis.height + vis.margin.top + 20)
        //         .text(vis.variableName);

        vis.xAxisText
            .text(vis.variableName);

        vis.rect1 = vis.svg.selectAll("rect")
            .data(vis.bins1)

        vis.rect1
            .enter()
            .append("rect")
            .merge(vis.rect1)
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .attr('stroke-width', 1)
                    .attr('fill', 'rgba(255,0,0,0.47)')
                    .style('opacity', function(d) {
                        // console.log(d[1].SPL_THEMES)

                        return 0.7
                    })

                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                            <div>
                                <p><span>The number of census tracts which contain <b>warehouses</b> <br>within this <b>${scaleDictionary[vis.variableNumber].name}</b> value range is <b>${d.length}</b></span>.</p>
                            </div>`);

            })
            .on('mouseout', function(event, d){
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0 + "px")
                    .style("top", 0 + "px")

                d3.select(this)
                    .attr('stroke-width', .1)
                    .attr('stroke', '#fff')
                    .attr('fill', '#f097a0')
                    .style('opacity', 1);
            })
            .transition()
            .duration(1000)
                .attr("x", 1)
                .attr("transform", function(d) { return "translate(" + vis.x(d.x0) + "," + vis.y(d.length) + ")"; })
                .attr("width", function(d) { return vis.x(d.x1) - vis.x(d.x0) -1 ; })
                .attr("height", function(d) { return vis.height - vis.y(d.length); })
                .style("fill", "#f097a0")
                .style("opacity", 1);

        vis.rect1
            .exit()
            .remove()

        vis.rect2 = vis.svg.selectAll("rect2")
            .data(vis.bins2)

        vis.rect2
            .enter()
            .append("rect")
            .merge(vis.rect2)
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .attr('stroke-width', 1)
                    .attr('fill', 'rgba(255,0,0,0.47)')
                    .style('opacity', function(d) {
                        //console.log(d[1].SPL_THEMES)

                        return 0.7
                    })

                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                        <div>
                                <p><span>The number of census tracts which contain <b>data centers</b> <br>within this <b>${scaleDictionary[vis.variableNumber].name}</b> value range is <b>${d.length}</b></span>.</p>
                        </div>`);

            })
            .on('mouseout', function(event, d){
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0 + "px")
                    .style("top", 0 + "px")

                d3.select(this)
                    .attr('stroke-width', .1)
                    .attr('stroke', '#fff')
                    .attr('fill', '#b495f5')
                    .style('opacity', 1);
            })
            .transition()
            .duration(1000)
                .attr("x", 1)
                .attr("transform", function(d) { return "translate(" + vis.x(d.x0) + "," + vis.y(d.length) + ")"; })
                .attr("width", function(d) { return vis.x(d.x1) - vis.x(d.x0) -1 ; })
                .attr("height", function(d) { return vis.height - vis.y(d.length); })
                .style("fill", "#b495f5")
                .style("opacity", 1)

        vis.rect2
            .exit()
            .remove()

        // vis.svg
        //     .append("text")
        //     .attr("x", vis.x(scaleDictionary[0].avg) - 170)
        //     .attr("y", vis.y(133))
        //     .text("average u.s. census tract")
        //     .attr("class", "ntlAvgAnnotation")

        // vis.refLine = vis.svg.selectAll("line")
        //
        // vis.refLine
        //     .enter()
        //     .append("line")
        //     .merge(vis.refLine)
        //     .on('mouseover', function(event, d) {
        //         d3.select(this)
        //             .attr('stroke-width', 3)
        //             .style('opacity', function(d) {
        //                 //console.log(d[1].SPL_THEMES)
        //
        //                 return 0.5
        //             })
        //
        //         vis.tooltip
        //             .style("opacity", 1)
        //             .style("left", event.pageX + 20 + "px")
        //             .style("top", event.pageY + "px")
        //             .html(`
        //                 <div>
        //                     <p><span><b>U.S. Census Tract National Average:</b> ${scaleDictionary[vis.variableNumber].avg.toFixed(2)}</span></p>
        //                 </div>`);
        //
        //     })
        //     .on('mouseout', function(event, d){
        //         vis.tooltip
        //             .style("opacity", 0)
        //             .style("left", 0 + "px")
        //             .style("top", 0 + "px")
        //
        //         d3.select(this)
        //             .attr('stroke-width', 3)
        //             .style('opacity', 0.8);
        //     })
        //     .transition()
        //     .duration(1000)
        //         .attr("x1", vis.x(scaleDictionary[vis.variableNumber].avg) )
        //         .attr("x2", vis.x(scaleDictionary[vis.variableNumber].avg) )
        //         .attr("y1", vis.y(0) + 100)
        //         .attr("y2", vis.y(138))
        //         .attr("stroke", "#4a4a4a")
        //         .attr("opacity", 0.8)
        //         .attr("fill", "red")
        //         .attr("stroke-width", "2")
        //
        // vis.refLine
        //     .exit()
        //     .remove()


        vis.refLine
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .attr('stroke-width', 4)
                    .style('opacity', function(d) {
                        //console.log(d[1].SPL_THEMES)

                        return 0.5
                    })

                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                        <div>
                            <p><span><b>U.S. Census Tract National ${scaleDictionary[vis.variableNumber].name} Average:</b> ${scaleDictionary[vis.variableNumber].avg.toFixed(2)}</span></p>
                        </div>`);

            })
            .on('mouseout', function(event, d){
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0 + "px")
                    .style("top", 0 + "px")

                d3.select(this)
                    .attr('stroke-width', 3)
                    .style('opacity', 0.8);
            })
            .transition()
            .duration(1000)
            .attr("y1", vis.height)
            .attr("y2", 60)
            .attr("x1", vis.x(scaleDictionary[vis.variableNumber].avg) )
            .attr("x2", vis.x(scaleDictionary[vis.variableNumber].avg) )

    }



}