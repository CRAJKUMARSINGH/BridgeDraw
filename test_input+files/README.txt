Bridge input file format (one value per line):

1: scale1 (number)
2: scale2 (number)
3: skew (degrees)
4: datum (level)
5: toprl (top road level)
6: left (start chainage)
7: right (end chainage)
8: xincr (x increment)
9: yincr (y increment)
10: noch (number of cross-section points)

From line 11 onward: repeat pairs of
- chainage
- level

Example (10 cross-section points):
186
100
0
100
110.98
0
43.2
10
1
4
0
110.98
10.8
110.5
21.6
110.2
32.4
110.1
43.2
110.0
