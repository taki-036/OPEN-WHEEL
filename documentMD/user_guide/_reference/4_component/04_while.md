---
title: While
lang: ja
permalink: /reference/4_component/04_while.html
---

![img](./img/while.png "while")


Whileコンポーネントは、各種プログラミング言語のWhileループと同様に、設定された条件判定が真の間、下位コンポーネントを繰り返し実行します。

Whileコンポーネントに設定できるプロパティは以下のとおりです。

### use javascript expression for condition check
Taskコンポーネントのretry判定と同じく、繰り返し実行を行うかどうかの判定にシェルスクリプトを用いるか、javascript式を用いるかを指定します。

### script name for condition check
use javascript expression for condition checkが無効の時のみ、条件判定に用いるシェルスクリプトをドロップダウンリストから選択します。

### jacascript expression
use javascript expression for condition checkが有効の時のみ、条件判定に用いるjavascript式を設定します。

__インデックス値の参照方法について__  
ループ実行中に下位コンポーネントから現在のインデックス値を利用する場合は、__$WHEEL_CURRENT_INDEX__ 環境変数で参照可能です。  
{: .notice--info}

### number of instances to keep
各インデックスで処理を行なった時のディレクトリを最大何個まで残すかを指定します。
無指定の時は、全てのディレクトリが保存されます。

詳しくは後述の[Whileコンポーネント実行時の挙動](#whileコンポーネント実行時の挙動)で説明します。

### Whileコンポーネント実行時の挙動
Whileコンポーネントも、Forコンポーネントと同様の挙動をしますがディレクトリ名の末尾にはインデックス値の代わりに、0から始まる数字を1刻みで使用します。

また終了判定もインデックス値の計算ではなく、設定されたシェルスクリプトの戻り値か、javascript式の評価結果を用います。

--------
[コンポーネントの詳細に戻る]({{ site.baseurl }}/reference/4_component/)

