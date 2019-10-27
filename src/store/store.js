import Vue from 'vue'
import Vuex from 'vuex'
import { mapState } from 'vuex'

Vue.use(Vuex)
Vue.use(mapState)

export const store = new Vuex.Store({
    state: {
        temp: [20, 80],
        page: '',
        infomodal: false,
        settingsmodal: false,
        terminalmodal: false,
        printerState: {"type": "PrinterStateChanged", "payload":{"state_string":"Offline","state_id":"OFFLINE"}},
        temps: {"bed":{"actual":"0","target":"0"}, "chamber":{"actual":"0","target":"0"}, "tool0":{"actual":"0","target":"0"}, "time": "0"},
        logs: {},
        cam: "",
        powerState: "off",
        lightState: "off",
        connectionState: "off",
        connectionSettings: {"options": {"printerProfiles": []}},
        isPower: false,
        isNotPower: true,
        isLight: false,
        isNotLight: true,
        isConnection: false,
        isNotConnection: true,
        isConnecting: false,
        fileList: [],
        selectedfolder: "",
        selectedfile: "",
        files: [],
        folders: [],
        currentLayer: 0,
        totalLayer: 0,
        currentHeight: 0,
        totalHeight: 0,
        file_origin: "local",
        searchLoader: false,
        pageLoader: true,
        pageLoaderAddText: "",
        octoprintConnectionTries: 0,
        octoprintConnectionMaxTries: 4,
        printhistory: [],
        job: {"printfile": "", "estimatedPrintTime": "", "currentZ": "", "progress":{"completion": "", "filepos": "", "printTime": "", "printTimeLeft": "", "filament": {"tool0": {"length": "", "volume": ""}}}},
        thingiverse_results: [],
        q: "",
        thingpage: 1,
        stats: {"success": 0, "failed": 0},
        pie_tool0: {
            datasets: [{
            data: [0, 250],
            backgroundColor: [
                '#fc3c63',
                '#C0C0C0'
            ]
            }]
        },
        pie_tool0_options: {
            segmentShowStroke: false,
            circumference: 1 * Math.PI,
            rotation: 1 * Math.PI,
            cutoutPercentage: 80
        },
        pie_bed: {
            datasets: [{
            data: [0, 90],
            backgroundColor: [
                '#2b9eeb',
                '#C0C0C0'
            ]
            }]
        },
        pie_bed_options: {
            segmentShowStroke: false,
            circumference: 1 * Math.PI,
            rotation: 1 * Math.PI,
            cutoutPercentage: 80
        },
        line_temps: {
            labels: [''],
            datasets: [{
            label: 'Extruder I',
            fill: false,
            backgroundColor: '#fc3c63',
            borderColor: '#fc3c63',
            borderWidth: 2,
            data: [0],
            },
            {
            label: 'Extruder S',
            fill: false,
            backgroundColor: '#fab3c2',
            borderColor: '#fab3c2',
            borderWidth: 6,
            data: [0],
            },
            {
            label: 'Bed I',
            fill: false,
            backgroundColor: '#2b9eeb',
            borderColor: '#2b9eeb',
            borderWidth: 2,
            data: [0],
            },
            {
            label: 'Bed S',
            fill: false,
            backgroundColor: '#99d3fa',
            borderColor: '#99d3fa',
            borderWidth: 6,
            data: [0],
            }]
        },
        line_temps_options: {
            elements: {
            point:{
                radius: 0
            }
            },
            responsive: true,
                    title: {
                        display: false
                    },
                    tooltips: {
                        mode: 'index',
                        intersect: false,
                    },
                    hover: {
                        mode: 'nearest',
                        intersect: true
                    },
                    scales: {
                        xAxes: [{
                            display: true,
                            scaleLabel: {
                                display: false,
                                labelString: ''
                            }
                        }],
                        yAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: 'Temperature'
                            }
                        }]
            },
        },
        pie_stats_printing: {
            datasets: [{
            data: [0, 0],
            backgroundColor: [
                '#31cf65',
                '#fc3c63'
            ]
            }],
            labels: ['successful', 'failed']
        },
        pie_stats_printing_options: {
            segmentShowStroke: false,
            responsive: true
        }
    },
    mutations: {}
})


/*
dropzoneOptions: {
            url: 'http://192.168.120.244:5000/api/files/local',
            thumbnailWidth: 150,
            maxFilesize: 100,
            headers: { "My-Awesome-Header": "header value" }
        }
*/