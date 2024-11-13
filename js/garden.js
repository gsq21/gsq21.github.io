function Vector(x, y) {
	this.x = x;
	this.y = y;
};

Vector.prototype = {
	rotate: function (theta) {
		var x = this.x;
		var y = this.y;
		this.x = Math.cos(theta) * x - Math.sin(theta) * y;
		this.y = Math.sin(theta) * x + Math.cos(theta) * y;
		return this;
	},
	mult: function (f) {
		this.x *= f;
		this.y *= f;
		return this;
	},
	clone: function () {
		return new Vector(this.x, this.y);
	},
	length: function () {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	},
	subtract: function (v) {
		this.x -= v.x;
		this.y -= v.y;
		return this;
	},
	set: function (x, y) {
		this.x = x;
		this.y = y;
		return this;
	}
};

function Petal(stretchA, stretchB, startAngle, angle, growFactor, bloom) {
	this.stretchA = stretchA;
	this.stretchB = stretchB;
	this.startAngle = startAngle;
	this.angle = angle;
	this.bloom = bloom;
	this.growFactor = growFactor;
	this.r = 1;
	this.isfinished = false;
	//this.tanAngleA = Garden.random(-Garden.degrad(Garden.options.tanAngle), Garden.degrad(Garden.options.tanAngle));
	//this.tanAngleB = Garden.random(-Garden.degrad(Garden.options.tanAngle), Garden.degrad(Garden.options.tanAngle));
}
Petal.prototype = {
	draw: function () {
		var ctx = this.bloom.garden.ctx;
		var v1, v2, v3, v4;
		v1 = new Vector(0, this.r).rotate(Garden.degrad(this.startAngle));
		v2 = v1.clone().rotate(Garden.degrad(this.angle));
		v3 = v1.clone().mult(this.stretchA); //.rotate(this.tanAngleA);
		v4 = v2.clone().mult(this.stretchB); //.rotate(this.tanAngleB);
		ctx.strokeStyle = this.bloom.c;
		ctx.beginPath();
		ctx.moveTo(v1.x, v1.y);
		ctx.bezierCurveTo(v3.x, v3.y, v4.x, v4.y, v2.x, v2.y);
		ctx.stroke();
	},
	render: function () {
		if (this.r <= this.bloom.r) {
			this.r += this.growFactor; // / 10;
			this.draw();
		} else {
			this.isfinished = true;
		}
	}
}

function Bloom(p, r, c, pc, garden) {
	this.p = p;
	this.r = r;
	this.c = c;
	this.pc = pc;
	this.petals = [];
	this.garden = garden;
	this.init();
	this.garden.addBloom(this);
}
Bloom.prototype = {
	draw: function () {
		var p, isfinished = true;
		this.garden.ctx.save();
		this.garden.ctx.translate(this.p.x, this.p.y);
		for (var i = 0; i < this.petals.length; i++) {
			p = this.petals[i];
			p.render();
			isfinished *= p.isfinished;
		}
		this.garden.ctx.restore();
		if (isfinished == true) {
			this.garden.removeBloom(this);
		}
	},
	init: function () {
		var angle = 360 / this.pc;
		var startAngle = Garden.randomInt(0, 90);
		for (var i = 0; i < this.pc; i++) {
			this.petals.push(new Petal(Garden.random(Garden.options.petalStretch.min, Garden.options.petalStretch.max), Garden.random(Garden.options.petalStretch.min, Garden.options.petalStretch.max), startAngle + i * angle, angle, Garden.random(Garden.options.growFactor.min, Garden.options.growFactor.max), this));
		}
	}
}

function Garden(ctx, element) {
	this.blooms = [];
	this.element = element;
	this.ctx = ctx;
}
Garden.prototype = {
	render: function () {
		for (var i = 0; i < this.blooms.length; i++) {
			this.blooms[i].draw();
		}
	},
	addBloom: function (b) {
		this.blooms.push(b);
	},
	removeBloom: function (b) {
		var bloom;
		for (var i = 0; i < this.blooms.length; i++) {
			bloom = this.blooms[i];
			if (bloom === b) {
				this.blooms.splice(i, 1);
				return this;
			}
		}
	},
	createRandomBloom: function (x, y) {
		this.createBloom(x, y, Garden.randomInt(Garden.options.bloomRadius.min, Garden.options.bloomRadius.max), Garden.randomrgba(Garden.options.color.rmin, Garden.options.color.rmax, Garden.options.color.gmin, Garden.options.color.gmax, Garden.options.color.bmin, Garden.options.color.bmax, Garden.options.color.opacity), Garden.randomInt(Garden.options.petalCount.min, Garden.options.petalCount.max));
	},
	createBloom: function (x, y, r, c, pc) {
		new Bloom(new Vector(x, y), r, c, pc, this);
	},
	clear: function () {
		this.blooms = [];
		this.ctx.clearRect(0, 0, this.element.width, this.element.height);
	}
}

