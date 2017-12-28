#include <cmath>
//#include <Python.h>
//#include <numpy/arrayobject.h>
#include <QDebug>
#include <QDir>
#include <QProcess>
#include <QString>
#include <cstdlib>
#include <cstdio>

#include <opencv2/ximgproc.hpp>
#include <opencv2/ximgproc/edge_filter.hpp>
#include <opencv2/highgui/highgui.hpp>
#include <opencv2/imgproc/imgproc.hpp>
#include <opencv2/core/core.hpp>
#include <opencv2/core/utility.hpp>

#include <string>

#include "image_provider.h"
#include "deNoise.hpp"
#include "blending.h"

QImage Mat2QImage(cv::Mat const& mat)
{
	cv::Mat temp;
	cvtColor(mat, temp,CV_BGR2RGB);
	QImage image((const uchar *) temp.data,
	         temp.cols, temp.rows, temp.step, QImage::Format_RGB888);
	image.bits();
	return image;
}

cv::Mat QImage2Mat(QImage const& image)
{
	 cv::Mat mat(image.height(),image.width(),
	                CV_8UC4,(uchar*)image.bits(),image.bytesPerLine());
	 cv::cvtColor(mat, mat, CV_BGRA2BGR);
	 return mat;
}

void ImageReader::setSource(const QString& source)
{
	string fileName = source.toUtf8().constData();
	fileName.erase(0, 7);

	m_mat = cv::imread(fileName, CV_LOAD_IMAGE_COLOR);
	m_mat.copyTo(m_mat_copy);

	if(m_mat.empty())
	{
		qWarning() << "Image Path Not Exist!";
		exit(-1);
	}

	emit setSourceFinished();
}

QImage ImageReader::requestImage(const QString& id, QSize* size, const QSize& requestedSize)
{
	QImage qimage;
	process(m_mat, qimage);
	return qimage;
}

int ImageReader::process(cv::Mat& m, QImage& qimage)
{
	if(m.empty())
	{
		qWarning() << "Empty Mat";
		return 0;
	}

	switch ( m.type() )
	{
		case CV_8UC4:
		{
			qimage = QImage( m.data, m.cols, m.rows, m.step, QImage::Format_RGB32 );
			break;
		}
		case CV_8UC3:
		{
			QImage image( m.data, m.cols, m.rows, m.step, QImage::Format_RGB888 );
			qimage = image.rgbSwapped();
			break;
		}
		case CV_8UC1:
		{
			static QVector<QRgb>  sColorTable;

			// only create our color table once
			if ( sColorTable.isEmpty() )
			{
				for ( int i = 0; i < 256; ++i )
					sColorTable.push_back( qRgb( i, i, i ) );
			}
			QImage image( m.data, m.cols, m.rows, m.step, QImage::Format_Indexed8 );
			image.setColorTable( sColorTable );
			qimage = image;
			break;
		}
		default:
			qWarning() << "ASM::cvMatToQImage() - cv::Mat image type not handled in switch:" << m.type();
			break;
	}

	return 1;
}

int ImageReader::edge(QQuickItem *item)
{
	// grab image
	auto grabResult = item->grabToImage();

	if(m_mat.empty())
	{
		emit edgeFinished();
		return 0;
	}

	// get mask
	connect(grabResult.data(), &QQuickItemGrabResult::ready, [=]() {
		QImage image = grabResult->image().copy();
		cv::Mat mat = QImage2Mat(image);

		cv::imwrite("C:/Users/mxj/Desktop/zzj/Data/msk_input.png", mat);

		// start new process
		QProcess *process = new QProcess(this);
		QString program = "python";
		QString folder = "../Segmentation/process.py";
		process->start(program, QStringList() << folder);
		process->waitForFinished();
		process->close();

		cv::Mat edge(mat.size(), mat.type());
		string model = "../Model/edge.yml";
		cv::Ptr<cv::ximgproc::StructuredEdgeDetection> pDollar =
		        cv::ximgproc::createStructuredEdgeDetection(model);

		cv::Mat input;
		mat.copyTo(input);
		input.convertTo(input, cv::DataType<float>::type, 1 / 255.0);
		pDollar->detectEdges(input, edge);

		cv::Mat gray_edge = cv::Mat(edge.rows, edge.cols, CV_8UC1);
		threshold(edge*255, gray_edge, 30, 255, cv::THRESH_BINARY);

		cv::Mat msk = cv::imread("C:/Users/mxj/Desktop/zzj/Data/msk_output.png", 0);


		gray_edge.convertTo(gray_edge, CV_8UC1);
		cv::multiply(msk, gray_edge, gray_edge, 1, CV_8UC1);

		gray_edge = 255 - gray_edge;

		gray_edge.convertTo(m_mat, CV_8UC3);

		emit edgeFinished();
	});

	return 0;
}

