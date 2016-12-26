"use strict";

function StreamingStoryline(container, config) {
    var that = this;

    that.time_shrink_ratio = 1;
    that.vertical_shrink_ratio = 1;
    that.timeslice_space_min = 20;
    that.control_point_shift = that.timeslice_space_min * 0.4;
    that.realtime2screentime = {};
    that.latest_time = -that.timeslice_space_min - 1;
    that.svg_width = $(container).width();
    that.svg_height = config.svg_height;
    that.margin_top = 30;
    that.margin_bottom = 30;
    that.height_min = that.svg_height;
    that.height_max = - that.margin_top;
    //that.screen_time_range = [0, 0];
    that.has_stoped = false;
    that.straighten = null;
    that.fisheye_distortion_factor = 3;
    that.last_update_time = Date.now();
    that.fps_max = 10;
    that.frame_min_space = 1000 / that.fps_max;

    that.view_start = 0;
    that.view_end = that.svg_width;

    that.translate_x = 0;
    var drag = d3.behavior.drag()
        .on("drag", function(d, i) {
            //d.x += d3.event.dx;
            that.translate_x += d3.event.dx;
            //d.y += d3.event.dy;
            that.svg
                .transition()
                .duration(300)
                .attr("viewBox", function(d, i) {
                // return "translate(" + [that.translate_x, 0] + ")"
                    return that._get_viewBox.call(that);
            })
        });

    that.entity_names_container = d3.select(container).append("div")
        .attr("id", "chips");
    that.svg = d3.select(container).append("svg:svg")
        .attr("id", "storyline")
        .attr("height", that.svg_height)
        .attr("width", that.svg_width)
        .attr("preserveAspectRatio", "none")
        .attr("viewBox", that._get_viewBox())
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

StreamingStoryline.prototype._get_viewBox_height = function () {
    var that = this;
    return Math.max(that.svg_height, that.height_max - that.height_min + that.margin_bottom + that.margin_top);
};

StreamingStoryline.prototype._get_viewBox = function () {
    var that = this;
    var viewBox_height = that._get_viewBox_height();
    //console.log( - that.margin_top + that.height_min, viewBox_height, that.height_min, that.height_max);
    return that.view_start + " " + (- that.margin_top + that.height_min) + " " + (that.view_end - that.view_start) + " " + (viewBox_height);
};

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
    that.height_min = that.svg_height;
    that.height_max = - that.margin_top;
    var straighten_shifts = that.storyline_data.straighten_shifts;
    for (var time in straighten_shifts) {
        var shift = straighten_shifts[time];
        var time_slice = that.storyline_data.time_slices[time];
        for (var entity in time_slice) {
            time_slice[entity].height += shift;
            var h = time_slice[entity].height;
            that.height_max = Math.max(that.height_max, h);
            that.height_min = Math.min(that.height_min, h);
        }
        //// clear straighten shifts
        //straighten_shifts[time] = 0;
    }

    console.log("shift");
};

