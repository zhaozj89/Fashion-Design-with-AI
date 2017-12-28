import QtQuick 2.7
import QtGraphicalEffects 1.0
import QtQuick.Layouts 1.1

Item {
    Layout.fillHeight: true
    Layout.fillWidth: true
    Layout.minimumWidth: 50
    Layout.preferredWidth: 100
    Layout.minimumHeight: 150

    Layout.leftMargin: 10
    Layout.rightMargin: 10
    Layout.topMargin: 10
    Layout.bottomMargin: 10

    property alias color: sketchLayer.color
    property alias strokeWidth: sketchLayer.strokeWidth
    property var clearScreen: sketchLayer.clearScreen

    Canvas {
        id: sketchLayer
        anchors.fill: parent
        property real lastX
        property real lastY
        property color color: "black"
        property real strokeWidth: 10.0

        function clearScreen() {
            var ctx = getContext("2d");
            ctx.reset();
            sketchLayer.requestPaint();
        }

        onPaint: {
//            console.log(photo.isTracing);

            if(photo.isTracing==false && photo.state=="pencil")
            {
                var ctx = getContext('2d')
                ctx.lineWidth = strokeWidth
                ctx.strokeStyle = color
                ctx.beginPath()
                ctx.moveTo(lastX, lastY)
                lastX = mouseArea.mouseX
                lastY = mouseArea.mouseY
                ctx.lineTo(lastX, lastY)
                ctx.stroke()
            }
        }

        MouseArea {
            id: mouseArea
            anchors.fill: parent
            onPressed: {
//                console.log(photo.isTracing);

                if(photo.isTracing==false)
                {
                    sketchLayer.lastX = mouseX;
                    sketchLayer.lastY = mouseY;
                }
                else
                {
                    ImageReader.pressLasso(mouseX, mouseY);
                }
            }

            onPositionChanged: {
//                console.log(photo.isTracing);

                if(photo.isTracing==false)
                {
                    sketchLayer.requestPaint();
                }
                else
                {
                    ImageReader.moveLasso(mouseX, mouseY);
                    myImg.source = "";
                    myImg.source = "image://ImageReader";
                }
            }
        }
    }
}
