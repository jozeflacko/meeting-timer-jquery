"use strict";

var INITIAL_TIME = '00:01:00';
var PARTICIPANTS = ['Jozef','Gabriel','Emil','Hoda','Matheus','Fede','Fritz', 'Samuel','Inge','Stefan','Abduaziz','Ognjen'];
var interval;
var ANIMATION_TIMEOUT = 97;

$(document).ready(function() {
	createApp();	
});

function createApp() {
  var app = $('<div class="scrum-app" />');
  var title = $('<h1>Meeting Timer</h1>');  
  $('body').append(app);
  $(app).append(title);
  
  
  var breakpoint = createHeader(app);
  createPools(app, getParticipantsCookie(), breakpoint);
  
  createHelp(app);
}

function createHelp(app) {
  var hint = $('<div class="hint">This is a timer for short <b>Stand-up Meetings</b>. <br>Set time limit for speech, add participants into the pool below and when they are ready to talk, just click on arow with their name. Timer will start automatically.</div>');
  $(app).append(hint);
}

function createHeader(app) {
	var header = $('<div class="header" />');
  app.append(header);
  return createMainTimer(header);  
}

var INITIAL_TIME_COOKIE = 'init_time_cookie';
function getCookieInitialTime() {
  var initialTime = getCookie(INITIAL_TIME_COOKIE);
  if(initialTime)
    return initialTime;

  return INITIAL_TIME;
}
function setCookieInitialTime(value) {
  if(value !== undefined && value !== '' && value.length === 8 && value.split(':').length === 3)
    setCookie(INITIAL_TIME_COOKIE, value);
}
var INITIAL_PARTICIPANTS_COOKIE = 'init_participants_cookie';
function getParticipantsCookie() {
  var init = getCookie(INITIAL_PARTICIPANTS_COOKIE);
  if(init)
    return init;

  return PARTICIPANTS;
}
function setParticipantsWithCookie(value) {
  if(value !== undefined && value !== '') {
 
    setCookie(INITIAL_PARTICIPANTS_COOKIE, value);
  }
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
          c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
      }
  }
  return "";
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}


