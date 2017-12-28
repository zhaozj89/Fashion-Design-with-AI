import numpy as np
import cv2
from cv2.ximgproc import guidedFilter
from matplotlib import pyplot as plt

name_input1 = '../Data/pix_output.png'
name_input2 = '../Data/seg_input.jpg'
name_mask = '../Data/mask_edge.png'

input1 = cv2.imread(name_input1, 0)
input2 = cv2.imread(name_input2, 0)
mask = cv2.imread(name_mask, 0)

(h, w) = input1.shape

input1 = input1/255
input2 = input2/255

res2 = np.zeros((h, w), dtype=np.float64)

guidedFilter(input2, input1, res2, 13, 1.0)

cv2.imshow('test', res2)
cv2.waitKey(0)





res = np.zeros((h, w, c), dtype=np.float64)

for y in range(h):
    for x in range(w):
        for k in range(c):
            if input1[y, x, k] < 1:
                res[y, x, k] = input1[y, x, k]
            else:
                res[y, x, k] = input2[y, x, k]

cv2.imshow('demo', res)
cv2.waitKey(0)
