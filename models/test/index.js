const ndarray = require("ndarray");
const savePixels = require("save-pixels");
const getPixels = require("get-pixels");
const ops = require("ndarray-ops");
const fs = require('fs');
const KerasJS = require('keras-js');

// const model1 = new KerasJS.Model({
//     filepath: '../stage1-epoch-150.bin',
//     filesystem: true
// });

const model2 = new KerasJS.Model({
    filepath: '../stage2-epoch-150.bin',
    filesystem: true
});

// stage1
// getPixels("landmark.jpg", async function(err, pixels) {
//     height = pixels.shape[0];
//     width = pixels.shape[1];
//
//     let input = ndarray(new Float32Array(width * height * 3), [width, height, 3])
//     ops.assign(input.pick(null, null, 0), pixels.pick(null, null, 0));
//     ops.assign(input.pick(null, null, 1), pixels.pick(null, null, 1));
//     ops.assign(input.pick(null, null, 2), pixels.pick(null, null, 2));
//
//     ops.divseq(input, 127.5);
//     ops.subseq(input, 1);
//
//     console.log('loading model');
//     await model1.ready();
//     console.log('loading finished');
//     let output = await model1.predict({"input_6": input.data});
//     console.log('predicting finished');
//     let output_ndarray = ndarray(output[Object.keys(output)[0]], [256, 256, 3]);
//
//     ops.mulseq(output_ndarray, 0.5);
//     ops.addseq(output_ndarray, 0.5);
//
//     savePixels(output_ndarray, "png").pipe(fs.createWriteStream('stage1.png'))
// });

// stage2
getPixels("stage1.png", function(err, pixels) {
    height = pixels.shape[0];
    width = pixels.shape[1];

    let stage1 = ndarray(new Float32Array(width * height * 3), [width, height, 3]);
    ops.assign(stage1.pick(null, null, 0), pixels.pick(null, null, 0));
    ops.assign(stage1.pick(null, null, 1), pixels.pick(null, null, 1));
    ops.assign(stage1.pick(null, null, 2), pixels.pick(null, null, 2));

    ops.subseq(stage1, 2.0);
    ops.mulseq(stage1, 0.5);

    getPixels("sketch.jpg", async function(err, pixels){
        height = pixels.shape[0];
        width = pixels.shape[1];

        let stage2 = ndarray(new Float32Array(width * height * 3), [width, height, 3]);
        ops.assign(stage2.pick(null, null, 0), pixels.pick(null, null, 0));
        ops.assign(stage2.pick(null, null, 1), pixels.pick(null, null, 1));
        ops.assign(stage2.pick(null, null, 2), pixels.pick(null, null, 2));

        ops.divseq(stage2, 127.5);
        ops.subseq(stage2, 1.0);

        // concatenate
        let input = ndarray(new Float32Array(width * height * 6), [width, height, 6]);
        ops.assign(input.pick(null, null, 0), stage1.pick(null, null, 0));
        ops.assign(input.pick(null, null, 1), stage1.pick(null, null, 1));
        ops.assign(input.pick(null, null, 2), stage1.pick(null, null, 2));
        ops.assign(input.pick(null, null, 3), stage2.pick(null, null, 0));
        ops.assign(input.pick(null, null, 4), stage2.pick(null, null, 1));
        ops.assign(input.pick(null, null, 5), stage2.pick(null, null, 2));

        console.log('loading model');
        await model2.ready();
        console.log('loading finished');
        let output = await model2.predict({"input_7": input.data});
        console.log('predicting finished');
        let output_ndarray = ndarray(output[Object.keys(output)[0]], [256, 256, 3]);

        ops.mulseq(output_ndarray, 0.5);
        ops.addseq(output_ndarray, 0.5);

        ops.mulseq(output_ndarray, 255);

        savePixels(output_ndarray, "png").pipe(fs.createWriteStream('stage2.png'))
    });
});
