import os
from flask import Flask, flash, request, redirect, url_for, jsonify, render_template, abort
from jinja2 import TemplateNotFound
from PIL import Image
import cv2
import numpy as np
import base64
import tensorflow as tf
from keras.models import load_model
from adain.image import load_image, prepare_image, save_image
from adain.nn import build_vgg, build_decoder
from adain.norm import adain
from adain.weights import open_weights
from scipy.misc import imread, imresize, imsave

custom_code = Flask(__name__, static_folder='static')

os.environ['CUDA_VISIBLE_DEVICES'] = ''

global model1
global model2
model1 = load_model('stage1-epoch-150.h5')
model2 = load_model('stage2-epoch-150.h5')

global graph
graph = tf.get_default_graph()

def BuildGraph(vgg_weights, decoder_weights, alpha, data_format):
    image = tf.placeholder(shape=(None,None,None,3), dtype=tf.float32)
    content = tf.placeholder(shape=(1,None,None,512), dtype=tf.float32)
    style = tf.placeholder(shape=(1,None,None,512), dtype=tf.float32)

    target = adain(content, style, data_format=data_format)
    weighted_target = target * alpha + (1 - alpha) * content

    with open_weights(vgg_weights) as w:
        vgg = build_vgg(image, w, data_format=data_format)
        encoder = vgg['conv4_1']

    if decoder_weights:
        with open_weights(decoder_weights) as w:
            decoder = build_decoder(weighted_target, w, trainable=False,
                data_format=data_format)
    else:
        decoder = build_decoder(weighted_target, None, trainable=False,
            data_format=data_format)

    return image, content, style, target, encoder, decoder

data_format = 'channels_last'
vgg_weights='style-models/vgg19_weights_normalized.h5'
decoder_weights='style-models/decoder_weights.h5'

@custom_code.route('/demo', methods=['GET'])
def demo():
    try:
        return render_template('app.html')
    except TemplateNotFound:
        abort(404)

@custom_code.route('/talk_to_AI_draw', methods=['POST'])
def talk_to_AI_draw():
    # try:
    res_data = {}

    # input data
    input_data = request.json
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

    landmark_image = np.array(landmark_image)/127.5-1
    sketch_image = np.array(sketch_image)/127.5-1

    landmark_image = landmark_image[np.newaxis,...]
    sketch_image = sketch_image[np.newaxis,...]

    with graph.as_default():
        fake_sketch = model1.predict(landmark_image)

    sketch = np.concatenate([fake_sketch, sketch_image], axis=3)
    with graph.as_default():
        result = model2.predict(sketch)

    result = np.squeeze((result * 127.5 + 127.5).astype(np.uint8))

    # to data_uri
    cnt = cv2.imencode('.png', result)[1]
    b64 = base64.b64encode(cnt).decode('utf-8') # python3, for python2, use encodestring

    res_data['image'] = 'data:image/png;base64,' + b64

    return jsonify(res_data)
    # except:
    #     abort(404)

@custom_code.route('/stylize', methods=['POST'])
def stylize():
    with tf.Session() as sess:
        image, content, style, target, encoder, decoder = BuildGraph(vgg_weights, decoder_weights, 1.0, data_format=data_format)

        sess.run(tf.global_variables_initializer())

        res_data = {}

        # input data
        input_data = request.json
        content_image = input_data['content_data']
        style_filename = input_data['style_filename']

        encoded_image = content_image.split(",")[1]
        decoded_image = base64.b64decode(encoded_image)

        arr = np.asarray(bytearray(decoded_image), dtype=np.uint8)
        img = cv2.imdecode(arr, -1) # Load it as it is   
        img = cv2.cvtColor(img, cv2.COLOR_RGBA2RGB)

        cv2.imwrite('content.png', img)
        
        content_image = prepare_image(img,data_format=data_format)

        style_filename = './static/style/' + style_filename
        style_filename = style_filename + ',./static/style/style-white.png'

        style_path = style_filename.split(',')
        style_images = None
        style_paths = style_path
        for i, style_path in enumerate(style_paths):
            style_image = load_image(style_path, 0, None)
            style_image = prepare_image(style_image,data_format=data_format)
            if style_images is None:
                shape = tuple([len(style_paths)]) + style_image.shape
                style_images = np.empty(shape)
            style_images[i] = style_image

        # real style transfer
        style_features = sess.run(encoder, feed_dict={image: style_images})        
        content_feature = sess.run(encoder, feed_dict={image: content_image[np.newaxis,:]})

        _, h, w, c = content_feature.shape
        content_view_shape = (-1, c)

        mask_shape = lambda mask: (1, len(mask), c)
        mask_slice = lambda mask: (mask,slice(None))

        _,mask = cv2.threshold(content_image,230/255.0,1.0,cv2.THRESH_BINARY_INV)

        cv2.imwrite('mask.png', mask*255)

        mask = cv2.cvtColor(mask, cv2.COLOR_BGR2GRAY)
        mask = imresize(mask, (h, w), interp='nearest')
        mask = mask.astype(np.uint8)
        mask[mask == 255] = 1

        fg_mask = np.flatnonzero(mask == 1)
        bg_mask = np.flatnonzero(mask == 0)

        content_feat_view = content_feature.reshape(content_view_shape)
        content_feat_fg = content_feat_view[mask_slice(fg_mask)].reshape(mask_shape(fg_mask))
        content_feat_bg = content_feat_view[mask_slice(bg_mask)].reshape(mask_shape(bg_mask))

        style_feature_fg = style_features[0]
        style_feature_bg = style_features[1]

        target_feature_fg = sess.run(target, feed_dict={
            content: content_feat_fg[np.newaxis,:],
            style: style_feature_fg[np.newaxis,:]
        })
        target_feature_fg = np.squeeze(target_feature_fg)

        target_feature_bg = sess.run(target, feed_dict={
            content: content_feat_bg[np.newaxis,:],
            style: style_feature_bg[np.newaxis,:]
        })
        target_feature_bg = np.squeeze(target_feature_bg)

        target_feature = np.zeros_like(content_feat_view)
        target_feature[mask_slice(fg_mask)] = target_feature_fg
        target_feature[mask_slice(bg_mask)] = target_feature_bg
        target_feature = target_feature.reshape(content_feature.shape)

        output = sess.run(decoder, feed_dict={
            content: content_feature,
            target: target_feature
        })

        output = output[0]
        if data_format == 'channels_first':
            output = np.transpose(output, [1, 2, 0]) # CHW --> HWC
        output *= 255
        output = np.clip(output, 0, 255)
        output = output.astype(np.uint8)

        # to data_uri
        cnt = cv2.imencode('.png', output)[1]
        b64 = base64.b64encode(cnt).decode('utf-8') # python3, for python2, use encodestring

        res_data['image'] = 'data:image/png;base64,' + b64

        return jsonify(res_data)

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
