#include "blending.h"

int blending(cv::Mat target, cv::Mat src, cv::Mat mask)
{
    int h = target.rows;
    int w = target.cols;

    for(int y=0; y<h; ++y)
    {
        for(int x=0; x<w; ++x)
        {
            uchar *ptarget_data = target.data + 3*y*w + 3*x;
            uchar *psrc_data = src.data + 3*y*w + 3*x;
            uchar *pmsk_data = mask.data + 3*y*w + 3*x;

            int r0 = pmsk_data[0];
            int r1 = pmsk_data[1];
            int r2 = pmsk_data[2];

            ptarget_data[0] = (r0*ptarget_data[0] + (255-r0)*psrc_data[0])/255;
            ptarget_data[1] = (r1*ptarget_data[1] + (255-r1)*psrc_data[1])/255;
            ptarget_data[2] = (r2*ptarget_data[2] + (255-r2)*psrc_data[2])/255;
        }
    }

    return 0;
}
