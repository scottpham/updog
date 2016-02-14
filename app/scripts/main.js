// jshint devel:true
'use strict';

var Dogs = Backbone.Model.extend({
	defaults: function() {
		return {
			incrementer: 1,
			clickIncrementer: 1,
			count: 0
		}
	},
	increment: function() {
		var newCount = this.get('count') + this.get('incrementer');

		this.set({
			'count': newCount
		});
	},
	clickIncrement: function() {
		var newCount = this.get('count') + this.get('clickIncrementer');

		this.set({
			'count': newCount
		});
	}
});

var MainView = Backbone.View.extend({
	el: $('#backboneEl'),
	template: _.template($('#template').html()),
	initialize: function() {
		this.listenTo(this.model, 'change', this.render);
		this.render();
	},
	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	}
});

var dogs = new Dogs();
var main = new MainView({
	model: dogs
});
