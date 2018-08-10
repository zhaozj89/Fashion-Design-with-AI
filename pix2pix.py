# from https://github.com/eriklindernoren/Keras-GAN
from __future__ import print_function, division

import tensorflow as tf
from keras import backend as K

# Tensoflow configuration

num_cores = 4
GPU = True
CPU = False
if GPU:
    num_GPU = 2
    num_CPU = 1
if CPU:
    num_CPU = 1
    num_GPU = 0

gpu_options = tf.GPUOptions(allow_growth=True)
# config = tf.ConfigProto(gpu_options=gpu_options)

config = tf.ConfigProto(intra_op_parallelism_threads=num_cores,\
        inter_op_parallelism_threads=num_cores, allow_soft_placement=True,\
        device_count = {'CPU' : num_CPU, 'GPU' : num_GPU}, gpu_options=gpu_options)
session = tf.Session(config=config)
K.set_session(session)

from keras.layers import Input, Dense, Reshape, Flatten, Dropout, Concatenate
from keras.layers import BatchNormalization, Activation, ZeroPadding2D
from keras.layers.advanced_activations import LeakyReLU
from keras.layers.convolutional import UpSampling2D, Conv2D
from keras_contrib.layers.normalization import InstanceNormalization

from keras.models import Model
from keras.optimizers import Adam

from keras.callbacks import TensorBoard

import tensorflow as tf

import numpy as np
import os
import datetime
import sys
import matplotlib.pyplot as plt

from data_loader import DataLoader
<<<<<<< HEAD
from layer import *
from utils import *
from loss import *
=======

# from https://gist.github.com/joelthchao/ef6caa586b647c3c032a4f84d52e3a11
def write_log(callback, names, logs, batch_num):
    for name, value in zip(names, logs):
        summary = tf.Summary()
        summary_value = summary.value.add()
        summary_value.simple_value = value
        summary_value.tag = name
        callback.writer.add_summary(summary, batch_num)
        callback.writer.flush()
>>>>>>> parent of 409cb5e... revise pix2pix

class Pix2Pix():
    def __init__(self):
        # Input shape
        self.img_rows = 256
        self.img_cols = 256
        self.channels = 3
        self.img_shape = (self.img_rows, self.img_cols, self.channels)

        # I assumpe you will load the data wisely
        self.data_loader = DataLoader(img_size=(self.img_rows, self.img_cols))

        # Calculate output shape of D (PatchGAN)
        patch = int(self.img_rows / 2**4)
        self.disc_patch = (patch, patch, 1)

        # Number of filters in the first layer of G and D
        self.gf = 64
        self.df = 64

        optimizer = Adam(0.0002, 0.5)

<<<<<<< HEAD
        # Input images and their conditioning images
        img_A = Input(shape=self.img_shape) # sketch
        img_B = Input(shape=self.img_shape) # pose
        img_C = Input(shape=self.img_shape) # image
=======
        # Build and compile the discriminator
        self.discriminator = self.build_discriminator()
        self.discriminator.compile(loss='mse',
                                   optimizer=optimizer,
                                   metrics=['accuracy'])
>>>>>>> parent of 409cb5e... revise pix2pix

        #-------------------------
        # Construct Computational Graph of Discriminator
        #-------------------------
        # self.discriminator_stage1 = self.build_discriminator()
        # self.discriminator_stage1.compile(loss='mse', optimizer=optimizer, metrics=['accuracy'])

<<<<<<< HEAD
        self.discriminator_stage2 = self.build_discriminator()
        self.discriminator_stage2.compile(loss='mse', optimizer=optimizer, metrics=['accuracy'])

        #-------------------------
        # Construct Computational Graph of Generator
        #-------------------------
        self.generator_stage1 = self.build_generator()
        self.generator_stage2 = self.build_generator()

        fake_A = self.generator_stage1(img_B)
        # sketch_A = keras.layers.Add()([fake_A, img_A])
        sketch_A = MyMerge()([fake_A, img_A])
        fake_C = self.generator_stage2(sketch_A)

        # For the combined model we will only train the generator
        # self.discriminator_stage1.trainable = False
        self.discriminator_stage2.trainable = False

        # Discriminators determines validity of translated images / condition pairs
        # valid_stage1 = self.discriminator_stage1([fake_A, img_B])
        valid_stage2 = self.discriminator_stage2([fake_C, sketch_A])

        # self.combined_stage1 = Model(inputs=[img_A, img_B], outputs=[valid_stage1, fake_A])
        # self.combined_stage1.compile(loss=['mse', 'mae'], loss_weights=[1, 100], optimizer=optimizer)

        self.combined_stage2 = Model(inputs=[img_A, img_B, img_C], outputs=[valid_stage2, fake_C])
        self.combined_stage2.compile(loss=['mse', 'mae'], loss_weights=[1, 100], optimizer=optimizer)
=======
        # Build the generator
        self.generator = self.build_generator()

        # Input images and their conditioning images
        img_A = Input(shape=self.img_shape)
