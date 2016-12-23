import sys
import os

from layout_optimizer import optimize, inf
import mosek
from numpy import array, zeros, ones

# Since the actual value of Infinity is ignores, we define it solely
# for symbolic purposes:


if __name__ == '__main__':
	qsubi = [0, 1, 2, 2]
	qsubj = [0, 1, 0, 2]
	qval = [2.0, 0.2, -1.0, 2.0]

	c = [0.0, -1.0, 0.0]
	numvar = 3

	# asubi = [0, 0, 1, 1, 2, 2]
	# asubj = [0, 1, 0, 1, 0, 1]
	# aval = [1.0, 10., 1.0, 1., 1.0, 1.0]
	asub = [array([0, 1, 2]), array([0, 1, 2])]
	aval = [array([1.0, 1.0, 1.0]), array([10.0, 1., 1.])]

	bkc = [mosek.boundkey.lo, mosek.boundkey.lo]
	blc = [1.0, 4.0]
	buc = [inf, inf]
	numcon = len(bkc)
	objsense = mosek.objsense.minimize

	res = optimize((qsubi, qsubj, qval), c, (asub, aval), (bkc, blc, buc), numvar, numcon, objsense)
	print(res)