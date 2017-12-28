#include <opencv2/core.hpp>

using namespace std;

cv::Mat solve(const cv::Mat &IRR, const cv::Mat &I0, const cv::Mat &IR,
	const int nbits, double smoothness, int level);

cv::Mat deNoise_rec(const cv::Mat &IRR, const cv::Mat &I0, const cv::Mat &IR,
	const int *nbits, double smoothness, int level);

cv::Mat deNoise(const cv::Mat &I0, const cv::Mat &IR, double smoothness=1.0);
