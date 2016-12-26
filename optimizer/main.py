from layout_optimizer import compaction
from flask import Flask, jsonify, request

import sys
import json
import pickle
from config import CONFIG


app = Flask(__name__)


@app.route('/tasks/optimizer', methods=['GET'])
def get_tasks():
    current = json.loads(request.args.get('current'))
    preslice = json.loads(request.args.get('preslice'))
    preslots = json.loads(request.args.get('preslots'))
    # print(preslots)

    # find fixed slots
    preslot_map = {}
    current_slot_map = {}

    fixed_slots = {}
    if "sessions" in preslots:
        for session in preslots["sessions"]:
            for entity in session:
                preslot_map[entity] = session[entity]
        for session in current["sessions"]:
            for entity in session:
                current_slot_map[entity] = session[entity]

        for entity in current_slot_map:
            if entity not in preslot_map: continue
            if preslot_map[entity] == current_slot_map[entity]: fixed_slots[entity] = preslot_map[entity]

    if "time" in preslice and current["time"] != preslice["time"] + 1:
        return "invalid"
    # print(request.args.get('current'))
    # print(request.args.get('preslice'))
    result = compaction(current, preslice, fixed_slots, CONFIG, 0.)
    return jsonify(result)


if __name__ == '__main__':
    app.run(port=23334, host="0.0.0.0", debug=False)


