from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import numpy as np
import argparse
import json

import tensorflow as tf
import cv2

def multiply(a,b):
    print(tf.__version__)
    print(cv2.__version__)
    print("Will compute", a, "times", b)
    c = 0
    for i in range(0, a):
        c = c + b
    return c