function createMainTimer(container) {
  var panel = $('<div class="panel"></div>');  
  container.append(panel); 
    var buttonsPanel = $('<div class="buttonsPanel"></div>');  
    panel.append(buttonsPanel);
      var stop = $('<i class="stop fa fa-stop-circle-o" aria-hidden="true"></i>');  
      buttonsPanel.append(stop);
      installStop(stop);
      var reset = $('<i class="play fa fa-play-circle-o" aria-hidden="true"></i>');  
      buttonsPanel.append(reset);
      installReset(reset);    
    var totalTimerLabel = $('<span class="totalTimerLabel">Time Limit</span>');  
    panel.append(totalTimerLabel);    
    var totalTime = $('<input data-totalTime="0" class="totalTime"/>');
    panel.append(totalTime);    
    var breakpoint = $('<input id="breakpoint" value="'+getCookieInitialTime()+'" />');  
    breakpoint.on('change', function() {
      var value = $(this).val();
      setCookieInitialTime(value);
    });
    panel.append(breakpoint);
  
  return breakpoint;
}
function installStart(element) {  
  element.click(function(){
    start();
  });
}
function setAverageTime() {
    var relevatPeople = 0;
    var poolsTimes = $('.pool .time');
    var sum = 0;
    
    poolsTimes.each(function(){
      var times = $(this);
      var seconds = times.attr('data-seconds');
          seconds = seconds === undefined ? 0 : Number(seconds);
      if(seconds > 0)
        relevatPeople++;
      sum += seconds;
    });
    var average = parseInt( (sum / relevatPeople) ,10);  
    $('#average').text( toHHMMSS(average) );
}
function showAvarageBar() {
  var progressBars = $('.pool .progressBar');
  var sum = 0;
  var relevatPeople = 0;
    progressBars.each(function(){
      var progress = $(this);
      var width = parseInt(progress.css('width'),10);
          width = width === undefined ? 0 : Number(width);
      if(width > 0)
        relevatPeople++;

      sum += width;
    });
    var average = parseInt( (sum / relevatPeople) ,10);
    var left = (average + $('.participantContainer').first().width()) +  'px';
    $('.averageBar').css({ 'left': left });

    if( relevatPeople > 1)
      $('.averageBar').css({ 'display': 'block' });

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

function installStop(element) {  
  element.click(function(){
    $('.pool').removeClass('active');
    stop();
  });
}
function stop() {
  clearInterval(interval);
  interval = undefined;
  showAvarageBar();
}
function installReset(element) {  
  element.click(function(){
  	$('.pool').removeClass('active');
    $('.pool').removeClass('overtime');
    $('.pool').removeClass('almostOvertime');
    $('.pool').removeClass('stop');
    $('.pool').removeAttr('data-beep-played');
    $('.pool .progressBar').css('width','');
    $('.pool .time').val('').attr('data-seconds','0');
    stop();
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
    var newPoolButton = $('<span class="newPoolButton jbtn">+</span>');  
    newPool.append(newPoolButton);
    newPoolButton.click(function(e) {
            var name = $(event.target).prev('.newPoolName').val();
            if(name === '') {
              alert('Name not specified!');
              return;
            }
            $(event.target).prev('.newPoolName').val('');
            var icon = 'rocket';
            createPool(pools, name, breakpointInput );
    });
    $('.pools').append('<div class="averageBar"><span id="average">00:00:00</span></div>');
}
function createPool(container, participant, breakpointInput) {	
  var pool = $('<div class="pool" data-beep-played="0%" data-person="'+participant.toLowerCase()+'" />');
  var progressContainer = $('<div class="progressContainer" />');
  var progressBar = $('<div class="progressBar" />');  
  var time = $('<input class="time" data-seconds="0"/>');
  var removeButton = $('<div class="jbtn remove" >&times;</span>');
  
  pool.append(progressContainer); 
  progressContainer.append(progressBar);
  var participantContainer = $('<div class="participantContainer"><span class="name">'+participant+'</span></div>');
  progressContainer.append(participantContainer);
  setRandomColor(progressBar, participantContainer);
  progressContainer.append(time);
  pool.append(removeButton);
  removeButton.click(function(e) {
    $(e.target).closest('.pool').remove();
    showAvarageBar();
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

    
      var movement = Math.floor(seconds * progressStep);
      if(move === false) {
        var maxWidth = ( parseInt(progressContainer.css('width'),10) ) * 2;
        var percent = (movement * 200 / maxWidth) ;

        //progressBar.css('width', movement + 'px');
        progressBar.css('width', percent.toFixed(2) + '%');        
      }

      showAvarageBar();

      if(Number(breakpoint) < Number(seconds) ) {        
        if( pool.attr('data-beep-played') === undefined || pool.attr('data-beep-played') === '0%' ) {
          playBeep();
          pool.attr('data-beep-played','100%');
        }     
      }
      if(Number(2 * breakpoint) ==  Number(seconds)) {           
        pool.attr('data-beep-played','200%');
        playBeep(true);        
      }
      move = (breakpoint * 2 > seconds) ? false : true;
      setTimeout(function() {
          tryMove(pool, breakpointInput, move); 
      }, ANIMATION_TIMEOUT);
      
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

  element.css('background-color', bgColorWithTransparency );
  element.css('color', 'black');
  element2.css('background-color', bgColorWithTransparency );
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

function playBeep(more) {
   setTimeout(function(){
      play();    
      if(more === true) {
        setTimeout(function(){
          play();
          setTimeout(function(){
            play();
          },250);  
        },250);   
      }
   }, ANIMATION_TIMEOUT); 
   

    function play() {
      document.getElementById("audio").play();   
    }

}

function changePerson(person) {

  var findPerson = person;

  findPerson = findPerson.toLowerCase();

  var $pool = $('.pool[data-person="'+findPerson+'"]');

  $pool.click();

}



