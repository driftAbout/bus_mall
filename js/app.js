'use strict';

var product;
//variable for object key
var productKey;
//Object to be popolated with product objects
var allProducts = {};
//array of product keys;
var productKeys;
//variables for setting local storage
var sessionDataStorage;
var persistentDataStorage;
var totalPersistantRounds = 0;

//list of images
var imageNames = ['bag.jpg', 'banana.jpg', 'bathroom.jpg', 'boots.jpg', 'breakfast.jpg', 'bubblegum.jpg', 'chair.jpg', 'cthulhu.jpg', 'dog-duck.jpg', 'dragon.jpg', 'pen.jpg', 'pet-sweep.jpg', 'scissors.jpg', 'shark.jpg', 'sweep.png', 'tauntaun.jpg', 'unicorn.jpg', 'usb.gif', 'water-can.jpg', 'wine-glass.jpg'];

//length of image array for iterating
var imageCount = imageNames.length;
//selections contains the image section
var selections = document.getElementById('selections');
//target element for loaded images
var image_display = document.getElementById('image_display');


var welcome = document.getElementById('welcome');
var start_btn = document.getElementById('start');
var image_div = document.getElementById('small_image');
var save_session_btn = document.getElementById('save_session_btn');
var close_canvas_btn = document.getElementById('close_canvas_btn');

var greeting_salutation = document.getElementById('greeting_salutation');
var greeting_salutation_text = 'Welcomes You!';
var participation_message = document.getElementById('participation_message');
var participation_message_text = 'You have been selected to participate in our survey because you are currently on a bus stuck in traffic!';
var click_message = document.getElementById('click_message');
var click_message_text = 'Click to get started.';
var start_btn_text = 'amaze me';


var logo_large = document.getElementById('logo_large');

//elements to Access persistant data chart
var all_data_login = document.getElementById('all_data_login');
var all_data_link = document.getElementById('all_data_link');
var all_data_submit_btn = document.getElementById('all_data_submit_btn');
var all_data_cancel_btn = document.getElementById('all_data_cancel_btn');
var main = document.getElementsByTagName('main')[0];
var sections = main.getElementsByTagName('section');
//counter displays
var round_count_display = document.getElementById('round_count');
var total_rounds_display = document.getElementById('total_rounds');

// array to hold unique index numbers
var unique_Nums;
// array to hold previous set of unique index numbers
var previous_unique = [];

var saved_unique_Nums = [];
// session counter
var roundCount = 0;
var totalRounds = 25;

//time delay between choices
var timeDelay = 500;
//reference to seeTimeout used to clear the timeout
var timeoutID;
var targetImages;

//**********chart stuff *****************///
//section containing canvas
var results_container = document.getElementById('results');
//targert element for chart
var canvas = document.getElementById('results_chart');
var ctx = canvas.getContext('2d');
var chart;
var chartType = 'bar';
var percent_background_color = '#C3B867';
var views_background_color = '#767254';
var clicked_background_color = '#F7D50A';
var dataSet_border_color = '#eeeeee';
var roundsAxes_labelString = 'Number of Selection Rounds';
var percentAxes_labelString = 'Percentage of Clicks / View';
var yAxes_fontSize = 18;

//********* start *******//
welcome_start();

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
  this.createImageInfo();
};

Product.prototype.createImageInfo = function(){
  this.imagePath = this.imageFolder + '/' + this.fileName;
  var nameParts = this.fileName.split('.');
  this.productName = nameParts[0];
};

Product.prototype.viewCounter = function(){
  this.views++;
  this.calulatePercentage();
};

Product.prototype.clickCounter = function(){
  this.clicks++;
  this.calulatePercentage();
};

Product.prototype.calulatePercentage = function(){
  //calculate percentage to 1 decimal place if clicks is not zero
  if (this.clicks != 0) this.percentSelected = Math.round((this.clicks / this.views) * 1000) / 10;
};

/*****End Product Constructor******/
/**********************************/

function build_product_objects(){
  for (var i = 0; i < imageCount; i++){
    //put product in an object with a key of product name
    product = new Product(imageNames[i]);
    allProducts[product.productName] = product;
  }
  //get array of product keys
  productKeys = Object.keys(allProducts);
}


//function to create objects
function initProgram(){
  //hide the welcome window
  welcome.classList.add('close');
  //add display counter total
  total_rounds_display.textContent = totalRounds;
  //show the selections section
  selections.classList.remove('close');
  save_session_btn.addEventListener('click', saveSession);

  build_product_objects();
  //if there was a saved session the data will load
  //if not it behaves as if a new session
  load_session_data();
  console.log('sessionDataStorage', sessionDataStorage);
  // show image choices
  initRound();
}