int ImageReader::magic(QQuickItem *item)
{
	// grab image
	auto grabResult = item->grabToImage();

	// get mask
	connect(grabResult.data(), &QQuickItemGrabResult::ready, [=]() mutable {
		QImage image = grabResult->image().copy();
		cv::Mat input = QImage2Mat(image);

		cv::imwrite("C:/Users/mxj/Desktop/zzj/Data/magic_input.png", input);

		// start new process
		QProcess *process = new QProcess(this);
		QString program = "python";
		QString folder = "../pix2pix2/Forward/process.py";
		process->start(program, QStringList() << folder);
		process->waitForFinished();
		process->close();

		m_mat = cv::imread("C:/Users/mxj/Desktop/zzj/Data/magic_output.png", 1);
		emit magicFinished();
	});

	return 0;
}

int ImageReader::color(QQuickItem *item, QString flowerName)
{
	// grab image
	auto grabResult = item->grabToImage();

	if(m_mat.empty())
	{
		emit colorFinished();
		return 0;
	}

	// get mask
	connect(grabResult.data(), &QQuickItemGrabResult::ready, [=]() mutable {
		QImage image = grabResult->image().copy();
		cv::Mat imgObj = QImage2Mat(image);
		cv::Mat imgObjBackup;
		imgObj.copyTo(imgObjBackup);

		int w = imgObj.cols;
		int h = imgObj.rows;
		cv::resize(imgObj, imgObj, cv::Size(512, 512));
		std::string name = flowerName.toLocal8Bit().constData();
		std::string fName = "../GUI/assets/"+name+".png";
		cv::Mat flower = cv::imread(fName.c_str(), CV_LOAD_IMAGE_COLOR);
		cv::resize(flower, flower, cv::Size(512, 512));
		cv::Mat res = deNoise(imgObj, flower, 10);

		cv::Mat colorizedImg;
		res = res*255;
		res.copyTo(colorizedImg);
		cv::resize(colorizedImg, colorizedImg, cv::Size(w, h));

		colorizedImg.convertTo(colorizedImg, CV_8UC3);

		if(mask.empty())
		{
			cv::Mat msk = cv::Mat(imgObjBackup.size(), imgObjBackup.type());
			threshold(imgObjBackup, msk, 230, 255, cv::THRESH_BINARY_INV);
			cv::ximgproc::guidedFilter(imgObjBackup, msk, msk, 10, 20);
			blending(colorizedImg, imgObjBackup, msk);


		}
		else
		{
			blending(colorizedImg, imgObjBackup, mask);
		}

		colorizedImg.copyTo(m_mat);
		emit colorFinished();
	});

	return 0;
}

int ImageReader::magic_color(QQuickItem *item)
{
	// grab image
	auto grabResult = item->grabToImage();

	// get mask
	connect(grabResult.data(), &QQuickItemGrabResult::ready, [=]() mutable {
		QImage image = grabResult->image().copy();
		cv::Mat input = QImage2Mat(image);

		cv::imwrite("C:/Users/mxj/Desktop/zzj/Data/magic_input_color.png", input);

		// start new process
		QProcess *process = new QProcess(this);
		QString program = "python";
		QString folder = "../pix2pix2/Forward/process_color.py";
		process->start(program, QStringList() << folder);
		process->waitForFinished();
		process->close();

		m_mat = cv::imread("C:/Users/mxj/Desktop/zzj/Data/magic_output_color.png", 1);

		emit magic_colorFinished();
	});

	return 0;
}

