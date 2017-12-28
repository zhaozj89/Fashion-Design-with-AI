import QtQuick.Layouts 1.3
import QtQuick.Dialogs 1.0
import QtQuick 2.7
import QtMultimedia 5.4
import QtQuick.Controls 1.4
import QtQuick.Controls.Styles 1.4

Item {
    id: mainview
    width: 1280
    height: 980
    visible: true
    focus: true

    property int imgWidth: 800
    property int imgHeight: 1000

    ColumnLayout {
        anchors.fill: parent
        spacing: 6
        RowLayout {
            anchors.fill: parent
            spacing: 6

            // left option menu
            OptionMenu {
                id: optionMenu
            }

            // this rectangle is only used for providing a frame
            Rectangle {
                id: frame
                border.color: "gray"
                border.width: 2

                Layout.fillHeight: true
                Layout.fillWidth: true
                Layout.leftMargin: 10
                Layout.rightMargin: 10
                Layout.topMargin: 10
                Layout.bottomMargin: 10
            }

            // main window, show image and strokes
            Rectangle {
                id: photo
                anchors.fill: frame
                anchors.margins: 5
                state: "default"
                states: [
                    State {
                        name: "open"
                        StateChangeScript {
                            script: {
                                scribbleArea.clearScreen();
                                fileDialog.visible = true;
                            }
                        }
                    },
                    State {
                        name: "camera"
                        StateChangeScript {
                            script: {
                                scribbleArea.clearScreen();
                                myImg.source = "";
                            }
                        }
                    },
                    State {
                        name: "pencil"
                        StateChangeScript {
                            script: {
                                scribbleArea.visible = true;
                            }
                        }
                    },
                    State {
                        name: "edge"
                        StateChangeScript {
                            script: {
                                photo.busy = 1;
                                ImageReader.edgeFinished.connect(photo.relax);
                                ImageReader.edge(myImg);
                            }
                        }
                    },
                    State {
                        name: "magic"
                        StateChangeScript {
                            script: {
                                photo.busy = 1;
                                scribbleArea.visible = true;
                                ImageReader.magicFinished.connect(photo.relax);
                                ImageReader.magic(myImg);
                            }
                        }
                    },
                    State {
                        name: "color"
                        StateChangeScript {
                            script: {
                                scribbleArea.visible = true;
                                scribbleArea.clearScreen();
                                myImg = "";
                                myImg.source = "image://ImageReader";
                            }
                        }
                    },
                    State {
                        name: "magic_color"
                        StateChangeScript {
                            script: {
                                photo.busy = 1;
                                scribbleArea.visible = true;
                                ImageReader.magic_colorFinished.connect(photo.relax);
                                ImageReader.magic_color(myImg);
                            }
                        }
                    },
                    State {
                        name: "tryon"
                        StateChangeScript {
                            script: {
                                photo.busy = 1;
                                scribbleArea.visible = true;
                                ImageReader.tryonFinished.connect(photo.relax);
                                ImageReader.tryon(myImg);
                            }
                        }
                    },
                    State {
                        name: "save"
                        StateChangeScript {
                            script: {ImageReader.save(myImg);}
                        }
                    }
                ]

                Image {
                    id: myImg
                    cache: false
                    anchors.horizontalCenter: parent.horizontalCenter
                    anchors.verticalCenter: parent.verticalCenter
                    Layout.preferredWidth: imgWidth
                    Layout.preferredHeight: imgHeight
                    source: "assets/blank.png"

                    ScribbleArea {
                        id: scribbleArea
                        anchors.fill: parent
                        visible: true
                    }
                }

//                Camera {
//                    id: camera
//                    captureMode: Camera.CaptureStillImage
//                }

//                VideoOutput {
//                    id: videoOutput
//                    source: camera
//                    visible: photo.state == "camera"
//                    focus: visible
//                    x: 0
//                    y: 0
//                    width: imgWidth
//                    height: imgHeight

//                    anchors.horizontalCenter: parent.horizontalCenter
//                    anchors.verticalCenter: parent.verticalCenter

//                    fillMode: Image.PreserveAspectCrop

//                    MouseArea {
//                        anchors.fill: parent;
//                        onClicked: {
//                            photo.busy = 1;
//                            scribbleArea.visible = true;
//                            ImageReader.captureFinished.connect(photo.relax);
//                            ImageReader.capture(videoOutput);
//                            photo.state = "default";
//                        }
//                    }
//                }

                property int busy: 0

                function relax(){
                    photo.busy=0;
                    myImg.source = "";
                    myImg.source = "image://ImageReader";
                    scribbleArea.visible = false;
                }

                BusyIndicator {
                    anchors.horizontalCenter: photo.horizontalCenter
                    anchors.verticalCenter: photo.verticalCenter
                    running: photo.busy === 1

                    style: BusyIndicatorStyle {
                        indicator: Image {
                            visible: control.running
                            source: "assets/spinner.png"
                            RotationAnimator on rotation {
                                running: control.running
                                loops: Animation.Infinite
                                duration: 2000
                                from: 360 ; to: 0
                            }
                        }
                    }
                }

                // open file
                FileDialog {
                    id: fileDialog
                    title: "Please choose a file"
                    folder: shortcuts.home
                    onAccepted: {
                        photo.busy = 1;
                        ImageReader.setSourceFinished.connect(photo.relax);
                        ImageReader.setSource(fileDialog.fileUrl);

                        photo.state = "default";
                        visible = false;
                    }
                    onRejected: {
                        visible = false;
                        photo.state = "default";
                    }
                    visible: false
                }

                // dealing with state changing in optionMenu
                Connections {
                    target: optionMenu
                    onClicked: photo.state = optionMenu.myState
                }

                property bool isTracing: false

                Connections {
                    target: toolBox
                    onFlowerClicked: {
                        photo.state = "default";
                        photo.state = "color";
                        if(toolBox.flowerName!="lasso")
                        {
                            photo.busy = 1;
                            ImageReader.colorFinished.connect(photo.relax);
                            ImageReader.color(myImg, toolBox.flowerName);
                        }
                        else
                        {
                            photo.isTracing = !photo.isTracing;

                            if(photo.isTracing==true)
                            {
                                ImageReader.initLasso(myImg);
                            }
                            else
                            {
                                ImageReader.eraseLasso();
                                myImg.source = "";
                                myImg.source = "image://ImageReader";
                            }
                        }
                    }
                }
            }
        }

        // for each menu, show its toolbox
        ToolBox {
            id: toolBox

            // dealing with state changing in optionMenu
            Connections {
                target: optionMenu
                onClicked: toolBox.state = optionMenu.myState
            }
        }
    }
}
