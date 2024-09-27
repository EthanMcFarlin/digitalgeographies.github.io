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
        name: "EP_UNINSUR.x",
        min: 0,
        max: 70,
        avg: 8.805836,
        desc: "Percentage uninsured in the total civilian noninstitutionalized population estimate, 2016-2020 ACS"
    },
    {
        name: "E_MINRTY",
        min: 0,
        max: 12602,
        avg: 1559.891,
        desc: "Minority (Hispanic or Latino (of any race); Black and African American; American Indian and Alaska Native; Asian; Native Hawaiian and Other Pacific Islander; Two or More Races; Other Races) estimate, 2016-2020 ACS"
    },
    {
        name: "E_AFAM",
        min: 0,
        max: 4500,
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
        max: 2.5,
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
        max: 80,
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

let readableNames = {
    "SPL_THEMES": "Composite social vulnerability",
    "E_HBURD": "Housing cost burden",
    "E_DISABL": "Population with a disability estimate",
    "EPL_POV150": "Percentage of people below 150% poverty",
    "EP_UNINSUR.x": "Percentage uninsured",
    "E_MINRTY": "Minority estimate",
    "E_AFAM": "Black/African American estimate",
    "E_HISP": "Hispanic or latino estimate",
    "SPL_EJI": "Summation of EJI ranks",
    "RPL_EJI": "Percentile ranks of SPL_EJI",
    "E_PM": "Annual days above PM2.5 standard",
    "E_DSLPM": "Concentrations of diesel",
    "E_IMPWTR": "Percentage with impaired watershed",
    "RPL_EBM_DOM5": "Percentile rank of impaired water",
    "E_TOTCR": "Probability of contracting cancer over life",
    "EPL_ASTHMA": "Percentile rank of people with asthma"
};