---
title: Source
lang: ja
permalink: /reference/4_component/09_Source.html
---

![img](./img/source.png "source")

Sourceコンポーネントは、プロジェクト実行に関する入力ファイルに相当するファイルを扱うためのコンポーネントです。

Sourceコンポーネントに設定できるプロパティは以下のとおりです。
なお、Sourceコンポーネントにはinput filesプロパティは指定することができません。


### upload on demand
プロジェクトの実行時に、ブラウザから実際に使うファイルをWHEELにアップロードするかどうかを指定します。


### Sourceコンポーネントの挙動
プロジェクト実行時にSourceコンポーネントのoutputFileに指定されたファイルがディレクトリ内に存在する場合、Sourceコンポーネントは特に何も処理せず正常終了します。

ファイルが存在せずupload on demandが有効なときは、ブラウザ上にファイルアップロードダイアログが表示され、ユーザがアップロードしたファイルがoutput filesとして扱われます。

![img](./img/upload_source_file_dialog.png "upload source file dialog")


--------
[コンポーネントの詳細に戻る]({{ site.baseurl }}/reference/4_component/)