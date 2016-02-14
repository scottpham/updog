// jshint devel:true
'use strict';


var app = app || {};


var Dogs = Backbone.Model.extend({
	defaults: function() {
		return {
			incrementer: 1,
			clickIncrementer: 1,
			count: 0
		}
	},
	timeIncrement: function() {
		var newCount = this.get('count') + this.get('incrementer');

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
	},
	initialize: function() {
		//re-render on change
		this.listenTo(this.model, 'change', this.render);

		this.render();
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
