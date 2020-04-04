;$$calendars = (function(){

  var __options = {
    target          : "",
    mode            : "default",
    start_event     : "focus",
    date_type       : "blank",
    date_string     : "",
    view_date       : 0,

    margin_top      : "4px",
    view_position   : "element-bottom",

    flg_date_active : "all",
    format_output   : "yyyy/mm/dd",     // [yyyy/mm/dd , yyyy/m/d , yyyy-m-d]
    readonly        : true,

    button_ok       : false,
    button_close    : true,
    button_today    : true,

    dom : {
      base  : ".calendars",
      table : ".calendars .table",
      year  : ".calendars .year",
      month : ".calendars .month",
      body  : ".calendars .body",
      prev  : ".calendars .prev",
      next  : ".calendars .next",
      date  : ".calendars .date",
      foot  : ".calendars .foot",
      
      button_today : ".calendars .today",
      button_close : ".calendars .close",
      button_ok    : ".calendars .ok"
    }
  };



  var LIB = function(){};

	LIB.prototype.event = function(target, mode, func){
		if (target.addEventListener){target.addEventListener(mode, func, false)}
		else{target.attachEvent('on' + mode, function(){func.call(target , window.event)})}
	};

	LIB.prototype.urlinfo = function(uri){
    uri = (uri) ? uri : location.href;
    var data={};
    var urls_hash  = uri.split("#");
    var urls_query = urls_hash[0].split("?");
		var sp   = urls_query[0].split("/");
		var data = {
      uri      : uri
		,	url      : sp.join("/")
    , dir      : sp.slice(0 , sp.length-1).join("/") +"/"
    , file     : sp.pop()
		,	domain   : sp[2] ? sp[2] : ""
    , protocol : sp[0] ? sp[0].replace(":","") : ""
    , hash     : (urls_hash[1]) ? urls_hash[1] : ""
		,	query    : (urls_query[1])?(function(urls_query){
				var data = {};
				var sp   = urls_query.split("#")[0].split("&");
				for(var i=0;i<sp .length;i++){
					var kv = sp[i].split("=");
					if(!kv[0]){continue}
					data[kv[0]]=kv[1];
				}
				return data;
			})(urls_query[1]):[]
		};
		return data;
  };

  LIB.prototype.upperSelector = function(elm , selectors) {
    selectors = (typeof selectors === "object") ? selectors : [selectors];
    if(!elm || !selectors){return;}
    var flg = null;
    for(var i=0; i<selectors.length; i++){
      for (var cur=elm; cur; cur=cur.parentElement) {
        if (cur.matches(selectors[i])) {
          flg = true;
          break;
        }
      }
      if(flg){
        break;
      }
    }
    return cur;
  }

  LIB.prototype.currentScriptTag = (function(){
    var scripts = document.getElementsByTagName("script");
    return this.currentScriptTag = scripts[scripts.length-1].src;
  })();


  LIB.prototype.pos = function(e,t){

		//エレメント確認処理
		if(!e){return null;}

		//途中指定のエレメントチェック（指定がない場合はbody）
		if(typeof(t)=='undefined' || t==null){
			t = document.body;
		}

		//デフォルト座標
		var pos={x:0,y:0};
		do{
			//指定エレメントでストップする。
			if(e == t){break}

			//対象エレメントが存在しない場合はその辞典で終了
			if(typeof(e)=='undefined' || e==null){return pos;}

			//座標を足し込む
			pos.x += e.offsetLeft;
			pos.y += e.offsetTop;
		}

		//上位エレメントを参照する
		while(e = e.offsetParent);

		//最終座標を返す
		return pos;
	};

  LIB.prototype.construct = function(){
    var lib = new LIB();

    switch(document.readyState){
      case "complete"    : new MAIN;break;
      case "interactive" : lib.event(window , "DOMContentLoaded" , function(){new MAIN});break;
      default            : lib.event(window , "load" , function(){new MAIN});break;
		}
  };


  var AJAX = function(options){
    if(!options){return}
		var httpoj = this.createHttpRequest();
		if(!httpoj){return;}
		// open メソッド;
		var option = this.setOption(options);

		// queryデータ
		var data = this.setQuery(option);
		if(!data.length){
			option.method = "get";
		}

		// 実行
		httpoj.open( option.method , option.url , option.async );
		// type
		if(option.type){
			httpoj.setRequestHeader('Content-Type', option.type);
		}
		
		// onload-check
		httpoj.onreadystatechange = function(){
			//readyState値は4で受信完了;
			if (this.readyState==4 && httpoj.status == 200){
				//コールバック
				option.onSuccess(this.responseText);
			}
		};

		// FormData 送信用
		if(typeof option.form === "object" && Object.keys(option.form).length){
			httpoj.send(option.form);
		}
		// query整形後 送信
		else{
			//send メソッド
			if(data.length){
				httpoj.send(data.join("&"));
			}
			else{
				httpoj.send();
			}
		}
		
  };
	AJAX.prototype.dataOption = {
		url:"",
		query:{},				// same-key Nothing
		querys:[],			// same-key OK
		data:{},				// ETC-data event受渡用
		form:{},
		async:"true",		// [trye:非同期 false:同期]
		method:"POST",	// [POST / GET]
		type:"application/x-www-form-urlencoded", // ["text/javascript" , "text/plane"]...
		onSuccess:function(res){},
		onError:function(res){}
	};
	AJAX.prototype.option = {};
	AJAX.prototype.createHttpRequest = function(){
		//Win ie用
		if(window.ActiveXObject){
			//MSXML2以降用;
			try{return new ActiveXObject("Msxml2.XMLHTTP")}
			catch(e){
				//旧MSXML用;
				try{return new ActiveXObject("Microsoft.XMLHTTP")}
				catch(e2){return null}
			}
		}
		//Win ie以外のXMLHttpRequestオブジェクト実装ブラウザ用;
		else if(window.XMLHttpRequest){return new XMLHttpRequest()}
		else{return null}
	};
	AJAX.prototype.setOption = function(options){
		var option = {};
		for(var i in this.dataOption){
			if(typeof options[i] != "undefined"){
				option[i] = options[i];
			}
			else{
				option[i] = this.dataOption[i];
			}
		}
		return option;
	};
	AJAX.prototype.setQuery = function(option){
		var data = [];
		if(typeof option.datas !== "undefined"){

			// data = option.data;
			for(var key of option.datas.keys()){
				data.push(key + "=" + option.datas.get(key));
			}
		}
		if(typeof option.query !== "undefined"){
			for(var i in option.query){
				data.push(i+"="+encodeURIComponent(option.query[i]));
			}
		}
		if(typeof option.querys !== "undefined"){
			for(var i=0;i<option.querys.length;i++){
				if(typeof option.querys[i] == "Array"){
					data.push(option.querys[i][0]+"="+encodeURIComponent(option.querys[i][1]));
				}
				else{
					var sp = option.querys[i].split("=");
					data.push(sp[0]+"="+encodeURIComponent(sp[1]));
				}
			}
		}
		return data;
	};




  var MAIN = function(options){
    if(!options){
      console.log("Error ! no-options.");
    }
    this.options = this.setOptions(options);
    if(!this.checkTarget){
      console.log("Error . ( no target element. )");
      return;
    }

    // modules
    this.setCSS();
    this.setHTML();

    // view-event-set
    this.setStart();
  };

  MAIN.prototype.setOptions = function(options){
    options = options ? options : {};
    var res = JSON.parse(JSON.stringify(__options));
    for(var i in options){
      res[i] = options[i];
    }
    if(res.mode === "range"){
      res.button_ok = true;
    }
    return res;
  };

  MAIN.prototype.checkTarget = function(){
    if(!this.options.target
      || !document.querySelector(this.options.target)){
      return false;
    }
    else{
      return true;
    }
  };

  // set-css
  MAIN.prototype.setCSS = function(){
    if(document.querySelector("link[data-calendar='1']")){return}
    var myScript = new LIB().currentScriptTag;
    var href = myScript.replace(".js",".css");
    var link = document.createElement("link");
    link.setAttribute("data-calendar","1");
    link.rel = "stylesheet";
    link.href = href;
    var head = document.getElementsByTagName("head");
    head[0].appendChild(link);
  };

  // カレンダー表示elementの構築（読み込み）
  MAIN.prototype.setHTML = function(){
    if(document.querySelector(this.options.dom.base)){return;}
    var myScript = new LIB().currentScriptTag;
    var url = myScript.replace(".js",".html");
    new AJAX({
      url : url,
      method : "get",
      onSuccess : (function(res){
        if(!res){return;}
        this.options.calendar_body = res;
      }).bind(this)
    });
  };

  // close-event
  MAIN.prototype.setCloseEvent = function(){
    var base = document.querySelector(this.options.dom.base);
    if(!base){return;}
    new LIB().event(base , "click" , (function(e){this.hidden(e)}).bind(this));
  };

  // 項目起動処理
  MAIN.prototype.setStart = function(){
    var targets = document.querySelectorAll(this.options.target);
    if(!targets || !targets.length || !this.options.start_event){return;}
    // var targets = document.querySelectorAll(this.options.target);
    // if(!targets || !targets.length){return}
    if(this.options.mode === "range" && targets.length === 2){
      // start
      var elm_start = targets[0];
      new LIB().event(elm_start , this.options.start_event , (function(e){this.click_target(e);}).bind(this));
      // end
      var elm_end   = targets[1];
      new LIB().event(elm_end , this.options.start_event , (function(e){this.click_target(e);}).bind(this));
      this.default_value_range([elm_start,elm_end]);
    }
    else{
      for(var i=0; i<targets.length; i++){
        this.set_readonly(targets[i]);
        new LIB().event(targets[i] , this.options.start_event , (function(e){this.click_target(e);}).bind(this));
        this.default_value(targets[i]);
      }
    }
  };

  MAIN.prototype.set_readonly = function(elm){
    if(this.options.readonly === true){
      elm.readOnly = true;
    }
  };

  MAIN.prototype.click_target = function(e){
    var target = e.target;
    if(!target){return;}
    this.view(target);

    if(this.options.mode === "range"){
      var elms = document.querySelectorAll(this.options.target);
      if(!elms || elms.length < 2){return;}
      var dateArr = [];
      
      if(elms[0] && elms[0].tagName === "INPUT" && elms[0].value){
        // dateArr = this.convertDateFormat(elms[1].value);
        dateArr.push(this.convertDateFormat(elms[0].value));
      }
      if(elms[1] && elms[1].tagName === "INPUT" && elms[1].value){
        dateArr.push(this.convertDateFormat(elms[1].value));
      }

      var dt = typeof (dateArr[this.options.view_date]) !== "undefined" ? dateArr[this.options.view_date] : null;
      this.calendar(dt);
    }

    else{
      if(target.tagName !== "INPUT"){return}
      var dateArr = this.convertDateFormat(target.value);
      if(!dateArr || !dateArr.y || !dateArr.m || !dateArr.d){return;}
      this.calendar(dateArr);
    }
  };
  

  MAIN.prototype.convertDateFormat = function(string_ymd){
    if(!string_ymd){return null;}
    if(string_ymd.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/)){
      return {
        y : Number(RegExp.$1),
        m : Number(RegExp.$2),
        d : Number(RegExp.$3)
      };
    }
    // yyyymmdd
    else if(string_ymd.match(/^(\d{4})(\d{2})(\d{2})$/)){
      return {
        y : Number(RegExp.$1),
        m : Number(RegExp.$2),
        d : Number(RegExp.$3)
      };
    }
    else{
      return null;
    }
  };

  // カレンダーを開いた時に、対象項目から値を取得する
  MAIN.prototype.setDateArray = function(){
    var targets = document.querySelectorAll(this.options.target);
    if(this.options.mode === "range"){
      if(typeof targets[0] !== "undefined"){
        this.options.current   = this.convertDateFormat(targets[0].value);
      }
      if(typeof targets[1] !== "undefined"){
        this.options.range_end = this.convertDateFormat(targets[1].value);
      }
    }
    else{
      this.options.current = this.convertDateFormat(targets[0].value);
    }
  };



  MAIN.prototype.view = function(target){
    if(!target){return}

    this.options.target_element = target;
    this.setDateArray();

    var calendar = document.querySelector(this.options.dom.base);
    if(calendar){
      this.close();
    }
    document.body.insertAdjacentHTML("beforeend",this.options.calendar_body);
    this.setCloseEvent();
    calendar = document.querySelector(this.options.dom.base);

    // position
    var table = document.querySelector(this.options.dom.table);
    if(!table){return}
    var pos = {top : 0,left : 0};
    switch(this.options.view_position){
      case "center":
        pos.top  = (window.innerHeight / 2) - (table.offsetHeight / 2);
        pos.left = (window.innerWidth  / 2) - (table.offsetWidth / 2);
        break;

      case "element-bottom":
        var bounce = target.getBoundingClientRect();
        var pos = new LIB().pos(target);
        var top  = pos.y  + bounce.height;
        var left = bounce.left + document.body.scrollLeft;
        pos.top  = top;
        pos.left = left;
        break;
    }
    table.style.setProperty("top"  , pos.top  + "px" , "");
    table.style.setProperty("left" , pos.left + "px" , "");

    // buttons
    this.setButton(calendar);

    // view
    calendar.setAttribute("data-view","1");
  };

  // クリック箇所に応じて非表示にする
  MAIN.prototype.hidden = function(e){
    var calendar = document.querySelector(this.options.dom.base);
    if(!calendar){return;}
    if(e.target.className !== calendar.className){return;}

    // hidden
    this.close();
  };

  // 無条件でカレンダーを非表示にする
  MAIN.prototype.close = function(){
    var calendar = document.querySelector(this.options.dom.base);
    if(!calendar){return;}

    calendar.parentNode.removeChild(calendar);
  };

  MAIN.prototype.setButton = function(calendar){
    var today = calendar.querySelector(this.options.dom.button_today);
    if(today && this.options.button_today !== true){
      today.style.setProperty("display","none","");
    }

    var close = calendar.querySelector(this.options.dom.button_close);
    if(close && this.options.button_close !== true){
      close.style.setProperty("display","none","");
    }

    var ok = calendar.querySelector(this.options.dom.button_ok);
    if(ok && this.options.button_ok !== true){
      ok.style.setProperty("display","none","");
    }
  };




  // カレンダーの表示処理（内容切り替え処理）
  MAIN.prototype.calendar = function(dateArr){
    dateArr = dateArr ? dateArr : this.getDate_today();
    this.setYearMonth(dateArr);   // year,month
    this.setDate(dateArr);        // dates
    this.setEvent();              // event
    this.options.date = dateArr;  // cache
  };

  MAIN.prototype.setYearMonth = function(dateArr){
    var calendar = document.querySelector(this.options.dom.base);
    if(!calendar){return;}
      calendar.querySelector(this.options.dom.year ).innerHTML = dateArr.y;
      calendar.querySelector(this.options.dom.month).innerHTML = dateArr.m;
  };

  MAIN.prototype.setDate = function(dateArr){
    var calendar = document.querySelector(this.options.dom.base);
    if(!calendar){return}

    var startDay  = new Date(dateArr.y, dateArr.m-1, 1).getDay();// その月の最初の日の曜日を取得
    var endDay    = new Date(dateArr.y, dateArr.m  , 0).getDay();// その月の最後の日の曜日を取得
    var endDate   = new Date(dateArr.y, dateArr.m  , 0).getDate();
    var textDate = 1; // 日付(これがカウントアップされます)
    var html =''; // テーブルのHTMLを格納する変数
    for (var row = 0; row < (endDate + startDay + (7 - endDay - 1)) / 7; row++){
      html += '<tr>';
      for (var col = 0; col < 7; col++) {
        if (row === 0 && col < startDay){
          html += "<td class='nil'>&nbsp;</td>";
        }
        else if (endDate < textDate) {
          html += "<td class='nil'>&nbsp;</td>";
        }
        else{
          var dateArr_current = {
            y : dateArr.y,
            m : dateArr.m,
            d : textDate
          };
          var mode   = this.getDate_className(dateArr_current);
          var select = this.getDate_selected(dateArr_current);
          html += '<td class="date" data-date-mode="'+ mode +'" data-select="'+ select +'">'+textDate+'</td>';
          textDate++;
        }
      }
      html += '</tr>';
    }
    calendar.querySelector(this.options.dom.body).innerHTML = html;
  };

  // [date , ""%blank]
  MAIN.prototype.getDate_className = function(current){

    var today = this.getDate_today();
    if(current.y === today.y
    && current.m === today.m
    && current.d === today.d){
      return "today";
    }

    var today_ms   = new Date(today.y   +"/"+ today.m   +"/"+ today.d);
    var current_ms = new Date(current.y +"/"+ current.m +"/"+ current.d);

    return this.checkDataActive(today_ms , current_ms);
  };

  MAIN.prototype.getDate_selected = function(current){
    if(this.options.mode === "range"){
      return this.getDate_selected_range(current);
    }
    else{
      return this.getDate_selected_single(current);
    }
  }
  MAIN.prototype.getDate_selected_single = function(select){
    if(this.options.current
    && this.options.current.y === select.y
    && this.options.current.m === select.m
    && this.options.current.d === select.d){
      return "1";
    }
    else{
      return "";
    }
  };

  MAIN.prototype.getDate_selected_range = function(dt){
    var start = this.options.current;
    var end   = this.options.range_end;
    if(!start || !end){
      return this.getDate_selected_single(dt);
    }
    var mode = this.checkRange_dateRelation(start , end);
    if(mode === 0){return "";}

    var date_num  = Date.parse(dt.y    +"/"+ dt.m    +"/"+ dt.d);
    var start_num = Date.parse(start.y +"/"+ start.m +"/"+ start.d);
    var end_num   = Date.parse(end.y   +"/"+ end.m   +"/"+ end.d);
    
    if(mode == 1 && start_num <= date_num && date_num <= end_num){
      return "1";
    }
    else if(mode == -1 && start_num >= date_num && date_num >= end_num){
      return "1";
    }
    else{
      return "";
    }
  };



  // today
  MAIN.prototype.getDate_today = function(adjust){
    var d = new Date();
    if(typeof adjust !== "undefined" && adjust){
      d.setDate(d.getDate() + Number(adjust));
    }
    return {
      y : d.getFullYear(),
      m : d.getMonth() + 1,
      d : d.getDate()
    };
  };


  MAIN.prototype.setEvent = function(){
    var calendar = document.querySelector(this.options.dom.base);
    if(!calendar){return}

    var lib = new LIB();

    // month-move
    var prev = calendar.querySelector(this.options.dom.prev);
    if(!prev.getAttribute("data-flg_event")){
      lib.event(prev, "click", (function(e){this.view_prevMonth(e)}).bind(this));
      prev.setAttribute("data-flg_event","1");
    }
    var next = calendar.querySelector(this.options.dom.next);
    if(!next.getAttribute("data-flg_event")){
      lib.event(next, "click", (function(e){this.view_nextMonth(e)}).bind(this));
      next.setAttribute("data-flg_event","1");
    }
    if(this.options.button_today === true){
      var today = calendar.querySelector(this.options.dom.button_today);
      if(!today.getAttribute("data-flg_event")){
        lib.event(today, "click", (function(e){
          var dateArr = this.getDate_today();
          this.calendar(dateArr);
        }).bind(this));
        today.setAttribute("data-flg_event","1");
      }
    }
    if(this.options.button_close === true){
      var close = calendar.querySelector(this.options.dom.button_close);
      if(!close.getAttribute("data-flg_event")){
        lib.event(close, "click", (function(e){this.close(e)}).bind(this));
        close.setAttribute("data-flg_event","1");
      }
    }
    if(this.options.button_ok === true){
      var ok = calendar.querySelector(this.options.dom.button_ok);
      if(!ok.getAttribute("data-flg_event")){
        lib.event(ok, "click", (function(e){this.clickButton_ok(e)}).bind(this));
        ok.setAttribute("data-flg_event","1");
      }
    }

    // day-click
    var days = calendar.querySelectorAll(this.options.dom.date +":not([data-date-mode='over'])");
    for(var i=0; i<days.length; i++){
      lib.event(days[i], "click", (function(e){this.dateClick(e)}).bind(this));
    }
  };



  MAIN.prototype.setMigrationMonth = function(move_value){
    var d = new Date(this.options.date.y +"/"+  this.options.date.m +"/"+ this.options.date.d);
    d.setMonth(d.getMonth() + Number(move_value));
    return {
      y : d.getFullYear(),
      m : d.getMonth() + 1,
      d : d.getDate()
    };
  };
  MAIN.prototype.view_prevMonth = function(){
    var dateArr = this.setMigrationMonth(-1);
    this.calendar(dateArr);
    this.setYearMonth(dateArr);
  };
  MAIN.prototype.view_nextMonth = function(){
    var dateArr = this.setMigrationMonth(+1);
    this.calendar(dateArr);
    this.setYearMonth(dateArr);
  };



  MAIN.prototype.checkDataActive = function(today_ms , current_ms){
    switch(this.options.flg_date_active){
      // 過去のみクリック可能
      case "past":
        if(today_ms < current_ms){
          return "over";
        }
        else{
          return "date";
        }

      // 未来のみクリック可能
      case "future":
        if(today_ms > current_ms){
          return "over";
        }
        else{
          return "date";
        }

      // 通常、または、すべてクリック可能
      case "all":
      default:
        return "date";
    }
  };

  MAIN.prototype.dateClick = function(e){
    var elm = e.currentTarget;
    var current = {
      y : this.options.date.y,
      m : this.options.date.m,
      d : Number(elm.textContent)
    };

    if(this.options.click){
      this.options.click(current);
    }

    // range処理(coloring)
    if(this.options.button_ok === true){
      if(this.options.mode === "range"){
        var range_mode = this.getRangeMode();
        if(range_mode === 2){
          this.options.current = null;
          this.options.range_end = null;
          range_mode = 0;
        }
        switch(range_mode){
          case 0:
          this.calendar_dateColor_single(current);
          break;
        
          case 1:
          default:
          this.calendar_dateColor_range(current);
          break;
        }
      }
      else{
        this.calendar_dateColor_single(current);
      }
    }
    // 通常(close)
    else{
      var target = this.options.target_element;
      if(!target || target.tagName !== "INPUT"){return;}
      target.value = this.convDateFormat(current);
      setTimeout((function(e){this.close(e)}).bind(this),100);

      // 任意処理の実行
      if(typeof this.options.select !== "undefined"){
        this.options.select(current);
      }
    }
    
    
  };

  MAIN.prototype.clickButton_ok = function(){
    if(this.options.mode === "range"){
      var targets = document.querySelectorAll(this.options.target);

      var start = typeof this.options.current   !== "undefined" ? this.options.current   : "";
      var end   = typeof this.options.range_end !== "undefined" ? this.options.range_end : "";

      if(!start && !end){return;}

      if(start && !end){
        var target = this.options.target_element;
        if(!target || target.tagName !== "INPUT"){return;}
        target.value = this.convDateFormat(start);
      }
      else{
        var mode = this.checkRange_dateRelation(start,end);

        if(start && mode == 1){
          targets[0].value = this.convDateFormat(start);
        }
        if(start && mode == -1){
          targets[1].value = this.convDateFormat(start);
        }
        if(end && mode == 1){
          targets[1].value = this.convDateFormat(end);
        }
        if(end && mode == -1){
          targets[0].value = this.convDateFormat(end);
        }
      }
    }
    else{
      var target = this.options.target_element;
      if(!target || target.tagName !== "INPUT"){return;}
      target.value = this.convDateFormat(this.options.current);
    }
    
    // 任意処理の実行
    if(typeof this.options.select !== "undefined"){
      this.options.select(this.options.current);
    }

    setTimeout((function(e){this.close(e)}).bind(this),100);
  };

  MAIN.prototype.calendar_dateColor_single = function(dateArr){
    this.options.current = dateArr;
    var body = document.querySelector(this.options.dom.body);
    if(!body){return;}
    var dates = body.querySelectorAll(this.options.dom.date);
    for(var i=0; i<dates.length; i++){
      if(dates[i].textContent == dateArr.d){
        dates[i].setAttribute("data-select","1");
      }
      else{
        dates[i].setAttribute("data-select","0");
      }
    }
  };
  /**
   * 基点クリック→終点クリックで日付の範囲選択ができる仕様
   * 基点クリック : this.options.current   => current_date{y,m,d}
   * 終点クリック : this.options.range_end => current_date{y,m,d}
   */
  MAIN.prototype.calendar_dateColor_range = function(dateArr){
    this.options.range_end = dateArr;
    var body = document.querySelector(this.options.dom.body);
    if(!body){return;}

    var dates = body.querySelectorAll(this.options.dom.date);
    for(var i=0; i<dates.length; i++){
      if(dates[i].textContent == dateArr.d){
        dates[i].setAttribute("data-select","1");
      }
    }
    this.calendar_select_between();
  };
  /**
   * return @ 
   * 0    : start
   * 1    : selected-start
   * 2    : range-selected
   * null : other
   */
  MAIN.prototype.getRangeMode = function(){
    if(typeof this.options.current === "undefined" || !this.options.current){
      return 0;
    }
    if((typeof this.options.current   !== "undefined" && this.options.current)
    && (typeof this.options.range_end === "undefined" || !this.options.range_end)){
      return 1;
    }
    else if((typeof this.options.current !== "undefined" && this.options.current)
    && (typeof this.options.range_end    !== "undefined" && this.options.range_end)){
      return 2;
    }
    else{
      return null;
    }
  };

  MAIN.prototype.calendar_select_between = function(){
    if(this.getRangeMode() !== 2){return;}
    var start = this.options.current;
    var end   = this.options.range_end;

    if(!start || !end){

      return;
    }
    
    // startとendの位置関係 [+1:start-end or -1:end-start]
    var mode = this.checkRange_dateRelation(start,end);
    
    var start_time = Date.parse(start.y+"/"+start.m+"/"+start.d);
    var end_time   = Date.parse(end.y  +"/"+end.m  +"/"+end.d);
    var year       = document.querySelector(this.options.dom.year).textContent;
    var month      = document.querySelector(this.options.dom.month).textContent;

    var body = document.querySelector(this.options.dom.body);
    if(!body){return;}

    var dates = body.querySelectorAll(this.options.dom.date);
    for(var i=0; i<dates.length; i++){
      var date_val  =  dates[i].textContent;
      var date_time = Date.parse(year+"/"+month+"/"+date_val);

      switch(mode){
        case 1:
        if(date_time > start_time && date_time <= end_time){
          dates[i].setAttribute("data-select","1");
        }
        break;

        case -1:
        if(date_time < start_time && date_time >= end_time){
          dates[i].setAttribute("data-select","1");
        }
        break;
      }
    }


  }

  // startとendの位置関係 [+1:start-end or -1:end-start]
  MAIN.prototype.checkRange_dateRelation = function(start , end){
    if(!start || !end){return 0;}
    var s_y = typeof (start.y) !== "undefined" ? start.y : "";
    var s_m = typeof (start.m) !== "undefined" ? start.m : "";
    var s_d = typeof (start.d) !== "undefined" ? start.d : "";
    var start_num = (s_y && s_m && s_d) ? Date.parse(s_y+"/"+s_m+"/"+s_d) : "";
    var e_y = typeof (end.y) !== "undefined" ? end.y : "";
    var e_m = typeof (end.m) !== "undefined" ? end.m : "";
    var e_d = typeof (end.d) !== "undefined" ? end.d : "";
    var end_num   = (e_y && e_m && e_d) ? Date.parse(e_y+"/"+e_m+"/"+e_d) : "";
    
    if(start_num && end_num &&  start_num < end_num){
      return 1;
    }
    else if(start_num && end_num && start_num > end_num){
      return -1;
    }
    else{
      return 0;
    }
  }




  MAIN.prototype.convDateFormat = function(dateArr){
    var str = this.options.format_output;
    if(!str){
      var arr = [current.y , current.m , current.d];
      target.value = arr.join("/");
    }
    str = str.replace(/yyyy/g , dateArr.y);
    str = str.replace(/y/g    , dateArr.y);
    str = str.replace(/mm/g   , (Array(2).join(0) + dateArr.m).slice(-2));
    str = str.replace(/m/g    , dateArr.m);
    str = str.replace(/dd/g   , (Array(2).join(0) + dateArr.d).slice(-2));
    str = str.replace(/d/g    , dateArr.d);
    return str;
  };

  // ページ起動時にフォームがブランクの場合にoptionに沿って代入する
  MAIN.prototype.default_value = function(target){
    if(!target){return}
    if(target.value !== ""){return}
    this.getDateValue(target , this.options.date_string);
  };
  MAIN.prototype.default_value_range = function(targets){
    if(!targets || targets.length !== 2){return}
    if(targets[0].value === ""){
      this.getDateValue(targets[0] , this.options.date_string , "");
    }
    if(targets[1].value === ""){
      this.getDateValue(targets[1] , this.options.date_string , "end");
    }
  };

  // format @ yyyy/mm/dd
  MAIN.prototype.getDateValue = function(target , string , range_mode){
    var d = "";
    switch(this.options.date_type){
      case "blank":

      case "today":
      if(this.options.mode === "range"){
        range_mode = range_mode ? range_mode : "";
        if(range_mode === "end"){
          if(string >= 0){
            d = this.getDate_today(string);
          }
          else{
            d = this.getDate_today();
          }
        }
        else{
          if(string >= 0){
            d = this.getDate_today();
          }
          else{
            d = this.getDate_today(string);
          }
        }
      }
      else{
        d = this.getDate_today(string);
      }
      
      break;

      case "string":
      d = this.convertDateFormat(string);
      break;

      case "query":
      var urlinfo = __urlinfo();
      d = (typeof urlinfo.query[string] !== "undefined") ? this.convertDateFormat(urlinfo.query[string]) : "";
      break;
    }
    target.value = this.convDateFormat(d);
  };

  




  return MAIN;
})();