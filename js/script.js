// ********
// Initialization
// ********

mapboxgl.accessToken = 'pk.eyJ1IjoiZXRoYW5tY2ZhcmxpbiIsImEiOiJjbHl6NGo0OG8wbm5iMmxwdnVvNWl6dHUwIn0.pyb_HA0qJwJ9jZkrmlKcqA';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v11',
    // style: {
    //     version: 8,
    //     sources: {},
    //     layers: [
    //         {
    //             'id': 'background',
    //             'type': 'background',
    //             'paint': {
    //                 'background-color': '#1A1A1B'
    //             }
    //         }
    //     ]
    // },
    projection: 'albers',
    zoom: 2,
    minZoom: 3.5,
    center: [-90, 37.5],
    attributionControl: false
});

map.addControl(new mapboxgl.AttributionControl(), 'top-left');
map.addControl(new mapboxgl.NavigationControl(), 'top-left');

var popup;
let popupAppeared = false;
let currentVariableSelectionType = "SVI";

map.on('style.load', () => {
    map.setFog({});
});

const secondsPerRevolution = 240;
const maxSpinZoom = 5;
const slowSpinZoom = 3;

let userInteracting = false;
const spinEnabled = false;

function spinGlobe() {
    const zoom = map.getZoom();
    if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
        let distancePerSecond = 360 / secondsPerRevolution;
        if (zoom > slowSpinZoom) {
            const zoomDif =
                (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
            distancePerSecond *= zoomDif;
        }
        const center = map.getCenter();
        center.lng -= distancePerSecond;
        map.easeTo({ center, duration: 1000, easing: (n) => n });
    }
}

// Pause spinning on interaction
map.on('mousedown', () => {
    userInteracting = true;
});
map.on('dragstart', () => {
    userInteracting = true;
});

// When animation is complete, start spinning if there is no ongoing interaction
map.on('moveend', () => {
    spinGlobe();
});

spinGlobe();

// ********
// Variable Selection
// ********

let chosenSVIMeasure = 0;

function updateEJMeasure(){
    chosenSVIMeasure = document.getElementById("EJ-variables").value;
    document.getElementById("SVI-variables").selectedIndex = 0;
    updateCircles();
    updateText();
    currentVariableSelectionType = "EJ";

    if (popupAppeared) {
        popup.remove();
    }

    myDoubleHistogram.updateVis();

    changeColorScale();

    myInfoCircle2.updateVis();

    // document.getElementById("colorLegend1").innerHTML = scaleDictionary[chosenSVIMeasure].name + " < mean u.s. census tract";
    // document.getElementById("colorLegend2").innerHTML = scaleDictionary[chosenSVIMeasure].name + " > mean u.s. census tract";

}

function updateSVIMeasure(){
    chosenSVIMeasure = document.getElementById("SVI-variables").value;
    document.getElementById("EJ-variables").selectedIndex = 0;
    updateCircles();
    updateText();
    currentVariableSelectionType = "SVI";

    if (popupAppeared) {
        popup.remove();
    }

    myDoubleHistogram.updateVis();

    changeColorScale();

    myInfoCircle1.updateVis();

    // document.getElementById("colorLegend1").innerHTML = scaleDictionary[chosenSVIMeasure].name + " < mean u.s. census tract";
    // document.getElementById("colorLegend2").innerHTML = scaleDictionary[chosenSVIMeasure].name + " > mean u.s. census tract";


}

function updateText() {
    let minimum = document.getElementById("min");
    minimum.innerHTML = scaleDictionary[chosenSVIMeasure].min;

    let maximum = document.getElementById("max");
    maximum.innerHTML = scaleDictionary[chosenSVIMeasure].max;

    let legendVariable = document.getElementById("legend1-variable");
    legendVariable.innerHTML = scaleDictionary[chosenSVIMeasure].name;
}