<<<<<<< HEAD
        img_B = Input(shape=self.img_shape)
=======
        # img_B = Input(shape=self.img_shape)
        img_C = Input(shape=self.img_shape)

        # By conditioning on X generate a fake version of X
        fake_C = self.generator(img_A) # sketch
        # fake_B = self.generator(img_B) # pose
>>>>>>> parent of 5685d47... Update

        # By conditioning on B generate a fake version of A
        fake_A = self.generator(img_B)

        # For the combined model we will only train the generator
        # self.discriminator.trainable = False

        # Discriminators determines validity of translated images / condition pairs
        valid = self.discriminator([fake_A, img_B])

<<<<<<< HEAD
        self.combined = Model(inputs=[img_A, img_B], outputs=[valid, fake_A])
        self.combined.compile(loss=['mse', 'mae'],
                              loss_weights=[1, 100],
                              optimizer=optimizer)
>>>>>>> parent of 409cb5e... revise pix2pix
=======
        self.combined = Model(inputs=[img_A, img_C], outputs=[valid, fake_C])
        self.combined.compile(loss=['mse', 'mae'], loss_weights=[1, 100], optimizer=optimizer)
>>>>>>> parent of 5685d47... Update

        self.tb_callback = TensorBoard(log_dir='./logs', write_graph=True, write_grads=True, write_images=True)
        self.tb_callback.set_model(self.combined_stage2)

    def build_generator(self):
        """U-Net Generator"""

        def conv2d(layer_input, filters, f_size=4, bn=True):
            """Layers used during downsampling"""
            d = Conv2D(filters, kernel_size=f_size, strides=2, padding='same')(layer_input)
            d = LeakyReLU(alpha=0.2)(d)
            if bn:
                d = BatchNormalization(momentum=0.8)(d)
            return d

        def deconv2d(layer_input, skip_input, filters, f_size=4, dropout_rate=0):
            """Layers used during upsampling"""
            u = UpSampling2D(size=2)(layer_input)
            u = Conv2D(filters, kernel_size=f_size, strides=1, padding='same', activation='relu')(u)
            if dropout_rate:
                u = Dropout(dropout_rate)(u)
            u = BatchNormalization(momentum=0.8)(u)
            u = Concatenate()([u, skip_input])
            return u

        # Image input
        d0 = Input(shape=self.img_shape)

        # Downsampling
        d1 = conv2d(d0, self.gf, bn=False)
        d2 = conv2d(d1, self.gf*2)
        d3 = conv2d(d2, self.gf*4)
        d4 = conv2d(d3, self.gf*8)
        d5 = conv2d(d4, self.gf*8)
        d6 = conv2d(d5, self.gf*8)
        d7 = conv2d(d6, self.gf*8)

        # Upsampling
        u1 = deconv2d(d7, d6, self.gf*8)
        u2 = deconv2d(u1, d5, self.gf*8)
        u3 = deconv2d(u2, d4, self.gf*8)
        u4 = deconv2d(u3, d3, self.gf*4)
        u5 = deconv2d(u4, d2, self.gf*2)
        u6 = deconv2d(u5, d1, self.gf)

        u7 = UpSampling2D(size=2)(u6)
        output_img = Conv2D(self.channels, kernel_size=4, strides=1, padding='same', activation='tanh')(u7)

        return Model(d0, output_img)

    def build_discriminator(self):

        def d_layer(layer_input, filters, f_size=4, bn=True):
            """Discriminator layer"""
            d = Conv2D(filters, kernel_size=f_size, strides=2, padding='same')(layer_input)
            d = LeakyReLU(alpha=0.2)(d)
            if bn:
                d = BatchNormalization(momentum=0.8)(d)
            return d

        img_A = Input(shape=self.img_shape)
        img_B = Input(shape=self.img_shape)

        # Concatenate image and conditioning image by channels to produce input
        combined_imgs = Concatenate(axis=-1)([img_A, img_B])

        d1 = d_layer(combined_imgs, self.df, bn=False)
        d2 = d_layer(d1, self.df*2)
        d3 = d_layer(d2, self.df*4)
        d4 = d_layer(d3, self.df*8)

        validity = Conv2D(1, kernel_size=4, strides=1, padding='same')(d4)

        return Model([img_A, img_B], validity)

    def train(self, epochs, batch_size=1, sample_interval=50):

        start_time = datetime.datetime.now()

        # Adversarial loss ground truths
        valid = np.ones((batch_size,) + self.disc_patch)
        fake = np.zeros((batch_size,) + self.disc_patch)

        for epoch in range(epochs):
            for batch_i, (imgs_A, imgs_B) in enumerate(self.data_loader.load_batch(batch_size)):

                # ---------------------
                #  Train Discriminator
                # ---------------------
<<<<<<< HEAD
                fake_A = self.generator_stage2.predict(imgs_B)
                sketch_A = 0*fake_A + 1*imgs_A
                fake_C = self.generator_stage2.predict(sketch_A)

