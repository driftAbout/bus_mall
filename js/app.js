'use strict';

var product;
//variable for object key
var imageKey;
//Object to be popolated with product objects
var allProducts = {};
//array of product keys;
var productKeys;

//list of images
var imageNames = ['bag.jpg', 'banana.jpg', 'bathroom.jpg', 'boots.jpg', 'breakfast.jpg', 'bubblegum.jpg', 'chair.jpg', 'cthulhu.jpg', 'dog-duck.jpg', 'dragon.jpg', 'pen.jpg', 'pet-sweep.jpg', 'scissors.jpg', 'shark.jpg', 'sweep.png', 'tauntaun.jpg', 'unicorn.jpg', 'usb.gif', 'water-can.jpg', 'wine-glass.jpg'];

//length of image array for iterating
var imageCount = imageNames.length;
//selections contains the image section
var selections = document.getElementById('selections');
//target element for loaded images
var image_display = document.getElementById('image_display');
//section containing canvas
var results_container = document.getElementById('results');
//targert element for chart
var canvas = document.getElementById('results_chart');
var ctx = canvas.getContext('2d');
var chart;

var welcome = document.getElementById('welcome');
var start = document.getElementById('start');


// array to hold unique index numbers
var unique_Nums;
// array to hold previous set of unique index numbers
var previous_unique = [];
// session counter
var roundCount = 0;
var totalRounds = 3;

//time delay between choices
var timeDelay = 500;
var delayedTime;
var targetImages;


/*****************************************/
/*** Build Product Object Constructor ***/
function Product(fileName){
  this.fileName = fileName;
  //filename without ext
  this.productName;
  //path to images folder
  this.imageFolder = 'images';
  //full path to image
  this.imagePath;
  this.views = 0;
  this.clicks = 0;
  this.percentSelected = 0;
  this.tallyString = 'votes for the';
  this.dataRow;
  this.createImageInfo();
};

Product.prototype.createImageInfo = function(){
  this.imagePath = this.imageFolder + '/' + this.fileName;
  var nameParts = this.fileName.split('.');
  this.productName = nameParts[0];
  this.createDataRow();
};

Product.prototype.viewCounter = function(){
  this.views++;
  this.percentSelected = Math.round((this.clicks / this.views) * 1000) / 10;
  this.createDataRow();
};

Product.prototype.clickCounter = function(){
  this.clicks++;
  this.percentSelected = Math.round((this.clicks / this.views) * 1000) / 10;
  this.createDataRow();
};

Product.prototype.createDataRow = function(){
  var dataRow = document.createElement('tr');
  var dataArray = [this.clicks, this.tallyString, this.productName];
  var dataString = '<tr><td>' + dataArray.join('</tr><td>') + '</tr></td>';
  dataRow.innerHTML = dataString;
  this.dataRow = dataRow;
};
/*****End Product Constructor******/
/**********************************/

//start the selection process on click of the start button (AMAZE ME)
function welcome_start(){
  start.addEventListener('click', initProgram);
}


//function to create objects
function initProgram(){
  console.log('click');
  //hide the welcome window
  welcome.classList.add('close');
  //show the selections section
  selections.classList.remove('close');

  for (var i = 0; i < imageCount; i++){
    //put product in an object with a key of product name
    product = new Product(imageNames[i]);
    allProducts[product.productName] = product;
  }
  //get array of product keys
  productKeys = Object.keys(allProducts);
  // first show choice
  initRound();
}


//Function to add images to the page
function initRound(){
  roundCount++;
  //quit giving choices after the number of rounds is done
  if (roundCount > totalRounds){
    image_display.classList.add('close');
    logResults();
    return;
  }
  var newImageElement;
  var imgSrc;
  //fetch an array of 3 random indexes
  var randomIndexes = uniqueRandomNumbers(imageCount, 0);
  //loop through arry of indexes
  for(var i = 0; i < randomIndexes.length; i++){
    //create fetch key using index of key array
    imageKey = productKeys[randomIndexes[i]];
    //get Product object with key and incriment view counter
    allProducts[imageKey].viewCounter();
    imgSrc = allProducts[imageKey].imagePath;
    newImageElement = document.createElement('img');
    newImageElement.setAttribute('id', imageKey);
    newImageElement.setAttribute('src', imgSrc);
    image_display.appendChild(newImageElement);
  }
  //add event listeners to newly created images
  initListeners();
}

function goAgain(){
  //reset images
  image_display.innerHTML = '';
  initRound();
}

//Function to generate three unique numbers and unique from previous round
//creats array of unique numbers and compares them to previous unique arrray
function uniqueRandomNumbers(max_num , min_num){
  var randomNUm;
  unique_Nums = [];

  while( unique_Nums.length < 3 ){
    randomNUm = Math.floor((Math.random() * (max_num - min_num)) + min_num);
    if ( ! unique_Nums.includes(randomNUm) && ! previous_unique.includes(randomNUm)){
      unique_Nums.push(randomNUm);
    }
  }
  previous_unique = unique_Nums;
  return unique_Nums;
}


