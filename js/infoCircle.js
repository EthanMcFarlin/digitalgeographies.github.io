class infoCircle {

    constructor(parentElement, variableNumber, variableName, selectionType) {
        this.parentElement = parentElement;

        this.variableNumber = variableNumber;
        this.variableName = variableName;
        this.selectionType = selectionType;

        this.initVis()
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 2, right: 5, bottom: 0, left: 2};

        // let parentElement = document.getElementById(this.parentElement);

        vis.width = 35 - vis.margin.left - vis.margin.right;
        vis.height = 35 - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'infoCircleTooltip')

        vis.icon = vis.svg.append('svg:foreignObject')
            .attr("width", 40)
            .attr("height", 40)
            .attr("color", "red")
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`)
            .append("xhtml:body")
            .attr("id", "newBody" + vis.selectionType)
            .attr("class", "dark")
            .html('<i class="fa-solid fa-circle-info infoIcon"></i>');


        this.wrangleData();
    }

    wrangleData(){
        let vis = this

        vis.updateVis()

    }

    updateVis(){
        let vis = this;

        vis.variableNumber = chosenSVIMeasure;
        vis.variableName = scaleDictionary[vis.variableNumber].name;


        vis.icon
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .attr('stroke-width', 4)
                    .style('opacity', function(d) {
                        //console.log(d[1].SPL_THEMES)

                        return 0.5
                    })

                if (currentVariableSelectionType === vis.selectionType) {
                    vis.tooltip
                        .style("opacity", 1)
                        .style("left", event.pageX + -150 + "px")
                        .style("top", event.pageY + 40 + "px")
                        .html(`
                        <div>
                            <p><span><b>Variable Description:</b><br> ${scaleDictionary[vis.variableNumber].desc}</span></p>
                        </div>`);
                }


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

    }



}