var load_started = false;
var select_status = false;
var mousein_status = false;
var update_data = false;
var first_click;

var width_graybox = 150;
var width_orangebox = 150;

var masks = $('.mm_mask');
masks.click(mm_click_event);
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
    if (left + width > w) {
        width = w - left;
    }
    $(selector).css('opacity', '0.5').css('left', left + 'px').css('width', width + 'px');
    update_data = (update == true);
    if (update) {
        minimap_select_center = left + width / 2;
        minimap_select_width = width;
    }
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
    var actual_minimap_width = minimap_width - width;
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

function mm_click_event(e) {
    return;
    // if (e.which == 3) {
    //     if (select_status >= 0) {
    //         offset = e.offsetX / $('.mm_top_line').width();
    //         var mousetime = (ed_now - st_now) * offset + st_now;
    //         select_status = -1;
    //         $('.mm_select_box').css('display', 'block').css('left', e.offsetX).css('width', 0);
    //         mm_send(mousetime);
    //     } else {
    //         select_status = 0;
    //         $('.mm_select_box').css('display', 'none').css('left', e.offsetX).css('width', 0);
    //     }
    //     return false;
    // }
    // switch (select_status) {
    //     case 0:
    //         select_status = 1;
    //         $('.mm_select_box').css('display', 'block')
    //             .css('left', offset + 'px');
    //         first_click = offset;
    //         break;
    //     case 1:
    //         select_status = 2;
    //         if (e.offsetX < first_click) {
    //             $('.mm_select_box').css('left', e.offsetX).css('width', first_click - e.offsetX);
    //         } else {
    //             $('.mm_select_box').css('left', first_click).css('width', -first_click + e.offsetX);
    //         }
    //         var o1 = first_click / $('.mm_top_line').width();
    //         var o2 = offset / $('.mm_top_line').width();
    //         var t1 = (ed_now - st_now) * o1 + st_now;
    //         var t2 = (ed_now - st_now) * o2 + st_now;
    //         mm_send(t1, t2);
    //         break;
    //     case 2:
    //     case -1:
    //         select_status = 0;
    //         $('.mm_select_box').css('display', 'none');
    //         break;
    // }
}
