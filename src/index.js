"use strict";

var INITIAL_TIME = '00:03:00';

var participants = [
	{
    name:'Gabriel',
    icon:'rocket'
  },
  {
    name:'Fritz',
    icon:'rocket'
  },
  {
    name:'Jozef',
    icon:'rocket'
  },
  {
    name:'Emil',
    icon:'rocket'
  },
  {
    name:'Fede',
    icon:'rocket'
  },
  {
    name:'Inge',
    icon:'rocket'
  },
  {
    name:'Stefan',
    icon:'rocket'
  },
  {
    name:'Samuel',
    icon:'rocket'
  },
  {
    name:'Matheus',
    icon:'rocket'
  },
  {
    name:'Hoda',
    icon:'rocket'
  },
];
var interval;

$(document).ready(function() {
	createApp();	
});

function createApp() {
  var app = $('<div class="scrum-app" />');
  var title = $('<h1>Scrum Timer</h1>');
  $('body').append(app);
  $(app).append(title);
  
  var breakpoint = createHeader(app);
	createPools(app, participants, breakpoint);
}

function createHeader(app) {
	var header = $('<div class="header" />');
  app.append(header);
  return createMainTimer(header);  
}

function createMainTimer(container) {
  var panel = $('<div class="panel"></div>');  
  container.append(panel); 
    var buttonsPanel = $('<div class="buttonsPanel"></div>');  
    panel.append(buttonsPanel);
      var pause = $('<span class="jbtn pause">Pause</span>');  
      buttonsPanel.append(pause);
      installPause(pause);
      var stop = $('<span class="jbtn stop">Reset</span>');  
      buttonsPanel.append(stop);
      installStop(stop);    
    var totalTimerLabel = $('<span class="totalTimerLabel">Time Limit</span>');  
    panel.append(totalTimerLabel);    
    var totalTime = $('<input data-totalTime="0" class="totalTime"/>');
    panel.append(totalTime);    
    var breakpoint = $('<input id="breakpoint" value="'+INITIAL_TIME+'" />');  
    panel.append(breakpoint);
  
  return breakpoint;
}
function installStart(element) {  
  element.click(function(){
    start();
  });
}
function setAverageTime() {
 
    var poolsTimes = $('.pool .time');
    var sum = 0;
    
    poolsTimes.each(function(){
      var times = $(this);
      var seconds = times.attr('data-seconds');
          seconds = seconds === undefined ? 0 : Number(seconds);
      sum += seconds;
    });
    var average = parseInt( (sum / poolsTimes.length) ,10);  
    $('#average').text('Average: '+ toHHMMSS(average) );
}
function showAvarageBar() {
  var progressBars = $('.pool .progressBar');
    var sum = 0;
    
    progressBars.each(function(){
      var progress = $(this);
      var width = parseInt(progress.css('width'),10);
          width = width === undefined ? 0 : Number(width);
      sum += width;
    });
    var average = parseInt( (sum / progressBars.length) ,10);
    var left = (average + $('.participantContainer').first().width()) +  'px';
    $('.averageBar').css({ 'left': left , display:'block'});
    setAverageTime();    
}
function start() {
  if(interval !== undefined)
    return;

  interval = setInterval(function() {
    updateTotalTime(1);
  },1000);    
}

function updateTotalTime(step) {
  var totalTime = $('.totalTime').attr('data-totalTime');
      totalTime = (totalTime == '') ? 0 : totalTime;
  var seconds = Number(totalTime) + step;
  $('.totalTime').val(toHHMMSS(seconds)).attr('data-totalTime', seconds);
}

function installPause(element) {  
  element.click(function(){
    $('.pool').removeClass('active');
    pause();
  });
}
function pause() {
  clearInterval(interval);
  interval = undefined;
}
function installStop(element) {  
  element.click(function(){
  	$('.pool').removeClass('active');
    $('.pool').removeClass('overtime');
    $('.pool').removeClass('almostOvertime');
    $('.pool').removeClass('stop');
    $('.pool .progressBar').css('width','');
    $('.pool .time').val('').attr('data-seconds','0');
    pause();
    $('.totalTime').val('').attr('data-totalTime', '0');
    $('.averageBar').css({display:'none', left:'80px'});
    $('#average').text('00:00:00');
  });
}



