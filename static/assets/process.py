import scipy.misc
from glob import glob
import numpy as np
import cv2
import matplotlib.pyplot as plt

class DataLoader():
    def __init__(self, img_size=(128, 128)):
        self.img_size = img_size

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

                imgs_A.append(img_A)
                imgs_B.append(img_B)
                imgs_C.append(img_C)

            yield imgs_A, imgs_B, imgs_C


    def imread(self, path):
        return scipy.misc.imread(path, mode='RGB').astype(np.float)


loader = DataLoader(img_size=(256, 256))

res = loader.load_batch(batch_size=60, is_testing=False)

for i, (imgs_A, imgs_B, imgs_C) in enumerate(res):
    for k in range(60):
        print(k)
        imgs_C[k] = cv2.cvtColor(imgs_C[k], cv2.COLOR_BGR2RGB)
        cv2.imwrite('./images/show/%04d.png' % k, imgs_C[k])

        img = np.concatenate([imgs_A[k],imgs_B[k],imgs_C[k]], axis=1)
        cv2.imwrite('./images/source/%04d.png' % k, img)
    break