void ImageReader::capture(QQuickItem *item)
{
	// grab image
	auto grabResult = item->grabToImage();

	// get mask
	connect(grabResult.data(), &QQuickItemGrabResult::ready, [=]() {
		QImage image = grabResult->image().copy();
		m_mat = QImage2Mat(image);

		emit captureFinished();
	});
}

void ImageReader::tryon(QQuickItem *item)
{
	// grab image
	auto grabResult = item->grabToImage();

	// get mask
	connect(grabResult.data(), &QQuickItemGrabResult::ready, [=]() {
		QImage image = grabResult->image().copy();
		cv::Mat mat = QImage2Mat(image);

		cv::Mat msk = cv::Mat(mat.size(), mat.type());
		threshold(mat, msk, 230, 255, cv::THRESH_BINARY_INV);
		cv::ximgproc::guidedFilter(mat, msk, msk, 10, 20);
		cv::Mat res;
		m_mat_copy.copyTo(res);
		blending(mat, res, msk);

		mat.copyTo(m_mat);
		emit tryonFinished();
	});
}

void ImageReader::save(QQuickItem *item)
{
	// grab image
	auto grabResult = item->grabToImage();

	// get mask
	connect(grabResult.data(), &QQuickItemGrabResult::ready, [=]() {
		QImage image = grabResult->image().copy();
		cv::Mat m_save = QImage2Mat(image);
		cv::cvtColor(m_save, m_save, CV_BGRA2BGR);

		char outname[100];
		sprintf(outname, "C:/Users/mxj/Desktop/zzj/Data/final%d.png", counter);
		cv::imwrite(outname, m_save);
		counter++;
	});
}


void ImageReader::initLasso(QQuickItem *item)
{
	if(m_mat.empty())
		return;
	else
	{
		m_mat.copyTo(m_lasso_src);
		m_lasso_currentClickSize=0;

		m_lasso_clicksX = new int[m_lasso_maxClickSize];
		m_lasso_clicksY = new int[m_lasso_maxClickSize];

		for( int i=0 ; i<m_lasso_maxClickSize ; i++ )
		{
			m_lasso_clicksX[i] = 0;
			m_lasso_clicksY[i] = 0;
		}

		m_lasso_graphWeights = new cv::Mat[9];

		computeGraphWeights();
		return;
	}
}

void ImageReader::pressLasso(double x, double y)
{
	int ix = x;
	int iy = y;

	if( m_lasso_currentClickSize == 0 )
	{
		path = cv::Mat::zeros( m_lasso_src.rows, m_lasso_src.cols, CV_8UC1 );
	}
	else
		registerPath(ix, iy);

	doDijkstras(ix, iy);

	m_lasso_clicksX[m_lasso_currentClickSize] = ix;
	m_lasso_clicksY[m_lasso_currentClickSize] = iy;

	++m_lasso_currentClickSize;
}

void ImageReader::moveLasso(double x, double y)
{
	int ix = x;
	int iy = y;

	if(!m_lasso_src.empty() && m_lasso_currentClickSize>0)
	{
		m_lasso_out = m_lasso_src.clone();
		backTrackFrom(ix, iy);
		paintImage(m_lasso_out);
	}
}

