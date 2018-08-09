function options = config()
% Initialize parameters and path
    options=[];
    data_path = './fashion-cut/data/';     
    options.coeff = [data_path 'type_coeff.mat'];
    options.mean_shape = [data_path 'type_mean_shape.mat'];
    options.file_densecrf = './fashion-cut/dependency/densecrf/build/examples/dense_inference';
    options.dir_caches = './fashion-cut/caches/'; 
    options.file_results = './fashion-cut/results/';
    
    options.num_points = 6;    
    options.ployseq = [1,2,4,6,5,3];
    options.param1_densecrf = [3, 6, 1, 3];
    options.param2_densecrf = [3, 3, 2, 3];       
    options.postpro_weight = 0.4;
    options.alpha = [0.8,0.2,0.2];
        
end