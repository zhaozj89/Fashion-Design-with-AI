#ifndef IMAGE_PROVIDER_H
#define IMAGE_PROVIDER_H

#include <QObject>
#include <QQuickItem>
#include <QQuickItemGrabResult>
#include <QQuickImageProvider>
#include <QSharedPointer>

#include <opencv2/core.hpp>
#include <opencv2/highgui.hpp>
#include <opencv2/imgproc.hpp>

#include <iostream>
#include <string>
#include <queue>
#include <vector>
#include <functional>

using namespace std;

class ImageReader : public QObject, public QQuickImageProvider
{
    Q_OBJECT

    Q_PROPERTY(QString isValid WRITE setSource)

public:
    explicit ImageReader(QObject *parent=0): QObject(parent), QQuickImageProvider(QQuickImageProvider::Image)
    {
       m_blankMat = cv::imread("C:/Users/mxj/Desktop/zzj/GUI/assets/blank.png", 1);
    }

    ~ImageReader() {}

    QQuickImageProvider::ImageType imageType() const { return QQuickImageProvider::Image; }
    QImage requestImage(const QString& id, QSize* size, const QSize& requestedSize);

    int process(cv::Mat& m, QImage& qimage);

    Q_INVOKABLE void setSource(const QString& source);
    Q_INVOKABLE int edge(QQuickItem *item);
    Q_INVOKABLE int magic(QQuickItem *item);
    Q_INVOKABLE int color(QQuickItem *item, QString flowerName);

    Q_INVOKABLE int magic_color(QQuickItem *item);

    Q_INVOKABLE void capture(QQuickItem *item);
    Q_INVOKABLE void save(QQuickItem *item);

    Q_INVOKABLE void tryon(QQuickItem *item);


    // for lasso
    Q_INVOKABLE void initLasso(QQuickItem *item);
    Q_INVOKABLE void pressLasso(double x, double y);
    Q_INVOKABLE void moveLasso(double x, double y);
    Q_INVOKABLE void eraseLasso();

signals:
    void edgeFinished();
    void magicFinished();
    void colorFinished();
    void magic_colorFinished();

    void setSourceFinished();
    void captureFinished();
    void tryonFinished();

private:
    cv::Mat m_mat;
    cv::Mat m_mat_copy;
    cv::Mat m_blankMat;

    int counter = 0;


    // intelligent scissors
private:
    cv::Mat m_lasso_src;
    cv::Mat m_lasso_out;
    int m_lasso_currentClickSize;

    int *m_lasso_clicksX=nullptr;
    int *m_lasso_clicksY=nullptr;

    const int m_lasso_maxClickSize = 200;

    cv::Mat *m_lasso_graphWeights=nullptr;

    bool isLassoProcess = false;

    cv::Mat isVisited;
    cv::Mat DijkstrasCost;
    cv::Mat previous;
    cv::Mat path;
    cv::Mat mask;

    void paintImage(cv::Mat a);
    void computeGraphWeights();
    void doDijkstras( int clickedX, int clickedY );
    void backTrackFrom(int startX, int startY);
    void registerPath(int startX, int startY);
};

class SpecialType
{
public:
    float num;
    int theX;
    int theY;

    SpecialType(float a, int x, int y)
    {
        num = a;
        theX = x;
        theY = y;
    }
};

class mycomparison
{
private:
    bool reverse;

public:
    mycomparison(const bool& revparam=false) {reverse=revparam;}
    bool operator() (const SpecialType& lhs, const SpecialType&rhs) const
    {
        if (reverse) return (lhs.num<rhs.num);
        else return (lhs.num>rhs.num);
    }
};

#endif // ImageReader2_H
