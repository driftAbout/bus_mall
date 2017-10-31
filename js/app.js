'use strict';

var imageKey;
var imageName;
var key_prefix = 'img_';
var allProducts = {};
var randomIndex;
var productObj;
var getKey;
// var imagePath_list = ['images/bag.jpg', 'images/banana.jpg', 'images/bathroom.jpg', 'images/boots.jpg', 'images/breakfast.jpg', 'images/bubblegum.jpg', 'images/chair.jpg', 'images/cthulhu.jpg', 'images/dog-duck.jpg', 'images/dragon.jpg', 'images/pen.jpg', 'images/pet-sweep.jpg', 'images/scissors.jpg', 'images/shark.jpg', 'images/sweep.png', 'images/tauntaun.jpg', 'images/unicorn.jpg', 'images/usb.gif', 'images/water-can.jpg', 'images/wine-glass.jpg'];

var imageNames = ['bag.jpg', 'banana.jpg', 'bathroom.jpg', 'boots.jpg', 'breakfast.jpg', 'bubblegum.jpg', 'chair.jpg', 'cthulhu.jpg', 'dog-duck.jpg', 'dragon.jpg', 'pen.jpg', 'pet-sweep.jpg', 'scissors.jpg', 'shark.jpg', 'sweep.png', 'tauntaun.jpg', 'unicorn.jpg', 'usb.gif', 'water-can.jpg', 'wine-glass.jpg']

var imageCount = imageNames.length;
var image_display = document.getElementById('image_display');
var resultsSection = document.getElementById('results_section');

var previous_unique = [];
var unique_Nums;

var targetImages;

var roundCount = 0;
var totalRounds = 25;
var imagesPerRound = 3;

var timeDelay = 500;
var delayedTime;


/*****************************************/
/*** Build Product Object Constructor ***/
function Product(fileName){
  this.fileName = fileName;
  this.productName;
  this.imageFolder = 'images';
  this.imagePath;
  this.views = 0;
  this.clicks = 0;
  this.percentSelected = 0;
  this.tallyString = "votes for the";
  this.dataRow;
  this.createImageInfo();
};

Product.prototype.createImageInfo = function(){
  this.imagePath = this.imageFolder + '/' + this.fileName;
  var nameParts = this.fileName.split('.');
  this.productName = nameParts[0];
  this.createDataRow()
};

Product.prototype.viewCounter = function(){
  this.views++;
};

Product.prototype.clickCounter = function(){
  this.clicks++;
  this.percentSelected = Math.round((this.clicks / this.views) * 1000) / 10;
  this.createDataRow();
  //this.tallyMessage = this.clicks + ' votes for ' + this.productName;
};

Product.prototype.createDataRow = function(){
  var dataRow = document.createElement('tr');
  console.log(this.productName)
  var dataArray = [this.clicks, this.tallyString, this.productName];
  var dataString = '<tr><td>' + dataArray.join('</tr><td>') + '</tr></td>';
  dataRow.innerHTML = dataString;
  this.dataRow =  dataRow;
};
/*****End Product Constructor******/
/**********************************/


//function to create objects
function initProgram(){
  for (var i = 0; i < imageCount; i++){
    imageKey = key_prefix + i;
    allProducts[imageKey] = new Product(imageNames[i]);
  }
  initRound();
}


//Function to add images to the page
function initRound(){
  roundCount++;
  console.log('roundCount', roundCount);
  if (roundCount > totalRounds){
    logResults();
    return;
  }
  var newImageElement;
  var imgSrc;
  var randomIndexes = uniqueRandomNumbers(imageCount, 0);

  for(var i = 0; i < randomIndexes.length; i++){
    imageKey = key_prefix + randomIndexes[i];
    allProducts[imageKey].viewCounter();
    imgSrc = allProducts[imageKey].imagePath;
    newImageElement = document.createElement('img');
    newImageElement.setAttribute('id', imageKey);
    newImageElement.setAttribute('src', imgSrc);
    image_display.appendChild(newImageElement);
  }
  initListeners();
}

function goAgain(){
  //reset images
  image_display.innerHTML = '';
  initRound();
}

//Function to generate three unique numbers and unique from previous round
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
  targetImages = image_display.getElementsByTagName('img');
  for (var t = 0; t < targetImages.length; t++){
    targetImages[t].addEventListener('click', registerClick);
  }
}

function registerClick(e){
  e.preventDefault();
  if( ! this.classList.contains('selected') && ! this.classList.contains('rejected') ){
    this.classList.add('selected');
    var imageId = this.getAttribute('id');
    allProducts[imageId].clickCounter();
    //var allImageTags = this.parentNode.childNodes;
    var allImageTags = image_display.getElementsByTagName('img');
    console.log('allImageTags', allImageTags);

    for (var i = 0; i < allImageTags.length; i++){
      allImageTags[i].removeEventListener('click', registerClick);
      if (this != allImageTags[i]){
        allImageTags[i].classList.toggle('rejected');
      }
    }
  }
//another round
  delayedTime = window.setTimeout(goAgain, timeDelay);
}

function logResults(){
  var newTable = document.createElement('table');
  var tbody = document.createElement('tbody');
  for( var i = 0; i < imageCount; i++){
    imageKey = key_prefix + i;
    tbody.appendChild(allProducts[imageKey].dataRow);
  }
  newTable.appendChild(tbody);
  console.log(tbody);
  console.log(resultsSection);
  resultsSection.appendChild(newTable);
}



initProgram();


/*
for (var j = 0; j < 1; j++) {
  initRound();
  console.log('unique_Num', unique_Nums);
  console.log('previous_unique', previous_unique);
}

initListeners();
*/
console.log('allProducts', allProducts);
