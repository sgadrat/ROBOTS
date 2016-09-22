var robots = {
	state: {tick: null, click: null, data: null},

	init: function() {
		var graphics = [
			'img/background.jpg',
			'img/background_game.jpg',
			'img/hero_idle.png',
			'img/target_green.png',
			'img/target_red.png',
			'img/nought.png',
			'img/cross.png',
			'img/speech.png',
		];
		var animations = {};
		animations['hero.portrait'] = new rtge.Animation();
		animations['hero.portrait'].steps = ['img/hero_idle.png'];
		animations['hero.portrait'].durations = [600000];
		animations['target.green'] = new rtge.Animation();
		animations['target.green'].steps = ['img/target_green.png'];
		animations['target.green'].durations = [600000];
		animations['target.red'] = new rtge.Animation();
		animations['target.red'].steps = ['img/target_red.png'];
		animations['target.red'].durations = [600000];
		animations['target.blink'] = new rtge.Animation();
		animations['target.blink'].steps = ['img/target_green.png', 'img/target_red.png'];
		animations['target.blink'].durations = [250, 250];
		animations['marker.nought'] = new rtge.Animation();
		animations['marker.nought'].steps = ['img/nought.png'];
		animations['marker.nought'].durations = [600000];
		animations['marker.cross'] = new rtge.Animation();
		animations['marker.cross'].steps = ['img/cross.png'];
		animations['marker.cross'].durations = [600000];
		animations['speech'] = new rtge.Animation();
		animations['speech'].steps = ['img/speech.png'];
		animations['speech'].durations = [600000];
		animations['logo'] = new rtge.Animation();
		for (var i = 0; i < 9; ++i) {
			var filename = 'img/logo_'+i+'.png';
			graphics.push(filename);
			animations['logo'].steps.push(filename);
			animations['logo'].durations.push(300);
		}
		animations['logo'].durations[8] = 600000;
		var camera = new rtge.Camera();

		rtge.init(
			'view',
			{
				'terrain': null,
				'objects': []
			},
			animations,
			[],
			graphics,
			{
				'globalTick': robots.globalTick,
				'worldClick': robots.worldClick,
			},
			camera
		);

		robots.state = {tick: robots.logoTick, click: null, data: {duration: 0, logo: null}};
	},

	globalTick: function(timeDiff) {
		if (robots.state.tick !== null) {
			robots.state.tick(timeDiff);
		}
	},

	worldClick: function(x, y) {
		if (robots.state.click !== null) {
			var style = getComputedStyle(document.getElementById('view'));
			var canvas_width = style.width.slice(0, style.width.length - 2);
			var canvas_height = style.height.slice(0, style.height.length - 2);
			var internal_width = 960;
			var internal_height = 540;

			var internal_x = x * (internal_width / canvas_width);
			var internal_y = y * (internal_height / canvas_height);
			robots.state.click(internal_x, internal_y);
		}
	},

	logoTick: function(timeDiff) {
		robots.state.data.duration += timeDiff;
		if (robots.state.data.logo === null) {
			robots.state.data.logo = new robots.Logo();
			rtge.addObject(robots.state.data.logo);
		}
		if (robots.state.data.duration > 6000) {
			robots.beginIntroState();
		}
	},

	introTick: function(timeDiff) {
		robots.state.data.duration += timeDiff;
		if (robots.state.data.duration > 1000) {
			document.getElementById('introtext').style.display = '';
		}
		if (robots.state.data.duration > 4000 && robots.state.data.hero === null) {
			robots.state.data.hero = new robots.Hero(753, 187);
			rtge.addObject(robots.state.data.hero);
		}
		if (robots.state.data.duration > 8000) {
			document.getElementById('introtext').innerHTML = '<p><span>Recherche de vulnérabilité en cours...</span></p>';

			if (robots.state.data.target === null) {
				robots.state.data.target = new robots.Target(0, 0);
				rtge.addObject(robots.state.data.target);
			}

			pos = [
				{time: 0, x:500, y:190},
				{time: 500, x:565, y:120},
				{time: 1000, x:440, y:260},
				{time: 1500, x:395, y:390},
				{time: 2000, x:210, y:400},
				{time: 2500, x:240, y:325},
				{time: 3000, x:280, y:255},
				{time: 3500, x:330, y:130},
				{time: 4000, x:334, y:177},
				{time: 4500, x:400, y:200},
				{time: 5000, x:365, y:252},
			];
			var current_time = robots.state.data.duration - 8000;
			best_pos = pos[0];
			for (var i = pos.length - 1; i >= 0; --i) {
				if (pos[i].time <= current_time) {
					best_pos = pos[i];
					break;
				}
			}
			robots.state.data.target.x = best_pos.x;
			robots.state.data.target.y = best_pos.y;
		}
		if (robots.state.data.duration > 13000) {
			robots.state.data.target.animation = 'target.blink';
		}
		if (robots.state.data.duration > 15000) {
			robots.state.data.target.animation = 'target.green';
			document.getElementById('introtext').innerHTML = '<p><span>Trouvé !</span></p>';
		}
		if (robots.state.data.duration > 18000) {
			robots.beginGameState();
		}
	},

	beginIntroState: function() {
		document.getElementById('introtext').innerHTML = '<p><span>Une fois encore le monde à besoin de vous !</span></p>';
		document.getElementById('introtext').style.display = 'none';
		while (rtge.state.objects.length > 0) {
			rtge.removeObject(rtge.state.objects[0]);
		}
		rtge.state.terrain = 'img/background.jpg';
		robots.state = {tick: robots.introTick, click: null, data: {duration: 0, hero: null, target: null}};
		document.getElementById('music').play();
	},

	beginGameState: function() {
		while (rtge.state.objects.length > 0) {
			rtge.removeObject(rtge.state.objects[0]);
		}
		rtge.addObject(new robots.Hero(753, 187));
		document.getElementById('introtext').style.display = 'none';
		rtge.state.terrain = 'img/background_game.jpg';
		robots.state = {tick: robots.gameTick, click: robots.gameClick, data: {hero: new robots.Hero(753, 187), board: [0, 0, 0, 0, 0, 0, 0, 0, 0], markers: [], duration: 0, speech: null, tuto_state: 'init'}};
		rtge.addObject(robots.state.data.hero);
	},

	gameTick: function(timeDiff) {
		var state = robots.state.data;
		state.duration += timeDiff;
		if (state.tuto_state == 'init' && state.duration > 3000) {
			state.speech = new robots.Tutorial();
			rtge.addObject(state.speech);
			state.tuto_state = 'running';
		}
	},

	gameClick: function(x, y) {
		// Cancel the tutorial (hide it or avoid it to appear later)
		robots.state.data.tuto_state = 'cancelled';
		if (robots.state.data.speech !== null) {
			rtge.removeObject(robots.state.data.speech);
		}

		// Get selected position
		var board_index = robots.coordToBoardIndex(x, y);
		if (robots.state.data.board[board_index] != 0) {
			return;
		}

		// Place player's marker
		var items_coord = [
			{x:193, y:156}, {x:335, y:112}, {x:473, y:66},
			{x:218, y:317}, {x:350, y:267}, {x:485, y:222},
			{x:230, y:468}, {x:368, y:430}, {x:506, y:381},
		];
		var marker = new robots.Nought(items_coord[board_index].x, items_coord[board_index].y);
		robots.state.data.markers.push(marker);
		robots.state.data.board[board_index] = 1;
		rtge.addObject(marker);

		// Check for player's victory
		var board_state = robots.gameOver(robots.state.data.board);
		if (board_state == 1) {
			document.getElementById('introtext').innerHTML = '<p><span>Félicitations !</span></p><p><span>Vous avez encore sauvé le monde, l\'humanité vous doit une fière chandelle.</span></p>';
			document.getElementById('introtext').style.display = '';
			robots.state = {tick: null, click: robots.beginGameState, data: null};
			return;
		}
		if (board_state == 3) {
			document.getElementById('introtext').innerHTML = '<p><span>Vous avez limité la casse.</span></p><p><span>Nous ne savons pas s\'il faut vous remercier.</span></p>';
			document.getElementById('introtext').style.display = '';
			robots.state = {tick: null, click: robots.beginGameState, data: null};
			return;
		}

		// Place computer marker
		defensive_move = null;
		win_move = null;
		first_move = null;
		for (board_index = 0; board_index < robots.state.data.board.length; ++board_index) {
			if (robots.state.data.board[board_index] == 0) {
				if (first_move === null) {
					first_move = board_index;
				}
				var board_copy = robots.state.data.board.slice(0);
				board_copy[board_index] = 2;
				if (robots.gameOver(board_copy) == 2) {
					win_move = board_index;
					break;
				}
				board_copy[board_index] = 1;
				if (robots.gameOver(board_copy) == 1) {
					defensive_move = board_index;
				}
			}
		}
		board_index = win_move !== null ? win_move : defensive_move !== null ? defensive_move : first_move;
		var marker = new robots.Cross(items_coord[board_index].x, items_coord[board_index].y);
		robots.state.data.markers.push(marker);
		robots.state.data.board[board_index] = 2;
		rtge.addObject(marker);

		// Check for computer victory
		var board_state = robots.gameOver(robots.state.data.board);
		if (board_state == 2) {
			document.getElementById('introtext').innerHTML = '<p><span>La ville a été détruite !</span></p><p><span>Maintenant que les humains ont disparu, vous pouvez vivre libre.</span></p>';
			document.getElementById('introtext').style.display = '';
			robots.state = {tick: null, click: robots.beginGameState, data: null};
			return;
		}
		if (board_state == 3) {
			document.getElementById('introtext').innerHTML = '<p><span>Vous avez limité la casse.</span></p><p><span>Nous ne savons pas s\'il faut vous remercier.</span></p>';
			document.getElementById('introtext').style.display = '';
			robots.state = {tick: null, click: robots.beginGameState, data: null};
			return;
		}
	},

	gameOver: function(board) {
		var i;
		for (i = 0; i < 9; i += 3) {
			if (board[i] != 0 && board[i] == board[i+1] && board[i+1] == board[i+2]) {
				return board[i];
			}
		}
		for (i = 0; i < 3; ++i) {
			if (board[i] != 0 && board[i] == board[i+3] && board[i+3] == board[i+6]) {
				return board[i];
			}
		}
		if (board[0] != 0 && board[0] == board[4] && board[4] == board[8]) {
			return board[0];
		}
		if (board[2] != 0 && board[2] == board[4] && board[4] == board[6]) {
			return board[2];
		}
		for (i = 0; i < 9; ++i) {
			if (board[i] == 0) {
				return 0;
			}
		}
		return 3;
	},

	coordToBoardIndex: function(x, y) {
		var cases_coord = [
			{x:193, y:156}, {x:335, y:112}, {x:473, y:66},
			{x:218, y:317}, {x:350, y:267}, {x:485, y:222},
			{x:230, y:468}, {x:368, y:430}, {x:506, y:381},
		];

		var best_index = null;
		var best_distance = null;
		for (var i = 0; i < cases_coord.length; ++i) {
			var distance = Math.sqrt(Math.pow(cases_coord[i].x - x, 2) + Math.pow(cases_coord[i].y - y, 2));
			if (best_distance === null || distance < best_distance) {
				best_index = i;
				best_distance = distance;
			}
		}
		return best_index;
	},

	Hero: function(x, y) {
		rtge.DynObject.call(this);
		this.x = x;
		this.y = y;
		this.z = 1;
		this.animation = 'hero.portrait';
	},

	Target: function(x, y) {
		rtge.DynObject.call(this);
		this.x = x;
		this.y = y;
		this.z = 1;
		this.anchorX = 60;
		this.anchorY = 60;
		this.animation = 'target.red';
	},

	Nought: function(x, y) {
		rtge.DynObject.call(this);
		this.x = x;
		this.y = y;
		this.z = 1;
		this.anchorX = 40;
		this.anchorY = 50;
		this.animation = 'marker.nought';
	},

	Cross: function(x, y) {
		rtge.DynObject.call(this);
		this.x = x;
		this.y = y;
		this.z = 1;
		this.anchorX = 40;
		this.anchorY = 50;
		this.animation = 'marker.cross';
	},

	Logo: function() {
		rtge.DynObject.call(this);
		this.animation = 'logo';
		this.anchorX = 167;
		this.anchorY = 117;
		this.x = 960 / 2;
		this.y = 540 / 2;
	},

	Tutorial: function() {
		rtge.DynObject.call(this);
		this.animation = 'speech'
		this.x = 550;
		this.y = 40;
	},
};
