var CellType = {
    Zero: 0,
    One: 1,
    Two: 2,
    Three: 3,
    Foure: 4,
    Five: 5,
    Six: 6,
    Seven: 7,
    Eight: 8,
    Pole: 9,
    Mine: 10,
    Flag: 11,
    PushedMine: 13,
    properties: {
        0: { src: "images/0.jpg", value: 0 ,type : "Number"},
        1: { src: "images/1.jpg", value: 1, type: "Number" },
        2: { src: "images/2.jpg", value: 2, type: "Number" },
        3: { src: "images/3.jpg", value: 3, type: "Number" },
        4: { src: "images/4.jpg", value: 4, type: "Number" },
        5: { src: "images/5.jpg", value: 5, type: "Number" },
        6: { src: "images/6.jpg", value: 6, type: "Number" },
        7: { src: "images/7.jpg", value: 7, type: "Number" },
        8: { src: "images/8.jpg", value: 8, type: "Number" },
        9: { src: "images/POLE.jpg", value: '', type: "Pole" },
        10: { src: "images/MINE.jpg", value: 'M', type: "Mine" },
        11: { src: "images/FLAG.jpg", value: 'F', type: "Flag" },
        13: { src: "images/MINEPUSHED.jpg", value: 'MP', type: "Mine" },
    }
};

var HeadersCellType = {
    Mines: 0,
    Smile: 1,
    Timer: 2,
    Result: 3
};

var FaceEnum = {
    SmileFace: "o_o",
    ShockedFace: "0_0",
    BossFace: "$_$",
    DieFace: "x_x",
}

var GameStatusEnum = {
    NotStart: 0,
    Gaming: 1,
    GameOver: 2,
    GameWin: 3,
    properties: {
        2: { src: "images/GAMEOVER.jpg" },
        3: { src: "images/GAMEWIN.jpg"},
    }
};

var LevelEnum = {
    Low: 0,
    Middle: 1,
    Hight: 2,
    
    properties: {
        0: { rows:9, columns:9 ,mines :14, value:0},
        1: { rows: 15, columns: 15, mines: 20, value: 1},
        2: { rows: 20, columns: 21, mines: 25, value: 2 },
    }
};

