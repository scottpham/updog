// jshint devel:true
'use strict';


var app = app || {};

//jquery extension for animate.css
$.fn.extend({
	animateCss: function(animationName) {
		var animationEnd =
			'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
		$(this).addClass('animated ' + animationName).one(animationEnd, function() {
			$(this).removeClass('animated ' + animationName);
		});
	}
});


var Dogs = Backbone.Model.extend({
	defaults: function() {
		return {
			timeIncrementer: 1,
			clickDoges: 0,
			clickIncrementer: 1,
			count: 0,
			clickerCost: 10,
			generatorCost: 50,
			dps: 0,
			generators: 0,
		}
	},
	buyGenerator: function() {
		var dogs = this.get('count');
		var cost = this.get('generatorCost');
		//dump out if cost is too much
		if (dogs < cost) {
			alert('Not enough Doges');
			return;
		} else {
			//take the doges
			this.set('count', dogs - cost);

			//increment click doge count
			var newCount = this.get('generators') + 1;

			//set new click doge value
			this.set({
				"generators": newCount
			});

			//fire off new incrementer
			this.setGenerator();

			//reset the cost of click doges
			this.increaseCost('generatorCost');
		}
	},
	stopAutoClick: function() {
		try {
			window.clearInterval(this.autoClicker);
		} catch (e) {
			console.log(e);
		}
	},
	calculateDPS: function(miliseconds) {
		var dps = this.get('dps');
		var incrementer = this.get('timeIncrementer');

		var newDps = 1 / (miliseconds / 1000);

		this.set('dps', newDps + incrementer);

	},
	formatter: function(num) {
		//this just rounds down
		return Math.floor(num);
	},
	increaseCost: function(buyable) {
		var cost = this.get(buyable);
		var clickers = this.get('clickDoges');

		var newCost = cost * (1.3);

		this.set(buyable, this.formatter(newCost));
	},
	setGenerator() {
		var generators = this.get('generators');
		//base interval is 1 second per generator
		var interval = 1000 / generators;

		// clear out old interval

		try {
			window.clearInterval(this.autoGenerator);
		} catch (e) {
			console.log(e);
		}


		//set interval to run local function timeIncrement
		this.autoGenerator = window.setInterval(this.timeIncrement.bind(this),
			interval);

		this.calculateDPS(interval);
	},
	setClickDoge: function() {

		var clickers = this.get('clickDoges');
		var interval = 10000 / clickers;
		// clear out old interval
		this.stopAutoClick();
		//set interval to 10 seconds
		this.autoClicker = window.setInterval(this.clickIncrement.bind(this),
			interval);

		console.log("doges are clicking every " + interval + " miliseconds");
		this.calculateDPS(interval);
	},
	buyClickDoge: function() {
		console.log("buy click doge ran");

		var dogs = this.get('count');
		var cost = this.get('clickerCost');
		//dump out if cost is too much
		if (dogs < cost) {
			alert('Not enough Doges');
			return;
		} else {
			//take the doges
			this.set('count', dogs - cost);

			//increment click doge count
			var newCount = this.get('clickDoges') + 1;

			//set new click doge value
			this.set({
				"clickDoges": newCount
			});

			//fire off new incrementer
			this.setClickDoge();

			//reset the cost of click doges
			this.increaseCost('clickDoges');
		}
	},
	timeIncrement: function() {
		console.log('time increment fired');
		var newCount = this.get('count') + this.get('timeIncrementer');

		this.set({
			'count': newCount
		});

	},
	clickIncrement: function() {
		console.log('clickIncrement fired');
		var newCount = this.get('count') + this.get('clickIncrementer');

		this.set({
			'count': newCount
		});

	}
});

var Dps = Backbone.View.extend({
	template: _.template($('#dpsTemplate').html()),
	initialize: function() {
		this.render();
		this.listenTo(this.model, 'change', this.render);
	},
	render: function() {
		//render
		this.$el.html(this.template(this.model.toJSON()));

		this.delegateEvents();
	}

});

