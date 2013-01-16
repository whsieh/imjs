/** canv := the canvas element */
/** ctx := the context of the canvas element */

var imgs = [];
var widths = [];
var imgX = [];
var totalWidth = 0;

var DEFAULT_IMG_WIDTH = 160;
var DEFAULT_GAP = 20;
var DEFAULT_Y = canv.height-160;
var DEFAULT_DRAW_MARGIN = 320;
var DAMPENING_RATE = 4;
var velocity = 0;

var canvasLoc = getPos(canv);
var centerX = canv.width/2;
var mouseX = centerX;
var mouseIn = false;

var selectedIndex = -1;
var seen = {};
var checkImg = new Image();
checkImg.src = '/images/checkmark.png';

window.onload = function() {
	fillImageData();
	initializeWidth();
	setInterval(frame, 33);
	setInterval(function() {
		if (!mouseIn) {
			if (Math.abs(velocity) >= DAMPENING_RATE) {
				velocity += (velocity > 0 ? -1 : 1) * DAMPENING_RATE;
			} else {
				velocity = 0;
			}
		}
	},100);
};

canv.onmousemove = function(event) {
	mouseX = event.clientX - canvasLoc['x'];
	var delta = mouseX - centerX;
	velocity = (delta > 0 ? -1 : 1 )*delta*delta / 6000;
	mouseIn = true;
	
	findImageIndex();
};

canv.onmouseout = function(event) {
	mouseX = centerX;
	mouseIn = false;
	selectedIndex = -1;
};

canv.onmousedown = function(event) {
	// findImageIndex();
	var s = selectedIndex;
	if (s != -1) {
		var i = imgs[s].src.lastIndexOf("/");
		seen[imgs[s].src] = true;
		var url = 'http://imgur.com/gallery' + imgs[s].src.substring(i,i+6);
		window.open(url);
	}
};

function frame() {
	drawframe();
	nextframe();
}

function findImageIndex() {
	var index = search(imgX, mouseX,0,imgX.length-1);
	if (imgX[index-1] < mouseX && mouseX < imgX[index-1]+widths[index-1]) {
		selectedIndex = index-1;
	} else if (imgX[index] < mouseX && mouseX < imgX[index]+widths[index]) {
		selectedIndex = index;
	} else if (imgX[index+1] < mouseX && mouseX < imgX[index+1]+widths[index+1]) {
		selectedIndex = index+1;
	}
}

function fillImageData() {
	for(var i=0; i<urls.length; i++) { // urls from index.jade
		imgs[i] = new Image();
		imgs[i].src = urls[i];
	}
	
}

function initializeWidth() {
	for (var i=0; i<imgs.length; i++) {
		widths[i] = DEFAULT_IMG_WIDTH;
		totalWidth = widths[i] + totalWidth;
	}
	imgX[0] = (canv.width - totalWidth)/2;
	for (var i=1; i<imgs.length; i++) {
		imgX[i] = imgX[i-1] + widths[i-1] + DEFAULT_GAP;
	}
}

function nextframe() {
	for (var i=0; i<imgs.length; i++) {
		imgX[i] += velocity;
	}
	if (velocity > 0) {
		if (imgX[imgs.length-1] > canv.width + (totalWidth/2)) {
			imgs.splice(0,0,imgs.pop());
			imgX.splice(0,0,imgX.pop());
			widths.splice(0,0,widths.pop());
			imgX[0] = imgX[1] - widths[0] - DEFAULT_GAP;
		}
	} else if (velocity < 0) {
		if (imgX[0] < -totalWidth/2) {
			imgs.splice(imgs.length-1,0,imgs.shift());
			imgX.splice(imgX.length-1,0,imgX.shift());
			widths.splice(widths.length-1,0,widths.shift());
			imgX[imgX.length-1] = imgX[imgX.length-2] + widths[imgX.length-2] + DEFAULT_GAP;
		}
	}
}

function search(array, val, start, end) {
	if (start == end || start + 1 == end) {
		return start;
	}
	var mid = Math.floor((start + end) / 2);
	if (val < array[mid]) {
		return search(array, val, start, mid);
	} else if (val > array[mid]) {
		return search(array, val, mid+1, end);
	} else {
		return mid;
	}
}

function drawframe() {
	ctx.clearRect(0,0,canv.width,canv.height);
	for (var i=0; i<imgs.length; i++) {
		if (seen[imgs[i].src]) {
			ctx.globalAlpha = (selectedIndex == i) ? 0.8 : 0.4;
			ctx.drawImage(imgs[i],imgX[i],DEFAULT_Y);
			ctx.globalAlpha = 1.0;
			ctx.drawImage(checkImg,imgX[i],DEFAULT_Y);
		} else if ((-DEFAULT_DRAW_MARGIN < imgX[i]) && (imgX[i] < canv.width+DEFAULT_DRAW_MARGIN)) {
			ctx.globalAlpha = (selectedIndex == i) ? 1.0 : 0.75;
			ctx.drawImage(imgs[i],imgX[i],DEFAULT_Y);
		}
	}
}

function getPos(elem) {
   if (!elem) {
      return {'x':0, 'y':0};
   }
   var xy = {'x':elem.offsetLeft, 'y':elem.offsetTop};
   var par = getPos(elem.offsetParent);
   for (var key in par) {
      xy[key] += par[key];
   }
   return xy;
}

