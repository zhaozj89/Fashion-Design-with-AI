$(document).ready(function () {
    "use strict";

    var mainTable = $('<table></table>');
    $(document.body).append(mainTable);

    mainTable.load(GLOBAL.MAINTABLETEMPLATE, function (e) {
        GLOBAL.width = GLOBAL.WIDTHDEFAULT;
        GLOBAL.height = GLOBAL.HEIGHTDEFAULT;

        // tools
        GLOBAL.nameButtonsTools = 'ButtonsTools';
        GLOBAL.resetEditModeButtons();

        // layers
        setTimeout(function(){
            GLOBAL.designLayer = new GLOBAL.GridCanvas($('#tdCanvas'), GLOBAL.width, GLOBAL.height, GLOBAL.COLORBLACK);

            GLOBAL.layers = [GLOBAL.designLayer];
            GLOBAL.layer = GLOBAL.designLayer;

        }, 100);
    });

    // var undoManager,
    //     circleDrawer,
    //     btnUndo,
    //     btnRedo,
    //     btnClear;
    //
    // undoManager = new UndoManager();
    // undoManager.setLimit(100);
    // circleDrawer = new CircleDrawer("view", undoManager);
    //
    // btnUndo = document.getElementById("btnUndo");
    // btnRedo = document.getElementById("btnRedo");
    // btnClear = document.getElementById("btnClear");
    //
    // function updateUI() {
    //     btnUndo.disabled = !undoManager.hasUndo();
    //     btnRedo.disabled = !undoManager.hasRedo();
    // }
    // undoManager.setCallback(updateUI);
    //
    // btnUndo.onclick = function () {
    //     undoManager.undo();
    //     updateUI();
    // };
    // btnRedo.onclick = function () {
    //     undoManager.redo();
    //     updateUI();
    // };
    // btnClear.onclick = function () {
    //     undoManager.clear();
    //     updateUI();
    // };
    //
    // updateUI();
});
