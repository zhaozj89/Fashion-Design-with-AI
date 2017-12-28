#include <QQmlApplicationEngine>
#include <QtQml>
#include <QtGui/QGuiApplication>
#include <QtCore/QDir>
#include <QtQuick/QQuickView>
#include <QtQml/QQmlEngine>


#include "image_provider.h"

int main(int argc, char *argv[])
{
    QGuiApplication app(argc, argv);
    QQuickView viewer;

#ifdef Q_OS_WIN
    QString extraImportPath(QStringLiteral("%1/../../../../%2"));
#else
    QString extraImportPath(QStringLiteral("%1/../../../%2"));
#endif
    viewer.engine()->addImportPath(extraImportPath.arg(QGuiApplication::applicationDirPath(),
                                                       QString::fromLatin1("qml")));

    viewer.setSource(QUrl("qrc:/main.qml"));

    ImageReader *r = new ImageReader();
    viewer.engine()->rootContext()->setContextProperty("ImageReader", r);
    viewer.engine()->addImageProvider(QLatin1String("ImageReader"), r);

    viewer.setTitle(QStringLiteral("SketchClothing"));
    viewer.setResizeMode(QQuickView::SizeRootObjectToView);
    viewer.setColor(QColor("#FCFCFC"));

    QObject::connect((QObject*)viewer.engine(), SIGNAL(quit()), &app, SLOT(quit()));

    viewer.show();

    return app.exec();
}
