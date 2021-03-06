window.addEventListener('load', function() {
	var canvas = document.getElementById('canvas');
	canvas.setAttribute('width', window.innerWidth);
	canvas.setAttribute('height', window.innerHeight);
	var stage = new createjs.Stage('canvas');
	createjs.Touch.enable(stage, true); // Enables single touch interaction
	var w = stage.canvas.width;
	var h = stage.canvas.height;
	var queue = new createjs.LoadQueue(false);
	queue.loadManifest([
		{id:'fish', src:'assets/fish.png'},
		{id:'sand', src:'assets/sand.jpg'}
	]);
	queue.on('complete', function() {
		var container = new createjs.Container();
		var water = new createjs.Shape();
		water.graphics.f('#81D4FA').dr(0,0,w,2*h);
		container.y = -h;
		container.addChild(water);
		stage.addChild(container);
		// var sand = new createjs.Shape();
		// sand.graphics.f('sandybrown').dr(0,0,w,1.1*h);
		var sand = new createjs.Bitmap(queue.getResult('sand'));
		sand.scaleX = w / sand.getBounds().width;
		sand.scaleY = 1.1 * h / sand.getBounds().height;
		sand.y = 0.9 * h;
		container.addChild(sand);
		var instruction = 'Swipe down to start the game.\rSwipe from the bottom to end the game.';
		var text = new createjs.Text(instruction, '64px Impact', '#fff');
		text.textAlign = 'center';
		text.lineHeight = '100';
		text.x = w / 2;
		text.y = 1.5 * h - text.getBounds().height / 2;
		container.addChild(text);
		var ticker = createjs.Ticker.addEventListener("tick", stage);
		ticker.framerate = 60;
		var start, y, isON = false, interval;
		stage.addEventListener('mousedown', function(e) {
			start = e.stageY;
			y = container.y;
		});
		stage.addEventListener('pressmove', function(e) {
			var diff = e.stageY - start;
			if (y + diff >= -h && y + diff <=0 && !isON) {
				container.y = y + diff;
				stage.update();
			}
		});
		stage.addEventListener('pressup', function(e) {
			if (!isON) (e.stageY - start > 0.25 * h)?
			createjs.Tween.get(container).to({y:0}, 500).call(function() {
				isON = true;
				interval = setInterval(go, 2000);
				fish.x = 0.2 * w;
				fish.y = 0.4 * h;
				container.addChild(fish);
			}) : createjs.Tween.get(container).to({y:-h}, 500);
			else if (e.stageY - start < -0.5 * h)
				createjs.Tween.get(container).to({y:-h}, 500).call(function() {
					isON = false;
					clearInterval(interval);
					seaweed.removeAllChildren();
				});
		});
		var seaweed = new createjs.Container();
		container.addChild(seaweed);
		var fish = new createjs.Bitmap(queue.getResult('fish'));
		stage.on('click', function() {
			if (isON) createjs.Tween.get(fish).to({scaleY:0.5, y: fish.y + 0.2 * h}, 400).to({scaleY:1}, 100);
		});
		var animate = createjs.Ticker.on("tick", function() {
			if (isON) fish.y -= 0.6 * h / animate.framerate;
		});
		animate.framerate = 60;
		var width = 0.05 * h;
		var height = 0.9 * h;
		var c = 5
		var green = ['#43A047', '#388E3C', '#2E7D32'];
		var squares = [];
		for (var i = green.length - 1; i >= 0; i--) {
			var g = new createjs.Graphics();
			g.f(green[i]).dr(0,0,width/c,width/c);
			squares.unshift(g);
		}
		function go() {
			var pair = new createjs.Container();
			seaweed.addChild(pair);
			var upperHeight = (Math.random() * 3 + 2) / 10 * height / (width / c);
			var upperTotal = Math.floor(upperHeight) * c;
			for (var i = 0; i < upperTotal; i++) {
				var shape = new createjs.Shape(squares[Math.floor(Math.random() * squares.length)]);
				shape.x = (i % c) * (width / c);
				shape.y = Math.floor(i / c) * (width / c);
				pair.addChild(shape);
			}
			var lowerEdge = (Math.random() * 3 + 4) / 10 * height + upperHeight;
			var lowerHeight = (height - lowerEdge) / (width / c);
			var lowerTotal = Math.floor(lowerHeight) * c;
			for (var i = 0; i < lowerTotal; i++) {
				var shape = new createjs.Shape(squares[Math.floor(Math.random() * squares.length)]);
				shape.x = (i % c) * (width / c);
				shape.y = height - (width / c) - Math.floor(i / c) * (width / c);
				pair.addChild(shape);
			}
			pair.x = w;
			createjs.Tween.get(pair).to({x:-width}, 3000).call(function() {
				seaweed.removeChild(pair);
			});
		}
	});
});
