import tensorflow as tf
import cv2
import numpy as np

def seg(image):
    # cv2.imshow('demo', image)
    # cv2.waitKey(0)

    _R_MEAN = 123.68
    _G_MEAN = 116.78
    _B_MEAN = 103.94

    def vgg_arg_scope(weight_decay=0.0005):
        with tf.contrib.slim.arg_scope([tf.contrib.slim.conv2d, tf.contrib.slim.fully_connected], activation_fn=tf.nn.relu,
                            weights_regularizer=tf.contrib.slim.l2_regularizer(weight_decay), biases_initializer=tf.zeros_initializer()):
            with tf.contrib.slim.arg_scope([tf.contrib.slim.conv2d], padding='SAME') as arg_sc:
                return arg_sc

    def vgg_16(inputs, num_classes=1000, is_training=True, dropout_keep_prob=0.5, spatial_squeeze=True, scope='vgg_16', fc_conv_padding='VALID'):
        with tf.variable_scope(scope, 'vgg_16', [inputs]) as sc:
            end_points_collection = sc.name + '_end_points'
            with tf.contrib.slim.arg_scope([tf.contrib.slim.conv2d, tf.contrib.slim.fully_connected, tf.contrib.slim.max_pool2d], outputs_collections=end_points_collection):
                net = tf.contrib.slim.repeat(inputs, 2, tf.contrib.slim.conv2d, 64, [3, 3], scope='conv1')
                net = tf.contrib.slim.max_pool2d(net, [2, 2], scope='pool1')
                net = tf.contrib.slim.repeat(net, 2, tf.contrib.slim.conv2d, 128, [3, 3], scope='conv2')
                net = tf.contrib.slim.max_pool2d(net, [2, 2], scope='pool2')
                net = tf.contrib.slim.repeat(net, 3, tf.contrib.slim.conv2d, 256, [3, 3], scope='conv3')
                net = tf.contrib.slim.max_pool2d(net, [2, 2], scope='pool3')
                net = tf.contrib.slim.repeat(net, 3, tf.contrib.slim.conv2d, 512, [3, 3], scope='conv4')
                net = tf.contrib.slim.max_pool2d(net, [2, 2], scope='pool4')
                net = tf.contrib.slim.repeat(net, 3, tf.contrib.slim.conv2d, 512, [3, 3], scope='conv5')
                net = tf.contrib.slim.max_pool2d(net, [2, 2], scope='pool5')
                net = tf.contrib.slim.conv2d(net, 4096, [7, 7], padding=fc_conv_padding, scope='fc6')
                net = tf.contrib.slim.dropout(net, dropout_keep_prob, is_training=is_training,  scope='dropout6')
                net = tf.contrib.slim.conv2d(net, 4096, [1, 1], scope='fc7')
                net = tf.contrib.slim.dropout(net, dropout_keep_prob, is_training=is_training, scope='dropout7')
                net = tf.contrib.slim.conv2d(net, num_classes, [1, 1], activation_fn=None, normalizer_fn=None, scope='fc8')
                end_points = tf.contrib.slim.utils.convert_collection_to_dict(end_points_collection)

                if spatial_squeeze:
                    net = tf.squeeze(net, [1, 2], name='fc8/squeezed')
                    end_points[sc.name + '/fc8'] = net
                return net, end_points

    def upsample_filt(size):
        factor = (size + 1) // 2
        if size % 2 == 1:
            center = factor - 1
        else:
            center = factor - 0.5
        og = np.ogrid[:size, :size]
        return (1 - abs(og[0] - center) / factor) * (1 - abs(og[1] - center) / factor)

    def bilinear_upsample_weights(factor, number_of_classes):
        filter_size = 2 * factor - factor % 2

        weights = np.zeros((filter_size,
                            filter_size,
                            number_of_classes,
                            number_of_classes), dtype=np.float32)

        upsample_kernel = upsample_filt(filter_size)

        for i in range(number_of_classes):

            weights[:, :, i, i] = upsample_kernel

        return weights

    def FCN_8s(image_batch_tensor, number_of_classes, is_training):
        image_batch_float = tf.to_float(image_batch_tensor)
        mean_centered_image_batch = image_batch_float - [_R_MEAN, _G_MEAN, _B_MEAN]
        upsample_filter_factor_2_np = bilinear_upsample_weights(factor=2, number_of_classes=number_of_classes)
        upsample_filter_factor_8_np = bilinear_upsample_weights(factor=8, number_of_classes=number_of_classes)
        upsample_filter_factor_2_tensor = tf.constant(upsample_filter_factor_2_np)
        upsample_filter_factor_8_tensor = tf.constant(upsample_filter_factor_8_np)
        with tf.variable_scope("fcn_8s")  as fcn_8s_scope:
            with tf.contrib.slim.arg_scope(vgg_arg_scope()):
                last_layer_logits, end_points = vgg_16(mean_centered_image_batch, num_classes=number_of_classes,
                                                       is_training=is_training, spatial_squeeze=False, fc_conv_padding='SAME')
                last_layer_logits_shape = tf.shape(last_layer_logits)
                last_layer_upsampled_by_factor_2_logits_shape = tf.stack([last_layer_logits_shape[0], last_layer_logits_shape[1] * 2,
                                                                          last_layer_logits_shape[2] * 2, last_layer_logits_shape[3]])
                last_layer_upsampled_by_factor_2_logits = tf.nn.conv2d_transpose(last_layer_logits, upsample_filter_factor_2_tensor,
                                                                                 output_shape=last_layer_upsampled_by_factor_2_logits_shape,
                                                                                 strides=[1, 2, 2, 1])
                pool4_features = end_points['fcn_8s/vgg_16/pool4']
                pool4_logits = tf.contrib.slim.conv2d(pool4_features, number_of_classes, [1, 1], activation_fn=None, normalizer_fn=None,
                                           weights_initializer=tf.zeros_initializer(), scope='pool4_fc')
                fused_last_layer_and_pool4_logits = pool4_logits + last_layer_upsampled_by_factor_2_logits
                fused_last_layer_and_pool4_logits_shape = tf.shape(fused_last_layer_and_pool4_logits)
                fused_last_layer_and_pool4_upsampled_by_factor_2_logits_shape = tf.stack([fused_last_layer_and_pool4_logits_shape[0],
                                                                                          fused_last_layer_and_pool4_logits_shape[1] * 2,
                                                                                          fused_last_layer_and_pool4_logits_shape[2] * 2,
                                                                                          fused_last_layer_and_pool4_logits_shape[3]])
                fused_last_layer_and_pool4_upsampled_by_factor_2_logits = tf.nn.conv2d_transpose(fused_last_layer_and_pool4_logits,
                                                                                                 upsample_filter_factor_2_tensor,
                                                                                                 output_shape=fused_last_layer_and_pool4_upsampled_by_factor_2_logits_shape,
                                                                                                 strides=[1, 2, 2, 1])
                pool3_features = end_points['fcn_8s/vgg_16/pool3']
                pool3_logits = tf.contrib.slim.conv2d(pool3_features, number_of_classes, [1, 1], activation_fn=None, normalizer_fn=None,
                                           weights_initializer=tf.zeros_initializer(), scope='pool3_fc')
                fused_last_layer_and_pool4_logits_and_pool_3_logits = pool3_logits + fused_last_layer_and_pool4_upsampled_by_factor_2_logits
                fused_last_layer_and_pool4_logits_and_pool_3_logits_shape = tf.shape(fused_last_layer_and_pool4_logits_and_pool_3_logits)
                fused_last_layer_and_pool4_logits_and_pool_3_upsampled_by_factor_8_logits_shape = tf.stack([
                                                                              fused_last_layer_and_pool4_logits_and_pool_3_logits_shape[0],
                                                                              fused_last_layer_and_pool4_logits_and_pool_3_logits_shape[1] * 8,
                                                                              fused_last_layer_and_pool4_logits_and_pool_3_logits_shape[2] * 8,
                                                                              fused_last_layer_and_pool4_logits_and_pool_3_logits_shape[3]])
                fused_last_layer_and_pool4_logits_and_pool_3_upsampled_by_factor_8_logits = tf.nn.conv2d_transpose(fused_last_layer_and_pool4_logits_and_pool_3_logits,
                                                                            upsample_filter_factor_8_tensor,
                                                                            output_shape=fused_last_layer_and_pool4_logits_and_pool_3_upsampled_by_factor_8_logits_shape,
                                                                            strides=[1, 8, 8, 1])
                fcn_16s_variables_mapping = {}
                fcn_8s_variables = tf.contrib.slim.get_variables(fcn_8s_scope)
                for variable in fcn_8s_variables:
                    if 'pool3_fc' in variable.name:
                        continue
                    original_fcn_16s_checkpoint_string = 'fcn_16s/' +  variable.name[len(fcn_8s_scope.original_name_scope):-2]
                    fcn_16s_variables_mapping[original_fcn_16s_checkpoint_string] = variable

        return fused_last_layer_and_pool4_logits_and_pool_3_upsampled_by_factor_8_logits, fcn_16s_variables_mapping

    def adapt_network_for_any_size_input(network_definition, multiple):
        def new_network_definition(*args, **kwargs):
            if 'image_batch_tensor' in kwargs:
                image_batch_tensor = kwargs['image_batch_tensor']
            else:
                image_batch_tensor = args[0]
                args = args[1:]
            input_image_shape = tf.shape(image_batch_tensor)
            image_height_width = input_image_shape[1:3]
            image_height_width_float = tf.to_float(image_height_width)
            image_height_width_multiple = tf.round(image_height_width_float / multiple) * multiple
            image_height_width_multiple = tf.to_int32(image_height_width_multiple)
            resized_images_batch = tf.image.resize_images(image_batch_tensor, image_height_width_multiple)
            kwargs['image_batch_tensor'] = resized_images_batch
            all_outputs = network_definition(*args, **kwargs)
            all_outputs = list(all_outputs)
            upsampled_logits_batch = all_outputs[0]
            pred = tf.argmax(upsampled_logits_batch, axis=3)
            temp_pred = tf.expand_dims(pred, 3)
            original_size_predictions = tf.image.resize_nearest_neighbor(images=temp_pred, size=image_height_width)
            all_outputs[0] = original_size_predictions
            return all_outputs
        return new_network_definition




    number_of_classes = 21
    image_tensor = tf.placeholder(tf.float32, shape=(224, 224, 3))
    image_batch_tensor = tf.expand_dims(image_tensor, axis=0)

    FCN_8sF = adapt_network_for_any_size_input(FCN_8s, 32)

    pred, fcn_8s_variables_mapping = FCN_8sF(image_batch_tensor=image_batch_tensor,  number_of_classes=number_of_classes, is_training=False)

    initializer = tf.global_variables_initializer()
    saver = tf.train.Saver()

    kernel = np.ones((5, 5),np.uint8)
    with tf.Session() as sess:
        sess.run(initializer)
        saver.restore(sess, "/Users/zzj/Documents/All/Submissions/uist17/UIST17 Program/Segmentation/checkpoints/model_fcn8s_final.ckpt")

        (w, h, c) = image.shape

        image = cv2.resize(image, (224, 224))
        image = image.astype(float)
        feed_dict_to_use = {image_tensor: image}

        image_np, pred_np = sess.run([image_tensor, pred], feed_dict=feed_dict_to_use)

        mask_np = (pred_np.squeeze()>0).astype(np.float32)
        mask_np = cv2.cvtColor(mask_np, cv2.COLOR_GRAY2RGB)
        mask_np_edge = cv2.dilate(mask_np, kernel, iterations = 3)

        mask_np_edge = cv2.resize(mask_np_edge, (h, w))
        return mask_np_edge

img = cv2.imread('/Users/zzj/Documents/All/Submissions/uist17/UIST17 Program/Data/msk_input.png', 1)
res = seg(img)
cv2.imwrite('/Users/zzj/Documents/All/Submissions/uist17/UIST17 Program/Data/msk_output.png', res*255)