Garden.options = {
	petalCount: {
		min: 8,
		max: 15
	},
	petalStretch: {
		min: 0.1,
		max: 3
	},
	growFactor: {
		min: 0.1,
		max: 1
	},
	bloomRadius: {
		min: 4,
		max: 7
	},
	density: 10,
	growSpeed: 1500 / 60,
	color: {
		rmin: 128,
		rmax: 255,
		gmin: 0,
		gmax: 128,
		bmin: 0,
		bmax: 128,
		opacity: 0.1
	},
	tanAngle: 60
};
Garden.random = function (min, max) {
	return Math.random() * (max - min) + min;
};
Garden.randomInt = function (min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};
Garden.circle = 2 * Math.PI;
Garden.degrad = function (angle) {
	return Garden.circle / 360 * angle;
};
Garden.raddeg = function (angle) {
	return angle / Garden.circle * 360;
};
Garden.rgba = function (r, g, b, a) {
	return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
};
Garden.randomrgba = function (rmin, rmax, gmin, gmax, bmin, bmax, a) {
	var r = Math.round(Garden.random(rmin, rmax));
	var g = Math.round(Garden.random(gmin, gmax));
	var b = Math.round(Garden.random(bmin, bmax));
	var limit = 5;
	if (Math.abs(r - g) <= limit && Math.abs(g - b) <= limit && Math.abs(b - r) <= limit) {
		return Garden.rgba(rmin, rmax, gmin, gmax, bmin, bmax, a);
	} else {
		return Garden.rgba(r, g, b, a);
	}
};
// 点击出现爱心特效
! function (e, t, a) {
	function r() {
		for (var e = 0; e < s.length; e++) s[e].alpha <= 0 ? (t.body.removeChild(s[e].el), s.splice(e, 1)) : (s[
			e].y--, s[e].scale += .004, s[e].alpha -= .013, s[e].el.style.cssText = "left:" + s[e].x +
			"px;top:" + s[e].y + "px;opacity:" + s[e].alpha + ";transform:scale(" + s[e].scale + "," + s[e]
				.scale + ") rotate(45deg);background:" + s[e].color + ";z-index:99999");
		requestAnimationFrame(r)
	}

	function n() {
		var t = "function" == typeof e.onclick && e.onclick;
		e.onclick = function (e) {
			t && t(), o(e)
		}
	}

	function o(e) {
		var a = t.createElement("div");
		a.className = "heart", s.push({
			el: a,
			x: e.clientX - 5,
			y: e.clientY - 5,
			scale: 1,
			alpha: 1,
			color: c()
		}), t.body.appendChild(a)
	}

	function i(e) {
		var a = t.createElement("style");
		a.type = "text/css";
		try {
			a.appendChild(t.createTextNode(e))
		} catch (t) {
			a.styleSheet.cssText = e
		}
		t.getElementsByTagName("head")[0].appendChild(a)
	}

	// 颜色
	function c() {
		return "rgb(" + ~~(255 * Math.random()) + "," + ~~(255 * Math.random()) + "," + ~~(255 * Math
			.random()) + ")"
	}
	var s = [];
	e.requestAnimationFrame = e.requestAnimationFrame || e.webkitRequestAnimationFrame || e
		.mozRequestAnimationFrame || e.oRequestAnimationFrame || e.msRequestAnimationFrame || function (e) {
			setTimeout(e, 1e3 / 60)
		}, i(
			".heart{width: 10px;height: 10px;position: fixed;background: #f00;transform: rotate(45deg);-webkit-transform: rotate(45deg);-moz-transform: rotate(45deg);}.heart:after,.heart:before{content: '';width: inherit;height: inherit;background: inherit;border-radius: 50%;-webkit-border-radius: 50%;-moz-border-radius: 50%;position: fixed;}.heart:after{top: -5px;}.heart:before{left: -5px;}"
		), n(), r()
}(window, document);