function updateCircles() {
    map.setPaintProperty('centers-layer', 'circle-radius',
        {
            property: scaleDictionary[chosenSVIMeasure].name,
            stops: [
                [{zoom: 8, value: scaleDictionary[chosenSVIMeasure].min}, 0],
                [{zoom: 8, value: scaleDictionary[chosenSVIMeasure].max}, 12],
                [{zoom: 11, value: scaleDictionary[chosenSVIMeasure].min}, 0],
                [{zoom: 11, value: scaleDictionary[chosenSVIMeasure].max}, 15],
                [{zoom: 16, value: scaleDictionary[chosenSVIMeasure].min}, 0],
                [{zoom: 16, value: scaleDictionary[chosenSVIMeasure].max}, 60]
            ]
        }

    );
}

// ********
// Custom Color Scale
// ********


function changeColorScale() {

    let colorScaleText = document.getElementById("colorScaleSelect").value;
    let selectedVariable = scaleDictionary[chosenSVIMeasure].name;
    let selectedMin = scaleDictionary[chosenSVIMeasure].min;
    let selectedMax = scaleDictionary[chosenSVIMeasure].max;
    let selectedAvg = scaleDictionary[chosenSVIMeasure].avg;

    let colorLegend1 = document.getElementById("colorLegend1");
    let colorLegend2 = document.getElementById("colorLegend2");

    let colorDot1 = document.getElementById("colorDot1");
    let colorDot2 = document.getElementById("colorDot2");

    if (colorScaleText === "classification") {

        colorLegend1.innerHTML = "Warehouse"
        colorLegend2.innerHTML = "Data Center"

        colorDot1.style.backgroundColor = "#cf2945";
        colorDot2.style.backgroundColor = "#935eff"

        map.setPaintProperty('centers-layer', 'circle-color', [
                'match',
                ['get', 'Classification'],
                'Warehouse',
                '#cf2945',
                'Data Center',
                '#935eff',
                /* other */ '#e0d1ff'
            ]
        )
    } else {

        colorLegend1.innerHTML = selectedVariable + " < mean u.s. census tract"
        colorLegend2.innerHTML = selectedVariable + " > mean u.s. census tract"

        colorDot1.style.backgroundColor = "#0B8369";
        colorDot2.style.backgroundColor = "#D2C074"

        map.setPaintProperty('centers-layer', 'circle-color', [
            'step',
            ['get', selectedVariable],
            '#0B8369', // any item where `someCountableProperty` is <= 19 will be displayed with this color
            selectedAvg,
            '#D2C074', // any item where `someCountableProperty` is <= 22 && > 19 will be displayed with this color
            selectedMax,
            '#A16612' // any item where `someCountableProperty` is > 22 will be displayed with this color
            ]
        )
    }

}

// map.current.setPaintProperty("county", "fill-color", [
//     'step',
//     ['get', 'someCountableProperty'],
//     '#afc5ff', // any item where `someCountableProperty` is <= 19 will be displayed with this color
//     19,
//     '#376eff', // any item where `someCountableProperty` is <= 22 && > 19 will be displayed with this color
//     22,
//     '#1c3780' // any item where `someCountableProperty` is > 22 will be displayed with this color
// ]);

// ********
// On Load
// ********

map.on('style.load', () => {

    map.addSource('centers', {
        type: 'geojson',
        data: 'data/map_3.geojson'
    });

    map.addLayer({
        'id': 'centers-layer',
        'type': 'circle',
        'source': 'centers',
        'paint': {
            'fill-opacity-transition': {duration: 500},
            'circle-radius': {
                property: scaleDictionary[chosenSVIMeasure].name,
                stops: [
                    [{zoom: 8, value: scaleDictionary[chosenSVIMeasure].min}, 0],
                    [{zoom: 8, value: scaleDictionary[chosenSVIMeasure].max}, 12],
                    [{zoom: 11, value: scaleDictionary[chosenSVIMeasure].min}, 0],
                    [{zoom: 11, value: scaleDictionary[chosenSVIMeasure].max}, 15],
                    [{zoom: 16, value: scaleDictionary[chosenSVIMeasure].min}, 0],
                    [{zoom: 16, value: scaleDictionary[chosenSVIMeasure].max}, 60]
                ]
            },
            'circle-stroke-width': 0,
            'circle-stroke-color': 'white',
            'circle-opacity': 0.3,
            'circle-color': [
                'match',
                ['get', 'Classification'],
                'Warehouse',
                '#cf2945',
                'Data Center',
                '#935eff',
                /* other */ '#e0d1ff'
            ]
        }
    });

});