//Function to add images to the page
function initRound(){
  roundCount++;
  round_count_display.textContent = roundCount;
  console.log('roundCount: ', roundCount);
  //quit giving choices after the number of rounds is done
  if (roundCount > totalRounds){
    image_display.classList.add('close');
    save_persistant_data();
    giveThanks();
    return;
  }
  var newImageElement;
  var imgSrc;
  //fetch an array of 3 random indexes
  var randomIndexes = uniqueRandomNumbers(imageCount, 0);
  //loop through array of indexes
  for(var i = 0; i < randomIndexes.length; i++){
    //create fetch key using index of key array
    productKey = productKeys[randomIndexes[i]];
    //get Product object with key and incriment view counter
    allProducts[productKey].viewCounter();
    imgSrc = allProducts[productKey].imagePath;
    newImageElement = document.createElement('img');
    newImageElement.setAttribute('id', productKey);
    newImageElement.setAttribute('src', imgSrc);
    image_display.appendChild(newImageElement);
  }
  //add event listeners to newly created images
  initListeners();
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
  timeoutID = window.setTimeout(goAgain, timeDelay);
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
  if (saved_unique_Nums.length != 0 ){
    unique_Nums = saved_unique_Nums;
    saved_unique_Nums = [];
  }
  while( unique_Nums.length < 3 ){
    randomNUm = Math.floor((Math.random() * (max_num - min_num)) + min_num);
    if ( ! unique_Nums.includes(randomNUm) && ! previous_unique.includes(randomNUm)){
      unique_Nums.push(randomNUm);
    }
  }
  previous_unique = unique_Nums;
  return unique_Nums;
}

//function to iniitiate chart.js
function logResults(){
  //hide selections window
  welcome.classList.add('close');
  results_container.classList.remove('close');
  var chartParamiters = new ChartDataSet(allProducts).chartParams;
  //reset the canvas if it already has a chart
  if (chart) chart.destroy();
  chart = new Chart(ctx, chartParamiters);
  canvas.addEventListener('click', open_reference_image);
}

