from keras.models import load_model
import numpy as np
import cv2
from data_loader import *

my_data_loader = DataLoader(img_size=(256, 256))

# step1. load data
img_A, img_B, img_C = my_data_loader.load_data_test(batch_size=2, is_testing=False)

# step2. load model
model1 = load_model('../../results/2stage/stage1-epoch-150.h5')
model2 = load_model('../../results/2stage/stage2-epoch-150.h5')

# step3. predict results
# fake_A = model1.predict(img_B)
sketch = np.concatenate([img_A, img_A], axis=3)
fake_C = model2.predict(sketch)

# result = np.concatenate([img_B, img_A, img_A, fake_C, img_C])
#
# result = 0.5 * result + 0.5
#
# titles = ['landmark', 'generated sketch', 'sketch', 'generated', 'original']
# fig, axs = plt.subplots(1, 5)
# for i in range(5):
#     axs[i].imshow(result[i])
#     axs[i].set_title(titles[i])
#     axs[i].axis('off')
# fig.savefig("test.png")
# plt.close()

output = np.squeeze((fake_C * 127.5 + 127.5).astype(np.uint8))
output = cv2.cvtColor(output, cv2.COLOR_BGR2RGB)
cv2.imwrite('test.jpg', output)
