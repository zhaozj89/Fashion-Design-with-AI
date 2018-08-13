var ndarray = require("ndarray");
var savePixels = require("save-pixels");
var getPixels = require("get-pixels");
var ops = require("ndarray-ops");
var morphology = require("ball-morphology");

// const model1 = new KerasJS.Model({
//     filepath: '../models/stage1-epoch-150.bin',
//     gpu: true
// });

const model2 = new KerasJS.Model({
    filepath: '../models/stage2-epoch-150.bin',
    gpu: true
});

///////////////////////////
// Image processing
///////////////////////////
var Downsampling_2D_OneChannelFloat32_NDArray = function(input, rows, cols){
    let width = input.shape[0];
    let height = input.shape[1];

    let output = ndarray(new Float32Array(rows*cols), [cols, rows, 1]);
    for(let i=0; i<rows; ++i) {
        for(let j=0; j<cols; ++j) {
            let idx_i = Math.floor(i*height/rows);
            let idx_j = Math.floor(j*width/cols);
            let val = input.get(idx_i,idx_j);
            output.set(i,j,val);
        }
    }
    return output;
}

var OneChannelFloat32_NDArray_To_ThreeChannelFloat32_NDArray = function(input){
    let width = input.shape[0];
    let height = input.shape[1];

    let output = ndarray(new Float32Array(width*height*3), [width, height, 3]);
    for(let i=0; i<height; ++i) {
        for(let j=0; j<width; ++j) {
            let val = input.get(i,j);
            output.set(i,j,0, val);
            output.set(i,j,1, val);
            output.set(i,j,2, val);
        }
    }
    return output;
}

var OneChannelFloat32_NDArray_To_FourChannelUint32_NDArray = function(input){
    let width = input.shape[0];
    let height = input.shape[1];

    let output = ndarray(new Uint32Array(width*height*4), [width, height, 4]);
    for(let i=0; i<height; ++i) {
        for(let j=0; j<width; ++j) {
            let val = input.get(i,j);
            output.set(i,j,0, Math.floor(255*val));
            output.set(i,j,1, Math.floor(255*val));
            output.set(i,j,2, Math.floor(255*val));
            output.set(i,j,3, 255);
        }
    }
    return output;
}

var OneChannelFloat32_NDArray_To_ThreeChannelUint32_NDArray = function(input){
    let width = input.shape[0];
    let height = input.shape[1];

    let output = ndarray(new Uint32Array(width*height*3), [width, height, 3]);
    for(let i=0; i<height; ++i) {
        for(let j=0; j<width; ++j) {
            let val = input.get(i,j);
            output.set(i,j,0, Math.floor(255*val));
            output.set(i,j,1, Math.floor(255*val));
            output.set(i,j,2, Math.floor(255*val));
        }
    }
    return output;
}

var ThreeChannelFloat32_NDArray_To_FourChannelUint32_NDArray = function(input){
    let width = input.shape[0];
    let height = input.shape[1];

    let output = ndarray(new Uint32Array(width*height*4), [width, height, 4]);
    for(let i=0; i<height; ++i) {
        for(let j=0; j<width; ++j) {
            let val0 = input.get(i,j,0);
            let val1 = input.get(i,j,1);
            let val2 = input.get(i,j,2);
            output.set(i,j,0,val0);
            output.set(i,j,1,val1);
            output.set(i,j,2,val2);
            output.set(i,j,3,255);
        }
    }
    return output;
}


///////////////////////////
// Main functions
///////////////////////////
var MakeLandmarkImage = function(){
    var width = 256;
    var height = 256;
    var black_image = ndarray(new Float32Array(width*height), [width, height]);
    ops.assigns(black_image, 0.0)

    for(el of GLOBAL.landmarks) {
        let circle_position = GetCirclePosition(el);
        black_image.set(Math.floor(width*circle_position[0]/GLOBAL.width),
                        Math.floor(height*circle_position[1]/GLOBAL.height), 1.0);
    }

    black_image = morphology.dilate(black_image, 10);

    ops.mulseq(black_image, 2.0);
    ops.subseq(black_image, 1.0);

    black_image = OneChannelFloat32_NDArray_To_ThreeChannelFloat32_NDArray(black_image);

    return black_image;

}

GLOBAL.ShowImageCanvas = function(input) {
    $('#ImageCanvas').remove();

    var input4 = ThreeChannelFloat32_NDArray_To_FourChannelUint32_NDArray(input);

    // console.log(input4);

    var image_canvas = savePixels(input4, "canvas");
    $(image_canvas).attr('id', 'ImageCanvas');
    $('body').append(image_canvas);
}

GLOBAL.Load_Models = async function () {
    await model1.ready();
    await model2.ready();
    return true;
}

