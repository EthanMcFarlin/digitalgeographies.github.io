// init global variables & switches
let myDoubleHistogram;
let myInfoCircle1;
let myInfoCircle2;
let myTimeline;

let promises = [
    d3.csv("data/transformed_data_4_EJI.csv"),
    d3.csv("data/time_data_aggregated_1.csv", d => ({
        Year: +d.Year,
        Warehouses: +d.Warehouses,
        Data_Centers: +d.Data_Centers,
        Total: +d.Total
    }))
];



Promise.all(promises)
    .then( function(data){ initMainPage(data) })
    .catch( function (err){console.log(err)} );

function initMainPage(dataArray) {

    // console.log(dataArray);

    myDoubleHistogram = new doubleHistogram('histogramContainer', dataArray[0], 0, "SPL_THEMES");
    myInfoCircle1 = new infoCircle('variableInfoContainer1', 0, "SPL_THEMES", "SVI");
    myInfoCircle2 = new infoCircle('variableInfoContainer2', 0, "SPL_THEMES", "EJ");
    myTimeline = new Timeline('timelineContainer', dataArray[1])

}

// function brushed() {
//     console.log("test");
// }