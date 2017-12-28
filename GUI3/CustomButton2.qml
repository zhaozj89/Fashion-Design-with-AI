import QtQuick 2.0
import QtQuick.Layouts 1.1
import QtQuick.Controls 2.0
import QtGraphicalEffects 1.0

/// http://tro.trola.org/wp/rounded-images-in-qtquickqml/
RoundMouseArea {
    property string iconName: ""
    property bool selected: false

    id: roundMouseArea
    width: 50
    height: 50

//    onClicked: selected = !selected

    Rectangle {
        id: background
        anchors.fill: parent
        color: roundMouseArea.pressed ? "red" : "white"
        border.color: "black"
        radius: width / 2
    }

    Image {
        id: img
        anchors.fill: parent
        fillMode: Image.PreserveAspectCrop
        visible: false
        source: iconName
    }

    Rectangle {
        id: mask
        anchors { fill: parent; margins: 18 }
        color: "black";
        clip: true
        visible: false
    }

    OpacityMask {
        anchors.fill: mask
        source: img
        maskSource: mask
    }
}
