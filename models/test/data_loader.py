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
        data_type = "train" if not is_testing else "test"
        path = glob('./output/%s/*' % (data_type))

        # batch_images = np.random.choice(path, size=batch_size)
        batch_images = ['./output/train/00000200.jpg', './output/train/00001001.jpg']

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

            # print(img_A.shape)
            ret, img_A = cv2.threshold(img_A, threshold, 255, cv2.THRESH_BINARY)
            # print(img_A.shape)
            # cv2.imshow('test', img_A)
            # cv2.waitKey(0)

            # If training => do random flip
            # if not is_testing and np.random.random() < 0.5:
            #     img_A = np.fliplr(img_A)
            #     img_B = np.fliplr(img_B)
            #     img_C = np.fliplr(img_C)

            imgs_A.append(img_A)
            imgs_B.append(img_B)
            imgs_C.append(img_C)

        imgs_A = np.array(imgs_A)/127.5 - 1.
        imgs_B = np.array(imgs_B)/127.5 - 1.
        imgs_C = np.array(imgs_C)/127.5 - 1.

        return imgs_A, imgs_B, imgs_C

    def load_data(self, batch_size=1, is_testing=False):
        data_type = "train" if not is_testing else "test"
        path = glob('./output/%s/*' % (data_type))

        batch_images = np.random.choice(path, size=batch_size)

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

            # print(img_A.shape)
            ret, img_A = cv2.threshold(img_A, threshold, 255, cv2.THRESH_BINARY)
            # print(img_A.shape)
            # cv2.imshow('test', img_A)
            # cv2.waitKey(0)

            # If training => do random flip
            if not is_testing and np.random.random() < 0.5:
                img_A = np.fliplr(img_A)
                img_B = np.fliplr(img_B)
                img_C = np.fliplr(img_C)

            imgs_A.append(img_A)
            imgs_B.append(img_B)
            imgs_C.append(img_C)

        imgs_A = np.array(imgs_A)/127.5 - 1.
        imgs_B = np.array(imgs_B)/127.5 - 1.
        imgs_C = np.array(imgs_C)/127.5 - 1.

        return imgs_A, imgs_B, imgs_C

    def load_batch(self, batch_size=1, is_testing=False):
        data_type = "train" if not is_testing else "val"
        path = glob('./output/%s/*' % (data_type))

        self.n_batches = int(len(path) / batch_size)

        for i in range(self.n_batches-1):
            batch = path[i*batch_size:(i+1)*batch_size]
            imgs_A, imgs_B, imgs_C = [], [], []
            for img in batch:
                img = self.imread(img)
                h, w, _ = img.shape
                half_w = int(w/3)
                img_A = img[:, :half_w, :]
                img_B = img[:, half_w:2*half_w, :]
                img_C = img[:, 2*half_w:, :]

                img_A = scipy.misc.imresize(img_A, self.img_size)
                img_B = scipy.misc.imresize(img_B, self.img_size)
                img_C = scipy.misc.imresize(img_C, self.img_size)

                # print(img_A.shape)
                ret, img_A = cv2.threshold(img_A, threshold, 255, cv2.THRESH_BINARY)
                # print(img_A.shape)
                # cv2.imshow('test', img_A)
                # cv2.waitKey(0)

                if not is_testing and np.random.random() > 0.5:
                    img_A = np.fliplr(img_A)
                    img_B = np.fliplr(img_B)
                    img_C = np.fliplr(img_C)

                imgs_A.append(img_A)
                imgs_B.append(img_B)
                imgs_C.append(img_C)

            imgs_A = np.array(imgs_A)/127.5 - 1.
            imgs_B = np.array(imgs_B)/127.5 - 1.
            imgs_C = np.array(imgs_C)/127.5 - 1.

            yield imgs_A, imgs_B, imgs_C


    def imread(self, path):
        return scipy.misc.imread(path, mode='RGB').astype(np.float)
