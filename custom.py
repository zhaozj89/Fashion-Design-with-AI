import os
from flask import Flask, flash, request, redirect, url_for, jsonify, render_template, abort
from jinja2 import TemplateNotFound
from PIL import Image
import cv2
import numpy as np
import base64
import tensorflow as tf
from keras.models import load_model
# import os
# os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

custom_code = Flask(__name__, static_folder='static')

global model1
global model2
model1 = load_model('stage1-epoch-150.h5')
model2 = load_model('stage2-epoch-150.h5')

global graph
graph = tf.get_default_graph()

@custom_code.route('/demo', methods=['GET'])
def demo():
    try:
        return render_template('app.html')
    except TemplateNotFound:
        abort(404)

@custom_code.route('/talk_to_AI_draw', methods=['POST'])
def talk_to_AI_draw():
    try:
        res_data = {}

        # input data
        input_data = request.json
        filename = input_data['filename']
        landmark = input_data['landmark']
        image_uri = input_data['sketch']

        encoded_image = image_uri.split(",")[1]
        decoded_image = base64.b64decode(encoded_image)

        arr = np.asarray(bytearray(decoded_image), dtype=np.uint8)
        img = cv2.imdecode(arr, -1) # Load it as it is

        # process opencv image here
        landmark_image = MakeLandmarkImage(landmark)
        sketch_image = MakeSketchImage(img)

        landmark_image = cv2.cvtColor(landmark_image, cv2.COLOR_GRAY2BGR)
        sketch_image = cv2.cvtColor(sketch_image, cv2.COLOR_GRAY2BGR)

        # cv2.imwrite('landmark.png', landmark_image)
        # cv2.imwrite('sketch_image.png', sketch_image)

        landmark_image = np.array(landmark_image)/127.5-1
        sketch_image = np.array(sketch_image)/127.5-1

        landmark_image = landmark_image[np.newaxis,...]
        sketch_image = sketch_image[np.newaxis,...]

        with graph.as_default():
            fake_sketch = model1.predict(landmark_image)

        # print('predict 1 succeed ...')

        sketch = np.concatenate([fake_sketch, sketch_image], axis=3)
        with graph.as_default():
            result = model2.predict(sketch)

        # print('predict 2 succeed ...')

        result = np.squeeze((result * 127.5 + 127.5).astype(np.uint8))
        # cv2.imwrite('result.png', result)

        # to data_uri
        cnt = cv2.imencode('.png', result)[1]
        b64 = base64.b64encode(cnt).decode('utf-8') # python3, for python2, use encodestring

        res_data['image'] = 'data:image/png;base64,' + b64

        return jsonify(res_data)
    except:
        abort(404)

def MakeLandmarkImage(landmarks):
    res = np.zeros((256, 256), np.uint8)
    for cor in landmarks:
        x = int(cor[1]*256/500)
        y = int(cor[0]*256/500)
        res[x,y] = 255
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(10,10))
    res = cv2.dilate(res,kernel,iterations = 1)

    return res

def MakeSketchImage(input):
    res = cv2.split(input)[3]
    res = 255-res
    res = cv2.resize(res, (256, 256))

    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(5,5))
    res = cv2.erode(res,kernel,iterations = 1)
    _, res = cv2.threshold(res,200,255,cv2.THRESH_BINARY)

    return res
