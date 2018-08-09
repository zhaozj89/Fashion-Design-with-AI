%% set up
source_path = '/Users/zzj/Documents/AR/Inshop/Img/';

X=importdata('list_landmarks_inshop.txt','%s');

len = size(X);

%% load edge model (do not need it everytime)
% % set opts for training (see edgesTrain.m)
% opts=edgesTrain();                % default options (good settings)
% opts.modelDir='edges/models/';          % model will be in models/forest
% opts.modelFnm='edges/modelBsds';        % model name
% opts.nPos=5e5; opts.nNeg=5e5;     % decrease to speedup training
% opts.useParfor=0;                 % parallelize if sufficient memory
% 
% % train edge detector (~20m/8Gb per tree, proportional to nPos/nNeg)
% tic, model=edgesTrain(opts); toc; % will load model if already trained
% 
% % set detection parameters (can set after training)
% model.opts.multiscale=0;          % for top accuracy set multiscale=1
% model.opts.sharpen=2;             % for top speed set sharpen=0
% model.opts.nTreesEval=4;          % for top speed set nTreesEval=1
% model.opts.nThreads=4;            % max number threads for evaluation
% model.opts.nms=0;                 % set to true to enable nms

%% Here I consider upper body image && all poses && all key points visible
for idx = 1:len,
   input = strtrim(X{idx});
   chunck = strsplit(input, ' ');
   image_name = [chunck{1}];
   cloth_type = str2num(chunck{2});
   pose_type = str2num(chunck{3});
   
   if cloth_type == 1,
       counter = 0;
       x_locs = [];
       y_locs = [];
       for kidx_out = 0:5,
           kidx_in = 4 + kidx_out*3;
           visibility = str2num(chunck{kidx_in});
           x_locs = [x_locs, str2num(chunck{kidx_in+1})];
           y_locs = [y_locs, str2num(chunck{kidx_in+2})];
           if visibility==0,
               counter=counter+1;
           end
       end
       if counter==6,
           rgb = imread([source_path, image_name]);
           
           % pose
           [h, w, c] = size(rgb);
           pose = zeros(h, w);
           for i=1:6,
               pose(y_locs(i), x_locs(i)) = 255;
           end
           se = offsetstrel('ball',5,5);
           pose = imdilate(pose, se);
           pose = cat(3, pose, pose, pose);

           res = [rgb, pose];
           imshow(res);
%            edge = edgesDetect(rgb, model);
%            edge = im2uint8(1-edge);
            break;
           
       end
   end
end


% I = imread('peppers.png');
% tic, E=edgesDetect(I,model); toc
% figure(1); im(I); figure(2); im(im2uint8(1-E));

% Im = imread('peppers.png');
% S = L0Smoothing(Im,0.01);
% S = im2uint8(S);
% figure, imshow(S);
