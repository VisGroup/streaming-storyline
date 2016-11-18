"use strict";

function StreamingStoryline(container, config) {
	var that = this;
	that.svg = d3.select(container).append("svg:svg")
		.attr("height", config.height);
	that.storyline_data = {
		"entities": {}, // name -> list of {time, height, type<anchor, extend>}
		"sessions": [],
		"range": [0, 0]
	};
	that.color = function (n) {
		return d3.schemeCategory20c[hashcode(n) % 20];
	};
	that.storylines = that.svg.selectAll("path.storyline");
	that.time_shrink_ratio = 1;
	that.view_time_range = [0, 400];
	// that.entity_id_set = new d3.set();
}

/*
{
	"time": <int>,
	"entities": list of names
	"sessions": [
		<proto> -> {
			<name>: <height>
		}
	]
}
*/
StreamingStoryline.prototype.update = function (new_data) {
	var time_shrink_ratio = this.time_shrink_ratio;
	var _data = this.storyline_data;
	var time = new_data.time;
	_data.range[1] = _.max(_data.range[1], time);
	for (var i = 0; i < new_data.entities.length; i ++) {
		var entity = new_data.entities[i];
		if (!_.has(_data.entities, entity)) {
			_data.entities[entity] = [];
		}
	}

	for (var i = 0; i < new_data.sessions.length; i ++) {
		var session = new_data.sessions[i];
		_.each(session, function (v, k){
			// v = v * time_shrink_ratio;
			var history_points = _data.entities[k];
			if (history_points.length == 0) {
				// the entity is newly added
				history_points.push({
					"time": time,
					"height": v,
					"type": "anchor"
				});
			} else {
				var prev_point = history_points.pop();
				if (prev_point.height == v) {
					if (prev_point.type == "anchor") {
						history_points.push(prev_point);
					}
					history_points.push({
						"time": time,
						"height": v,
						"type": "extend"
					});
				} else if (prev_point.height != v) {
					history_points.push({
						"time": time,
						"height": v,
						"type": "anchor"
					});
				}
			}
		});
	}
	this._draw();
};

StreamingStoryline.prototype._map2screen = function (p) {
	return {
		"time": p.time,
		"height": p.height
	};
};

StreamingStoryline.prototype._draw_entity = function (history_points) {
	var sr = this.time_shrink_ratio;
	var vtr = this.view_time_range; // [start, end]
	var point_count = history_points.length;
	if (point_count <= 0) return "";
	var start = this._map2screen(history_points[0]);
	var d = "M" + start.time + "," + start.height;
	var control_point_shift = 30;
	if (point_count == 1) {
		return d + "L" + (start.time - control_point_shift) + "," + start.height;
	}
	for (var i = 1; i < point_count; i ++) {
		var prev = history_points[0];
		var p = history_points[i];
		var ap = "C" + (prev.time - control_point_shift) + " " + (prev.height) + " "
			+ (p.time + control_point_shift) + " " + (p.height) + " "
			+ (p.time) + " " + (p.height);
		d += ap;
	}
	console.log(d);
	return d;
}

StreamingStoryline.prototype._draw = function () {
	var that = this;
	that.storylines = that.storylines.data(that.storyline_data.entities);
	that.storylines.enter().append("path.storyline")
		.attr("d", function (hps) {
			return that._draw_entity.call(that, hps);
		});
	that.storylines.exit().remove();
};

StreamingStoryline.prototype.resize = function (new_ratio) {
	// TODO
};