<<<<<<< HEAD
                # Train the discriminators (original images = Real / generated = Fake)
                # d_loss_real_stage1 = self.discriminator_stage1.train_on_batch([imgs_A, imgs_B], valid)
                # d_loss_fake_stage1 = self.discriminator_stage1.train_on_batch([fake_A, imgs_B], fake)
                # d_loss_stage1 = 0.5 * np.add(d_loss_real_stage1, d_loss_fake_stage1)

                d_loss_real_stage2 = self.discriminator_stage2.train_on_batch([imgs_C, sketch_A], valid)
                d_loss_fake_stage2 = self.discriminator_stage2.train_on_batch([fake_C, sketch_A], fake)
                d_loss_stage2 = 0.5 * np.add(d_loss_real_stage2, d_loss_fake_stage2)
=======
                # Condition on B and generate a translated version
                fake_A = self.generator.predict(imgs_B)
=======

                # Condition on A, B and generate translated versions
                fake_C = self.generator.predict(imgs_A)
                # fake_B = self.generator.predict(imgs_B)
                # fake_C = 0.4*fake_A + 0.6*fake_B
>>>>>>> parent of 5685d47... Update

                # Train the discriminators (original images = real / generated = Fake)
                d_loss_real = self.discriminator.train_on_batch([imgs_A, imgs_B], valid)
                d_loss_fake = self.discriminator.train_on_batch([fake_A, imgs_B], fake)
                d_loss = 0.5 * np.add(d_loss_real, d_loss_fake)
>>>>>>> parent of 409cb5e... revise pix2pix

                # -----------------
                #  Train Generator
                # -----------------
                # g_loss_stage1 = self.combined_stage1.train_on_batch([imgs_A, imgs_B], [valid, imgs_A])
                g_loss_stage2 = self.combined_stage2.train_on_batch([imgs_A, imgs_B, imgs_C], [valid, imgs_C])

<<<<<<< HEAD
                write_log(self.tb_callback,self.combined_stage2.metrics_names,
                          g_loss_stage2, batch_i)
=======
                # Train the generators
<<<<<<< HEAD
                g_loss = self.combined.train_on_batch([imgs_A, imgs_B], [valid, imgs_A])
=======
                g_loss = self.combined.train_on_batch([imgs_A, imgs_C], [valid, imgs_C])
>>>>>>> parent of 5685d47... Update

                write_log(self.tb_callback, ['train_loss', 'train_mae'], g_loss, batch_i)
>>>>>>> parent of 409cb5e... revise pix2pix

                elapsed_time = datetime.datetime.now() - start_time
                # Plot the progress
                print ("[Epoch %d/%d] [Batch %d/%d] [D loss: %f, acc: %3d%%] [G loss: %f] time: %s" % (epoch, epochs,
                                                                        batch_i, self.data_loader.n_batches,
                                                                        d_loss[0], 100*d_loss[1],
                                                                        g_loss[0],
                                                                        elapsed_time))

                # If at save interval => save generated image samples
                if batch_i % sample_interval == 0:
                    self.sample_images(epoch, batch_i)

            self.generator_stage1.save('./saved_model/stage1-epoch-{}.h5'.format(epoch))
            self.generator_stage2.save('./saved_model/stage2-epoch-{}.h5'.format(epoch))

    def sample_images(self, epoch, batch_i):
        os.makedirs('images/%s' % self.dataset_name, exist_ok=True)
        r, c = 3, 3

<<<<<<< HEAD
        imgs_A, imgs_B, imgs_C = self.data_loader.load_data(batch_size=3, is_testing=False)
<<<<<<< HEAD
        fake_A = self.generator_stage2.predict(imgs_B)
        sketch_A = 0 * fake_A + 1 * imgs_A
        fake_C = self.generator_stage2.predict(sketch_A)
=======
        imgs_A, imgs_B = self.data_loader.load_data(batch_size=3, is_testing=True)
        fake_A = self.generator.predict(imgs_B)
>>>>>>> parent of 409cb5e... revise pix2pix
=======
        fake_C = self.generator.predict(imgs_A)
        # fake_B = self.generator.predict(imgs_B)
        # fake_C = 0.4*fake_A + 0.6*fake_B
>>>>>>> parent of 5685d47... Update

        gen_imgs = np.concatenate([imgs_B, fake_A, imgs_A])

        # Rescale images 0 - 1
        gen_imgs = 0.5 * gen_imgs + 0.5

        titles = ['Condition', 'Generated', 'Original']
        fig, axs = plt.subplots(r, c)
        cnt = 0
        for i in range(r):
            for j in range(c):
                axs[i,j].imshow(gen_imgs[cnt])
                axs[i, j].set_title(titles[i])
                axs[i,j].axis('off')
                cnt += 1
        fig.savefig("images/%s/%d_%d.png" % (self.dataset_name, epoch, batch_i))
        plt.close()

if __name__ == '__main__':
    gan = Pix2Pix()
    gan.train(epochs=400, batch_size=10, sample_interval=20)
