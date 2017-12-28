///**************************************************************************************
//The structered edge demo requires you to provide a model.
//This model can be found at the opencv_extra repository on Github on the following link:
//https://github.com/opencv/opencv_extra/blob/master/testdata/cv/ximgproc/model.yml.gz
//***************************************************************************************/
//
//#include <opencv2/ximgproc.hpp>
//#include <opencv2/highgui/highgui.hpp>
//#include <opencv2/imgproc/imgproc.hpp>
//#include <opencv2/core/core.hpp>
//#include <opencv2/core/utility.hpp>
//
//#include <iostream>
//#include <cstring>
//#include <cstdio>
//#include <cstdlib>
//#include <string>
//
//#include "dirent.h"
//#include "pixel.h"
//
//using namespace std;
//using namespace cv;
//using namespace cv::ximgproc;
//
//int main(int argc, const char** argv)
//{
//	string src_path = "C:\\Users\\zzhaoao\\Desktop\\Hanfu01_seg\\";
//	string gray_path = "C:\\Users\\zzhaoao\\Desktop\\Hanfu01_gray\\";
//	string edge_path = "C:\\Users\\zzhaoao\\Desktop\\Hanfu01_edge\\";
//	string mask_path = "C:\\Users\\zzhaoao\\Desktop\\Hanfu01_mask\\";
//	string blurredMask_path = "C:\\Users\\zzhaoao\\Desktop\\Hanfu01_blurredMask\\";
//	string res_path = "C:\\Users\\zzhaoao\\Desktop\\Hanfu01_res\\";
//	string model = "C:\\Users\\zzhaoao\\Desktop\\COMP5421\\model\\model.yml";
//
//	Ptr<StructuredEdgeDetection> pDollar = createStructuredEdgeDetection(model);
//
//	DIR *dir;
//	struct dirent *ent;
//	int k = 0;
//	if ((dir = opendir(src_path.c_str())) != NULL)
//	{
//		while ((ent = readdir(dir)) != NULL) 
//		{
//			// real processing, such as: printf("%s\n", ent->d_name);
//			if (!(strcmp(ent->d_name, ".")==0 || strcmp(ent->d_name, "..") == 0))
//			{
//				char src_name[100] = { NULL };
//				char gray_name[100] = { NULL };
//				char edge_name[100] = { NULL };
//				char mask_name[100] = { NULL };
//				char blurredMask_name[100] = { NULL };
//				char res_name[100] = { NULL };
//				strcat(src_name, src_path.c_str());
//				strcat(src_name, ent->d_name);
//				strcat(gray_name, gray_path.c_str());
//				strcat(gray_name, ent->d_name);
//				strcat(edge_name, edge_path.c_str());
//				strcat(edge_name, ent->d_name);
//				strcat(mask_name, mask_path.c_str());
//				strcat(mask_name, ent->d_name);
//				strcat(blurredMask_name, blurredMask_path.c_str());
//				strcat(blurredMask_name, ent->d_name);
//				strcat(res_name, res_path.c_str());
//				strcat(res_name, ent->d_name);
//
//				Mat src = imread(src_name, CV_LOAD_IMAGE_COLOR);
//				Mat mask = imread(mask_name, CV_LOAD_IMAGE_GRAYSCALE);
//				//Mat binaryMask = Mat(mask.rows, mask.cols, CV_8UC1);
//				//Mat blurredMask = imread(blurredMask_name, CV_LOAD_IMAGE_GRAYSCALE); // Mat(mask.rows, mask.cols, CV_8UC1);
//				//Mat res = Mat(src.rows, src.cols, src.type());
//				//Mat res_edge = Mat(src.rows, src.cols, CV_8UC1);
//
//				if(src.empty())
//					CV_Error(Error::StsError, String("Cannot read src: ") + src_name);
//
//				printf("Processing %s ... ...\n", src_name);
//
//				//thresholding(mask, binaryMask);
//				//feathering(src, binaryMask, blurredMask);
//
//				//imwrite(blurredMask_name, blurredMask);
//
//				//mattingColor(src, blurredMask, res);
//
//				//imwrite(res_name, res);
//
//				//imshow("res", res);
//				//waitKey(0);
//
//				Mat gray;
//				cvtColor(src, gray, CV_BGR2GRAY);
//
//				src.convertTo(src, DataType<float>::type, 1 / 255.0);
//
//				Mat edge(src.size(), src.type());
//
//				pDollar->detectEdges(src, edge);
//
//				Mat gray_edge = Mat(edge.rows, edge.cols, CV_8UC1);
//				multiply(edge, mask, gray_edge, 1, CV_8UC1);
//				gray_edge.convertTo(gray_edge, CV_8UC3);
//				//mattingGray(gray_edge, blurredMask, res_edge);
//
//				threshold(gray_edge, gray_edge, 30, 255, THRESH_BINARY);
//				gray_edge = 255 - gray_edge;
//
//
//
//				//imshow("edge", gray_edge);
//				//waitKey(0);
//
//				imwrite(edge_name, gray_edge);
//				imwrite(gray_name, gray);
//			}
//		}
//		closedir(dir);
//	}
//	else 
//	{
//		perror("CANNOT open the given path!\n");
//		return EXIT_FAILURE;
//	}
//
//	return 0;
//}


#include "opencv2/core.hpp"
#include "opencv2/imgproc.hpp"
#include "opencv2/highgui.hpp"
#include "deNoise.hpp"
#include <iostream>

using namespace cv;
using namespace std;

int main(int argc, char** argv)
{
	Mat I0, IR, IRR;
	I0 = imread(".\\image\\out.png", CV_LOAD_IMAGE_COLOR);   // Read the file
	IR = imread(".\\image\\kelly.jpg", CV_LOAD_IMAGE_COLOR);   // Read the file
	
	resize(I0, I0, Size(256, 256));
	resize(IR, IR, Size(256, 256));
	
	IRR = deNoise(I0, IR);

	namedWindow("Result", WINDOW_AUTOSIZE);// Create a window for display.
	imshow("Result", IRR);                   // Show our image inside it.

	waitKey(0);                                          // Wait for a keystroke in the window
	return 0;

}
