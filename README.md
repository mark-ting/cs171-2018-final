# Team Blue Bikes #

## Repository Structure
#### 1. `index.html`
The main html file containing website layout.

#### 2. `res` Directory
- css: five css files (barchart.css, chord.css, map.css, scroll.css, and style.css) describing the style of html elements.
- data: one csv file (trips_2015.csv) containing information of all blue bike trips in 2015, stored with Git Large File Storage.
- img: icon pictures for map.
- js:
	* DataService.js: fetching station data from our data server
	* map.js: construct map object
	* StationMap.js: implementation of the map
	* main.js: reading the csv file containing trip data from Git LFS, and construct bar chart object and chord diagram objects
	* barChartDD.js: implementation of the bar chart
	* chordDiagram.js: implementation of the chord diagrams

#### 3. `vendor` Directory
Javascript libraries including bootstrap, d3-tip, d3 version 5, jquery easing, jquery, leaflet, popper and underscore.

#### 4. `images` Directory
Image files we used on our website.

#### 5. `Backend` Directory 
Codes for data cleanup, data analysis and other backend implementations.

## Project Website
The public website of our project can be found on https://mat3049.github.io/cs171-2018-final/. If the visualizations do not show up, please make sure to unblock the content and load our scripts. The bar charts and chord diagrams will take around 30 seconds to load as the trip data file is over 150 MB.

## Screencast Video
We created a two minute screen-cast with narration showing a demo of our visualization: https://youtu.be/a9ErRUmqRrk.


