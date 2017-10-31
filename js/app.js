'use strict';

//variable for object key
var imageKey;
//variable for constructing an object key and image id
var key_prefix = 'img_';
//Object to be popolated with product objects
var allProducts = {};

//list of images
var imageNames = ['bag.jpg', 'banana.jpg', 'bathroom.jpg', 'boots.jpg', 'breakfast.jpg', 'bubblegum.jpg', 'chair.jpg', 'cthulhu.jpg', 'dog-duck.jpg', 'dragon.jpg', 'pen.jpg', 'pet-sweep.jpg', 'scissors.jpg', 'shark.jpg', 'sweep.png', 'tauntaun.jpg', 'unicorn.jpg', 'usb.gif', 'water-can.jpg', 'wine-glass.jpg'];

//length of image array for iterating
var imageCount = imageNames.length;
//target element for loaded images
var image_display = document.getElementById('image_display');
//targert element for table data
var resultsSection = document.getElementById('results_section');
// array to hold unique index numbers
var unique_Nums;
// array to hold previous set of unique index numbers
var previous_unique = [];
// session counter
var roundCount = 0;
var totalRounds = 25;

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


//function to create objects
function initProgram(){
  for (var i = 0; i < imageCount; i++){
    //store product in ibject with a key
    imageKey = key_prefix + i;
    allProducts[imageKey] = new Product(imageNames[i]);
  }
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
    //create fetch key with index the number
    imageKey = key_prefix + randomIndexes[i];
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


//function to build table of votes
function logResults(){
  var newTable = document.createElement('table');
  var tbody = document.createElement('tbody');
  for( var i = 0; i < imageCount; i++){
    imageKey = key_prefix + i;
    tbody.appendChild(allProducts[imageKey].dataRow);
  }
  newTable.appendChild(tbody);
  resultsSection.appendChild(newTable);
}

initProgram();
console.log('allProducts', allProducts);
