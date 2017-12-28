import QtQuick 2.0
import QtQuick.Layouts 1.1
import QtQuick.Controls 2.0

Rectangle {
    property string myState: "default"

    border.color: "gray"
    border.width: 2

    id: root
    Layout.fillHeight: true
    Layout.minimumWidth: 50
    Layout.preferredWidth: 50
    Layout.maximumWidth: 300
    Layout.minimumHeight: 150

    Layout.leftMargin: 10
    Layout.rightMargin: 10
    Layout.topMargin: 10
    Layout.bottomMargin: 10

    anchors.left: parent.left
    anchors.leftMargin: 10

    signal clicked

    Column {
        anchors.fill: parent
        spacing: 10

        visible: true

        CustomButton2 {
            id: open
            iconName: "assets/open.png"
        }

        CustomButton2 {
            id: camera
            iconName: "assets/camera.png"
        }

        CustomButton2 {
            id: pencil
            iconName: "assets/pencil.png"
        }

        CustomButton2 {
            id: edge
            iconName: "assets/edge.png"
        }

        CustomButton2 {
            id: magic
            iconName: "assets/magic-wand.png"
        }

        CustomButton2 {
            id: color
            iconName: "assets/color.png"
        }


        CustomButton2 {
            id: magic_color
            iconName: "assets/magic-wand-color.png"
        }

        CustomButton2 {
            id: tryon
            iconName: "assets/tryon.png"
        }

        CustomButton2 {
            id: save
            iconName: "assets/save.png"
        }

        Connections {
            target: open
            onClicked: {
                root.myState = "open";
                root.clicked();
            }
        }

        Connections {
            target: camera
            onClicked: {
                root.myState = "camera";
                root.clicked();
            }
        }

        Connections {
            target: pencil
            onClicked: {
                root.myState = "pencil";
                root.clicked();
            }
        }

        Connections {
            target: edge
            onClicked: {
                root.myState = "edge";
                root.clicked();
            }
        }

        Connections {
            target: magic
            onClicked: {
                root.myState = "magic";
                root.clicked();
            }
        }

        Connections {
            target: color
            onClicked: {
                root.myState = "color";
                root.clicked();
            }
        }

        Connections {
            target: magic_color
            onClicked: {
                root.myState = "magic_color";
                root.clicked();
            }
        }

        Connections {
            target: tryon
            onClicked: {
                root.myState = "tryon";
                root.clicked();
            }
        }

        Connections {
            target: save
            onClicked: {
                root.myState = "save";
                root.clicked();
            }
        }
    }
}