StreamingStoryline.prototype._straighten_unshift = function() {
    var that = this;
    that.height_min = that.svg_height;
    that.height_max = - that.margin_top;
    var straighten_shifts = that.storyline_data.straighten_shifts;
    for (var time in straighten_shifts) {
        var shift = straighten_shifts[time];
        var time_slice = that.storyline_data.time_slices[time];
        for (var entity in time_slice) {
            time_slice[entity].height -= shift;
            var h = time_slice[entity].height;
            that.height_max = Math.max(that.height_max, h);
            that.height_min = Math.min(that.height_min, h);
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
        d3.select("#entity-" + d).classed("selected", true);
    } else {
        d3.select("#entity-" + that.straighten).classed("selected", false);
        if (that.straighten != d) {
            d3.select("#entity-" + d).classed("selected", true);
            that.straighten = d;
        } else {
            that.straighten = null;
        }
    }

    that._draw(true);

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
        time = screen_time;
    }
    that.latest_time = time;
    var time_slice = {};

    new_data.entities = this._get_entities(new_data);
    var _data = this.storyline_data;

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
        if (!_.has(_data.entities, entity)) {
            _data.entities[entity] = [];
        }
    }

    // incorporate new data into old data series
    for (var i = 0; i < new_data.sessions.length; i++) {
        var session = new_data.sessions[i];
        _.each(session, function(v, k) {
            that.height_max = Math.max(that.height_max, v);
            that.height_min = Math.min(that.height_min, v);

            var history_points = _data.entities[k];
            if (history_points.length == 0) {
                // the entity is newly added
                var nn = {
                    "time": time,
                    "height": v
                };
                var nnn = {
                    "time": time,
                    "height": v
                };
                history_points.push(nn);
                history_points.push(nnn);
                time_slice[k] = nn;
                //time_slice[k + that.timeslice_space_min] = nnn;
            } else {
                var point = history_points.pop();
                if (history_points.length == 1) {
                    var first_point = history_points[0];
                    first_point.height = v;
                }
                point.time = time;
                point.height = v;
                history_points.push(point);
                var nnn = {
                    "time": time,
                    "height": v
                };
                history_points.push(nnn);
                time_slice[k] = point;
                //var prev_point = history_points.pop();
                //history_points.push(prev_point);
                //var nn = {
                //    "time": time,
                //    "height": v
                //};
                //time_slice[k] = nn;
                //history_points.push(nn);
            }
        });
    }
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

//StreamingStoryline.prototype._fisheye_distortion = function () {
//
//};

var fisheye_distortion = function (center, p, r, alpha) {
    var d = Math.abs(p - center) / r * alpha;
    var norm = Math.exp(alpha) - 1;
    var indicator = center > p ? -1 : 1;
    //return center + r * d * (1 + 0.5 * d * (1 + d * 0.33));
    //return center + r * d * (1 + 0.5 * d);
    return center + r * (Math.exp(d) - 1) * indicator / norm;
};

StreamingStoryline.prototype._draw_entity = function(history_points) {
    var sr = this.time_shrink_ratio;
    //var vtr = this.view_time_range; // [start, end]
    var point_count = history_points.length;
    if (point_count <= 0) {
        return "";
    }

    var that = this;
    // find the first
    var i = 0;
    //for (; i < point_count; i ++) {
    //    if (history_points[i].time >= that.view_start) break;
    //}
    var focus_center = (that.view_start + that.view_end) / 2;
    var focus_radius = (that.view_end - that.view_start) / 2 * 10;
    var focus_start = focus_center - focus_radius;
    var focus_end = focus_center + focus_radius;
    var start = history_points[i];
    var d = "M" + start.time + "," + start.height;
    var control_point_shift = that.control_point_shift;

    // skip virtual point
    point_count --;

    if (point_count == 1) {
        return d + "L" + (start.time + control_point_shift) + "," + start.height;
    }
    //d = "M" + (prev.time) + "," + (prev.height);
    var line_break = false;
    var pt = history_points[i].time;
    var ph = history_points[i].height;
    for (i ++ ; i < point_count; i++) {
        //if (history_points[i].time > that.view_end + 100) break;
        var p = history_points[i];
        if (p.time - pt > that.timeslice_space_min) {
            line_break = true;
            continue;
        }
        var ct = p.time;
        var current_shift = control_point_shift;

        if (FISHEYE && that.fisheye_distortion_factor != 1 && pt >= focus_start && ct < focus_end) {
            pt = fisheye_distortion(focus_center, pt, focus_radius, that.fisheye_distortion_factor);
            ct = fisheye_distortion(focus_center, ct, focus_radius, that.fisheye_distortion_factor);
            current_shift = fisheye_distortion(0, control_point_shift, focus_radius, that.fisheye_distortion_factor);
        }

        var ap =
            //"M" + (prev.time) + "," + (prev.height) +
            (line_break ? "M" : "C" + (pt + current_shift) + "," + (ph) + "," +
            (ct - current_shift) + "," + (p.height) + ",") +
            (ct) + "," + (p.height);
        d += ap;
        if (line_break) line_break = false;
        pt = ct;
        ph = p.height;
    }
    // console.log(d);
    return d;
};

