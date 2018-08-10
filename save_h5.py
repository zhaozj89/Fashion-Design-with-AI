# from http://machinelearninguru.com/deep_learning/data_preparation/hdf5/hdf5.html
import cv2
import numpy as np
import glob
import h5py

num_images = 6683
store_image_shape = (num_images, 256, 768, 3)

image_name_format = '../output/*.jpg'

with h5py.File("../deepfashion.h5", "w") as f:
    dataset = f.create_dataset("im", store_image_shape, dtype=np.int8)

    k = 0
    for filename in glob.glob(image_name_format):
        print('reading ', filename, '...')
        if k>=num_images:
            break
        dataset[k,:,:,:] = cv2.imread(filename, 1)
        k+=1