// ********
// Calculate Percent Difference
// ********

function calculatePercentDifference(inputValue, inputVariable) {
    let nationalMean = scaleDictionary[chosenSVIMeasure].avg;

    let diffAbs = inputValue - nationalMean;
    let diffRel = diffAbs / nationalMean;
    let diffPer = diffRel * 100;

    return diffPer.toFixed(2);
}

// ********
// On Click: Points
// ********


map.on('click', 'centers-layer', (e) => {
    let chosenProperty = scaleDictionary[chosenSVIMeasure].name;

    const coordinates = e.features[0].geometry.coordinates.slice();
    const description = e.features[0].properties.Concatenated_Address;
    const property = e.features[0].properties[chosenProperty];
    const classification = e.features[0].properties.Classification;
    const dictDesc = scaleDictionary[chosenSVIMeasure].desc;
    const year = e.features[0].properties["Launch\nYear"];
    const sqft = e.features[0].properties[" Total Working\nSquare \nFeet"];
    const status = e.features[0].properties["Facility_Status"];

    popupAppeared = true;

    let relevantMean = scaleDictionary[chosenSVIMeasure].avg;
    relevantMean = relevantMean.toFixed(2);

    let classificationColor;

    if (['mercator', 'equirectangular'].includes(map.getProjection().name)) {
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
    }

    let percentDifference = calculatePercentDifference(property, chosenProperty);
    let parityStatus;

    if (percentDifference > 0) {
        parityStatus = "greater";
    } else {
        parityStatus = "less";
    }

    popup = new mapboxgl.Popup({className: "info-container"})
        .setLngLat(coordinates)
        // .setHTML(
        //     "<span>" +
        //     "Type: " + classification + "<br><br>" +
        //     "Address: " + description + "<br><br>" +
        //     + chosenProperty + ": " + property + "<br><br>"
        //     + "</span>"
        // )
        // <i id="arrow" class="fa-solid fa-down-left-and-up-right-to-center"></i>
        .setHTML(
            "<h1 class='popup-header'>" + description + "</h1>" +
            // "<p>" + "<span class='popup-classification'>" + classification + "</span>" + "</p>" +
            "<p>" + "<span id='popup-classification'>" + classification + "</span>" + "<span id='popup-smallInfo'>" + "Est. " + year + ", " + sqft + " sq. ft." + "</span>" + "</p>" +
            "<p class='popup-property'>" + "<span class='popup-emphasis'>" + chosenProperty + ": " + "</span>" + "<span class='popup-light'>" + property + "</span>" + "</p>" +
    "<p class='popup-relValue'>" + "The census tract where this " + classification + " is located has a " + "<span class='popup-emphasis'>" + chosenProperty + "</span>" + " value " + "<span id='colorCorrespondingly'>" + "<i id='colorArrow' class='fa-solid'></i>" + " " + percentDifference + "% " + parityStatus + "</span>" + " than the national average of " + "<span id='relMean'>" + relevantMean + "</span>" + " for all U.S. Census tracts in 2022." + "</p>" +
            "<p class='popup-desc' id='descBorder'>" + "<span id='censusBureauDesc'>" + "Variable Description: " + "</span>" + "<span class='popup-small'>" + dictDesc + "</span>" + "</p>"
        )
        .addTo(map);

    if (classification == "Warehouse") {
        document.getElementById("popup-classification").classList = "Warehouse";
        classificationColor = "#F2CBD1";
    } else {
        document.getElementById("popup-classification").classList = "DC";
        classificationColor = "#E8DEFF";
    }

    let colorElement = document.getElementById("colorCorrespondingly");
    let colorArrowElement = document.getElementById("colorArrow");

    if (percentDifference > 0) {
        colorElement.style.color = "#e64956";
        colorArrowElement.classList.add("fa-arrow-up")
    } else {
        colorElement.style.color = "#518c5b";
        colorArrowElement.classList.add("fa-arrow-down")
    }

    let descBorderElement = document.getElementById("descBorder");
    descBorderElement.style.borderLeftColor = classificationColor;

});

