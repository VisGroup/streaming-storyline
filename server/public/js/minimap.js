var load_started = false;
var select_status = false;
var mousein_status = false;
var update_data = false;
var first_click;

var width_graybox = 150;
var width_orangebox = 150;

var masks = $('.mm_mask');
// masks.click(mm_click_event);
masks.mousemove(mm_move_event);
masks.mouseleave(mm_leave_event);
masks.mousedown(mm_down_event);
masks.mouseup(mm_up_event);
masks[0].onmousewheel = mm_scroll_event;
var minimap_width = masks.width();
var minimap_height = masks.height();

var cursor_pos_list = [];
var cursor_pos = null;
var minimap_select_center;
var minimap_select_width;

var mouse_timer = setInterval(function() {
    if (!load_started) return;
    if (cursor_pos != null) {
        cursor_pos_list.push(cursor_pos);
    }
    if (cursor_pos_list.length > 7) {
        cursor_pos_list.splice(0, 1);
    }
    if (update_data && minimap_select_center && minimap_select_width) {
        update_storyline_view(minimap_select_center, minimap_select_width, getSpeed());
    }
    // if (!update_data) {
    //     update_minimap_view();
    // }
}, 1000 / 60);

function getSpeed() {
    speed = 0;
    var l = cursor_pos_list.length;
    if (!l) return speed;
    speed = (cursor_pos_list[l - 1] - cursor_pos_list[0]) / l;
    return speed;
}

function drawSelectBox(selector, position, width, update) {
    // console.log(position, width);
    var left = position - width / 2;
    if (left < 0) {
        width += left;
        left = 0;
    }
    var w = $('.mm_mask').width();

    update_data = (update == true);
    if (update) {
        minimap_select_center = left + width / 2;
        minimap_select_width = width;
    }
    if (left + width > w) {
        width = w - left;
    }
    $(selector).css('opacity', '0.5').css('left', left + 'px').css('width', width + 'px');
}

function hideSelectBox(selector) {
    $(selector).css('opacity', '0');
}

function mm_down_event(e) {
    if (!load_started) return;
    var offset = e.offsetX;
    select_status = 1;
    width_orangebox = width_graybox;
    drawSelectBox('.mm_orange', offset, width_orangebox, true);
    hideSelectBox('.mm_gray');
}

function mm_up_event(e) {
    if (!load_started) return;
    var offset = e.offsetX;
    select_status = 0;
    width_orangebox = width_graybox;

    drawSelectBox('.mm_orange', offset, width_orangebox, true);
    update_data = false;
    storyline.restoreNormalHeight();

    // hideSelectBox('.mm_gray');
    //console.log("up", offset, width_orangebox);
    // update_storyline_view(offset, width_orangebox);
}

function mm_scroll_event(e) {
    if (!load_started) return;
    var offset = e.offsetX;
    // console.log(e.wheelDeltaY);
    var delta = -e.wheelDeltaY / 40;
    width_graybox += delta;
    width_graybox = Math.max(80, width_graybox);
    width_graybox = Math.min(480, width_graybox);
    if (!select_status) {
        drawSelectBox('.mm_gray', offset, width_graybox);
    } else {
        width_orangebox = width_graybox;
        drawSelectBox('.mm_orange', offset, width_orangebox, true);
        //console.log("scroll", offset, width_orangebox);
        // update_storyline_view(offset, width_orangebox);
    }

    return false;
}

function mm_leave_event() {
    mousein_status = false;
    if (!load_started) return;
    select_status = 0;
    update_data = false;
    storyline.restoreNormalHeight();
    hideSelectBox('.mm_gray');
}

function mm_move_event(e) {
    mousein_status = true;
    if (!load_started) return;
    var offset = e.offsetX;
    cursor_pos = offset;
    //if (offset < width_graybox / 2 || offset + width_graybox / 2 > minimap_width) {
    //	return;
    //}
    if (!select_status) {
        drawSelectBox('.mm_gray', offset, width_graybox);
    } else {
        //console.log("move", offset, width_orangebox);
        // update_storyline_view(offset, width_orangebox);
        drawSelectBox('.mm_orange', offset, width_orangebox, true);
    }
}

function update_storyline_view(center, width, speed) {
    // console.log(speed); // speed[0]--center的速度， speed[1]--width的改变速度
    var actual_minimap_width = minimap_width;// - width / 2;
    // console.log(center, width);
    storyline.scrollTo(
        (center - width / 2) / actual_minimap_width, // start
        (center + width / 2) / actual_minimap_width, // end
        speed, // speed
        select_status
    );
}

function update_minimap_view() {
    var cw = storyline.getMinimapCenterWidth();
    if (cw[1] > 1) return width;
    var center = cw[0] * minimap_width;
    var width = cw[1] * minimap_width;
    if (!width || !center) return width;
    // console.log(center, width);
    width_orangebox = width;
    width_graybox = width;
    drawSelectBox('.mm_orange', center, width, false);

}

var ctx = $('#minimap')[0].getContext('2d');
var canvas_width = 2000;
var canvas_height = 100;

function drawMinimap() {
    var data = storyline.storyline_data;
    var es = storyline.storyline_data.entities;
    var range = data.range[1];
    var minh = 1e30;
    var maxh = 0;
    for (var j in es) {
        var entity = es[j];
        entity.forEach(function(e, i) {
            minh = Math.min(minh, e.height);
            maxh = Math.max(maxh, e.height);
        });
    }
    minh -= 5;
    maxh += 5;
    ctx.clearRect(0, 0, canvas_width, canvas_height);
    for (var j in es) {
        var oldx = undefined;
        var oldy = undefined;
        var old_time = 0;
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = storyline.color(j);
        var entity = es[j];

        var entity_length = entity.length;

        entity.forEach(function(e, i) {
            // skip virtual point
            if (i == entity_length - 1) {
                return;
            }
            var x = e.time / range * canvas_width;
            var y = (e.height - minh) / (maxh - minh) * canvas_height;
            if (oldx != undefined && oldy != undefined) {
                if (e.time - old_time > 100) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            } else {
                ctx.moveTo(x, y);
            }
            oldx = x;
            oldy = y;
            old_time = e.time;
        });
        ctx.stroke();
    }
}
