---
title: OpenFOAMを利用したパラメータスタディ解析ワークフロー
lang: ja
permalink: /tutorial/3_application_tutorial/2_OpenFOAM_PS/
---
本章では、WHEELを用いた計算事例として「OpenFOAMを利用したパラメータスタディ解析ワークフロー」を紹介します。

3次元CADで作成した分配菅モデルに対して、inletの流速を対象としたパラメータスタディを行ないます。


## 1. 概要
本事例で使用する解析対象モデルは、分配菅モデルです。

### 解析モデル D50-d10

![img](./img/model.png "model")

inletから流入した流体がoutletから出ていく解析を実施します。

なお、本チュートリアルは、富岳上で実行することを前提としています。
異なる環境で実行する場合は、スクリプト・設定を適宜変更してください。

また、事前に[こちら](sample/OpenFOAM_tutorial_sample.zip)のファイルをダウンロードして展開しておいてください。
アーカイブ内には次の3つのファイルが含まれます。

pipe.unv
: メッシュ(「SALOME-MECA」を用い、CADモデルを元に作成し、Ideas universal形式にてメッシュデータをエクスポートしています)

U
: 流速の初期条件ファイル

D50-d10.tgz
: ケースファイル


本チュートリアルの最終ステップでは、WHEELサーバにインストールされた
ParaViewを使用して計算結果の可視化を行ないます。

このため、WHEELをリモートのサーバにインストールしてチュートリアルを実行していたり
ParaViewがインストールされていない環境で実行している場合は、
「解析結果の確認」の章は実行できません。

### ワークフローの概要
本チュートリアルでは、下図のようにパラメータスタディコンポーネントを用いて、inletの流速を「5m/sから7m/sまで1m/s刻み」で変化させながら解析を行います。

![img](./img/workflow.png "ワークフロー完成図")

convertコンポーネント
: OpenFOAM用のメッシュファイルを用意する。

PS0コンポーネント
: inletの流速を変化させながら解析を行う。 内部コンポーネントとして、後述の __solve__ コンポーネントを持つ。

solveコンポーネント
: __convert__ コンポーネントで作成したメッシュを用いてOpenFOAMによる解析を行う。

extract
: 解析結果を展開し、ParaViewで開ける状態にする。

## 2. ワークフロー作成
新規プロジェクトを作成し、taskコンポーネントを2つと、PSコンポーネントを1つ追加してください。
1つ目のtaskコンポーネントの名前は __convert__ 、2つ目のtaskコンポーネントの名前は
__extract__ としてください。

また、PSコンポーネント内部にtaskコンポーネントを1つ追加し、
__solve__ という名前にしてください。

### convertコンポーネントの設定
最初に、CADで作成した分配管モデルを __convert__ コンポーネント内に配置します。
__convert__ コンポーネントの __Files__ エリアを開き、事前にダウンロードした
__pipe.unv__ をアップロードしてください。

ファイルのアップロードは、__Files__ エリアにファイルをドロップするか、
__upload file__ ボタンをクリックした時に表示されるダイアログで、アップロードするファイルを選択することで行ないます。
詳しい操作方法は、[リファレンスマニュアル]({{ site.baseurl }}/reference/3_workflow_screen/1_graphview.html "リファレンスマニュアル-グラフビュー画面") を参照してください。

続いて、__convert__ コンポーネントで実行されるスクリプトを作成します。 __run.sh__  という名前で新規ファイルを作成し、次の内容を記入してください。

```
. /vol0004/apps/oss/spack-v0.17.0/share/spack/setup-env.sh

spack load 'openfoam@2012%fj@4.8.0'

ideasUnvToFoam pipe.unv
```

このスクリプトでは、Ideas universal形式のメッシュファイルを
OpenFOAM形式へと変換します。

正常に終了すると __constant/polyMesh__ ディレクトリに次のファイルが生成されます。

- boundary
- owner
- faces
- neighbor
- points

最後に、コンポーネントのプロパティ画面を開いて、以下の4項目を設定してください。

- script: run.sh
- host: fugaku
- use job scheduler: 有効
- output files: constant

### solveコンポーネントの設定
最初に、解析に使用するケースファイルおよび流速の初期条件ファイルを __solve__ コンポーネントに配置します。
__solve__ コンポーネントの __Files__ エリアを開き、事前にダウンロードした以下のファイルをアップロードしてください。
 * ケースファイル(__D50-d10.tgz__)
 * 流速の初期条件ファイル(__U__)

次に、スクリプトファイルを作成します。 __run.sh__  という名前で新規ファイルを作成し、次の内容を記入してください。

```
. /vol0004/apps/oss/spack-v0.17.0/share/spack/setup-env.sh

spack load 'openfoam@2012%fj@4.8.0'

tar xvzf D50-d10.tgz
mv ./U ./D50-d10/0
cd ./D50-d10

decomposePar || exit $?
mpiexec -n 12 simpleFoam -parallel || exit $?
reconstructPar || exit $?
touch result.foam

cd ..
tar cvzf D50-d10.tar.gz D50-d10
```

最後に、コンポーネントのプロパティ画面を開いて、以下の3項目を設定してください。

- script: run.sh
- host: fugaku
- use job scheduler: 有効


### PSコンポーネントの設定
PSコンポーネントでは、inletの流速を変化させるための設定を行います。

