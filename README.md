 MYNT-Calendar
==

![title-banner](docs/banner.png)

```
Author  : Yugeta.Koji
Date    : 2019.09.03
```


# History
  ver 3.0 : 2019.09.03 (after ver 3)
  var 3.1 : 2019.09.07 default-blank-today
  var 4.0 : 2020.04.04 from-to , multi-target
 
# Howto

  sampleを御覧ください。


# Options

  - target
    日付入力をする項目
    mode=rangeのときのみ複数登録可能（通常複数登録すると、一番先頭の項目のみに登録される）

  - mode
    解説 : カレンダー機能のモード
    default : 通常カレンダー
    range   : from - toの登録ができる（targetに2つの項目を登録すること）

  - start_event
    解説 : 項目に登録するイベントセット
    click
    focus

  - date_type
    解説 : ページ表示時に項目が空欄だった場合の処理タイプ
    today  : 当日の日付
    blank  : 何もしない (default)
    string : 任意文字列の表示
    query  : GETクエリ文字列を挿入

  - date_string
    解説 : date_typeに応じた変数用
    date_type="string"の時に、任意文字列を登録
    date_type="query"の時に、query-keyを入力
    date_type="today"の時、mode="range"の時に、もう一つの項目を本日と何日ずらすかを入力(マイナスもOK)

  - view_date
    解説 : カレンダー表示の初期対象日付
    0 : 項目の1番目の値で表示（default）
    1 : 項目の最後の値で表示（date_type="query"の時に有効）
    ※date_type="query"以外の場合に、複数の項目がある場合に入力すると、その値が表示される。（この注釈は、現時点で非搭載機能）

  - view_position
    解説 : カレンダーの表示位置
    center         : 画面中央
    element-bottom : 基点の直下 (default)

  - margin_top
    解説 : カレンダーの表示位置の若干下にずらす時の設定
    default : 4px

  - flg_date_active
    解説 : カレンダーの日付で選択できる条件
    all    : 未来過去すべての日付選択可能 (default)
    past   : 過去のみ選択可能
    future : 未来のみ選択可能

  - format_output
    解説 : 項目に登録する時の文字列フォーマット
    "yyyy/mm/dd" (default)
    "yyyy-mm-dd"
    "yyyymmdd"

  - readonly
    解説 : 登録した項目を直接入力できないようにする。
    true : 入力・変更不可 (default)
    false : 入力・変更可能

  - button_ok
    解説 : footerのokボタン表示
    true
    false (default)

  - button_close
    解説 : footerのcloseボタン表示
    true (default)
    false

  - button_today
    解説 : footerのTodayボタン表示
    true (default)
    false
