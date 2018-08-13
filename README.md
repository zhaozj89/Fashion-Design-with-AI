# Set up

* `pip install -r requirements.txt`

* `cd static`, `npm install`

* `cd ..`

* `pip install redis`

* install `https://redis.io/download`

# How to use

* start `redis`

* `psiturk`

* `server on`

# Expose the server using ngrok

one terminal

* `start service on the server`

another terminal

* `ssh -L 8000:127.0.0.1:4040 zhenjie@10.89.185.156`

* `./ngrok http 22362`

* `visit http://localhost:8000`

# Use jupyter to code

* `jupyter notebook --no-browser --port=8080`

* `ssh -N -L 8080:localhost:8080 zhenjie@10.89.185.156`

* Refer to [here](http://fizzylogic.nl/2017/11/06/edit-jupyter-notebooks-over-ssh)

# Environment

*Lab workstation II:*

#### Specs:

* *System*: Ubuntu 16.04 Desktop 64bit

* *Memory*: 64GB

* *Processor*: Intel Core i9-7900 3.3GHz *  20cores

* *Graphics*: GeForce GTX 1080 Ti 12GB * 2

* *Disk*: 512GB (SSD); 4TB (HDD)

* `cuda 8.0`, `cudnn 5.1`

#### Access method:

*In 4203 via eduroam*

*can be accessed only via eduroam*

*account: your given name*

*pswd: hcihkust*

* `ssh {account}@10.89.185.156`

#### How to find a running server and kill it

* `sudo netstat -nlp`

* `sudo kill <pid>`

# Useful references

* https://dashboard.ngrok.com/get-started

* https://unix.stackexchange.com/questions/115897/whats-ssh-port-forwarding-and-whats-the-difference-between-ssh-local-and-remot
