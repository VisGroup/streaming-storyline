"use strict";

function StreamingStoryline(container, config) {
    var that = this;

    that.time_shrink_ratio = 1;
    that.vertical_shrink_ratio = 1;
    that.timeslice_space_min = 100;
    that.realtime2screentime = {};
    that.latest_time = -that.timeslice_space_min - 1;
    that.svg_width = $(container).width();
    that.svg_height = config.svg_height;
    that.margin_top = 30;
    that.margin_bottom = 30;
    that.height_max = 0;
    //that.screen_time_range = [0, 0];
    that.has_stoped = false;
    that.straighten = null;

    that.view_start = 0;
    that.view_end = that.svg_width;

    that.translate_x = 0;
    var drag = d3.behavior.drag()
        .on("drag", function(d, i) {
            //d.x += d3.event.dx;
            that.translate_x += d3.event.dx;
            //d.y += d3.event.dy;
            that.svg.attr("transform", function(d, i) {
                return "translate(" + [that.translate_x, 0] + ")"
            })
        });

    that.svg = d3.select(container).append("svg:svg")
        .attr("id", "storyline")
        .attr("height", that.svg_height)
        .attr("width", that.svg_width)
        .attr("preserveAspectRatio", "none")
        .attr("viewBox", "0 " + (-that.margin_top) + " " + that.svg_width + " " + that.svg_height)
        .call(drag);

    that.storyline_data = {
        "entities": {}, // name -> list of {time, height, type<anchor, extend>}
        "sessions": [],
        "range": [Math.MAX_VALUE, Math.MIN_VALUE],
        "time_slices": {}, // time -> list of points belong to the same time point
        "straighten_shifts": {}
    };

    that.color = d3.scale.category20();
    that.storylines = that.svg.append("svg:g").selectAll("path.storyline");
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

StreamingStoryline.prototype._straighten_shift = function() {
    var that = this;
    var straighten_shifts = that.storyline_data.straighten_shifts;
    for (var time in straighten_shifts) {
        var shift = straighten_shifts[time];
        var time_slice = that.storyline_data.time_slices[time];
        for (var entity in time_slice) {
            time_slice[entity].height += shift;
        }
        //// clear straighten shifts
        //straighten_shifts[time] = 0;
    }

    console.log("shift");
};

StreamingStoryline.prototype._straighten_unshift = function() {
    var that = this;
    var straighten_shifts = that.storyline_data.straighten_shifts;
    for (var time in straighten_shifts) {
        var shift = straighten_shifts[time];
        var time_slice = that.storyline_data.time_slices[time];
        for (var entity in time_slice) {
            time_slice[entity].height -= shift;
        }
        // clear straighten shifts
        straighten_shifts[time] = 0;
    }

    console.log("unshift");
};

StreamingStoryline.prototype.straighten_by = function(d) {
    var that = this;

    if (that.straighten != null) {
        that._straighten_unshift();
    }

    if (that.straighten != d) {
        var straighten_shifts = that.storyline_data.straighten_shifts;

        // get average height of entity d
        var history_points = that.storyline_data.entities[d];
        var sum = 0;
        for (var i = 0; i < history_points.length; i++) {
            sum += history_points[i].height;
        }
        var average_height = sum / history_points.length;

        // get shifts of each time points
        for (var i = 0; i < history_points.length; i++) {
            var time = history_points[i].time;
            straighten_shifts[time] = average_height - history_points[i].height;
        }
        that._straighten_shift();
    }

    if (that.straighten == null) {
        that.straighten = d;
    } else {
        if (that.straighten != d) {
            that.straighten = d;
        } else {
            that.straighten = null;
        }
    }

    that._draw();

};

StreamingStoryline.prototype._get_entities = function(new_data) {
    var entities = d3.set();
    for (var i = 0; i < new_data.sessions.length; i++) {
        var s = new_data.sessions[i];
        for (var k in s) {
            entities.add(k);
        }
    }
    return entities._;
};

StreamingStoryline.prototype.update = function(new_data) {
    var that = this;
    if (that.has_stoped) {
        return;
    }
    // convert time to displayable format
    var time = new_data.time;

    // if the time already exists
    if (that.realtime2screentime[time]) {
        return;
    }

    // make sure displayed time slices have at least timeslice_space_min
    if (time - that.latest_time <= that.timeslice_space_min) {
        var screen_time = that.latest_time + that.timeslice_space_min;
        that.realtime2screentime[time] = screen_time;
        //console.log(that.latest_time, time, screen_time);
        time = screen_time;
    }
    that.latest_time = time;
    var time_slice = {};

    new_data.entities = this._get_entities(new_data);
    // var time_shrink_ratio = this.time_shrink_ratio;
    var _data = this.storyline_data;

    // if (DEBUG_MODE) {
    //     //time *= 200;
    // }

    // extend straighten shifts
    if (that.straighten == null) {
        _data.straighten_shifts[time] = 0;
    } else {
        var time_points = _.keys(_data.straighten_shifts);
        var latest_time_point = _.max(time_points);
        var latest_straighten_shift = _data.straighten_shifts[latest_time_point];
        _data.straighten_shifts[time] = latest_straighten_shift;
    }

    // update time range
    _data.range[0] = _.min([_data.range[0], time]);
    _data.range[1] = _.max([_data.range[1], time]);

    // create new entity lines that never ever exists
    for (var entity in new_data.entities) {
        // var entity = new_data.entities[i];
        //console.log(entity);
        if (!_.has(_data.entities, entity)) {
            _data.entities[entity] = [];
            // that.entity_set.add(entity);
        }
    }

    //if (DEBUG_MODE) {
    //    var lengths = [];
    //    for (var entity in _data.entities) {
    //        lengths.push(_data.entities[entity].length);
    //    }
    //    console.log("before", lengths.join(" "));
    //}

    //// extend old entity lines not mentioned in new time slice
    //for (var entity in _data.entities) {
    //    var history_points = _data.entities[entity];
    //    if (!_.has(new_data.entities, entity)) {
    //        var prev_point = history_points[history_points.length - 1];
    //        var nn = {
    //            "time": time,
    //            "height": prev_point.height
    //        };
    //        time_slice[entity] = nn;
    //        history_points.push(nn);
    //    }
    //}

    //if (DEBUG_MODE) {
    //    var lengths = [];
    //    for (var entity in _data.entities) {
    //        lengths.push(_data.entities[entity].length);
    //    }
    //    console.log("middle", lengths.join(" "));
    //    console.log(_.keys(_data.entities));
    //    console.log(new_data.entities);
    //}

    var stats = {};
    if (DEBUG_MODE) {
        for (var entity in new_data.entities) {
            stats[entity] = 0;
        }
    }

    // incorporate new data into old data series
    //console.log(new_data);
    //var height_max = 0;
    for (var i = 0; i < new_data.sessions.length; i++) {
        var session = new_data.sessions[i];
        _.each(session, function(v, k) {
            that.height_max = Math.max(that.height_max, v);
            // v = v * time_shrink_ratio;
            if (DEBUG_MODE) {
                if (stats[k]) {
                    return;
                }
            }
            var history_points = _data.entities[k];
            if (history_points.length == 0) {
                if (DEBUG_MODE && Random_Layout) {
                    v = Math.random() * that.svg_height;
                }
                // the entity is newly added
                var nn = {
                    "time": time,
                    "height": v
                };
                history_points.push(nn);
                time_slice[k] = nn;
            } else {
                var prev_point = history_points.pop();
                if (DEBUG_MODE && Random_Layout) {
                    if (Math.random() < 0.65) {
                        v = prev_point.height;
                    } else {
                        v = Math.random() * that.svg_height;
                    }
                }
                history_points.push(prev_point);
                var nn = {
                    "time": time,
                    "height": v
                };
                time_slice[k] = nn;
                history_points.push(nn);
            }
            stats[k]++;
        });
    }
    that.vertical_shrink_ratio = (that.svg_height - that.margin_bottom) / that.height_max;
    //console.log(that.vertical_shrink_ratio);

    //if (DEBUG_MODE) {
    //    console.log(stats);
    //}
    //if (DEBUG_MODE) {
    //    var lengths = [];
    //    for (var entity in _data.entities) {
    //        lengths.push(_data.entities[entity].length);
    //    }
    //    console.log("after", lengths.join(" "));
    //}
    that.storyline_data.time_slices[time] = time_slice;
    this._draw();
    if (!mousein_status) {
        update_minimap_view();
    }
};

StreamingStoryline.prototype._map2screen = function(p) {
    var that = this;
    // TODO: apply fish-eye and rescale
    return {
        "time": p.time,
        "height": p.height
    };
};

StreamingStoryline.prototype._draw_entity = function(history_points) {
    var sr = this.time_shrink_ratio;
    //var vtr = this.view_time_range; // [start, end]
    var point_count = history_points.length;
    if (point_count <= 0) {
        return "";
    }
    var start = this._map2screen(history_points[0]);
    var d = "M" + start.time + "," + start.height;
    var control_point_shift = 40;
    if (point_count == 1) {
        return d + "L" + (start.time + control_point_shift) + "," + start.height;
    }
    //d = "M" + (prev.time) + "," + (prev.height);
    var line_break = false;
    for (var i = 1; i < point_count; i++) {
        var prev = history_points[i - 1];
        var p = history_points[i];
        if (p.time - prev.time > 100) {
            line_break = true;
            continue;
        }
        var ap =
            //"M" + (prev.time) + "," + (prev.height) +
            (line_break ? "M" : "C") + (prev.time + control_point_shift) + "," + (prev.height) + "," +
            (p.time - control_point_shift) + "," + (p.height) + "," +
            (p.time) + "," + (p.height);
        d += ap;
        if (line_break) line_break = false;
    }
    // console.log(d);
    return d;
};

StreamingStoryline.prototype._draw = function() {
    var that = this;
    var entities_list = [];
    _.each(that.storyline_data.entities, function(v, k) {
        entities_list.push(k);
    });
    // var path_values = {};
    that.storylines = that.storylines.data(entities_list);
    that.storylines.enter().append("path")
        .attr("id", function(entity_name) {
            return entity_name;
        })
        .attr("class", "storyline");
    // .classed("storyline")
    ;
    that.storylines.exit().remove();

    that.storylines
        .attr("id", function(entity_name) {
            return "entity-" + entity_name;
        })
        .transition()
        .duration(500)
        .attr("d", function(entity_name) {
            var hps = that.storyline_data.entities[entity_name];
            return that._draw_entity.call(that, hps);
        })
        .style("stroke", function(entity_name) {
            return that.color(entity_name);
        });
    that.storylines
        // .each(function (entity_name) {
        //     d3.select("#entity-" + entity_name).call(cc);
        // })
        .on("mouseover", function(d) {
            // console.log("mouseover");
            var e = d3.select("#entity-" + d);
            // e.style("filter", "url(#filter1)");
            e.style("stroke-width", "5px");
        })
        .on("mouseout", function(d) {
            // console.log("mouseout");
            var e = d3.select("#entity-" + d);
            // e.style("filter", "");
            e.style("stroke-width", "3.5px");
        })
        .on("click", function(d) {
            console.log(d, "click");
            that.straighten_by.call(that, d);
            Materialize.toast("Entity " + getEntityName(d) + " selected", 1000);
        });

    this.drawEntitiesLabels();
    drawMinimap();

};

// for Debug use
StreamingStoryline.prototype.stop_loading = function() {
    var that = this;
    that.has_stoped = true;
}

StreamingStoryline.prototype.drawEntitiesLabels = function() {
    var that = this;
    // console.log("that.view_start", that.view_start);
    var t = that.view_start;
    var time = Math.floor(t / 100) * 100;
    var s = (t - time) / 100;
    var slices = storyline.storyline_data.time_slices;
    var slice0 = slices[time];
    var slice1 = slices[time + 100];
    if (slice1 == undefined) slice1 = slice0;
    var heights = {};
    for (var i in slice0) {
        if (heights[i] == undefined) heights[i] = {};
        heights[i].t1 = slice0[i].height;
    }
    for (var i in slice1) {
        if (heights[i] == undefined) heights[i] = {};
        heights[i].t2 = slice1[i].height;
    }
    var view = $('#storyline')[0].viewBox.baseVal;
    for (var i = 0; i < 20; i++) {
        $('#chip' + i).css('display', 'none');
    }
    for (var i in heights) {
        var t1 = heights[i].t1;
        var t2 = heights[i].t2;
        if (t1 == undefined) t1 = t2;
        if (t2 == undefined) t2 = t1;
        var tmp = t1 + (t2 - t1) * s;
        tmp = (tmp - view.y) / view.height * that.svg_height;
        heights[i] = tmp;
        $('#chip' + i).css('top', heights[i] - 16 + 'px');
        $('#chip' + i).css('display', 'block');
        $('#chip' + i).css('color', that.color(i));
        $('#chip' + i).text(getEntityName(i));
    }
    console.log(heights);
}

StreamingStoryline.prototype.scrollTo = function(start, end, speed, select_status) {
    var that = this;
    var data_time_range = that.storyline_data.range;
    var data_time_length = data_time_range[1] - data_time_range[0];
    if (data_time_length <= that.svg_width) {
        return;
    }
    that.view_start = data_time_length * start + data_time_range[0];
    that.view_end = data_time_length * end + data_time_range[0];
    // console.log(view_start, view_end, start, end, data_time_length, data_time_range);
    // speed = Math.sqrt(Math.abs(speed / 3));
    // speed -= 1;
    // speed = Math.max(0, speed);
    speed = Math.abs(speed);
    if (speed < 10) {
        speed = Math.pow(speed / 10, 2);
    } else {
        speed = Math.pow(speed / 10, 0.5);
    }

    var h1, h2;
    h1 = -that.svg_height * speed / 2;
    h2 = that.svg_height * (1 + speed);
    that.svg.transition()
        // <<<<<<< HEAD
        .duration(select_status ? 80 : 1000)
        .attr("viewBox", that.view_start + " " + h1 + " " + (that.view_end - that.view_start) + " " + h2);
    // =======
    // .duration(select_status ? 10 : 1000)
    // .attr("viewBox", view_start + " " + (-that.margin_top) + " " + (view_end - view_start) + " " + that.svg_height);
    // >>>>>>> master

    //console.log(view_end - view_start);
    that.drawEntitiesLabels();
};

StreamingStoryline.prototype.restoreNormalHeight = function() {
    var that = this;
    var view = $('#storyline')[0].viewBox.baseVal;
    that.svg.transition()
        .duration(300)
        .ease('linear')
        .attr("viewBox", view.x + " " + 0 + " " + view.width + " " + that.svg_height);
    setTimeout(that.drawEntitiesLabels, 300);
}

// 返回当前可视部分对应的minimap的中心、宽度的像素数
StreamingStoryline.prototype.getMinimapCenterWidth = function() {
    var that = this;
    var view = $('#storyline')[0].viewBox.baseVal;
    var view_start = view.x;
    var view_end = view.width + view_start;
    var data_time_range = that.storyline_data.range;
    var data_time_length = data_time_range[1] - data_time_range[0];
    var start = (view_start - data_time_range[0]) / data_time_length;
    var end = (view_end - data_time_range[0]) / data_time_length;
    return [(end + start) / 2, end - start];
}