map.on('mouseenter', 'centers-layer', () => {
    map.getCanvas().style.cursor = 'pointer';
});

map.on('mouseleave', 'centers-layer', () => {
    map.getCanvas().style.cursor = '';
});

// ********
// Menu Resizing
// ********

let menu_status = false;
let menu_status2 = false;

function minimize() {

    let parent1 = document.getElementById("contentToMinimize")
    let parent2 = document.getElementById("rounded-parent")
    let arrow = document.getElementById("arrow")

    menu_status = !menu_status;

    if (menu_status) {
        parent1.classList.add("parent1-minimized");
        parent2.classList.add("parent2-minimized");

        arrow.classList.remove("fa-down-left-and-up-right-to-center")
        arrow.classList.add("fa-sliders")

    } else {
        parent1.classList.remove("parent1-minimized");
        parent2.classList.remove("parent2-minimized");

        arrow.classList.add("fa-down-left-and-up-right-to-center")
        arrow.classList.remove("fa-sliders")
    }
}

function minimize2() {
    let parent2 = document.getElementById("histogramParent")
    let parent1 = document.getElementById("histogramContainer")
    let arrow2 = document.getElementById("arrow2")

    menu_status2 = !menu_status2;

    if (menu_status2) {
        parent1.classList.add("parent1-minimized");
        parent2.classList.add("parent3-minimized");

        arrow2.classList.remove("fa-down-left-and-up-right-to-center")
        arrow2.classList.add("fa-chart-simple")

    } else {
        parent1.classList.remove("parent1-minimized");
        parent2.classList.remove("parent3-minimized");

        arrow2.classList.add("fa-down-left-and-up-right-to-center")
        arrow2.classList.remove("fa-chart-simple")
    }
}

// ********
// Dynamic Color Scheme
// ********

let currentColorStatus = false;

function updateColorScheme() {
    currentColorStatus = !currentColorStatus;

    let elementsToChange = ["SVI-header", "EJ-header", "legend-header", "color-header", "rounded-parent",
        "minimize", "arrow", "SVI-variables", "EJ-variables", "legend-1", "legend-2", "colorScaleSelect",
        "histogramParent", "histogramContainer", "arrow2", "newBodyEJ", "newBodySVI",
        "checkBox1", "checkBox2", "layers-header"];

    if (currentColorStatus) {
        elementsToChange.forEach(function (element) {
            document.getElementById(element).classList.remove("dark");
            map.setStyle('mapbox://styles/mapbox/' + "light-v11");
        })
    } else {
        elementsToChange.forEach(function (element) {
            document.getElementById(element).classList.add("dark");
            map.setStyle('mapbox://styles/mapbox/' + "dark-v11");
        })
    }

    document.getElementById("colorScaleSelect").selectedIndex = 0;
    changeColorScale();


}

// ********
// Filtering Data Centers and Warehouses
// ********

let currentWarehouseStatus = true;
let currentDataCenterStatus = true;

function updateLayers(chosenFilter) {
    let filters = [];

    if (document.getElementById('layer1').checked) {
        filters.push('Warehouse');
    }
    if (document.getElementById('layer2').checked) {
        filters.push('Data Center');
    }

    if (filters.length === 0) {
        map.setFilter('centers-layer', ['==', 'Classification', '']); // No circles will match this filter
    } else {
        map.setFilter('centers-layer', ['in', 'Classification', ...filters]);
    }
}
