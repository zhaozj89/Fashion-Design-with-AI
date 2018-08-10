import cv2
import numpy as np
import h5py

with h5py.File("../deepfashion.h5", "r") as f:
    print(list(f.keys()))
    print(len(f['im']))
    for i in range(len(f['im'])):
        print(i)
        print(f['im'][i].shape)
