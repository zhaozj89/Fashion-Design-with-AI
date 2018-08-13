import cv2

im = cv2.imread('gray.png', 1)

kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(2,2))
res = cv2.erode(im,kernel,iterations = 1)

_, res = cv2.threshold(res,200,255,cv2.THRESH_BINARY)

print(res.shape)
print(type(res))
print(res.dtype)

res = cv2.resize(res, (256, 256))

cv2.imwrite('tmp.png', res)
