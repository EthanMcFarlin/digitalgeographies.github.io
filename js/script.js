// ********
// Initialization
// ********

mapboxgl.accessToken = 'pk.eyJ1IjoiZXRoYW5tY2ZhcmxpbiIsImEiOiJjbHl6NGo0OG8wbm5iMmxwdnVvNWl6dHUwIn0.pyb_HA0qJwJ9jZkrmlKcqA';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11',
    projection: 'albers',
    zoom: 2,
    minZoom: 3,
    center: [-90, 37.5],
    attributionControl: false
});

map.addControl(new mapboxgl.AttributionControl(), 'top-left');
map.addControl(new mapboxgl.NavigationControl(), 'top-left');

var popup;

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

let scaleDictionary = [
    {
        name: "SPL_THEMES",
        min: 0.99,
        max: 13.57,
        avg: 7.674277,
        desc: "Sum of series themes (1: Socioeconomic Status, 2: Household Characteristics, 3: Racial and Ethnic Minority Status, 4: Housing Type / Transportation)"
    },
    {
        name: "E_HBURD",
        min: 0,
        max: 1644,
        avg: 399.3317,
        desc: "Housing cost burdened occupied housing units with annual income less than $75,000 (30%+ of income spent on housing costs) estimate, 2016-2020 ACS"
    },
    {
        name: "E_DISABL",
        min: 0,
        max: 1552,
        avg: 489.3169,
        desc: "Civilian noninstitutionalized population with a disability estimate, 2014-2018 ACS"
    },
    {
        name: "EPL_POV150",
        min: 0,
        max: 0.9995,
        avg: 0.4998178,
        desc: "Percentile percentage of persons below 150% poverty estimate"
    },
    {
        name: "EP_UNINSUR",
        min: 0,
        max: 100,
        avg: 8.805836,
        desc: "Percentage uninsured in the total civilian noninstitutionalized population estimate, 2016-2020 ACS"
    },
    {
        name: "E_MINRTY",
        min: 0,
        max: 12602,
        avg: 1559.891,
        desc: "Minority (Hispanic or Latino (of any race); Black and African American, Not Hispanic or Latino; American Indian and Alaska Native, Not Hispanic or Latino; Asian, Not Hispanic or Latino; Native Hawaiian and Other Pacific Islander, Not Hispanic or Latino; Two or More Races, Not Hispanic or Latino; Other Races, Not Hispanic or Latino) estimate, 2016-2020 ACS"
    },
    {
        name: "E_AFAM",
        min: 0,
        max: 7843,
        avg: 478.1086,
        desc: "Adjunct variable - Black/African American, not Hispanic or Latino persons estimate, 2016-2020 ACS"
    },
    {
        name: "E_HISP",
        min: 0,
        max: 7334,
        avg: 710.9013,
        desc: "Adjunct variable – Hispanic or Latino persons estimate, 2016-2020 ACS"
    },
    {
        name: "SPL_EJI",
        min: 0,
        max: 3,
        avg: 1.325396,
        desc: "Summation of the HVM, EBI, and SVI module percentile ranks"
    },
    {
        name: "RPL_EJI",
        min: 0,
        max: 1,
        avg: 0.5,
        desc: "Percentile ranks of SPL_EJI"
    },
    {
        name: "E_PM",
        min: 3.25,
        max: 16.05,
        avg: 8.950115,
        desc: "Annual mean days above PM2.5 regulatory standard - 3-year average"
    },
    {
        name: "E_DSLPM",
        min: 0.01,
        max: 6.08,
        avg: 0.4888175,
        desc: "Ambient concentrations of diesel PM/m3"
    },
    {
        name: "E_IMPWTR",
        min: 0,
        max: 100,
        avg: 49.99622,
        desc: "Percent of tract that intersects an impaired/impacted watershed at the HUC12 level"
    },
    {
        name: "RPL_EBM_DOM5",
        min: 0,
        max: 0.9093,
        avg: 0.4889685,
        desc: "Percentile rank of domain consisting of impaired water bodies"
    },
    {
        name: "E_TOTCR",
        min: 8.77,
        max: 31.76082,
        avg: 31.76082,
        desc: "The probability of contracting cancer over the course of a lifetime, assuming continuous exposure"
    },
    {
        name: "EPL_ASTHMA",
        min: 0,
        max: 1,
        avg: 0.4900416,
        desc: "Percentile rank of percentage of individuals with asthma"
    },
]

let chosenSVIMeasure = 0;

function updateEJMeasure(){
    chosenSVIMeasure = document.getElementById("EJ-variables").value;
    document.getElementById("SVI-variables").selectedIndex = 0;
    updateCircles();
    updateText();
    popup.remove();

}

function updateSVIMeasure(){
    chosenSVIMeasure = document.getElementById("SVI-variables").value;
    document.getElementById("EJ-variables").selectedIndex = 0;
    updateCircles();
    updateText();
    popup.remove();

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

    popup = new mapboxgl.Popup({className: "info-container" })
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
    "<p class='popup-relValue'><span id='colorCorrespondingly'>" + "<i id='colorArrow' class='fa-solid'></i>" + " " + percentDifference + "% " + parityStatus + "</span>" + " than the national average of " + "<span id='relMean'>" + relevantMean + "</span>" + " for all U.S. Census tracts in 2022." + "</p>" +
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

function minimize() {

    let parent1 = document.getElementById("contentToMinimize")
    let parent2 = document.getElementById("rounded-parent")
    let arrow = document.getElementById("arrow")

    menu_status = !menu_status;

    if (menu_status) {
        parent1.classList.add("parent1-minimized");
        parent2.classList.add("parent2-minimized");

        arrow.classList.remove("fa-down-left-and-up-right-to-center")
        arrow.classList.add("fa-up-right-and-down-left-from-center")

    } else {
        parent1.classList.remove("parent1-minimized");
        parent2.classList.remove("parent2-minimized");

        arrow.classList.add("fa-down-left-and-up-right-to-center")
        arrow.classList.remove("fa-up-right-and-down-left-from-center")
    }

    console.log(currentColorStatus, menu_status);

    // while (currentColorStatus && menu_status) {
    //     document.getElementById("rounded-parent").classList.backgroundColor = "#fff";
    //     document.getElementById("minimize").style.color = "black";
    // }

    // if (currentColorStatus && menu_status) {
    //     document.getElementById("rounded-parent").classList.backgroundColor = "#fff";
    //     document.getElementById("minimize").style.color = "black";
    //
    // } else if ( (currentColorStatus === true) && (menu_status === false)) {
    //     document.getElementById("rounded-parent").style.backgroundColor = "#1a1a1a";
    //     document.getElementById("minimize").style.color = "white";
    // } else if ( (currentColorStatus === false) && (menu_status === false)) {
    //     // document.getElementById("rounded-parent").style.backgroundColor = "#fff";
    // }



}

// ********
// Dynamic Color Scheme
// ********

let currentColorStatus = false;

function updateColorScheme() {
    currentColorStatus = !currentColorStatus;

    let elementsToChange = ["SVI-header", "EJ-header", "legend-header", "color-header", "rounded-parent",
        "minimize", "arrow", "SVI-variables", "EJ-variables", "legend-1", "legend-2"];

    if (currentColorStatus) {
        elementsToChange.forEach(function (element) {
            document.getElementById(element).classList.add("dark");
            map.setStyle('mapbox://styles/mapbox/' + "dark-v11");
        })
    } else {
        elementsToChange.forEach(function (element) {
            document.getElementById(element).classList.remove("dark");
            map.setStyle('mapbox://styles/mapbox/' + "light-v11");
        })
    }

}