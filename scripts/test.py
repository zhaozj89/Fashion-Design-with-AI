from keras.models import load_model
import numpy as np
import cv2
import scipy

sketch = cv2.imread('input.png', 1)
# img = cv2.imread('00000100.jpg', 1)
# sketch = img[:,:256,:]

# sketch_resized = scipy.misc.imresize(sketch, (256,256))

kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(3,3))
sketch = cv2.erode(sketch,kernel,iterations = 1)

ret, sketch = cv2.threshold(sketch, 200, 255, cv2.THRESH_BINARY)

cv2.imwrite('threshold.jpg', sketch)

sketch = sketch/127.5 - 1

input = sketch[np.newaxis,...]

model2 = load_model('../stage2-epoch-150.h5')

input = np.concatenate([input, input], axis=3)
output = model2.predict(input)

output = np.squeeze((output * 127.5 + 127.5).astype(np.uint8))
output = cv2.cvtColor(output, cv2.COLOR_BGR2RGB)
cv2.imwrite('output.jpg', output)
