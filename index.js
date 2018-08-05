const model = new KerasJS.Model({
    filepath: './saved_model/my_model.bin',
    gpu: true
});

var ndarray = require("ndarray");


model.ready()
.then(
    () => {
        console.log(model);
        let input_image = ndarray(new Float32Array(256*256*3), [256, 256, 3]);
        return model.predict({"input_3": input_image.data});
    }
)
.then(
    outputData => {
        console.log(outputData);
    }
)
.catch(
    error => {
        console.log(error);
    }
);
