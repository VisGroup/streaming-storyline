var sample_data_generator = function (entity_set, height, time) {
	var session_count = _.random(2, 5);
	var entity_list = [];
	entity_set.forEach(function (e) {
		entity_list.push(e);
	});
	var entity_count = entity_list.length;
	var session_size_lower_bound = Math.ceil(entity_count * 0.4);
	var session_size_upper_bound = Math.floor(entity_count * 1.7);
	var covered = 0;
	var border = height * 0.06;
	var sessions = [];
	for (var i = 0; i < session_count - 1; i ++) {
		var estimated_size = Math.max(0, _.random(session_size_lower_bound, session_size_upper_bound));
		estimated_size = Math.min(entity_count - covered, estimated_size);
		var session = {};
		for (var j = 0; j < estimated_size; j ++) {
			session[entity_list[j + covered]] = _.random(border, height - border);
		}
		covered += estimated_size;
		sessions.push(session);
	}
	return {
		"time": time,
		"entities": entity_list,
		"sessions": sessions
	};
};

var storyline = new StreamingStoryline("#streaming-storyline", {
	"height": 400,
	"width": 1200
});

var iter_count = 3;
var test_main = function () {
	var entity_set = new d3.set("asdfger");
	var curr_time = 0;
	var delay = _.random(100, 200);

	var iteration = function () {
		var sessions = sample_data_generator(entity_set, 400, curr_time);
		// console.log(sessions);
		storyline.update(sessions);
		iter_count --;
		if (iter_count < 0) return;
		console.log("iter\t" + curr_time);

		curr_time += delay;
		delay = _.random(100, 200);
		setTimeout(iteration, delay);
	};
	setTimeout(iteration, delay);
};

test_main();