//create evenlisteners
function initListeners(){
  //loop through each img element and add event listener
  targetImages = image_display.getElementsByTagName('img');
  for (var t = 0; t < targetImages.length; t++){
    targetImages[t].addEventListener('click', registerClick);
  }
}

function registerClick(e){
  e.preventDefault();
  //only register clicks on images with out an updated class
  if( ! this.classList.contains('selected') && ! this.classList.contains('rejected') ){
    this.classList.add('selected');
    var imageId = this.getAttribute('id');
    //inciment click counter
    allProducts[imageId].clickCounter();
    // get array of img tags
    //remove event listeners and mark non selected images as rejected
    var allImageTags = image_display.getElementsByTagName('img');
    for (var i = 0; i < allImageTags.length; i++){
      allImageTags[i].removeEventListener('click', registerClick);
      if (this != allImageTags[i]){
        allImageTags[i].classList.toggle('rejected');
      }
    }
  }
  //set a deleay before moving on to the next set of choices
  delayedTime = window.setTimeout(goAgain, timeDelay);
}

function logResults(){
  //hide selections window
  selections.classList.add('close');
  results_container.classList.remove('close');
  var chartParamiters = new ChartDataSet(allProducts).chartParams;
  chart = new Chart(ctx, chartParamiters);
  console.log('chartParamiters', chartParamiters);
  canvas.addEventListener('click', clickHandler);
}

function clickHandler(evt) {
  var item = chart.getElementAtEvent(evt)[0];
  if (item) {
    var label = item._view.label;
    var item_imagePath = allProducts[label].imagePath;
    console.log('item_imagePath', item_imagePath);
    displayImage(item_imagePath);
  }
}

function displayImage(path){
  var image_div = document.getElementById('small_image');
  var small_image = document.createElement('img');
  small_image.setAttribute('src', path);
  small_image.addEventListener('click', function(){image_div.classList.add('close');});
  image_div.appendChild(small_image);
  image_div.classList.remove('close');
}

/*
//function to build table of votes
function logResults(){
  var newTable = document.createElement('table');
  var tbody = document.createElement('tbody');
  for( var i = 0; i < imageCount; i++){
    imageKey = productKeys[i];
    tbody.appendChild(allProducts[imageKey].dataRow);
  }
  newTable.appendChild(tbody);
  resultsSection.appendChild(newTable);
}
*/

welcome_start()
console.log('allProducts', allProducts);

console.log('productKeys', productKeys);


/**********************************************/
/**************Chart Constructor *************/
var chartType = 'bar';
var percent_background_color = '#C3B867';
var percent_border_color = '#000000';
var views_background_color = '#767254';
var views_border_color = '#767254';
var clicked_background_color = '#F7D50A';
var clicked_border_color = '#000000';
var roundsAxes_labelString = 'Number of Selection Rounds';
var percentAxes_labelString = 'Percentage of Clicks / View';
var yAxes_fontSize = 18;


function ChartDataSet(dataObject){
  this.product_data_object = dataObject;
  this.type = chartType;
  this.labels = Object.keys(this.product_data_object);
  this.keyCount = this.labels.length;
  this.percent_data_set = {
    label: 'Percent Selected',
    yAxisID: 'percent_axis',
    backgroundColor: percent_background_color,
    borderColor: percent_border_color,
    data: []
  };
  this.views_data_set = {
    label: 'Product Views',
    yAxisID: 'rounds_axis',
    backgroundColor: views_background_color,
    borderColor: views_border_color,
    data: []
  };
  this.clicked_data_set = {
    label: 'Product Selections',
    yAxisID: 'rounds_axis',
    backgroundColor: clicked_background_color,
    borderColor: clicked_border_color,
    data: []
  };
  this.xAxes = [{
    barThickness: 30,
    categoryPercentage: .1,
    barPercentage: 1
  }];
  this.percent_axis = {
    id: 'percent_axis',
    type: 'linear',
    position: 'right',
    scaleLabel: {labelString: percentAxes_labelString, display: true, fontSize: yAxes_fontSize},
    ticks: {
      suggestedMax: 100,
      min: 0
    }
  };
  this.rounds_axis = {
    id: 'rounds_axis',
    type: 'linear',
    position: 'left',
    scaleLabel: {labelString: roundsAxes_labelString, display: true, fontSize: yAxes_fontSize},
    ticks: {
      suggestedMax: totalRounds,
      min: 0
    }
  };
  this.options = {
    scales: {
      yAxes:[this.percent_axis, this.rounds_axis],
      xAxes:[this.xAxes]
    }
  };
  this.processProductData();
  this.dataSets = [this.percent_data_set, this.views_data_set, this.clicked_data_set];
  this.chartData = {labels: this.labels, datasets:  this.dataSets};
  this.chartParams = {type: this.type, data: this.chartData, options: this.options};

}

ChartDataSet.prototype.processProductData = function(){
  var prodData;
  for (var i = 0; i < this.keyCount; i++){
    prodData = this.product_data_object[this.labels[i]];
    this.percent_data_set.data.push(prodData.percentSelected);
    this.views_data_set.data.push(prodData.views);
    this.clicked_data_set.data.push(prodData.clicks);
  }
};
