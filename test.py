from keras.models import load_model
import numpy as np
import cv2
from data_loader import *

my_data_loader = DataLoader(img_size=(256, 256))

# im = cv2.imread('./datasets/facades/test/1.jpg', 1)
# input = im[:,0:256,:]
# input = input[np.newaxis,...]
# print(input.shape)

# step1. load data
imgs_A, imgs_B, imgs_C = my_data_loader.load_data_test(batch_size=2, is_testing=False)

img_A = imgs_A[1,:,:,:] #(imgs_A[0,:,:,:] + imgs_A[1,:,:,:])*0.5
img_B = imgs_A[1,:,:,:] #(imgs_B[0,:,:,:] + imgs_B[1,:,:,:])
img_C = imgs_C[1,:,:,:]

img_A = img_A[np.newaxis,...]
img_B = img_B[np.newaxis,...]
img_C = img_C[np.newaxis,...]

# step2. load model
model1 = load_model('../results/2stage/stage1-epoch-150.h5')
model2 = load_model('../results/2stage/stage2-epoch-150.h5')

# step3. predict results
fake_A = model1.predict(img_B)
sketch = np.concatenate([img_A, img_A], axis=3)
fake_C = model2.predict(sketch)

result = np.concatenate([img_B, fake_A, img_A, fake_C, img_C])
# print(result[1].shape)

result = 0.5 * result + 0.5

titles = ['landmark', 'generated sketch', 'sketch', 'generated', 'original']
fig, axs = plt.subplots(1, 5)
for i in range(5):
    axs[i].imshow(result[i])
    axs[i].set_title(titles[i])
    axs[i].axis('off')
fig.savefig("test.png")
plt.close()

# print(fake_C.shape)
output = np.squeeze((fake_C * 127.5 + 127.5).astype(np.uint8))
output = cv2.cvtColor(output, cv2.COLOR_BGR2RGB)
cv2.imwrite('test.jpg', output)
