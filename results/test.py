from keras.models import load_model
import numpy as np
import cv2

# sketch = cv2.imread('input.png', 1)
sketch = cv2.imread('00000000.jpg', 1)
sketch = sketch[:,:256,:]

ret, sketch = cv2.threshold(sketch, 200, 255, cv2.THRESH_BINARY)

cv2.imwrite('threshold.jpg', sketch)

print(sketch.shape)

sketch = sketch[np.newaxis,...]

sketch = sketch/127.5 - 1
print(sketch.dtype)

model2 = load_model('../stage2-epoch-150.h5')

input = np.concatenate([sketch, sketch], axis=3)
output = model2.predict(input)

output = 0.5 * output + 0.5

output = np.squeeze((output * 127.5 + 127.5).astype(np.uint8))
cv2.imwrite('output.jpg', output)
