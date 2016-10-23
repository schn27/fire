"use strict"

function Fire() {
	var canvas = document.getElementById("canvas");
	var scale = 4;
	var width = 0;
	var height = 0;
	var pixels = [];
	var newPixels = [];
	var imageData = null;
	var palette = createPalette();

	resize();

	this.onResize = function() {
		resize();
	};

	this.run = function() {
		var animFrame = window.requestAnimationFrame ||
						window.webkitRequestAnimationFrame ||
						window.mozRequestAnimationFrame    ||
						window.oRequestAnimationFrame      ||
						window.msRequestAnimationFrame     ||
						null;

		if (animFrame !== null) {
			var recursiveAnim = function() {
				mainloop();
				animFrame(recursiveAnim, canvas);
			};

			// start the mainloop
			animFrame(recursiveAnim);
		} else {
			var ONE_FRAME_TIME = 1000.0 / 60.0 ;
			setInterval(mainloop, ONE_FRAME_TIME);
		}
	};

	function createPalette() {
		var cr0 = 0;
		var cg0 = 0.4;
		var cb0 = 0.7;

		var kr = 1 / (1 - cr0) * 2;
		var br = -kr * cr0;
		var kg = 1 / (1 - cg0);
		var bg = -kg * cg0;
		var kb = 1 / (1 - cb0);
		var bb = -kb * cb0;	

		var palette = [];
		for (var i = 0; i < 256; ++i) {
			var v = i / 255;
			var color = [];
			color[0] = Math.floor(Math.min(Math.max(kr * v + br, 0), 1) * 255);
			color[1] = Math.floor(Math.min(Math.max(kg * v + bg, 0), 1) * 255);
			color[2] = Math.floor(Math.min(Math.max(kb * v + bb, 0), 1) * 255);
			palette[i] = color;
		}

		return palette;		
	}

	function resize() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		width = Math.floor(canvas.width / scale);
		height = Math.floor(canvas.height / scale);

		imageData = canvas.getContext('2d').createImageData(width * scale, height * scale);

		for (var i = 0; i < width * height; ++i) {
			newPixels[i] = pixels[i] = 0;
		}
	}

	function mainloop() {
		draw();
	}

	function draw() {
		var bottom = (height - 1) * width;

		for (var x = 0; x < width; ++x) {
			if (Math.random() > 0.93) {
				pixels[bottom + x] = 255;
			}
		}
			
		for (var x = 0; x < width; ++x) {
			for (var y = 0; y < height; ++y) {
				var y0 = y * width;
				var y1 = Math.min(y + 1, height - 1) * width;
				var y2 = Math.min(y + 2, height - 1) * width;
				var l = Math.max(x - 1, 0);
				var r = Math.min(x + 1, width - 1);
				var avg = Math.floor((pixels[y1 + l] + pixels[y1 + x] + pixels[y1 + r] + pixels[y2 + x]) / 4.06);
				avg = Math.min(avg, 255);

				newPixels[y0 + x] = avg;

				var color = palette[avg];

				for (var ys = 0; ys < scale; ++ys) {
					var ofs = (y * scale + ys) * width * scale + x * scale;
					for (var xs = 0; xs < scale; ++xs) {
						var i = (ofs + xs) * 4;
						imageData.data[i + 0] = color[0];
						imageData.data[i + 1] = color[1];
						imageData.data[i + 2] = color[2];
						imageData.data[i + 3] = 255;		
					}
				}
			}
		}

		var tmp = pixels;
		pixels = newPixels;
		newPixels = tmp;

		var context = canvas.getContext('2d');

		context.putImageData(imageData, 0, 0);
	}
}

var fire = new Fire();
fire.run();
