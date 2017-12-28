import tensorflow as tf
import cv2
import numpy as np
import argparse
import json

def forward(input_image):
    model_dir = "/Users/zzj/Documents/All/Submissions/uist17/UIST17 Program/Model/qipao_model"

    w, h, c = input_image.shape
    input_image = cv2.resize(input_image, (256, 256))
    input_np = np.array(input_image)/255;

    with tf.Session() as sess:
        saver = tf.train.import_meta_graph(model_dir + "/export.meta")
        saver.restore(sess, model_dir + "/export")
        input_vars = json.loads(tf.get_collection("inputs")[0].decode('utf-8'))
        output_vars = json.loads(tf.get_collection("outputs")[0].decode('utf-8'))
        input = tf.get_default_graph().get_tensor_by_name(input_vars["input"])
        output = tf.get_default_graph().get_tensor_by_name(output_vars["output"])

        output_np = sess.run(output, feed_dict={input: input_np})[0]

    output_np = cv2.resize(output_np, (h, w))
    return output_np

im = cv2.imread('/Users/zzj/Documents/All/Submissions/uist17/UIST17 Program/Data/cache/magic_input.png', 1)
res = forward(im)
cv2.imwrite('/Users/zzj/Documents/All/Submissions/uist17/UIST17 Program/Data/cache/magic_output.png', res*255)
