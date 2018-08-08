from keras.models import load_model
import numpy as np
import cv2

im = cv2.imread('./datasets/facades/test/1.jpg', 1)
input = im[:,0:256,:]
input = input[np.newaxis,...]

# print(input.shape)

model = load_model('./saved_model/epoch-1.h5')

output = model.predict(input)

# print(type(output))
# print(output.shape)

output = np.squeeze((output * 127.5 + 127.5).astype(np.uint8))
cv2.imwrite('test.jpg', output)