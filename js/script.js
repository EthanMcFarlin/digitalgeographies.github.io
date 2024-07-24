// ********
// Initialization
// ********

mapboxgl.accessToken = 'pk.eyJ1IjoiZXRoYW5tY2ZhcmxpbiIsImEiOiJjbHl6NGo0OG8wbm5iMmxwdnVvNWl6dHUwIn0.pyb_HA0qJwJ9jZkrmlKcqA';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v11',
    projection: 'albers',
    zoom: 4,
    minZoom: 3,
    center: [-90, 37.5],
    attributionControl: false
});

map.addControl(new mapboxgl.AttributionControl(), 'top-left');
map.addControl(new mapboxgl.NavigationControl(), 'top-left');

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
        max: 13.57

    },
    {
        name: "E_HBURD",
        min: 0,
        max: 1644
    },
    {
        name: "E_DISABL",
        min: 0,
        max: 1552
    },
    {
        name: "EPL_POV150",
        min: 0,
        max: 0.9995
    },
    {
        name: "EP_UNINSUR",
        min: 0,
        max: 100
    },
    {
        name: "E_MINRTY",
        min: 0,
        max: 12602
    },
    {
        name: "E_AFAM",
        min: 0,
        max: 7843
    },
    {
        name: "E_HISP",
        min: 0,
        max: 7334
    },
]

let chosenSVIMeasure = 0;

function updateSVIMeasure(){
    chosenSVIMeasure = document.getElementById("SVI-variables").value;
    updateCircles();
    updateText();

}

function updateText() {
    let minimum = document.getElementById("min");
    minimum.innerHTML = scaleDictionary[chosenSVIMeasure].min;

    let maximum = document.getElementById("max");
    maximum.innerHTML = scaleDictionary[chosenSVIMeasure].max;
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

map.on('load', () => {

    map.addSource('centers', {
        type: 'geojson',
        data: 'data/map.geojson'
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
// On Click: Points
// ********

map.on('click', 'centers-layer', (e) => {
    let chosenProperty = scaleDictionary[chosenSVIMeasure].name;

    const coordinates = e.features[0].geometry.coordinates.slice();
    const description = e.features[0].properties.Concatenated_Address;
    const property = e.features[0].properties[chosenProperty];
    const classification = e.features[0].properties.Classification;

    if (['mercator', 'equirectangular'].includes(map.getProjection().name)) {
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
    }

    new mapboxgl.Popup({className: "info-container" })
        .setLngLat(coordinates)
        // .setHTML(
        //     "<span>" +
        //     "Type: " + classification + "<br><br>" +
        //     "Address: " + description + "<br><br>" +
        //     + chosenProperty + ": " + property + "<br><br>"
        //     + "</span>"
        // )
        .setHTML(
            "<h1 class='popup-header'>" + description + "</h1>" +
            // "<p>" + "<span class='popup-classification'>" + classification + "</span>" + "</p>" +
            "<p>" + "<span id='popup-classification'>" + classification + "</span>" + "</p>" +
            "<p class='popup-property'>" + "<span class='popup-emphasis'>" + chosenProperty + ": " + "</span>" + "<span class='popup-light'>" + property + "</span>" + "</p>"
        )
        .addTo(map);

    if (classification == "Warehouse") {
        document.getElementById("popup-classification").classList = "Warehouse";
    } else {
        document.getElementById("popup-classification").classList = "DC";
    }
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



}
