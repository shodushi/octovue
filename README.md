# OctoVue

An alternative UI for octoprint based on vue.js and bulma css framework


## Functionality
 - of course print gcodes :-)
 - looking more modern than octoprint :-)
 - preview gcode files, if image available (place image named the same like gcode file into same directory. For example you have Vase.gcode, put preview image/photo named "Vase.png" in same directory)
 - Search thingiverse inside OctoVue for models and download them
 - nice printpage with graphs and gauges for temperatures (for now up to 7 hotends + heated bed and heated enclosure supported)
 - statistics page with overview of printed files (successful / failed)
 - control printer power in case you power your printer with a Sonoff POW (with tasmota fw) from OctoVue
 - control enclosure light (external control unit like nodeMCU) from OctoVue


## prerequisites
```
install & configure octoprint
  octoprint settings:
  	-> enable cors
  	-> enable api

  octoprint plugins needed:
    -> OctoPrint-DisplayLayerProgress (https://github.com/OllisGit/OctoPrint-DisplayLayerProgress)


npm install -g serve
```

## Installation
```
git clone https://github.com/shodushi/octovue.git

npm install
```

## Run
```
run the non-optimized version:

npm run serve


run the optimized version:

npm run build

a) serve -s -l 80 dist
        OR
b) copy "dist" directory into any webserver document root in your network

```

## Configuration
```
Enter all infos in initial config screen and save.

Hint:

Configuration will be lost, when accessed form another browser or browser cache is cleared.

To make your configuration persistent, click "export config" button
and place "octovue_config.txt" into dist folder.

```



## Preview
![screenshot](screenshots/screen1.png)

<hr />

![screenshot](screenshots/screen2.png)

<hr />

![screenshot](screenshots/screen3.png)

<hr />

![screenshot](screenshots/screen4.png)