StreamingStoryline.prototype._draw = function(animation) {
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
    that.storylines.exit().remove();

    if (animation) {
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
    } else {
        that.storylines
            .attr("id", function(entity_name) {
                return "entity-" + entity_name;
            })
            .attr("d", function(entity_name) {
                var hps = that.storyline_data.entities[entity_name];
                return that._draw_entity.call(that, hps);
            })
            .style("stroke", function(entity_name) {
                return that.color(entity_name);
            });
    }
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
    that.svg
        .transition()
        .duration(300)
        .ease('linear')
        .attr("viewBox", that._get_viewBox());
    //drawMinimap();
    setTimeout(function () {
        that.drawEntitiesLabels.call(that);
        drawMinimap();
    }, 300);
};

// for Debug use
StreamingStoryline.prototype.stop_loading = function() {
    var that = this;
    that.has_stoped = true;
};

StreamingStoryline.prototype.drawEntitiesLabels = function() {
    var that = this;
    // console.log("that.view_start", that.view_start);
    var t = that.view_start;
    var time = Math.floor(t / that.timeslice_space_min ) * that.timeslice_space_min ;
    var s = (t - time) / that.timeslice_space_min ;
    var slices = storyline.storyline_data.time_slices;
    var slice0 = slices[time];
    var slice1 = slices[time + that.timeslice_space_min ];
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
    //for (var i = 0; i < 20; i++) {
    //    $('#chip' + i).css('display', 'none');
    //}
    var height_list = [];
    for (var i in heights) {
        var t1 = heights[i].t1;
        var t2 = heights[i].t2;
        if (t1 == undefined) t1 = t2;
        if (t2 == undefined) t2 = t1;
        var tmp = t1 + (t2 - t1) * s;
        tmp = (tmp - view.y) / view.height * that.svg_height;
        heights[i] = tmp;
        height_list.push([i, heights[i]]);
        //$('#chip' + i).css('top', heights[i] - 16 + 'px');
        //$('#chip' + i).css('display', 'block');
        //$('#chip' + i).css('color', that.color(i));
        //$('#chip' + i).text(getEntityName(i));
    }
    //if (_.size(heights) == 0) return;

    //console.log(heights);
    var entity_names = that.entity_names_container.selectAll("div.chip");
    entity_names = entity_names.data(height_list);
    entity_names
        .enter()
        .append("div")
        .attr("class", "chip");
    entity_names.exit().remove();

    //var height_min = that.height_min;
    //var margin_top = that.margin_top;
    //var valid_height = that.svg_height - that.margin_top - that.margin_bottom;
    entity_names
        //.transition()
        //.duration(100)
        .style("top", function (d) {
            return d[1] - 16 + "px";
            //var screen_height = (d[1] - height_min) / valid_height * (that.height_max - that.height_min) + margin_top;
            //return screen_height + "px";
        })
        .style("display", "block")
        .style("color", function (d) {
            return that.color(d[0]);
        })
        //.style(function (d) {
        //    return {
        //        "top": d[1] - 16 + "px",
        //        "display": "block",
        //        "color": that.color(d[0])
        //    }
        //})
        .text(function (d) {
            return getEntityName(d[0]);
        });
};

StreamingStoryline.prototype.scrollTo = function(start, end, speed, select_status) {
    var that = this;
    var current_time = Date.now();
    if (current_time - that.last_update_time < that.frame_min_space) {
        return;
    }
    that.last_update_time = current_time;
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

    that.fisheye_distortion_factor = Math.exp(speed);

    // var h1, h2;
    // h1 = -that.svg_height * speed / 2;
    // h2 = that.svg_height * (1 + speed);
    that.svg.transition()
        .duration(select_status ? 80 : 1000)
        .attr("viewBox", that._get_viewBox());
    that._draw(!select_status);

    //console.log(view_end - view_start);
    //that.drawEntitiesLabels();
    setTimeout(function () {
        that.drawEntitiesLabels.call(that);
    }, 100);
};

StreamingStoryline.prototype.restoreNormalHeight = function() {
    var that = this;
    var view = $('#storyline')[0].viewBox.baseVal;
    that.svg.transition()
        .duration(300)
        .ease('linear')
        .attr("viewBox", that._get_viewBox());
    setTimeout(function () {
        that.drawEntitiesLabels.call(that);
    }, 300);
};

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
};