var Clicker = Backbone.View.extend({
	// template: _.template($('#buttonTemplate').html()),
	initialize: function() {
		this.render();
		//re render on model change (not sure if I need this)
		// this.listenTo(this.model, 'change', this.render);
	},
	events: {
		'click': 'handleClick'
	},
	handleClick: function() {
		this.model.clickIncrement();
	},
	render: function() {
		this.$el.empty();
		//because events get effed on re-render
		this.delegateEvents();

		return this;
	}
});

var CounterView = Backbone.View.extend({
	template: _.template($('#counterTemplate').html()),
	render: function() {
		//because there is no template
		this.$el.html(this.template(this.model.toJSON()));
		//because events get effed on re-render
		this.delegateEvents();

		return this;
	},
	initialize: function() {
		//re-render on change
		this.listenTo(this.model, 'change', this.render);

		this.render();
	}
});

var BuyClickView = Backbone.View.extend({
	template: _.template($('#buyClickDogeTemplate').html()),
	initialize: function() {
		this.render();

		this.listenTo(this.model, 'change', this.render);
	},
	events: {
		"click": "handleClick"
	},
	handleClick: function() {
		this.model.buyClickDoge();
	},
	render: function() {
		this.$el.html(this.template(this.model.toJSON()));

		//re add events on re-render
		this.delegateEvents()
		return this;
	}
});

var ShowClickDoges = Backbone.View.extend({
	template: _.template($('#clickDogeCounterTemplate').html()),
	initialize: function() {
		//re-render on change to model
		this.listenTo(this.model, 'change', this.render);

		this.render();
	},
	render: function() {
		//render template
		this.$el.html(this.template(this.model.toJSON()));

		//re attach events if there are any
		this.delegateEvents();

		return this;

	}
});

var GeneratorView = Backbone.View.extend({
	template: _.template($('#generatorTemplate').html()),
	initialize: function() {
		// re-render on change to model
		this.listenTo(this.model, 'change', this.render);

		this.render();
	},
	events: {
		"click": "handleClick"
	},
	handleClick: function() {
		this.model.buyGenerator();
	},
	render: function() {
		// render template
		this.$el.html(this.template(this.model.toJSON()));

		//re attach events if there are any
		this.delegateEvents();

		return this;
	}
});

var GeneratorCounter = Backbone.View.extend({
	template: _.template($('#generatorCounterTemplate').html()),
	initialize: function() {
		//re-render on change to model
		this.listenTo(this.model, 'change', this.render);

		this.render();
	},
	render: function() {
		//render template
		this.$el.html(this.template(this.model.toJSON()))

		//re attach events
		this.delegateEvents();

		return this;
	}
});

var DogePic = Backbone.View.extend({
	template: {},
	render: function() {

		this.delegateEvents();

	},
	initialize: function() {
		this.render();

		this.listenTo(this.model, 'change:clickDoges', this.newClickDoge);
		this.listenTo(this.model, 'change:count', this.newDoge);

	},
	newDoge: function() {
		// this.$el.animateCss('pulse');
	},
	newClickDoge: function() {
		this.$el.animateCss('bounce');
	}
});



var MainView = Backbone.View.extend({
	el: $('#backboneEl'),
	template: _.template($('#template').html()),
	initialize: function() {
		this.render();
		//clicker is a sub view of of main view
		this.clicker = new Clicker({
			el: $('#clicker'),
			model: this.model
		});

		//counter is a sub view
		this.counter = new CounterView({
			el: $('#counter'),
			model: this.model
		});

		this.buyClick = new BuyClickView({
			el: $('#buyClickDoge'),
			model: this.model
		});

		this.showClickDoges = new ShowClickDoges({
			el: $('#clickerCounter'),
			model: this.model
		});

		this.dps = new Dps({
			el: $('#dps'),
			model: this.model
		});

		this.dogePic = new DogePic({
			el: $('#dogepic'),
			model: this.model
		});

		this.generatorView = new GeneratorView({
			el: $('#dogeGenerator'),
			model: this.model
		});

		this.showGenerators = new GeneratorCounter({
			el: $('#generatorCounter'),
			model: this.model
		})
	},
	render: function() {
		//render template
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	}
});


var dogs = new Dogs();

var main = new MainView({
	model: dogs
});
