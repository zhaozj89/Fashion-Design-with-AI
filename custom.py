# this file imports custom routes into the experiment server

from flask import Blueprint, render_template, request, jsonify, Response, abort, current_app
from jinja2 import TemplateNotFound
from functools import wraps
from sqlalchemy import or_

from psiturk.psiturk_config import PsiturkConfig
from psiturk.experiment_errors import ExperimentError, InvalidUsage
from psiturk.user_utils import PsiTurkAuthorization, nocache

# # Database setup
from psiturk.db import db_session, init_db
from psiturk.models import Participant
from json import dumps, loads

# load the configuration options
config = PsiturkConfig()
config.load_config()
# if you want to add a password protect route use this
myauth = PsiTurkAuthorization(config)

# explore the Blueprint
custom_code = Blueprint('custom_code', __name__,
                        template_folder='templates', static_folder='static')

###########################################################
#  serving warm, fresh, & sweet custom, user-provided routes
#  add them here
###########################################################

# ----------------------------------------------
# example custom route
# ----------------------------------------------


@custom_code.route('/my_custom_view')
def my_custom_view():
    # Print message to server.log for debugging
    current_app.logger.info("Reached /my_custom_view")

    try:
        return render_template('custom.html')
    except TemplateNotFound:
        abort(404)

# ----------------------------------------------
# example using HTTP authentication
# ----------------------------------------------


@custom_code.route('/my_password_protected_route')
@myauth.requires_auth
def my_password_protected_route():
    try:
        return render_template('custom.html')
    except TemplateNotFound:
        abort(404)

# ----------------------------------------------
# example accessing data
# ----------------------------------------------


@custom_code.route('/view_data')
@myauth.requires_auth
def list_my_data():
    users = Participant.query.all()
    try:
        return render_template('list.html', participants=users)
    except TemplateNotFound:
        abort(404)

# ----------------------------------------------
# example computing bonus
# ----------------------------------------------


@custom_code.route('/compute_bonus', methods=['GET'])
def compute_bonus():
    # check that user provided the correct keys
    # errors will not be that gracefull here if being
    # accessed by the Javascrip client
    if not request.args.has_key('uniqueId'):
        # i don't like returning HTML to JSON requests...  maybe should change this
        raise ExperimentError('improper_inputs')
    uniqueId = request.args['uniqueId']

    try:
        # lookup user in database
        user = Participant.query.\
            filter(Participant.uniqueid == uniqueId).\
            one()
        user_data = loads(user.datastring)  # load datastring from JSON
        bonus = 0

        for record in user_data['data']:  # for line in data file
            trial = record['trialdata']
            if trial['phase'] == 'TEST':
                if trial['hit'] == True:
                    bonus += 0.02
        user.bonus = bonus
        db_session.add(user)
        db_session.commit()
        resp = {"bonusComputed": "success"}
        return jsonify(**resp)
    except:
        abort(404)  # again, bad to display HTML, but...


# ----------------------------------------------
# chatbot route
# ----------------------------------------------
# import os
# from flask import Flask, flash, request, redirect, url_for, jsonify
# from werkzeug.utils import secure_filename
#
# from PIL import Image
# import cv2
# import numpy as np
# import base64
#
# UPLOAD_FOLDER = './static/uploads'
# ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])
#
# from psiturk.experiment import app
#
# app.config.update(UPLOAD_FOLDER = UPLOAD_FOLDER)
#
# def allowed_file(filename):
#     return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
#
# @custom_code.route('/get_art_tutor_response', methods=['POST'])
# def get_art_tutor_response():
#     try:
#         res_data = {}
#
#         # input data
#         input_data = request.json
#         text = input_data['text']
#         image_uri = input_data['image']
#         N = input_data['number']
#
#         if N>2:
#             res_data['text'] = 'Your input is too complex! I cannot understand. Sorry!'
#             res_data['image'] = ''
#             return jsonify(res_data)
#
#         # processing text
#         res_data['text'] = text
#
#         # processing image
#         if image_uri=='':
#             res_data['image'] = ''
#         else:
#             encoded_image = image_uri.split(",")[1]
#             decoded_image = base64.b64decode(encoded_image)
#
#             arr = np.asarray(bytearray(decoded_image), dtype=np.uint8)
#             img = cv2.imdecode(arr, -1) # Load it as it is
#
#             # get opencv image here
#
#             # to data_uri
#             cnt = cv2.imencode('.png', img)[1]
#             b64 = base64.encodestring(cnt)
#
#             res_data['image'] = 'data:image/png;base64,' + b64
#
#         return jsonify(res_data)
#     except:
#         abort(404)

# @custom_code.route('/art_tutor')
# def art_tutor():
#     try:
#         return render_template('chatbot.html')
#     except TemplateNotFound:
#         abort(404)

# ----------------------------------------------
# real custom code
# ----------------------------------------------
# my_code = Blueprint('my_code', __name__, static_folder='frontend/build', template_folder="frontend/build")
#
# @my_code.route('/react')
# def react():
#     try:
#         return render_template('index.html')
#     except TemplateNotFound:
#         abort(404)
#
# # muse register after create blueprint
# from psiturk.experiment import app
# app.register_blueprint(my_code)

import os
from flask import Flask, flash, request, redirect, url_for, jsonify
from PIL import Image
import cv2
import numpy as np
import base64
from keras.models import load_model

model1 = load_model('stage1-epoch-150.h5')
model2 = load_model('stage2-epoch-150.h5')

# Main
@custom_code.route('/study', methods=['GET'])
def study():
    try:
        return render_template('ad.html')
    except TemplateNotFound:
        abort(404)

@custom_code.route('/demo', methods=['GET'])
def demo():
    try:
        return render_template('exp.html', uniqueId='test', adServerLoc='none', mode='debug')
    except TemplateNotFound:
        abort(404)

# @custom_code.route('/talk_to_AI_landmark', methods=['POST'])
# def talk_to_AI_landmark():
#     try:
#         res_data = {};
#
#         # input data
#         input_data = request.json
#         filename = input_data['filename']
#         landmark = input_data['landmark']
#
#         # process opencv image here
#         landmark_image = MakeLandmarkImage(landmark)
#         landmark_image = cv2.cvtColor(landmark_image, cv2.COLOR_GRAY2BGR)
#         cv2.imwrite('landmark.png', landmark_image)
#
#         landmark_image = np.array(landmark_image)/127.5-1
#         landmark_image = landmark_image[np.newaxis,...]
#
#         fake_sketch = model1.predict(landmark_image)
#
#         result = np.squeeze((fake_sketch * 127.5 + 127.5).astype(np.uint8))
#         cv2.imwrite('fake_sketch.png', result)
#
#         # to data_uri
#         cnt = cv2.imencode('.png', result)[1]
#         b64 = base64.encodestring(cnt)
#
#         res_data['image'] = 'data:image/png;base64,' + b64
#
#         return jsonify(res_data)
#     except:
#         abort(404)

@custom_code.route('/talk_to_AI_draw', methods=['POST'])
def talk_to_AI_draw():
    try:
        res_data = {};

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

        fake_sketch = model1.predict(landmark_image)
        sketch = np.concatenate([fake_sketch, sketch_image], axis=3)
        result = model2.predict(sketch)

        result = np.squeeze((result * 127.5 + 127.5).astype(np.uint8))
        # cv2.imwrite('result.png', result)

        # to data_uri
        cnt = cv2.imencode('.png', result)[1]
        b64 = base64.encodestring(cnt)

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
