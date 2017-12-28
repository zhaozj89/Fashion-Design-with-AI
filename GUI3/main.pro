TEMPLATE = app

CONFIG += c++11

QT += qml quick multimedia widgets

RESOURCES += \
    main.qrc \

SOURCES += \
    main.cpp \
    image_provider.cpp \
    deNoise.cpp \
    blending.cpp

HEADERS += \
    image_provider.h \
    deNoise.hpp \
    blending.h

openCV = /usr/local/opt/opencv@3

mac{
    INCLUDEPATH += $$openCV/include/

    LIBS += -L$$openCV/lib  \
    -lopencv_core           \
    -lopencv_imgproc        \
    -lopencv_highgui        \
    -lopencv_calib3d        \
    -lopencv_features2d     \
    -lopencv_imgcodecs      \
    -lopencv_videoio        \
    -lopencv_objdetect      \
    -lopencv_face			\
    -lopencv_ximgproc
}

#INCLUDEPATH += C:/Users/mxj/Anaconda3/include
#INCLUDEPATH += C:/Users/mxj/Anaconda3/libs
#INCLUDEPATH += C:/Users/mxj/Anaconda3/Lib/site-packages/numpy/core/include
#DEPENDPATH += C:/Users/mxj/Anaconda3/include
#DEPENDPATH += C:/Users/mxj/Anaconda3/libs
#DEPENDPATH += C:/Users/mxj/Anaconda3/Lib/site-packages/numpy/core/include

#LIBS += "C:/Users/mxj/Anaconda3/libs/python35.lib"
#LIBS += "C:/Users/mxj/Anaconda3/libs/python3.lib"
#LIBS += "C:/Users/mxj/Anaconda3/libs/_tkinter.lib"
#LIBS += "C:/Users/mxj/Anaconda3/Lib/site-packages/numpy/core/lib/npymath.lib"

#win32: LIBS += -LC:/Users/mxj/Desktop/zzj/opencv_install/x86/vc14/lib \
#    -lopencv_core320         \
#    -lopencv_imgproc320      \
#    -lopencv_highgui320      \
#    -lopencv_calib3d320      \
#    -lopencv_features2d320   \
#    -lopencv_imgcodecs320    \
#    -lopencv_videoio320      \
#    -lopencv_bgsegm320    \
#    -lopencv_bioinspired320    \
#    -lopencv_objdetect320    \
#    -lopencv_ximgproc320     \
#    -lopencv_aruco320     \
#    -lopencv_calib3d320    \
#    -lopencv_ccalib320    \
#    -lopencv_core320    \
#    -lopencv_datasets320    \
#    -lopencv_dnn320    \
#    -lopencv_dpm320    \
#    -lopencv_face320    \
#    -lopencv_features2d320    \
#    -lopencv_flann320    \
#    -lopencv_fuzzy320    \
#    -lopencv_highgui320    \
#    -lopencv_imgcodecs320    \
#    -lopencv_imgproc320    \
#    -lopencv_line_descriptor320    \
#    -lopencv_ml320    \
#    -lopencv_objdetect320    \
#    -lopencv_optflow320    \
#    -lopencv_phase_unwrapping320    \
#    -lopencv_photo320    \
#    -lopencv_plot320    \
#    -lopencv_reg320    \
#    -lopencv_rgbd320    \
#    -lopencv_saliency320    \
#    -lopencv_shape320    \
#    -lopencv_stereo320    \
#    -lopencv_stitching320    \
#    -lopencv_structured_light320    \
#    -lopencv_superres320    \
#    -lopencv_surface_matching320    \
#    -lopencv_text320    \
#    -lopencv_tracking320    \
#    -lopencv_video320    \
#    -lopencv_videoio320    \
#    -lopencv_videostab320    \
#    -lopencv_xfeatures2d320    \
#    -lopencv_ximgproc320    \
#    -lopencv_xobjdetect320    \
#    -lopencv_xphoto320

#INCLUDEPATH += C:/Users/mxj/Desktop/zzj/opencv_install/include \
#C:/Users/mxj/Desktop/zzj/opencv_install/include/opencv \
#C:/Users/mxj/Desktop/zzj/opencv_install/include/opencv2

#DISTFILES += \
#    main.qml \
#    ToolBox.qml \
#    OptionMenu.qml \
#    DesignLayer.qml \
#    ScribbleArea.qml \
#    CustomButton.qml \
#    RoundMouseArea.qml \
#    CustomButton2.qml
