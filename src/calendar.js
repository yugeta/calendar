;$$calendar = (function(){
  var __event = function(target, mode, func){
		if (target.addEventListener){target.addEventListener(mode, func, false)}
		else{target.attachEvent('on' + mode, function(){func.call(target , window.event)})}
	};
	var __urlinfo = function(uri){
    uri = (uri) ? uri : location.href;
    var data={};
		//URLとクエリ分離分解;
    var urls_hash  = uri.split("#");
    var urls_query = urls_hash[0].split("?");
		//基本情報取得;
		var sp   = urls_query[0].split("/");
		var data = {
      uri      : uri
		,	url      : sp.join("/")
    , dir      : sp.slice(0 , sp.length-1).join("/") +"/"
    , file     : sp.pop()
		,	domain   : sp[2]
    , protocol : sp[0].replace(":","")
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
  var __upperSelector = function(elm , selectors) {
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

  // string [yyyy/mm/dd -> y,m,d , yyyy-mm-dd -> y,m,d , "yyyymmdd" -> y,m,d] (value in integer)
  var __convertDateFormat = function(string_ymd){
    // split(/ - .)
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

  // srcを判別して、起動しているscriptを取得する
  var __getMyScript = function(){
    var scripts = document.getElementsByTagName("script");
    for(var i=0; i<scripts.length; i++){
      var src = scripts[i].src;
      if(!src){continue;}
      var fileinfo = __urlinfo(src);
      if(fileinfo.file === "calendar.js"){
        return scripts[i];
      }
    }
  }

  //ハイフン区切りを大文字に変換する。
	var __camelize = function(v){
		if(typeof(v)!='string'){return}
		return v.replace(/-([a-z])/g , function(m){return m.charAt(1).toUpperCase();});
  };
  
  // URL切り替え処理 [key , value , flg(before,*after)]
  var __setUrl = function(key,val,flg){
    var urlinfo = __urlinfo();
    var query = [];
    if(flg==="before"){
      query.push(key + "=" + val);
    }
    for(var i in urlinfo.query){
      if(i !== key){
        query.push(i + "=" + urlinfo.query[i]);
      }
    }
    if(flg!=="before"){
      query.push(key + "=" + val);
    }
    history.pushState(null,null,urlinfo.url+"?"+query.join("&"));
  };

  var __number_format = function(num){
    num = num.toString();
    var tmpStr = "";
    while (num != (tmpStr = num.replace(/^([+-]?\d+)(\d\d\d)/,"$1,$2"))){num = tmpStr;}
    return num;
  };

  // // scroll
  // var __scroll = function(){
  //   // For scrollX
  //   var x = (((t = document.documentElement) || (t = document.body.parentNode))
  //   && typeof t.scrollLeft == 'number' ? t : document.body).scrollLeft;
  //   // For scrollY
  //   var y = (((t = document.documentElement) || (t = document.body.parentNode))
  //   && typeof t.scrollTop == 'number' ? t : document.body).scrollTop;
  //   return {x:x,y:y};
  // }

  // 読み込み完了後に起動処理
  var __construct = function(){
    switch(document.readyState){
      case "complete"    : new $$;break;
      case "interactive" : __event(window , "DOMContentLoaded" , function(){new $$});break;
      default            : __event(window , "load" , function(){new $$});break;
		}
  };

  // デフォルト設定
  var __options = {
    target : ".input-date",   // 起動（表示）タイミングのエレメント（input=text , button ...)
    start_event : "focus",  // [click , focus]
    default_date_type   : "today" ,      // [blank:未入力 , today:ブランクの場合に当日の日付 , string:任意（指定）の値 , query:url-queryの任意の値]
    default_date_string : "2019/08/01",  // [type=string:yyyy/mm/dd , type=query:date]

    margin_top : "4px", // カレンダーを下にずらすマージン値
    view_position : "element-bottom", // [center:画面中央 , element-bottom:基点の直下]
    view_type : "", // []

    flg_date_active : "past", // [all:未来過去すべての日付選択可能 , past:過去のみ選択可能 , future:未来のみ選択可能]
    format_output : "yyyy/mm/dd", // [yyyy/mm/dd , yyyy/m/d , yyyy-m-d]

    // element-hierarchy
    dom : {
      base   : ".calendar",
        table  : ".calendar-table",
        head   : ".calendar-head",
          title  : ".calendar-title",
            year   : ".calendar-year",
            month  : ".calendar-month",
            prev   : ".calendar-table .calendar-title .prev",
            next   : ".calendar-table .calendar-title .next",
          week   : ".calendar-week",
        body   : ".calendar-body",
          date : ".date",
        foot : ".calendar-foot",
          today : ".today",
          close : ".close"
    },

    currentView : true,
    date : {
      y : null,
      m : null,
      d : null
    },
    selected : function(){}
  };

  //指定したエレメントの座標を取得
	var __pos = function(e,t){

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




  // 初期設定とイベントセット
  var $$ = function(options){
    if(!options){
      console.log("Error ! no-options.");
    }
    this.options = this.initOptions(options);

    // css
    this.setCSS();  // set-link-tag
    this.setHTML(); // load-template

    // view-event-set
    var targets = document.querySelectorAll(this.options.target);
    if(targets.length && this.options.start_event){
      for(var i=0; i<targets.length; i++){
        __event(targets[i] , this.options.start_event , (function(e){
          var dateArr = this.getDateArr_default();
          if(!dateArr || !dateArr.y || !dateArr.m || !dateArr.d){return;}
          this.calendar(dateArr);
          this.view(e);
        }).bind(this));
        this.defaultBlank(targets[i]);
      }
    }

    // __event(window , "resize" , (function(e){this.view("resize");}).bind(this));
    
  };

  // set-css
  $$.prototype.setCSS = function(){
    if(document.querySelector("link[data-calendar='1']")){return}
    var myScript = __getMyScript();
    var src = myScript.src;
    var href = src.replace(".js",".css");
    var link = document.createElement("link");
    link.setAttribute("data-calendar","1");
    link.rel = "stylesheet";
    link.href = href;
    var head = document.getElementsByTagName("head");
    head[0].appendChild(link);
  };

  // カレンダー表示elementの構築（読み込み）
  $$.prototype.setHTML = function(){
    if(document.querySelector(this.options.dom.base)){return}
    var myScript = __getMyScript();
    var src = myScript.src;
    var url = src.replace(".js",".html");
    new $$ajax({
      url : url,
      method : "get",
      onSuccess : (function(res){
        if(!res){return;}
        document.body.insertAdjacentHTML("beforeend",res);
        this.setCloseEvent();
      }).bind(this)
    });
  };

  // close-event
  $$.prototype.setCloseEvent = function(){
    var base = document.querySelector(this.options.dom.base);
    if(base){
      __event(base , "click" , (function(e){this.hidden(e)}).bind(this));
    }
  };


  // format @ yyyy/mm/dd
  $$.prototype.getDateValue = function(){
    switch(this.options.default_date_type){
      case "blank":
        return null;

      case "today":
        return this.getDate_today();

      case "string":
        return __convertDateFormat(this.options.default_date_string);

      case "query":
        var urlinfo = __urlinfo();
        if(typeof urlinfo.query[this.options.default_date_string] === "undefined"){
          return null;
        }
        else{
          return __convertDateFormat(urlinfo.query[this.options.default_date_string]);
        }
    }
  };

  

  

  $$.prototype.initOptions = function(options){
    if(!options){return __options;}
    var res = {};
    for(var i in __options){
      res[i] = __options[i];
    }
    for(var i in options){
      res[i] = options[i];
    }
    return res;
  };



  $$.prototype.view = function(e){
    // if(e === "resize"){
    //   var calendar = document.querySelector("calendar");
    //   if(!calendar){return}
    //   if(calendar.getAttribute("data-view") !== "1"){return;}
    //   var target = document.activeElement;
    //   if(!target || target.tagName !== "INPUT"){return}
    // }
    // else{
    //   var target = e.target;
    // }
    var target = e.target;
    if(!target){return}

    // position
    var table = document.querySelector(this.options.dom.table);
    var pos = {top : 0,left : 0};
    switch(this.options.view_position){
      case "center":
        pos.top  = (window.innerHeight / 2) - (table.offsetHeight / 2);
        pos.left = (window.innerWidth / 2)  - (table.offsetWidth / 2);
      break;

      case "element-bottom":
        var bounce = target.getBoundingClientRect();
        var pos = __pos(target);

        // var top  = bounce.top  + bounce.height + document.body.scrollTop;
        var top  = pos.y  + bounce.height - document.body.scrollTop;
        // var top  = bounce.top  + bounce.height;
        var left = bounce.left + document.body.scrollLeft;
        // // 縦にはみ出す場合は、下付き
        // if(top + table.offsetHeight > window.innerHeight){
        //   top = window.innerHeight - table.offsetHeight;
        // }
        // 横にはみ出す場合はセンター表示
        // if(left + table.offsetWidth > window.innerWidth){
        //   left = (window.innerWidth / 2) - (table.offsetWidth / 2);
        // }
        pos.top  = top;
        pos.left = left;
        break;
    }
// console.log(top+","+left);
    table.style.setProperty("top"  , pos.top  + "px" , "");
    table.style.setProperty("left" , pos.left + "px" , "");

    // view
    var calendar = document.querySelector(this.options.dom.base);
    if(!calendar){return;}
    calendar.setAttribute("data-view","1");

  };
  // クリック箇所に応じて非表示にする
  $$.prototype.hidden = function(e){
    var calendar = document.querySelector(this.options.dom.base);
    if(!calendar){return;}
    if(e.target.className !== calendar.className){return;}
    calendar.setAttribute("data-view","0");
  };
  // 無条件でカレンダーを非表示にする
  $$.prototype.close = function(){
    var calendar = document.querySelector(this.options.dom.base);
    if(!calendar){return;}
    calendar.setAttribute("data-view","0");
  };


  // 初期表示する為の日付を取得
  $$.prototype.getDateArr_default = function(){
    var dateArr = this.getDateArr_target();
    if(!dateArr || !dateArr.y || !dateArr.m || !dateArr.d){
      dateArr = this.getDateValue();
    }
    return dateArr;
  };
  $$.prototype.getDateArr_target = function(){
    var target = document.querySelector(this.options.target);
    if(target && target.tagName === "INPUT"){
      return __convertDateFormat(target.value);
    }
    else{
      return "";
    }
  };

  // カレンダーの表示処理（内容切り替え処理）
  $$.prototype.calendar = function(dateArr){
    // year,month
    this.setYearMonth(dateArr);

    // dates
    this.setDate(dateArr);

    // event
    this.setEvent();

    // cache
    this.options.date = dateArr;
  };


  $$.prototype.setYearMonth = function(dateArr){
    var calendar = document.querySelector(this.options.dom.base);
    if(!calendar){return;}
    calendar.querySelector(this.options.dom.year).innerHTML  = dateArr.y;
    calendar.querySelector(this.options.dom.month).innerHTML = dateArr.m;
  };
  $$.prototype.setDate = function(dateArr){
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

  // today
  $$.prototype.getDate_today = function(){
    var d = new Date();
    return {
      y : d.getFullYear(),
      m : d.getMonth() + 1,
      d : d.getDate()
    };
  };

  // [date , ""%blank]
  $$.prototype.getDate_className = function(current){

    var today = this.getDate_today();
    if(current.y === today.y
    && current.m === today.m
    && current.d === today.d){
      return "today";
    }

    var today_ms   = new Date(today.y   +"/"+ today.m   +"/"+ today.d);
    var current_ms = new Date(current.y +"/"+ current.m +"/"+ current.d);

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

  $$.prototype.getDate_selected = function(current){
    var select = this.getDateArr_target();
    if(select
    && current.y === select.y
    && current.m === select.m
    && current.d === select.d){
      return "select";
    }
    else{
      return "";
    }
  };

  $$.prototype.setEvent = function(){
    var calendar = document.querySelector(this.options.dom.base);
    if(!calendar){return}

    // month-move
    var prev = calendar.querySelector(this.options.dom.prev);
    if(!prev.getAttribute("data-flg_event")){
      __event(prev, "click", (function(e){this.view_prevMonth(e)}).bind(this));
      prev.setAttribute("data-flg_event","1");
    }
    var next = calendar.querySelector(this.options.dom.next);
    if(!next.getAttribute("data-flg_event")){
      __event(next, "click", (function(e){this.view_nextMonth(e)}).bind(this));
      next.setAttribute("data-flg_event","1");
    }
    var today = calendar.querySelector(this.options.dom.today);
    if(!today.getAttribute("data-flg_event")){
      __event(today, "click", (function(e){
        var dateArr = this.getDate_today();
        this.calendar(dateArr);
      }).bind(this));
      today.setAttribute("data-flg_event","1");
    }
    var close = calendar.querySelector(this.options.dom.close);
    if(!close.getAttribute("data-flg_event")){
      __event(close, "click", (function(e){this.close(e)}).bind(this));
      close.setAttribute("data-flg_event","1");
    }


    // day-click
    var days = calendar.querySelectorAll(this.options.dom.date +":not([data-date-mode='over'])");
    for(var i=0; i<days.length; i++){
      __event(days[i], "click", (function(e){this.dateClick(e)}).bind(this));
    }
  };

  $$.prototype.setMigrationMonth = function(move_value){
    var dt = new Date(this.options.date.y +"/"+  this.options.date.m +"/"+ this.options.date.d);
    dt.setMonth(dt.getMonth() + Number(move_value));
    return {
      y : dt.getFullYear(),
      m : dt.getMonth() + 1,
      d : dt.getDate()
    };
  };
  $$.prototype.view_prevMonth = function(){
    var dateArr = this.setMigrationMonth(-1);
    this.calendar(dateArr);
    this.setYearMonth(dateArr);
  };
  $$.prototype.view_nextMonth = function(){
    var dateArr = this.setMigrationMonth(+1);
    this.calendar(dateArr);
    this.setYearMonth(dateArr);
  };

  $$.prototype.dateClick = function(e){
    var elm = e.currentTarget;
    var current = {
      y : this.options.date.y,
      m : this.options.date.m,
      d : Number(elm.textContent)
    };
    var target = document.querySelector(this.options.target)
    if(target && target.tagName === "INPUT"){
      target.value = this.convDateFormat(current);
    }

    if(this.options.click){
      this.options.click(current);
    }

    // close（強制終了）
    setTimeout((function(e){this.close(e)}).bind(this),100);

    // 任意処理の実行
    if(this.options.selected){
      this.options.selected(current);
    }
  };

  $$.prototype.convDateFormat = function(dateArr){
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
  $$.prototype.defaultBlank = function(target){
    if(!target){return}
    if(target.value !== ""){return}
    var res = this.getDateValue();
    if(!res){return}
    target.value = this.convDateFormat(res);
  };

  return $$;
})();
