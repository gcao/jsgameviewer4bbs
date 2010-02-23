GOCOOL_GAME_ID_PATTERN = /gid=(\d+)/i;

Object.extend(CONFIG, {
  gocoolUrlPrefix: "/app/"
});

Object.extend(GameController.prototype, {
  loadGocoolGame: function(id, n){
    this.gocoolId = id;
    var conf = this.config;
    return this.load(conf.gocoolUrlPrefix + "games/" + id + ".sgf", n);
  },

  createGocoolPlayer: function(){
    this.setPlayer(new GocoolPlayer(this));
    return this;
  }
});

var GocoolPlayer = Class.create();
Object.extend(GocoolPlayer.prototype, {
  initialize: function(gameController){
    this.gameController = gameController;
  },

  isPlayer: function(){
    var c = this.gameController;
    var username = c.getUsername();
    return username == this.parseUsername(c.game.blackName) || username == this.parseUsername(c.game.whiteName);
  },

  isMyTurn: function(){
    var c = this.gameController;
    var username = c.getUsername();
    var nextPlayerColor = c.game.getNextPlayer();
    return (nextPlayerColor == STONE_BLACK && username == this.parseUsername(c.game.blackName)) ||
           (nextPlayerColor == STONE_WHITE && username == this.parseUsername(c.game.whiteName));
  },

  parseUsername: function(s){
    var i = s.indexOf('(');
    var j = s.indexOf(')');
    if (i >= 0 & j > i){
      return s.substring(i+1, j);
    } else {
      return s;
    }
  },

  sendMove: function(color, moveNumber, x, y, prevX, prevY){
    var c = this.gameController;
    var node = c.gameState.currentNode;
    var parentNode = node.parent;
    if (node.temp && (!parentNode || !parentNode.temp)){
      // node contains the first try move.
    } else {
      //alert("This is not the first TRY move.");
      alert("�ⲻ�������µĵ�һ����");
      return false;
    }
    var prevX = null, prevY = null;
    if (parentNode){
      prevX = parentNode.x;
      prevY = parentNode.y;
    }
    var color = node.color;
    var moveNumber = node.moveNumber;
    var x = node.x, y = node.y;
    var gid = this.getGameId(c.game.url);
    if (!gid || gid.length == 0){
      //alert("DGS game ID not found!");
      alert("δ֪DGS�Ծֺţ��ڶԾ�URL��δ�ҵ�gid=###��###Ϊ�Ծֺţ�");
      return false;
    }
    var url = "/jsgameviewer/php/dgs.php?command=PLAY&gid="+gid;
    url += "&color=" + (color==STONE_BLACK?"B":"W");
    url += "&move=" + moveNumber;
    var xyToSgf = function(x,y){
      if (x && x >= 0 && y && y >= 0){
        return String.fromCharCode('a'.charCodeAt(0)+x, 'a'.charCodeAt(0)+y);
      }
      return null;
    }
    var sgf_move = xyToSgf.call(this, x,y);
    url += "&sgf_move=" + sgf_move;
    var sgf_prev = xyToSgf.call(this, prevX, prevY);
    if (sgf_prev != null)
      url += "&sgf_prev=" + sgf_prev;
    jq.ajax({url: url,
      success:function(response){
        if (response.charAt(0) == '0'){ // success
          c.refresh();
        } else { // failure
          c.setComment(response);
          //alert("Operation failed!");
          alert("����ʧ�ܣ���μ������ұߵ�ԭʼ������Ϣ��");
        }
      },
      error: function(XMLHttpRequest, textStatus, errorThrown){
        c.setComment(textStatus + " " + errorThrown);
        //alert("Operation failed!");
        alert("����ʧ�ܣ���μ������ұߵ�ԭʼ������Ϣ��");
      }
    });
    return true;
  },

  resign: function(){
    var c = this.gameController;
    var gid = this.getGameId(c.game.url);
    if (!gid || gid.length == 0){
      //alert("DGS game ID not found!");
      alert("δ֪DGS�Ծֺţ��ڶԾ�URL��δ�ҵ�gid=###��###Ϊ�Ծֺţ�");
      return false;
    }
    var node = c.gameState.rootNode;
    while(node.hasChildren()){
      var n = node.children[0];
      if (n.temp)
        break;
      else
        node = n;
    }
    var moveNumber = node.moveNumber;
    var url = "/jsgameviewer/php/dgs.php?command=RESIGN&gid="+gid+"&move="+moveNumber;
    jq.ajax({url: url,
      success:function(response){
        if (response.charAt(0) == '0'){ // success
          c.refresh();
        } else { // failure
          c.setComment(response);
          //alert("Operation failed!");
          alert("����ʧ�ܣ���μ������ұߵ�ԭʼ������Ϣ��");
        }
      },
      error: function(XMLHttpRequest, textStatus, errorThrown){
        c.setComment(textStatus + " " + errorThrown);
        //alert("Operation failed!");
        alert("����ʧ�ܣ���μ������ұߵ�ԭʼ������Ϣ��");
      }
    });
    return true;
  }
});
