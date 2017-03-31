function Mscroll(selector, opt) {
	this.wrapper = document.querySelector(selector);
	this.startTranslateY = 0;
	this.nowTranslateY = 0;
	this.target = 0;
	this.startPoint = {
		pageX: 0,
		pageY: 0
	};
	this.nowPoint = {
		pageX: 0,
		pageY: 0
	};
	this.lastTime = 0;
	this.nowTime = 0;
	this.timeDistance = 1; //取1是为了避免NAN

	this.lastPointY = 0;
	this.disTance = 0;

	this.isUpright = true;
	this.isFirst = true;
	this.scale = 0;
	this.step = 1;
	this.Tween = {
		easeOut: function(t, b, c, d) {
			return -c * ((t = t / d - 1) * t * t * t - 1) + b;
		},
		backOut: function(t, b, c, d, s) {
			if (typeof s == 'undefined') {
				s = 1.70158;
			}
			return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
		}
	};

	//默认参数
	this.default = {
		bounce: false,
		scrollBounce: false,
		scrollBar: false,
		scrollStart: function() {},
		scrollMove: function() {},
		scrollEnd: function() {}
	}
	extend(this.default, opt || {});
	this.init();
}

Mscroll.prototype = {
	constructor: Mscroll,
	init: function() {
		var This = this;
		this.scroller = this.wrapper.children[0];
		this.maxY = this.wrapper.clientHeight - this.scroller.clientHeight;
		cssTransform(this.scroller, 'translateZ', 0.01); //开启3D硬件加速
		this.touchStart();
		this.touchMove();
		this.touchEnd();
		if (this.default.scrollBar) {
			this.scrollBar();
		}
		setTimeout(function() {
			This.refresh();
		}, 30);
	},
	touchStart: function() {
		var This = this;
		this.wrapper.addEventListener(
			'touchstart',
			function(e) {
				if (This.maxY >= 0) return;
				clearInterval(This.timer);
				This.scroller.style.transition = 'none';
				if (This.default.scrollStart) {
					This.default.scrollStart();
				}
				This.startPoint = {
					pageX: e.changedTouches[0].pageX,
					pageY: e.changedTouches[0].pageY
				};
				This.startTranslateY = cssTransform(This.scroller, 'translateY');
				This.nowTime = new Date().getTime();
				This.lastPointY = This.startPoint.pageY;
				This.timeDistance = 1;
				This.disTance = 0;
				This.isUpright = true;
				This.isFirst = true;

				if (This.default.scrollBar) {
					This.scale = This.wrapper.offsetHeight / This.scroller.offsetHeight;
					This.scrollBar.style.height = This.scale * This.wrapper.offsetHeight + 'px';
				}
			}
		)
	},
	touchMove: function() {
		var This = this;
		this.wrapper.addEventListener(
			'touchmove',
			function(e) {

				if (!This.isUpright) return;
				This.nowPoint = {
					pageX: e.changedTouches[0].pageX,
					pageY: e.changedTouches[0].pageY
				};
				This.disX = This.nowPoint.pageX - This.startPoint.pageX;
				This.disY = This.nowPoint.pageY - This.startPoint.pageY;
				This.nowTranslateY = This.startTranslateY + This.disY;

				if (This.nowTranslateY > 0) {
					if (This.default.bounce) {
						This.step = 1 - This.nowTranslateY / This.wrapper.clientHeight; //顶部有回弹
						This.nowTranslateY = parseInt(This.step * This.nowTranslateY);
					} else {
						This.nowTranslateY = 0; //顶部无回弹
					}
				} else if (Math.abs(This.nowTranslateY) > Math.abs(This.maxY)) {

					if (This.default.bounce) {
						This.over = This.maxY - This.nowTranslateY; //底部有回弹
						This.step = 1 - This.over / This.wrapper.clientHeight;
						This.over = parseInt(This.step * This.over);
						This.nowTranslateY = This.maxY - This.over;
					} else {
						This.nowTranslateY = This.maxY; //底部无回弹
					}
				}
				if (This.isFirst) {
					This.isFirst = false;
					if (Math.abs(This.disY) < Math.abs(This.disX)) {
						This.isUpright = false;
						return;
					}
				}
				This.nowTime = new Date().getTime();
				This.disTance = This.nowPoint.pageY - This.lastPointY;
				This.timeDistance = This.nowTime - This.lastTime;
				This.lastTime = This.nowTime;
				This.lastPointY = This.nowPoint.pageY;

				if (This.isUpright) {
					cssTransform(This.scroller, 'translateY', This.nowTranslateY);
				}

				if (This.default.scrollBar) {
					This.scrollBar.style.opacity = 1;
					This.scale = This.wrapper.offsetHeight / This.scroller.offsetHeight;
					This.scrollBar.style.height = This.scale * This.wrapper.offsetHeight + 'px';
					This.scrollBarPosition();
				}

				if (This.default.scrollMove) {
					This.default.scrollMove();
				}
			}
		)
	},
	touchEnd: function() {
		var This = this;
		this.wrapper.addEventListener(
			'touchend',
			function(e) {
				This.speed = (This.disTance / This.timeDistance) * 600;
				This.speed = isNaN(This.speed) ? 0 : This.speed;
				This.nowTranslateY = cssTransform(This.scroller, 'translateY');
				This.target = This.nowTranslateY + This.speed;
				This.time = Math.abs(This.speed*0.8);
				This.type = "easeOut";
				if (This.target >= 0) {
					This.target = 0;
					if (This.default.scrollBounce) {
						This.type = "backOut";
					} else {
						This.type = "easeOut";
					}
				} else if (Math.abs(This.target) > Math.abs(This.maxY)) {
					This.target = This.maxY;
					if (This.default.scrollBounce) {
						This.type = "backOut";
					} else {
						This.type = "easeOut";
					}
				}
				This.end(This.target, This.type, This.time);
			}
		)
	},
	end: function(target, type, time) {
		var This = this;
		var t = 0;
		var b = cssTransform(This.scroller, 'translateY');
		var c = target - b;
		var d = Math.ceil(time / 80);
		clearInterval(this.timer);
		this.timer = setInterval(function() {
			t++;
			if (t > d) {
				clearInterval(This.timer);
				if (This.default.scrollEnd) {
					This.default.scrollEnd();
					if (This.default.scrollBar) {
						This.scrollBar.style.opacity = 0;
					}
				}
			} else {
				This.scroller.top = This.Tween[type](t, b, c, d);
				cssTransform(This.scroller, 'translateY', This.scroller.top);

				if (This.default.scrollBar) {
					This.scrollBarPosition();
				}

				if (This.default.scrollMove) {
					This.default.scrollMove();
				}
			}
		}, 30);
	},
	scrollBar: function() {
		this.scrollBar = document.createElement('div');
		this.scrollBar.setAttribute('class', "scrollBar");
		this.scrollBar.style.cssText = "position:absolute;top:0;right:6px;width:10px;z-index:1000;opacity:0;background:rgba(0,0,0,0.4);transition: .5s opacity;-webkit-transform-style: preserve-3d;transform-style: preserve-3d;";
		this.scale = this.wrapper.offsetHeight / this.scroller.offsetHeight;
		this.scrollBar.style.height = this.scale * this.wrapper.offsetHeight + 'px';
		document.body.appendChild(this.scrollBar);
	},
	scrollBarPosition: function() {
		this.scrollBar.top = -parseInt(cssTransform(this.scroller, 'translateY') * this.scale);
		cssTransform(this.scrollBar, 'translateY', this.scrollBar.top);
	},
	refresh: function() {
		this.maxY = this.wrapper.clientHeight - this.scroller.clientHeight;
		this.scale = this.wrapper.offsetHeight / this.scroller.offsetHeight;
	}
}

function extend(target, original) {
	for (var attr in original) {
		target[attr] = original[attr];
	}
}

function cssTransform(el, attr, val) {
	if (!el.transform) {
		el.transform = {};
	}
	if (arguments.length > 2) {
		el.transform[attr] = val;
		var sVal = "";
		for (var s in el.transform) {
			switch (s) {
				case "rotate":
				case "skewX":
				case "skewY":
					sVal += s + "(" + el.transform[s] + "deg) ";
					break;
				case "translateX":
				case "translateY":
				case "translateZ":
					sVal += s + "(" + el.transform[s] + "px) ";
					break;
				case "scaleX":
				case "scaleY":
				case "scale":
					sVal += s + "(" + el.transform[s] + ") ";
					break;
			}
			el.style.WebkitTransform = el.style.transform = sVal;
		}
	} else {
		val = el.transform[attr];
		if (typeof val == "undefined") {
			if (attr == "scale" || attr == "scaleX" || attr == "scaleY") {
				val = 1;
			} else {
				val = 0;
			}
		}
		return val;
	}
}