var Sapper = function (table) {
    var self = this;

    var Matrix;
    var Table = $(table);
    var Status = GameStatusEnum.NotStart;
    var Level;

    var DisplayMines;
    var DisplayFace;
    var DisplayTime;
    var DisplayResult;
    var Timer;

    function CellObject () {
    this.type = null;
    this.refToCell = null;
    this.row = null;
    this.column = null;
    this.noted = false;
    this.viewed = false;
    }

    function HeaderCellObject(HeadersCellType) {
        this.refToCell = null;
        this.value = 0;
        this.type = HeadersCellType;
    }

    function CreateMatrixArray(rows, columns) {
        var arr = new Array();
        for (var i = 0; i < rows; i++) {
            arr[i] = new Array();
            for (var j = 0; j < columns; j++) {
                
                arr[i][j] = new CellObject();
            }
        }
        return arr;
    }

    function CreateHeaders() {
        var arr = new Array();
        var head = createTr().appendTo(createThead());

        DisplayMines = new HeaderCellObject(HeadersCellType.Mines);
        DisplayMines.value = Level.mines;
        newTh = new createTh(Level.columns / 3);
        newTh.appendTo(head);
        DisplayMines.refToCell = newTh;

        DisplayFace = new HeaderCellObject(HeadersCellType.Smile);
        newTh = new createTh(Level.columns / 3 + Level.columns%3);
        newTh.appendTo(head);
        DisplayFace.refToCell = newTh;

        DisplayTime = new HeaderCellObject(HeadersCellType.Timer);
        DisplayTime.value = 1;
        newTh = new createTh(Level.columns / 3);
        newTh.appendTo(head);
        DisplayTime.refToCell = newTh;

        DisplayResult = new HeaderCellObject(HeadersCellType.Result);
        ResultImagehead = createTr().appendTo(createThead());
        newTh = new createTh(Level.columns).hide();
        newTh.appendTo(ResultImagehead);
        DisplayResult.refToCell = newTh;
       
        ResultImagehead.appendTo(Table);
        head.appendTo(Table);
    }

    function Createlevel(level, columns, mines) {
        if (!columns && !mines) {
            return LevelEnum.properties[level];
        } else {
            this.rows = parseInt(level);
            this.columns = parseInt(columns);
            this.mines = parseInt(mines);
        }

    }

    self.CreateSapperMap = function (level,columns,mines) {
        Table.html('');

        clearTimeout(Timer);
        Level = new Createlevel(level,columns,mines);
        Status = GameStatusEnum.NotStart;
        Matrix = CreateMatrixArray(Level.rows, Level.columns);
        CreateHeaders();

        var tbody = createBody().appendTo(Table);

        for (var i = 0; i < Matrix.length; i++) {
            var newTr = new createTr();
            for (var j = 0; j < Matrix[i].length; j++) {
                var newTd = new createTd(i,j);
                newTd.appendTo(newTr);
                Matrix[i][j].refToCell = newTd;
                Matrix[i][j].row = i;
                Matrix[i][j].column = j;
                Matrix[i][j].type = CellType.Zero;
            }
            newTr.appendTo(tbody);
        }

        setMines();
        setNumbers();
        SetDisplayMines(0);
        SetDisplayFace(FaceEnum.SmileFace)

        goAcrossMap(function(data) {
            setCSSToCell(data, CellType.Pole,false);
        }) 
    }

    

    function setCSSToCell(cell, celltype,isPushed) {
        cell.refToCell.css("background-image", 'url(' + CellType.properties[celltype].src + ')').css("background-size", "cover").css("border-style", isPushed ? "ridge" : "outset");
    }

    function showRealCellType() {
        goAcrossMap(function(data) {
            setCSSToCell(data, data.type,true);
        })
    }

    function note (cell) {
        if (!cell.viewed) {
            if (!cell.noted) {
                    cell.noted = true;
                    SetDisplayMines(-1)
                setCSSToCell(cell, CellType.Flag,true);                
            } else {
                cell.noted = false;
                SetDisplayMines(1)
                setCSSToCell(cell, CellType.Pole,false);
            }
        }
    }

    function getCellInfo(event) {
        if (Status == GameStatusEnum.GameWin || Status == GameStatusEnum.GameOver) {
            CleanMap();
            return;
        }

        
        var currentCell = $(event);
        var row = currentCell.data('row');
        var column = currentCell.data('column');
        return Matrix[row][column];
    }

   
    function SetDisplayTime() {
        var val = DisplayTime.value++;
        DisplayTime.refToCell.html(val);
        Timer = setTimeout(SetDisplayTime, 1000);
    }

    function SetDisplayMines(val) {
       
        var newval = DisplayMines.value += val;
        DisplayMines.refToCell.html(newval);
    }

    function SetDisplayFace(val) {

         DisplayFace.value = val;
        DisplayFace.refToCell.html(val);
    }

    function Game(cell) {
        if (Status != GameStatusEnum.Gaming) {
            Timer = setTimeout(SetDisplayTime, 1000);
            Status = GameStatusEnum.Gaming;
        }
        if (!cell.noted) {
            if (cell.type == CellType.Mine) {
                ShowResult(false, cell);
            } else {
                SetDisplayFace(FaceEnum.SmileFace)
                if (cell.type != CellType.Zero) {
                    ShowCells(cell, false);
                }
                else {
                    ShowCells(cell, true);
                }
                checkForVictory();
            }
        }
    }

    function checkForVictory() {
        var NotViewed = true;

        goAcrossMap(
            function(data) {
                if (!data.viewed && data.type !== CellType.Mine) {
                    NotViewed = false;
                }

            });
        if (NotViewed) {
            ShowResult(true);
        }
    }

    function ShowResult(isWin,cell) {
        clearTimeout(Timer);
        showRealCellType();
        if (isWin) {
            Status = GameStatusEnum.GameWin;
            SetDisplayFace(FaceEnum.BossFace);
            DisplayResult.refToCell.css("background-image", 'url(' + GameStatusEnum.properties[GameStatusEnum.GameWin].src + ')').css("background-size", "cover").css("height", Level.columns * 10 + "px").show("slow");
        } else {
            Status = GameStatusEnum.GameOver;
            SetDisplayFace(FaceEnum.DieFace);
            setCSSToCell(cell, CellType.PushedMine,true);
            DisplayResult.refToCell.css("background-image", 'url(' + GameStatusEnum.properties[GameStatusEnum.GameOver].src + ')').css("background-size", "cover").css("height", Level.columns * 10 + "px").show("slow");
        }
    }

    function CleanMap() {
        clearTimeout(Timer);
        if (Level.value) {
            self.CreateSapperMap(Level.value);
        } else {
            self.CreateSapperMap(Level.rows,Level.columns,Level.mines);
        }

    }

    function ShowCells(cell, recs) {
        if (!cell.noted) {
            if (!cell.viewed) {
               setCSSToCell(cell, cell.type,true); 
               cell.viewed = true;

                if (recs) {
                    lookAround(cell, CellType.Zero, function(data, recs) {
                        if (!data.viewed)
                            setTimeout(function () {
                                ShowCells(data, recs); return true;
                            });
                    })
                }
            }
        }
    } 

   function setMines() {
        var i = 1;
        while (i <= Level.mines) {
            x = Math.floor(Math.random() * Level.rows);
            y = Math.floor(Math.random() * Level.columns);

            if (Matrix[x][y].type == CellType.Mine) continue;
            Matrix[x][y].type = CellType.Mine;
            i++;
        }
    }

   function setNumbers() {

        goAcrossMap(function (data) {

            if (data.type != CellType.Mine) {
                numberCount = 0;
                lookAround(data, CellType.Mine, function (data) {
                        numberCount++;
                })
                data.type = numberCount;
            }
        })
    }

    function lookAround(data, neededCellType, callback) {

        if (Matrix[data.row + 1] && Matrix[data.row + 1][data.column] && ComparationTypes(Matrix[data.row + 1][data.column].type , neededCellType)) {
            callback(Matrix[data.row + 1][data.column], Matrix[data.row + 1][data.column].type==CellType.Zero);
        }
        if (Matrix[data.row][data.column + 1] && ComparationTypes(Matrix[data.row][data.column + 1].type , neededCellType)) {
            callback(Matrix[data.row][data.column + 1], Matrix[data.row][data.column + 1].type == CellType.Zero);
        }
        if (Matrix[data.row][data.column - 1] && ComparationTypes(Matrix[data.row][data.column - 1].type , neededCellType)) {
            callback(Matrix[data.row][data.column - 1], Matrix[data.row][data.column - 1].type == CellType.Zero);
        }
        if (Matrix[data.row - 1] && Matrix[data.row - 1][data.column] && ComparationTypes(Matrix[data.row - 1][data.column].type , neededCellType)) {
            callback(Matrix[data.row - 1][data.column], Matrix[data.row - 1][data.column].type == CellType.Zero);
        }
        if (Matrix[data.row - 1] && Matrix[data.row - 1][data.column + 1] && ComparationTypes(Matrix[data.row - 1][data.column + 1].type , neededCellType)) {
            callback(Matrix[data.row - 1][data.column + 1], Matrix[data.row - 1][data.column + 1].type == CellType.Zero);
        }
        if (Matrix[data.row - 1] && Matrix[data.row - 1][data.column - 1] && ComparationTypes(Matrix[data.row - 1][data.column - 1].type , neededCellType)) {
            callback(Matrix[data.row - 1][data.column - 1], Matrix[data.row - 1][data.column - 1].type == CellType.Zero);
        }
        if (Matrix[data.row + 1] && Matrix[data.row + 1][data.column + 1] && ComparationTypes(Matrix[data.row + 1][data.column + 1].type , neededCellType)) {
            callback(Matrix[data.row + 1][data.column + 1], Matrix[data.row + 1][data.column + 1].type == CellType.Zero);
        }
        if (Matrix[data.row + 1] && Matrix[data.row + 1][data.column - 1] && ComparationTypes(Matrix[data.row + 1][data.column - 1].type , neededCellType)) {
                callback(Matrix[data.row + 1][data.column - 1], Matrix[data.row + 1][data.column - 1].type == CellType.Zero);
        }
    }

  function ComparationTypes(first, second) {
     return CellType.properties[first].type == CellType.properties[second].type
  }

  function goAcrossMap(callback) {
        for (var i = 0; i < Matrix.length; i++) {
            for (var j = 0; j < Matrix[i].length; j++) {
                callback(Matrix[i][j]);
            }
        }
    }

  Table.bind("contextmenu", function (event) {
      event.preventDefault();
  })

  Table.on('mouseup', 'td[data-column]', function (e) {
      if (Status != GameStatusEnum.GameWin && Status != GameStatusEnum.GameOver) {
          SetDisplayFace(FaceEnum.SmileFace)
          var clickedCell = getCellInfo(this);
          if (!clickedCell.viewed && !clickedCell.noted) {
              SetDisplayFace(FaceEnum.SmileFace)
              clickedCell.refToCell.css("border-style", "outset");
          }
      }
  })

  Table.on('mousedown', 'td[data-column]', function (e) {
      if (Status != GameStatusEnum.GameWin && Status != GameStatusEnum.GameOver) {
          SetDisplayFace(FaceEnum.SmileFace)
          var clickedCell = getCellInfo(this);
          if (!clickedCell.viewed && !clickedCell.noted) {
              SetDisplayFace(FaceEnum.ShockedFace)
              clickedCell.refToCell.css("border-style", "ridge");
          }
      }
  })

  Table.on('mousemove', 'td[data-column]', function (e) {

      if (Status != GameStatusEnum.GameWin && Status != GameStatusEnum.GameOver && Status != GameStatusEnum) {
          SetDisplayFace(FaceEnum.SmileFace)
          var clickedCell = getCellInfo(this);
          if (!clickedCell.viewed && !clickedCell.noted) {
              clickedCell.refToCell.css("border-style", "outset");
          }
      }
  })

  Table.on('click', 'td[data-column]', function (e) {
      Game(getCellInfo(this));
  })

  Table.on('contextmenu', 'td[data-column]', function (e) {
      if (Status == GameStatusEnum.Gaming) {
          SetDisplayFace(FaceEnum.SmileFace)
          note(getCellInfo(this));
          checkForVictory();
      }
  })

   var createTd = function (row, column) {
       var template = "<td data-column='" + column + "' data-row='" + row + "'></td>";

        return $(template);
    }

   var createTr = function () {
        var template = '<tr></tr>';

        return $(template);
   }

   var createBody = function () {
       var template = '<tbody></tbody>';

       return $(template);
   }

   var createThead = function () {
       var template = '<thead></thead>';

       return $(template);
   }

   var createTh = function (colspan) {
       var template = '<th' + (colspan ? ' colspan="' + colspan + '"' : '') + ' ></th>';

       return $(template);
   }
}
