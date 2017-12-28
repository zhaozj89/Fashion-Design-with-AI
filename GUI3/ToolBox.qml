import QtQuick 2.7
import QtQuick.Layouts 1.1
import QtQuick.Dialogs 1.0
import QtQuick.Controls 1.4
import QtQuick.Controls.Styles 1.4

Rectangle {
    id: root
    border.color: "gray"
    border.width: 2

    Layout.fillWidth: true
    Layout.minimumWidth: 50
    Layout.preferredWidth: 200
    Layout.preferredHeight: 50

    Layout.leftMargin: 10
    Layout.rightMargin: 10
    Layout.topMargin: 10
    Layout.bottomMargin: 10

    anchors.bottom: parent.bottom
    anchors.bottomMargin: 10

    state: "default"

    property string flowerName: ""
    signal flowerClicked

    states: [
        State {
            name: "default"
            StateChangeScript {
                script: {pencil.visible=false; flower.visible=false;}
            }
        },
        State {
            name: "save"
            StateChangeScript {
                script: {pencil.visible=false; flower.visible=false;}
            }
        },
        State {
            name: "magic"
            StateChangeScript {
                script: {pencil.visible=false; flower.visible=false;}
            }
        },
        State {
            name: "open"
            StateChangeScript {
                script: {pencil.visible=false; flower.visible=false;}
            }
        },
        State {
            name: "pencil"
            StateChangeScript {
                script: {pencil.visible=true; flower.visible=false;}
            }
        },
        State {
            name: "color"
            StateChangeScript {
                script: {pencil.visible=false; flower.visible=true;}
            }
        }
    ]

    Row {
        id: flower
        spacing: 50
        visible: false

        CustomButton {
            id: lasso
            iconName: "assets/lasso.png"
            onClicked: {
                flowerName = "lasso";
                root.flowerClicked();
            }
        }

        CustomButton2 {
            id: daisy
            iconName: "assets/daisy.png"
            onClicked: {
                flowerName = "daisy";
                root.flowerClicked();
            }
        }

        CustomButton2 {
            id: hydrangea
            iconName: "assets/hydrangea.png"
            onClicked: {
                flowerName = "hydrangea";
                root.flowerClicked();
            }
        }

        CustomButton2 {
            id: pansy
            iconName: "assets/pansy.png"
            onClicked: {
                flowerName = "pansy";
                root.flowerClicked();
            }
        }

        CustomButton2 {
            id: pear
            iconName: "assets/pear.png"
            onClicked: {
                flowerName = "pear";
                root.flowerClicked();
            }
        }

        CustomButton2 {
            id: rose
            iconName: "assets/rose.png"
            onClicked: {
                flowerName = "rose";
                root.flowerClicked();
            }
        }

        CustomButton2 {
            id: sunflower
            iconName: "assets/sunflower.png"
            onClicked: {
                flowerName = "sunflower";
                root.flowerClicked();
            }
        }
    }

    Row {
        id: pencil
        spacing: 50
        visible: false

        Row {
            leftPadding: 50
            spacing: 10
            anchors.verticalCenter: parent.verticalCenter

            Slider {
                id: strokeWidth
                anchors.verticalCenter: parent.verticalCenter
                maximumValue: 10.0
                minimumValue: 1.0
                stepSize: 1.0
                value: 10.0
                onValueChanged: scribbleArea.strokeWidth = value
            }

            Text {
                width: 50
                anchors.verticalCenter: parent.verticalCenter
                font.pixelSize: 22
                text: strokeWidth.value
            }
        }

        CustomButton {
            id: palette
            iconName: "assets/paint-palette.png"
            onClicked: colorDialog.visible = true

            ColorDialog {
                id: colorDialog
                title: "Please choose a color"
                onAccepted: {
                    palette.selected = false;
                    scribbleArea.color = colorDialog.color;
                }
                onRejected: {
                    palette.selected = false;
                    visible = false;
                }
            }
        }

        CustomButton {
            iconName: "assets/eraser.png"
            property real myWidth: 0
            property string myColor: ""
            onClicked: {
                if(selected==true)
                {
                    myColor = scribbleArea.color;
                    myWidth = scribbleArea.strokeWidth;
                    scribbleArea.color = "white";
                    scribbleArea.strokeWidth = 50;
                }
                else
                {
                    scribbleArea.color = myColor;
                    scribbleArea.strokeWidth = myWidth;
                }
            }
        }

        CustomButton2 {
            onClicked: {scribbleArea.clearScreen(); myImg.source = "assets/blank.png";}
        }
    }
}
