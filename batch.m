%% set up
source_path = 'D:\';
output_path = 'D:\Users\output\';

X=importdata('list_landmarks_inshop.txt','%s');

len = size(X);

% configuration of fashion cut
options = config();

% configuration for guided filter
r = 60;
eps = 10^-6;

%% load edge model first

%% Here I consider upper body image && all poses && all key points visible
name_counter = 0;
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
       landmark_for_crf = [];
       visibility_for_crf = [];
       for kidx_out = 0:5,
           kidx_in = 4 + kidx_out*3;
           visibility = str2num(chunck{kidx_in});
           x_locs = [x_locs, str2num(chunck{kidx_in+1})];
           y_locs = [y_locs, str2num(chunck{kidx_in+2})];
           if visibility==0,
               counter=counter+1;
           end
           landmark_for_crf = [landmark_for_crf, str2num(chunck{kidx_in+1}), str2num(chunck{kidx_in+2})];
           visibility_for_crf = [visibility_for_crf, visibility];
       end
       if counter==6,
           display(name_counter);
           name_counter =  name_counter+1;
%            rgb = imread([source_path, image_name]);
%            [h, w, c] = size(rgb);
%            
%            % segment rgb
%            for i=0:5,
%                landmark_for_crf(2*i+1) = landmark_for_crf(2*i+1)/w - 0.5;
%                landmark_for_crf(2*i+2) = landmark_for_crf(2*i+2)/h - 0.5;
%            end
%            
%            mask = FashionParsing(rgb, landmark_for_crf, visibility_for_crf, options);
% %            vmap = alphamask(rgb, mask, options);
%            mask = guidedfilter_color(im2double(rgb), mask, r, eps);
%            mask = repmat(mask, [1,1,3]);
%            white = im2double(ones(h,w));
%            white = repmat(white,[1,1,3]);
%            rgb = im2double(rgb);
%            rgb(:,:,1) = rgb(:,:,1).*mask(:,:,1) + white(:,:,1).*(1-mask(:,:,1));
%            rgb(:,:,2) = rgb(:,:,2).*mask(:,:,2) + white(:,:,2).*(1-mask(:,:,2));
%            rgb(:,:,3) = rgb(:,:,3).*mask(:,:,3) + white(:,:,3).*(1-mask(:,:,3));
%            rgb = im2uint8(rgb);
% %            imshow(rgb);
% %            break;
%            
%            % pose
%            pose = zeros(h, w);
%            for i=1:6,
%                pose(y_locs(i), x_locs(i)) = 255;
%            end
%            se = offsetstrel('ball',10,10);
%            pose = imdilate(pose, se);
%            pose = repmat(pose, [1,1,3]);
% 
%            edge = edgesDetect(rgb, model);
%            edge = im2uint8(1-edge);
%            edge = repmat(edge, [1,1,3]);
% 
%            res = [edge, pose, rgb];
%            
%            output_name = sprintf('%08d.jpg', name_counter);
%            name_counter = name_counter+1;
%            imwrite(res, [output_path,output_name]);
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
