var ndarray = require("ndarray");
var imshow = require("ndarray-imshow");
var savePixels = require("save-pixels");
var getPixels = require("get-pixels");
// var fill = require("ndarray-fill");
// var cwise = require("cwise");
var ops = require("ndarray-ops");
var morphology = require("ball-morphology");

const model1 = new KerasJS.Model({
    filepath: './models/stage1-epoch-150.bin',
    gpu: true
});

///////////////////////////
// OpenCV to ndarray, and vice versas
///////////////////////////
// var OneChannelFloat32_NDArray_To_OneChannelUint8_OpenCV = function(input) {
//     let cols = input.shape[0];
//     let rows = input.shape[1];
//     let output = new cv.Mat(rows, cols, cv.CV_8U1C);
//     console.log(input);
//     console.log(output);
//     for(let i=0; i<rows; ++i) {
//         for(let j=0; j<cols; ++j) {
//             let pixel = output.ucharPtr(i, j);
//             console.log(pixel);
//             let val = input.get(i,j);
//             pixel[0] = Math.floor(255*val);
//         }
//     }
//     return output;
// }
//
// var OneChannelUint8_OpenCV_To_OneChannelFloat32_NDArray = function(input) {
//     let cols = input.cols;
//     let rows = input.rows;
//     let output = ndarray(new Uint32Array(cols*rows), [cols, rows]);
//     for(let i=0; i<rows; ++i) {
//         for(let j=0; j<cols; ++j) {
//             let pixel = input.ucharPtr(i, j);
//             input.set(i,j,pixel[0]/255.0);
//         }
//     }
//     return output;
// }

///////////////////////////
// Image Processing
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
            output.set(i,j,0, Math.floor(255*val0));
            output.set(i,j,1, Math.floor(255*val1));
            output.set(i,j,2, Math.floor(255*val2));
            output.set(i,j,3, 255);
        }
    }
    return output;
}

GLOBAL.MakeLandmarkImage = function(){
    var width = 256;
    var height = 256;
    var black_image = ndarray(new Float32Array(width*height), [width, height]);
    ops.assigns(black_image, 0.0)

    // black_image = Downsampling_2D_OneChannelFloat32_NDArray(black_image, 256, 256);

    for(el of GLOBAL.landmarks) {
        let circle_position = GetCirclePosition(el);
        black_image.set(Math.floor(width*circle_position[0]/GLOBAL.width),
                        Math.floor(height*circle_position[1]/GLOBAL.height), 1.0);
    }

    black_image = morphology.dilate(black_image, 10);

    // imshow(OneChannelFloat32_NDArray_To_ThreeChannelUint32_NDArray(black_image));

    ops.mulseq(black_image, 2.0);
    ops.subseq(black_image, 1.0);

    black_image = OneChannelFloat32_NDArray_To_ThreeChannelFloat32_NDArray(black_image);

    return black_image;

}

GLOBAL.ShowImageCanvas = function(input) {
    $('#ImageCanvas').remove();

    imshow(input);


    var input4 = ThreeChannelFloat32_NDArray_To_FourChannelUint32_NDArray(input);

    console.log(input4);

    var image_canvas = savePixels(input4, "canvas");
    $(image_canvas).attr('id', 'ImageCanvas');
    $('body').append(image_canvas);
}

GLOBAL.RunStage_1_Model = RunStage_1_Model;

async function RunStage_1_Model(input) {
    try {
        await model1.ready();
        output = await model1.predict({"input_6": input.data});
        var output_image = ndarray(output[Object.keys(output)[0]], [256, 256, 3]);
        ops.mulseq(output_image, 0.5);
        ops.addseq(output_image, 0.5);
        console.log(output_image);
        return output_image;
    } catch(err){
        console.log(err);
    }
    // model1.ready()
    // .then(
    //     () => {
    //         return model1.predict({"input_6": input.data});
    //     }
    // )
    // .then(
    //     output => {
    //         var output_image = ndarray(output[Object.keys(output)[0]], [256, 256, 3]);
    //         ops.mulseq(output_image, 0.5);
    //         ops.addseq(output_image, 0.5);
    //         console.log(output_image);
    //         return output_image;
    //     }
    // )
    // .catch(
    //     error => {
    //         console.log(error);
    //     }
    // );
}

// let input_image = ndarray(new Float32Array(256*256*3), [256, 256, 3]);
// console.log(savePixels(input_image, "png"));

// imshow(input_image);

//
// const model2 = new KerasJS.Model({
//     filepath: './models/stage2-epoch-150.bin',
//     gpu: true
// });

// model1.ready()
// .then(
//     () => {
//         console.log(model1);
//         for(var el in GLOBAL.landmarks) {
//             console.log(GetCirclePosition(el));
//         }
//         // let input_image = ndarray(new Float32Array(256*256*3), [256, 256, 3]);
//         // return model.predict({"input_6": input_image.data});
//     }
// )
// .then(
//     // outputData => {
//     //     console.log(outputData);
//     // }
// )
// .catch(
//     error => {
//         console.log(error);
//     }
// );
//
// model2.ready()
// .then(
//     () => {
//         console.log(model2);
//         // let input_image = ndarray(new Float32Array(256*256*3), [256, 256, 3]);
//         // return model.predict({"input_7": input_image.data});
//     }
// )
// .then(
//     // outputData => {
//     //     console.log(outputData);
//     // }
// )
// .catch(
//     error => {
//         console.log(error);
//     }
// );
