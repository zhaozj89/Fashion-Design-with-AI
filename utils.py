import tensorflow as tf

# from https://gist.github.com/joelthchao/ef6caa586b647c3c032a4f84d52e3a11
def write_log(callback, names, logs, batch_num):
    for name, value in zip(names, logs):
        summary = tf.Summary()
        summary_value = summary.value.add()
        summary_value.simple_value = value
        summary_value.tag = name
        callback.writer.add_summary(summary, batch_num)
        callback.writer.flush()
