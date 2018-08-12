from keras import backend as K

def mean_log_error(y_true, y_pred):
    return K.mean(K.log(K.square(y_pred - y_true)+1e-12), axis=-1)
