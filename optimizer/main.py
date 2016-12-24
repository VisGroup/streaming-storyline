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
    if "time" in preslice and current["time"] != preslice["time"] + 1:
        return "invalid"
    # print(request.args.get('current'))
    # print(request.args.get('preslice'))
    result = compaction(current, preslice, CONFIG, 0.01)
    return jsonify(result)


if __name__ == '__main__':
    app.run(port=23334, host="0.0.0.0")


