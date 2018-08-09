import cv2
import numpy as np
import glob
import h5py

image_name_format = 'output/*.jpg'
np_data = np.empty((256, 768, 3, 1000)) # I would like to know the size beforehand

k = 0
for filename in glob.glob(image_name_format): #assuming gif
    print('reading ', filename, '...')
    np_data[k,:,:,:] = cv2.imread(filename, 1)
    k+=1

with h5py.File("all.h5", "w") as f:
    dataset = f.create_dataset("im", np_data, dtype=np.int8)
