import mosek
from numpy import array, zeros, ones
import operator


INF = 0.
env = mosek.Env()


def optimize(Q, c, A, b, numvar, numcon, objsense):
	task = env.Task()
	task.appendvars(numvar)
	task.appendcons(numcon)

	# variable non-negative
	for j in range(numvar):
		# Set the bounds on variable j
		# blx[j] <= x_j <= bux[j]
		task.putbound(mosek.accmode.var, j, mosek.boundkey.lo, 0.0, INF)

	asub, aval = A
	for i in range(numcon):
		task.putarow(i, asub[i],  # Row index of non-zeros in column j.
				 aval[i])  # Non-zero Values of column j.

	bkc, blc, buc = b
	for i in range(numcon):
		task.putbound(mosek.accmode.con, i, bkc[i], blc[i], buc[i])

	qsubi, qsubj, qval = Q
	# Set up and input quadratic objective
	task.putqobj(qsubi, qsubj, qval)

	for i in range(numvar):
		# Set the linear term c_j in the objective.
		task.putcj(j, c[j])

	task.putobjsense(objsense)

	# Optimize
	task.optimize()

	solsta = task.getsolsta(mosek.soltype.itr)

	# Output a solution
	xx = zeros(numvar, float)
	task.getxx(mosek.soltype.itr, xx)

	if solsta == mosek.solsta.optimal or solsta == mosek.solsta.near_optimal:
		# print(xx)
		return xx
	else:
		return solsta


def compaction(current, preslice, config):
	has_precendent = "time" in preslice
	current_order, current_session = convert_format(current)
	if has_precendent:
		preslice_order, preslice_session = convert_format(preslice)

		HEIGHT_MIN = 10
		# get preslice height map
		preslice_height_map = {}
		for session in preslice["sessions"]:
			for entity in session:
				preslice_height_map[entity] = session[entity] + HEIGHT_MIN

	numvar = len(current_order)
	numcon = numvar - 1

	# construction of Q
	qsubi = []
	qsubj = []
	qval = []
	c = []
	for i in range(numvar):
		qsubi.append(i)
		qsubj.append(i)
		qval.append(1.)
		c.append(0.)

	if has_precendent:
		for i in range(numvar):
			for j in range(numvar):
				if i == j:
					continue
				if i not in preslice_session or j not in preslice_session:
					continue
				if current_session[i] == current_session[j]:
					continue
				if preslice_session[i] == preslice_session[j]:
					qval[i] += 1.
					qval[j] += 1.
					qsubi.append(i)
					qsubj.append(j)
					qval.append(-1.)
				else:
					ratio = preslice_height_map[i] / preslice_height_map[j]
					if ratio < 1.:
						qval[i] += 1 / ratio
						qval[j] += 1.
					else:
						qval[i] += 1.
						qval[j] += ratio
					qsubi.append(i)
					qsubj.append(j)
					qval.append(ratio)

	# construction of A
	asub = []
	aval = []
	bkc = []
	blc = []
	buc = []
	for i in range(numvar - 1):
		entity_0 = current_order[i]
		entity_1 = current_order[i + 1]
		asub.append(array([i, i + 1]))
		bkc.append(mosek.boundkey.lo)
		if current_session[entity_0] != current_session[entity_1]:
			blc.append(config["d-out"])
			buc.append(INF)
		else:
			blc.append(config["d-in"])
			buc.append(config["d-in"])
		aval.append(array([-1., 1.]))
	objsense = mosek.objsense.minimize
	res = optimize((qsubi, qsubj, qval), c, (asub, aval), (bkc, blc, buc), numvar, numcon, objsense)
	print(res)


def convert_format(slice):
	time = slice["time"]
	sessions = slice["sessions"]

	heights = {}
	order = []
	session_map = {}

	for i, session in enumerate(sessions):
		for entity in session:
			heights[entity] = session[entity]
			session_map[entity] = i

	for item in sorted(heights.items(), key=operator.itemgetter(1)):
		order.append(item[0])
	return (order, session_map)


def test(l_c, l_p):
	import json
	from config import CONFIG
	# c = '{"time":5,"sessions":[{"0": 0},{"1": 2,"2": 3},{"3": 5},{"4": 7},{"5": 9},{"6": 11,"7": 12},{"8": 14}]}'
	# p = '{  "sessions": [    {      "0": 0    },     {      "1": 2,       "2": 3    },     {      "3": 5    },     {      "4": 7    },     {      "5": 9    },     {      "6": 11,       "7": 12    },     {      "8": 14    }  ],   "time": 4}'
	current = json.loads(l_c)
	preslice = json.loads(l_p)

	compaction(current, preslice, CONFIG)


if __name__ == '__main__':
	with open("data.txt") as infile:
		lines = []
		for line in infile:
			lines.append(line)

		print(len(lines))
		for i in range(int(len(lines) / 2)):
			test(lines[i], lines[i + 1])