GLOBAL.Infer = async function (){
    // stage 1
    // let stage1_input_ndarray = MakeLandmarkImage();
    // console.log('loading model1');
    // await model1.ready();
    // console.log('loading model1 finished');
    // let stage1_output = await model1.predict({"input_6": stage1_input_ndarray.data});
    // console.log('model1 predicting finished');
    // let stage1_output_ndarray = ndarray(stage1_output[Object.keys(stage1_output)[0]], [256, 256, 3]);
    //
    // console.log(stage1_output_ndarray);

    // getPixels("../models/test/sketch.jpg", async function(err, pixels) {
        // let stage1 = ndarray(new Float32Array(256 * 256 * 3), [256, 256, 3]);
        // ops.assign(stage1.pick(null, null, 0), pixels.pick(null, null, 0));
        // ops.assign(stage1.pick(null, null, 1), pixels.pick(null, null, 1));
        // ops.assign(stage1.pick(null, null, 2), pixels.pick(null, null, 2));
        //
        // // ops.subseq(stage1, 2.0);
        // // ops.mulseq(stage1, 0.5);
        //
        // ops.divseq(stage1, 127.5);
        // ops.subseq(stage1, 1.0);

        getPixels("../models/test/sketch.jpg", async function(err, pixels){
            // height = pixels.shape[0];
            // width = pixels.shape[1];

            // var data = {};

            let stage2 = ndarray(new Float32Array(256 * 256 * 3), [256, 256, 3]);
            ops.assign(stage2.pick(null, null, 0), pixels.pick(null, null, 0));
            ops.assign(stage2.pick(null, null, 1), pixels.pick(null, null, 1));
            ops.assign(stage2.pick(null, null, 2), pixels.pick(null, null, 2));

            // ops.mulseq(stage2, 255.0);

            // data['input'] = stage2.data;
            //
            ops.divseq(stage2, 127.5);
            ops.subseq(stage2, 1.0);
            //
            // // concatenate
            let input = ndarray(new Float32Array(256 * 256 * 6), [256, 256, 6]);
            ops.assign(input.pick(null, null, 0), stage2.pick(null, null, 0));
            ops.assign(input.pick(null, null, 1), stage2.pick(null, null, 1));
            ops.assign(input.pick(null, null, 2), stage2.pick(null, null, 2));
            ops.assign(input.pick(null, null, 3), stage2.pick(null, null, 0));
            ops.assign(input.pick(null, null, 4), stage2.pick(null, null, 1));
            ops.assign(input.pick(null, null, 5), stage2.pick(null, null, 2));

            await model2.ready();
            let output = await model2.predict({"input_7": input.data});
            let output_ndarray = ndarray(output[Object.keys(output)[0]], [256, 256, 3]);

            ops.mulseq(output_ndarray, 127.5);
            ops.addseq(output_ndarray, 127.5);

            // // console.log(output_ndarray);
            //
            // data['output'] = output_ndarray.data;
            //
            // var json = JSON.stringify(data);
            // var blob = new Blob([json], {type: "application/json"});
            // var url  = URL.createObjectURL(blob);
            //
            // var a = document.createElement('a');
            // a.download    = "backup.json";
            // a.href        = url;
            // a.textContent = "Download backup.json";
            //
            // a.click();
            //
            GLOBAL.ShowImageCanvas(output_ndarray);
        });
    // });
    // // stage 2
    // getPixels("./models/test/sketch.jpg", async function(err, pixels){
    //     height = pixels.shape[0];
    //     width = pixels.shape[1];
    //
    //     let stage2_image_ndarray = ndarray(new Float32Array(width * height * 3), [width, height, 3]);
    //     ops.assign(stage2_image_ndarray.pick(null, null, 0), pixels.pick(null, null, 0));
    //     ops.assign(stage2_image_ndarray.pick(null, null, 1), pixels.pick(null, null, 1));
    //     ops.assign(stage2_image_ndarray.pick(null, null, 2), pixels.pick(null, null, 2));
    //
    //     ops.divseq(stage2_image_ndarray, 127.5);
    //     ops.subseq(stage2_image_ndarray, 1.0);
    //
    //     // concatenate
    //     let stage2_input_ndarray = ndarray(new Float32Array(width * height * 6), [width, height, 6]);
    //     ops.assign(stage2_input_ndarray.pick(null, null, 0), stage1_output_ndarray.pick(null, null, 0));
    //     ops.assign(stage2_input_ndarray.pick(null, null, 1), stage1_output_ndarray.pick(null, null, 1));
    //     ops.assign(stage2_input_ndarray.pick(null, null, 2), stage1_output_ndarray.pick(null, null, 2));
    //     ops.assign(stage2_input_ndarray.pick(null, null, 3), stage2_image_ndarray.pick(null, null, 0));
    //     ops.assign(stage2_input_ndarray.pick(null, null, 4), stage2_image_ndarray.pick(null, null, 1));
    //     ops.assign(stage2_input_ndarray.pick(null, null, 5), stage2_image_ndarray.pick(null, null, 2));
    //
    //     console.log('loading model2');
    //     // await model2.ready();
    //     console.log('loading model2 finished');
    //     let stage2_output = await model2.predict({"input_7": stage2_input_ndarray.data});
    //     console.log('model2 predicting finished');
    //     let stage2_output_ndarray = ndarray(stage2_output[Object.keys(stage2_output)[0]], [256, 256, 3]);
    //     ops.mulseq(stage2_output_ndarray, 0.5);
    //     ops.addseq(stage2_output_ndarray, 0.5);
    //
    //     console.log(stage2_output_ndarray);
    //
    //     ops.mulseq(stage2_output_ndarray, 255);
    //     GLOBAL.ShowImageCanvas(stage2_output_ndarray);
    // });
}