void ImageReader::eraseLasso()
{
	if(isLassoProcess==true)
	{
		cv::line(path,cv::Point(m_lasso_clicksX[0], m_lasso_clicksY[0]),
		        cv::Point(m_lasso_clicksX[m_lasso_currentClickSize-1],
		        m_lasso_clicksY[m_lasso_currentClickSize-1]),
		        cv::Scalar(255, 0, 0));

		mask = path.clone();
		cv::threshold(path, mask, 1, 255, CV_THRESH_BINARY);
		cv::floodFill(mask, cv::Point(2, 2), 255, 0, 10, 10);

		mask = 255-mask;
		cv::ximgproc::guidedFilter(m_lasso_src, mask, mask, 10, 20);
		cv::cvtColor(mask, mask, CV_GRAY2BGR);

		m_lasso_src.copyTo(m_mat);
	}

	// deconstruction
	isLassoProcess = false;
	m_lasso_currentClickSize = 0;

	if(m_lasso_clicksX!=nullptr)
	{
		delete [] m_lasso_clicksX;
		m_lasso_clicksX = nullptr;
	}

	if(m_lasso_clicksY!=nullptr)
	{
		delete [] m_lasso_clicksY;
		m_lasso_clicksY = nullptr;
	}

	if(m_lasso_graphWeights!=nullptr)
	{
		delete [] m_lasso_graphWeights;
		m_lasso_graphWeights = nullptr;
	}
}

void ImageReader::computeGraphWeights()
{
	cv::Mat K[9];
	K[0] = (cv::Mat_<float>(3,3)<<0, .7, 0, -.7, 0, 0, 0, 0, 0);
	K[1] = (cv::Mat_<float>(3,3)<<-.25, 0, .25, -.25, 0, .25, 0, 0, 0);
	K[2] = (cv::Mat_<float>(3,3)<<0, .7, 0, 0, 0, -.7, 0, 0, 0);
	K[3] = (cv::Mat_<float>(3,3)<<.25, .25, 0, 0, 0, 0, -.25, -.25, 0);
	K[4] = (cv::Mat_<float>(3,3)<<0, 0, 0, 0, 100000, 0, 0, 0, 0);
	K[5] = (cv::Mat_<float>(3,3)<<0, -.25, -.25, 0, 0, 0, 0, .25, .25);
	K[6] = (cv::Mat_<float>(3,3)<<0, 0, 0, -.7, 0, 0, 0, .7, 0);
	K[7] = (cv::Mat_<float>(3,3)<<0, 0, 0, -.25, 0, -.25, .25, 0, -.25);
	K[8] = (cv::Mat_<float>(3,3)<<0, 0, 0, 0, 0, .7, 0, -.7, 0);

	std::vector<cv::Mat> channels(3);
	cv::Mat mat_tmp;
	for(int i=0 ; i<=8 ; ++i)
	{
		cv::filter2D(m_lasso_src, mat_tmp, CV_32FC3, K[i]);
		cv::Mat dst = cv::Mat::zeros(m_lasso_src.size(), CV_32FC1);
		float epsilon = 0.01;
		cv::split(mat_tmp, channels);
		cv::Mat B = channels[0];
		cv::Mat G = channels[1];
		cv::Mat R = channels[2];
		B = 255-B;
		G = 255-G;
		R = 255-R;
		dst = B.mul(B) + G.mul(G) + R.mul(R) + epsilon;
		dst.copyTo(m_lasso_graphWeights[i]);
	}
}

void ImageReader::registerPath(int startX, int startY)
{
	int tmp;
	while( (tmp=previous.at<uchar>(cv::Point(startX,startY))) != 255 )
	{
		//plot
		path.at<uchar>( cv::Point(startX, startY) ) = 255;

		switch(tmp)
		{
			case 0:
				startX--;
				startY--;
				continue;
			case 1:
				startY--;
				continue;
			case 2:
				startY--;
				startX++;
				continue;
			case 3:
				startX--;
				continue;
			case 4:
				std::cerr<<"Should not be occuring\n";
				exit(1);
				continue;
			case 5:
				startX++;
				continue;
			case 6:
				startX--;
				startY++;
				continue;
			case 7:
				startY++;
				continue;
			case 8:
				startX++;
				startY++;
				continue;
		}
	}
}

