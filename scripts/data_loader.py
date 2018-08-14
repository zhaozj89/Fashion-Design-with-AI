import scipy
from glob import glob
import numpy as np
import cv2
import matplotlib.pyplot as plt

threshold = 200

class DataLoader():
    def __init__(self, img_size=(128, 128)):
        self.img_size = img_size

    def load_data_test(self, batch_size=1, is_testing=False):
        batch_images = ['./00000100.jpg']

        imgs_A = []
        imgs_B = []
        imgs_C = []
        for img_path in batch_images:
            img = self.imread(img_path)

            h, w, _ = img.shape
            _w = int(w/3)
            img_A, img_B, img_C = img[:, :_w, :], img[:, _w:_w*2, :], img[:, _w*2:, :]

            img_A = scipy.misc.imresize(img_A, self.img_size)
            img_B = scipy.misc.imresize(img_B, self.img_size)
            img_C = scipy.misc.imresize(img_C, self.img_size)

            ret, img_A = cv2.threshold(img_A, threshold, 255, cv2.THRESH_BINARY)

            imgs_A.append(img_A)
            imgs_B.append(img_B)
            imgs_C.append(img_C)

        imgs_A = np.array(imgs_A)/127.5 - 1.
        imgs_B = np.array(imgs_B)/127.5 - 1.
        imgs_C = np.array(imgs_C)/127.5 - 1.

        return imgs_A, imgs_B, imgs_C

    def imread(self, path):
        return scipy.misc.imread(path, mode='RGB').astype(np.float)
