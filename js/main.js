// init global variables & switches
let myDoubleHistogram;
let myInfoCircle1;
let myInfoCircle2;

let promises = [
    d3.csv("data/transformed_data_4_EJI.csv")
];

Promise.all(promises)
    .then( function(data){ initMainPage(data) })
    .catch( function (err){console.log(err)} );

function initMainPage(dataArray) {

    // console.log(dataArray);

    myDoubleHistogram = new doubleHistogram('histogramContainer', dataArray[0], 0, "SPL_THEMES");
    myInfoCircle1 = new infoCircle('variableInfoContainer1', 0, "SPL_THEMES", "SVI");
    myInfoCircle2 = new infoCircle('variableInfoContainer2', 0, "SPL_THEMES", "EJ");

}