#### 計算結果の格納フォルダの準備
計算結果を格納するためのフォルダを準備します。PSコンポーネントをクリックし、__output files__ に `results` を追加してください。

#### パラメータスタディの条件設定
パラメータスタディの条件は __parameterSetting.json__ で行います。
__Files__ エリア内のある __parameterSetting.json__
ファイルを選択した状態でテキストエディタを開いてPS設定モードにします。

流速を変更するため、__solve__ コンポーネント内の流速初期条件ファイル __U__ を編集します。
まず、 __add new target file__ ボタンをクリックします。
以下の画面が表示されるので、 __solve__ を選択し、テキストボックスに __U__ と入力して、__OK__ ボタンをクリックします。

![img](./img/PS_target_file.png "ターゲットファイルの指定")

左ペインに __U__ ファイルが開かれるので、
boundaryField -> inlet -> value の行にある、 __uniform (5 0 0);__ のうち __5__ を __vel_U__ に変更します。

![img](./img/change_value.png "値の変更")

__uniform (vel_U 0 0);__ のうち __vel_U__ の部分をドラッグして選択してください。
右ペインの __parameters__ テキストボックスに __vel_U__ と表示されます。

![img](./img/PS_param.png "パラメータ置き換え部分の選択")

この状態で、 __add new parameter__ ボタンをクリックしてinletの流速に設定する値を入力します。  
ここでは、5m/sから7m/sまで1m/s刻みでパラメータスタディを行なうので
min=5, max=7, step=1 を設定してください。

![img](./img/PS_U_setting.png "パラメータ置き換え部分の選択")

以上の設定で、5m/s、6m/s、7m/sの流速条件ファイルが自動生成され、各条件で解析が実行されます。

#### 計算結果の回収
各条件で計算された結果を __output files__ に設定した `results` フォルダに集約するための設定を追加します。
__add new gather setting__ ボタンをクリックしてgather設定ダイアログを表示します。
__solve__ を選択し、 __srcName__ に `D50-d10.tar.gz`、__dstName__ に
<code>results/&lbrace;&lbrace; vel_U &rbrace;&rbrace;/D50-d10.tar.gz</code> と入力してください。

![img](./img/PS_gather_setting.png "PS結果ファイル回収設定")

以上で、PS設定ファイルの編集は完了です。画面右上の __save all files__ ボタンを
クリックして編集内容を保存してください。

### extractコンポーネントの設定
__extract__ コンポーネントのスクリプトファイルを作成します。
__extract__ コンポーネントに
__run.sh__  という名前で新規ファイルを作成し、次の内容を記入してください。

```
for i in results/*
  do
    pushd $i
    tar xfz  D50-d10.tar.gz
    popd
  enddo
```

このスクリプトは、 __solve__ コンポーネントの出力結果を順に展開し、
ParaViewを起動する準備をします。

最後にコンポーネントのプロパティを開いて、scriptに __run.sh__ を設定してください。


### ファイル依存関係の設定
コンポーネント間の入出力設定を行います。
__convert__ のoutput filesに設定した `constatnt` の▶をPSコンポーネントにドロップして接続してください。

また、PSコンポーネントのoutputFileに設定した `results` の▶を
__extract__ コンポーネントにドロップして接続してください。

以上でワークフローの作成は完了です。__save project__ ボタンをクリックして作成したプロジェクトをsaveします。

![img](./img/workflow.png "ワークフロー完成図")


## 3. プロジェクトの実行
__run project__ ボタンをクリックして、プロジェクトを実行してください。
初めに、富岳へのログインに必要な秘密鍵のパスワードを聞かれますが、それ以降はワークフローの終了まで操作は不要です。

## 4. 解析結果の確認

解析結果の確認を行います。

計算結果ファイルのパスを取得するため、 __extract__ コンポーネントのプロパティ画面を開いてFilesエリアを表示し
`results`ディレクトリ -> 流入速度のディレクトリ と辿ります。
その下に `result.foam` ファイルが表示されるので、これをクリックして選択し
__share file__ ボタンをクリックしてください。

![img](./img/file_share_button.png "ファイル共有ボタン")

__result.foam__ ファイルのパスが表示されます。
コピーボタンをクリックするとファイルのパスがクリップボードにコピーされるので、このファイル名を引数にParaViewを起動してください。

![img](./img/file_share_dialog.png "ファイル共有ダイアログ")



### 解析結果
参考として、5[m/s], 6[m/s], 7[m/s] の各流入速度の可視化結果を記載します。

**流入速度5[m/s]** の解析結果において、分配菅の断面図に **速度 U** を、ベクトルで **圧力 p** を表示した結果は以下になります。

##### 流入速度5[m/s]

![img](./img/result_5.png "流入速度5m/s結果")

同様に、**流入速度6[m/s]**、**流入速度7[m/s]** の結果を示します。

##### 流入速度6[m/s]

![img](./img/result_6.png "流入速度6m/s結果")

##### 流入速度7[m/s]

![img](./img/result_7.png "流入速度7m/s結果")


OpenFOAMを利用したパラメータスタディ解析ワークフロー例は以上になります。

--------
[実践編チュートリアルに戻る]({{ site.baseurl }}/tutorial/3_application_tutorial/)