/**********************************************/
/**************Chart Constructor *************/
function ChartDataSet(dataObject){
  this.product_data_object = dataObject;
  this.type = chartType;
  this.labels = Object.keys(this.product_data_object);
  this.keyCount = this.labels.length;
  this.percent_data_set = {
    label: 'Percent Selected',
    yAxisID: 'percent_axis',
    backgroundColor: percent_background_color,
    borderColor: dataSet_border_color,
    data: []
  };
  this.views_data_set = {
    label: 'Product Views',
    yAxisID: 'rounds_axis',
    backgroundColor: views_background_color,
    borderColor: dataSet_border_color,
    data: []
  };
  this.clicked_data_set = {
    label: 'Product Selections',
    yAxisID: 'rounds_axis',
    backgroundColor: clicked_background_color,
    borderColor: dataSet_border_color,
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
      suggestedMax: totalRounds + totalPersistantRounds,
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


//************************//
//******* modals *********//

//set messages for Greeting
function setStartMessage() {
  //change the messages if there is a stored session
  if (localStorage.sessionDataStorage) {
    participation_message_text = 'Thank you for returning to finish our survey.  Traffic obviously let up and you made it home!';
    click_message_text = 'Click to resume session.';
    start_btn_text = 'Resume';
  }
  greeting_salutation.textContent = greeting_salutation_text;
  participation_message.textContent = participation_message_text;
  click_message.textContent = click_message_text;
  start_btn.textContent = start_btn_text;
}

function setThankYouMessage(){
  participation_message_text = 'Thank you for finishing our survey .  Keep an eye out for the first edition of Bus Mall!';
  click_message_text = 'Click to see results';
  start_btn_text = 'Results';
  //change the messages if there is a stored session
  if (localStorage.sessionDataStorage) {
    participation_message_text = 'Thank you for starting our survey .  Please do not forget to return and finish your session';
    click_message_text = '';
    start_btn_text = 'Close';
  }

  greeting_salutation_text = 'Thanks You';
  greeting_salutation.textContent = greeting_salutation_text;
  participation_message.textContent = participation_message_text;
  click_message.textContent = click_message_text;
  start_btn.textContent = start_btn_text;
  // change the event listener
  setSalutationListener();
}

function giveThanks(){
  setThankYouMessage();
  welcome.classList.remove('close');

};

// change the event listener
function setSalutationListener() {
  start_btn.removeEventListener('click', initProgram);
  start_btn.addEventListener('click', logResults);
  if (localStorage.sessionDataStorage) {
    start_btn.removeEventListener('click', logResults);
    start_btn.addEventListener('click', function(){
      welcome.classList.add('close');
      logo_large.classList.remove('close');
    });
  }

  selections.classList.add('close');
}

close_canvas_btn.addEventListener('click', closeCanvas);

function closeCanvas(){
  logo_large.classList.remove('close');
  results_container.classList.add('close');
  if (chart) chart.destroy();
}

//function to start the selection process on click of the start button (AMAZE ME)
function welcome_start(){
  setStartMessage();
  //activate link for persistant chart data
  all_data_link.addEventListener('click', open_all_data_login);
  start_btn.addEventListener('click', initProgram);
}

//persistant data chart login functions
function open_all_data_login(e){
  e.preventDefault();
  //add event listeners for login buttons
  all_data_cancel_btn.addEventListener('click', close_all_data_login);
  all_data_submit_btn.addEventListener('click', show_all_data);

  all_data_login.classList.toggle('section_active');
}

function close_all_data_login(e){
  e.preventDefault();
  all_data_login.classList.remove('section_active');
}

function show_all_data(e){
  e.preventDefault();
  all_data_login.classList.toggle('section_active');
  //close visible sections
  for (var i = 0; i < sections.length; i++){
    if (sections[i].className != 'close' && sections[i].id != 'all_data_login'){
      sections[i].classList.add('close');
    }
  }
  create_persistantData_chart();
}

//function to open small product image when clicking on a bar in the chart
function open_reference_image(evt) {
  //chart.js api call
  var item = chart.getElementAtEvent(evt)[0];
  if (item) {
    var label = item._view.label;
    // use the label as the key for a product object
    var item_imagePath = allProducts[label].imagePath;
    displayImage(item_imagePath);
  }
}

//show the image far a clicked bar
function displayImage(path){
  image_div.innerHTML = '';
  var small_image = document.createElement('img');
  small_image.setAttribute('src', path);
  small_image.addEventListener('click', function(){
    image_div.classList.add('close');
    image_div.innerHTML = '';
  });
  image_div.appendChild(small_image);
  image_div.classList.remove('close');
}

/*************************/
/******localStorage*********/

/* data structures
var persistentDataStorage = {
totalPersistantRounds:
  productName: {views: clicks:}
};

var sessionDataStorage = {
  productName: {views: clicks:},
  roundCount: ,
  saved_unique_Nums = []
  previous_unique: []
};
*/

function create_persistantData_chart(){
  build_product_objects();
  load_persistant_data();
  logResults();
}


function saveSession(){
  //clear the time out function so you are not moving along in the code while in a timeout
  window.clearTimeout(timeoutID);
  //hide the section containing the images
  selections.classList.add('close');
  //open thank you message;
  //wait just a sec
  window.setTimeout(save_session_data(), timeDelay );
  giveThanks();
}

function save_session_data(){
  sessionDataStorage = save_views_clicks();
  //subtract 1ß from round count to reset to last view when the sesion was saved
  sessionDataStorage.roundCount = roundCount - 1;
  sessionDataStorage.previous_unique = previous_unique;
  sessionDataStorage.saved_unique_Nums = unique_Nums;
  localStorage.sessionDataStorage = JSON.stringify(sessionDataStorage);
}


function save_persistant_data(){
  var sessionData = save_views_clicks();
  if (localStorage.persistentDataStorage){
    persistentDataStorage = JSON.parse(localStorage.persistentDataStorage);
    for (var i = 0; i < productKeys.length; i++){
      productKey = productKeys[i];
      persistentDataStorage[productKey].views += sessionData[productKey].views;
      persistentDataStorage[productKey].clicks += sessionData[productKey].clicks;
    }
  }
  if(! persistentDataStorage) persistentDataStorage = sessionData;
  //the round count ends +1 above the maximum views so subtract 1
  if (isNaN(persistentDataStorage.totalPersistantRounds += (roundCount - 1))) persistentDataStorage.totalPersistantRounds = (roundCount - 1);
  localStorage.persistentDataStorage = JSON.stringify(persistentDataStorage);
}

function load_views_clicks(storage_data){
  for ( var i = 0; i < productKeys.length; i++){
    productKey = productKeys[i];
    allProducts[productKey].views = storage_data[productKey].views;
    allProducts[productKey].clicks = storage_data[productKey].clicks;
    allProducts[productKey].calulatePercentage();
  }
}

function save_views_clicks(){
  var storage_data = {};
  for (var i = 0; i < productKeys.length; i++){
    productKey = productKeys[i];
    storage_data[productKey] = {};
    storage_data[productKey].views = allProducts[productKey].views;
    storage_data[productKey].clicks = allProducts[productKey].clicks;
  }
  return storage_data;
}

function load_persistant_data(){
  if (localStorage.persistentDataStorage){
    persistentDataStorage = JSON.parse(localStorage.persistentDataStorage);
    totalPersistantRounds = persistentDataStorage.totalPersistantRounds;
    load_views_clicks(persistentDataStorage);
  }
  return;
}

function load_session_data(){
  if (localStorage.sessionDataStorage){
    sessionDataStorage = JSON.parse(localStorage.sessionDataStorage);
    roundCount = sessionDataStorage.roundCount;
    //totalRounds = totalRounds - roundCount;
    previous_unique = sessionDataStorage.previous_unique;
    saved_unique_Nums = sessionDataStorage.saved_unique_Nums;
    load_views_clicks(sessionDataStorage);
    //remove the session data
    localStorage.removeItem('sessionDataStorage');
  }
  return;
}
