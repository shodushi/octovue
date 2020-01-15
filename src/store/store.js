import Vue from 'vue'
import Vuex from 'vuex'
import { mapState } from 'vuex'

Vue.use(Vuex)
Vue.use(mapState)

export const store = new Vuex.Store({
    state: {
        temp: [20, 80],
        infomodal: false,
        modalfilemove: false,
        settingsmodal: false,
        terminalmodal: false,
        printerState: {"type": "PrinterStateChanged", "payload":{"state_string":"Offline","state_id":"OFFLINE"}},
        temps: {"bed":{"actual":"0","target":"0"}, "chamber":{"actual":"0","target":"0"}, "tool0":{"actual":"0","target":"0"}, "time": "0"},
        logs: [],
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
        selectedmovefolder: "",
        files: [],
        folders: [],
        movefolders: [],
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
        graphs: [],
        avail_printerports: [],
        avail_baudrates:[],
        printerProfiles: {},
        octoprintCommands: [],
        theme: "",
        line_temps: {
            labels: [''],
            datasets: [],
        },
        line_temps_options: {
            elements: {
                point:{
                    radius: 0
                }
            },
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
                    display: false,
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
            datasets: [
                {
                    data: [0, 0],
                    backgroundColor: [
                        '#31cf65',
                        '#fc3c63'
                    ]
                }
            ],
            labels: ['successful', 'failed']
        },
        pie_stats_printing_options: {
            segmentShowStroke: false,
            responsive: true
        },
        bar_stats_printing: {
            datasets: [
                {
                    data: [],
                    label: ['monthly prints'],
                    backgroundColor: [
                        '#209cee',
                        '#209cee',
                        '#209cee',
                        '#209cee',
                        '#209cee',
                        '#209cee',
                        '#209cee',
                        '#209cee',
                        '#209cee',
                        '#209cee',
                        '#209cee',
                        '#209cee'
                    ]
                }
            ],
            labels: []
        },
        bar_stats_printing_options: {
            segmentShowStroke: false,
            responsive: true,
            maintainAspectRatio: false
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