function createPools(app, participants, breakpointInput) {
 	var pools = $('<div class="pools" />');
  app.append(pools);
 	for(var i=0;i<participants.length;i++) {
  	createPool(pools, participants[i], breakpointInput );
  }
  var newPool = $('<div class="newPool"></div>');  
  app.append(newPool);
    var newPoolName = $('<input type="text "class="newPoolName"/>');  
    newPool.append(newPoolName);
    var newPoolButton = $('<span class="newPoolButton jbtn">Add Participant</span>');  
    newPool.append(newPoolButton);
    newPoolButton.click(function(e) {
            var name = $(event.target).prev('.newPoolName').val();
            if(name === '') {
              alert('Name not specified!');
              return;
            }
            $(event.target).prev('.newPoolName').val('');
            var icon = 'rocket';
            createPool(pools, { name: name, icon:icon }, breakpointInput );
    });
    $('.pools').append('<div class="averageBar"><span id="average">00:00:00</span></div>');
}
function createPool(container, participant, breakpointInput) {	
  var pool = $('<div class="pool" />');
  var progressContainer = $('<div class="progressContainer" />');
  var progressBar = $('<div class="progressBar" />');  
  var time = $('<input class="time" data-seconds="0"/>');
  var removeButton = $('<div class="jbtn remove" >&times;</span>');
  
  pool.append(progressContainer); 
  progressContainer.append(progressBar);
  var participantContainer = $('<div class="participantContainer fa '+participant.icon+'"><span class="name">'+participant.name+'</span></div>');
  progressContainer.append(participantContainer);
  setRandomColor(progressBar, participantContainer);
  progressContainer.append(time);
  pool.append(removeButton);
  removeButton.click(function(e) {
    $(e.target).closest('.pool').remove();
  });

  container.append(pool);
  installPoolEvents(pool, breakpointInput);  
  installSortable( $('.pools') );
}

function installPoolEvents(pool, breakpointInput) {
	pool.click(function(event) {    
    start();
    $('.pool').not(pool).removeClass('active');
  	pool.toggleClass('active');    
		tryMove(pool, breakpointInput, true);
  });
}

function tryMove(pool, breakpointInput, move) {
    if(pool === undefined || pool === null)
      return;

    if(pool.hasClass('active')) {
    	var progressContainer = pool.find('.progressContainer'); 
  		var breakpoint = fromHHMMSStoSeconds( $(breakpointInput).val() ); // because input is in minutes      
      var progressStep = parseInt( (progressContainer.css('width') ), 10) / breakpoint; 
    	var progressBar = progressContainer.find('.progressBar');
      var time = pool.find('.time');
    	var seconds = Number(time.attr('data-seconds'), 10);
      seconds += 0.1;
      seconds = seconds.toFixed(2);
      time.attr('data-seconds', seconds);
      time.val(toHHMMSS(seconds));   

      showAvarageBar();
      var movement = Math.floor(seconds * progressStep);
      if(move === false) {
        var maxWidth = ( parseInt(progressContainer.css('width'),10) ) * 2;
        var percent = (movement * 200 / maxWidth) ;

        //progressBar.css('width', movement + 'px');
        progressBar.css('width', percent.toFixed(2) + '%');
      }
      
      if(breakpoint * 2 > seconds) {
        move = false;
      } else {          
        move = true;
      }     
      setTimeout(function() {
          tryMove(pool, breakpointInput, move);
      }, 100);
      
    } 
}

function toHHMMSS(secs) {
  var sec_num = parseInt(secs, 10)    
  var hours   = Math.floor(sec_num / 3600) % 24
  var minutes = Math.floor(sec_num / 60) % 60
  var seconds = sec_num % 60    
  return [hours,minutes,seconds]
      .map(v => v < 10 ? "0" + v : v)
      .filter((v,i) => v !== "00" || i > 0)
      .join(":")
}
function installSortable(elements) {
  $(function() {
    if ( elements.length ) {
      //elements.sortable('destroy');
      elements.sortable({ items: '.pool', opacity: 0.6, cursor: 'move', update: function() {
        var order = $(this).sortable("serialize") + '&action=updateRecordsListings';
      }});
    }
  });
}

function setRandomColor(element, element2) {
  var letters = '0123456789ABCDEF';
  var bgcolor = '#';
  for (var i = 0; i < 6; i++) {
    bgcolor += letters[Math.floor(Math.random() * 16)];
  }

  var bgColorWithTransparency = addTransparency(bgcolor);

  element.css('background', bgColorWithTransparency );
  element.css('color', 'black');
  element2.css('background', bgColorWithTransparency );
  element2.css('color', 'black');
}
function invertColor(hex) {
  if (hex.indexOf('#') === 0) {
      hex = hex.slice(1);
  }
  if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) {
      throw new Error('Invalid HEX color.');
  }
  var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
      g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
      b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
  return '#' + padZero(r) + padZero(g) + padZero(b);
}
function padZero(str, len) {
  len = len || 2;
  var zeros = new Array(len).join('0');
  return (zeros + str).slice(-len);
}
function addTransparency(hex){
  var c;
  if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
      c= hex.substring(1).split('');
      if(c.length== 3){
          c= [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c= '0x'+c.join('');

      return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',.4)';
  }
  throw new Error('Bad Hex');
}
function fromHHMMSStoSeconds(hms) {
    var a = hms.split(':'); // split it at the colons

    // minutes are worth 60 seconds. Hours are worth 60 minutes.
    var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 

    return seconds;
}