void ImageReader::doDijkstras( int clickedX, int clickedY )
{
	isVisited = cv::Mat::zeros(m_lasso_src.size(),CV_8UC1);
	DijkstrasCost = cv::Mat::ones(m_lasso_src.size(),CV_32F);
	previous = cv::Mat::zeros(m_lasso_src.size(),CV_8UC1);
	DijkstrasCost = 1000000000000.0*DijkstrasCost;

	int currX = clickedX;
	int currY = clickedY;
	DijkstrasCost.at<float>(cv::Point(currX,currY)) = 0.0;
	previous.at<uchar>( cv::Point(currX,currY) ) = 255;
	std::priority_queue<SpecialType,std::vector<SpecialType>,mycomparison> pqueue;

	while(1)
	{
		isVisited.at<uchar>(cv::Point(currX,currY)) = 1;
		for( int i=-1 ; i<=1 ; i++ )
		{
			for( int j=-1 ; j<=1 ; j++ )
			{
				if( isVisited.at<uchar>(cv::Point(currX+j,currY+i)) >= 1 )
					continue;
				float oldCost = DijkstrasCost.at<float>(cv::Point(currX+j,currY+i));
				int xx = (i+1)*3 + (j+1);
				cv::Mat tmp = m_lasso_graphWeights[xx];

				float newCost = DijkstrasCost.at<float>(cv::Point(currX,currY)) + tmp.at<float>(cv::Point(currX,currY));
				if( newCost < oldCost )
				{
					DijkstrasCost.at<float>(cv::Point(currX+j,currY+i)) = newCost;
					previous.at<uchar>(cv::Point(currX+j,currY+i)) = (1-i)*3 + (1-j);
					if((isVisited.at<uchar>(cv::Point(currX+j,currY+i)) == 0)
					        && ((currX+j)>0) && ((currX+j) < m_lasso_src.cols-1)
					        && (currY+i>0)  && (currY+i<m_lasso_src.rows-1)  )
						pqueue.push(SpecialType(newCost,currX+j,currY+i));
				}
			}
		}
		if( pqueue.empty() == true )
		{
			break;
		}
		SpecialType t = pqueue.top();
		pqueue.pop();
		if( pqueue.empty() == true )
		{
			break;
		}
		while( isVisited.at<uchar>(cv::Point(t.theX,t.theY))==1 ) //if it is visited then ignore this and get next element in the min-queue
		{
			t=pqueue.top();
			pqueue.pop();
			if( pqueue.empty() == true )
			{
				break;
			}
		}
		currX = t.theX;
		currY = t.theY;
	}
}

void ImageReader::backTrackFrom(int startX, int startY)
{
	int tmp;
	cv::Vec3b val(0,255,255);
	while( (tmp=previous.at<uchar>(cv::Point(startX,startY))) != 255 )
	{
		//plot
		m_lasso_out.at<cv::Vec3b>( cv::Point(startX,startY) ) = val;

		switch(tmp)
		{
			case 0:
				startX--;
				startY--;
				continue;
			case 1:
				startY--;
				continue;
			case 2:
				startY--;
				startX++;
				continue;
			case 3:
				startX--;
				continue;
			case 4:
				std::cerr<<"Should not be occuring\n";
				exit(1);
				continue;
			case 5:
				startX++;
				continue;
			case 6:
				startX--;
				startY++;
				continue;
			case 7:
				startY++;
				continue;
			case 8:
				startX++;
				startY++;
				continue;
		}
	}
}

void ImageReader::paintImage(cv::Mat a)
{
	isLassoProcess = true;

	if(m_lasso_currentClickSize>2)
	{
		for(int i=1; i<m_lasso_currentClickSize; ++i)
		{
			cv::Point pt0, pt1;
			pt0.x = m_lasso_clicksX[i-1];
			pt0.y = m_lasso_clicksY[i-1];
			pt1.x = m_lasso_clicksX[i];
			pt1.y = m_lasso_clicksY[i];
			line(a, pt0, pt1, cv::Scalar(100, 100, 100), 10, 8, 0);
			circle(a, pt1, 5, cv::Scalar(0, 0, 255), 10, 8, 0);
		}
	}

	a.copyTo(m_mat);
}

