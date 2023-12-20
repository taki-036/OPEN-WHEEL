---
title: Parametric Study Analysis Workflow Using OpenFOAM
---
This chapter introduces the parametric study analysis workflow using OpenFOAM as a calculation example using WHEEL.

Perform a parameter study of inlet flow velocity on a distribution pipe model created in 3D CAD.


## 1. Analysis Summary
The analysis target model used in this example is the distributed-pipe model.

### Analytical Model D50-d10

![img](./img/model.png "model")

Perform an analysis where the fluid coming in from the inlet leaves the outlet.

Please download and extract the file (sample/OpenFOAM_tutorial_sample.zip) in advance.
The archive contains three files:

pipe.unv
: Mesh ("SALOME-MECA" is used to create a CAD model and export mesh data in Ideas universal format.)

U
: velocity initial condition file

D50-d10.tgz
: Case Files


In the final step of this tutorial, you install the software on the WHEEL server.
Visualize calculation results using ParaView.

For this reason, you may have installed WHEEL on a remote server to perform the tutorial.
If you are running in an environment where ParaView is not installed,
You cannot run the Review Results chapter.


## 2. Workflow Creation
Create a new project and add two task components and one PS component.
The first task component is named __convert__ and the second task component is named
__extract__.

Also, add one task component inside the PS component.
Name it __solve__.

### Configure the convert component
Open the __Files__ area of the __convert__ component and download the
Please upload __pipe.unv__.

Uploading a file can be done by dropping the file into the __Files__ area or
Click the __upload file__ button to select the file you want to upload.
For detailed instructions, see the Reference Manual ({{site.baseurl}}/reference/3_workflow_screen/1_graphview.html "Reference Manual - Graph View Screen").

followed by __run.sh__  Create a new file named and fill in the following:

```
. /vol0004/apps/oss/spack-v0.17.0/share/spack/setup-env.sh

spack load 'openfoam@2012%fj@4.8.0'

ideasUnvToFoam pipe.unv
```

This script converts a mesh file in the format Ideas universal to
Convert to OpenFOAM format.

On successful completion, the following file is generated in the __constant/polyMesh__ directory:

- boundary
- owner
- faces
- neighbor
- points

Open the component properties window and set the following four items.

- script: run.sh
- host: fugaku
-use job scheduler: Enabled
- output files: constant

### Setting up the solve component
Open the __Files__ area of the __solve__ component and upload the following pre-downloaded files:
 * Case Files (__D50-d10. tgz__)
 * Initial velocity condition file (__U__)

Also, __run.sh__  Create a new file named and fill in the following:

```
. /vol0004/apps/oss/spack-v0.17.0/share/spack/setup-env.sh

spack load 'openfoam@2012%fj@4.8.0'

tar xvzf D50-d10.tgz
mv ./U ./D50-d10/0
cd ./D50-d10

decomposePar
mpiexec -n 12 simpleFoam -parallel
reconstructPar
touch result.foam

cd ..
tar cvzf D50-d10.tar.gz D50-d10
```

Open the component properties window and set the following three items.

- script: run.sh
- host: fugaku
-use job scheduler: Enabled


### Configuring PS Components
Click the PS component and add `results` to __output files__.

__parameterSetting.json__ in __Files__ area
With the file selected, open a text editor and enter PS configuration mode.

Click the __Add New Target File__ button in the __solve__ component.
Target __U__.

! img (./img/PS_target_file.png "Specify Target File")

The __U__ file is opened in the left pane, so the boundaryField- > inlet- > value line
__uniform (5 0 0); the __5__ portion of __
Drag to select.

The __parameters__ text box in the right pane displays __5__.

! img (./img/PS_param.png "Selecting Parameter Replacements")

In this state, click the __Add New Parameter__ button to set the inlet velocity
Enter.
In this case, the parameter study will be performed in 1m/s increments from 5m/s to 7m/s.
Set min=5, max=7, step=1.

! img (./img/PS_U_setting.png "Selecting Parameter Replacements")

Finally, add a setting to collect the execution results of the __solve__ component.

Click the __Add New Gather Setting__ button to display the gather settings dialog.
Select __solve__, set __srcName__ to `D50-d10.tar.gz`, set __dstName__ to
<code>results/& lbrace; & lbrace; U & rbrace; & rbrace; Type/D50-d10.tar.gz</code>.

! img (./img/PS_gather_setting.png "PS Results File Collection Settings")

This completes the editing of the PS configuration file. the __SAVE ALL FILES__ button at the top right of the screen.
Click to save your edits.

### Configuring the extract Component
To the __extract__ component
__run.sh__  Create a new file named and fill in the following:

```
for i in results/*
  do
    pushd $i
    tar xfz  D50-d10.tar.gz
    popd
  enddo
```

This script sequentially expands the output of the __solve__ component.
Prepare to start ParaView.

Finally, open the component properties and set script to __run.sh__.


### Setting File Dependencies
▶ of `constant` set in output files of __convert__ to PS component
Drop and connect.

In addition, ▶ of `results` set in outputFile of PS component
Drop and connect to the __extract__ component.

This completes the workflow creation process. Click the __save project__ button to save the project you created.

! img (./img/workflow.png "Complete Workflow")


## 3. Run Project
Click the __run project__ button to run the project.
First, you will be asked for the password for the private key you need to log in to Fugaku, but after that, no further action is required until the end of the workflow.

## 4. Review analysis results

Review the analysis results.

Open the __extract__ component properties screen to display the Files area,
Go to the `results` directory- > Inflow Speed directory.
The `result.foam` file appears below it, click on it and select it.
Click the __share file__ button.

! img (./img/file_share_button.png "File Share Button")

Displays the path to the __result.foam__ file.
Click the Copy button to copy and start ParaView with this file name as the argument.

! img (./img/file_share_dialog.png "File Sharing Dialog")



### Analysis Results
For reference, here are the visualization results for the inflow velocities of 5 [m/s], 6 [m/s], and 7 [m/s].

*In the analysis result of * inflow velocity 5 [m/s] **, ** velocity U** is displayed in the cross-sectional view of the distribution pipe and ** pressure p** is displayed as a vector, and the result is as follows.

##### Inflow velocity 5 [m/s]

! img (./img/result_5.png "Inflow Velocity 5 m/s Result")

Similarly, the results for ** Inflow velocity 6 [m/s] ** and ** Inflow velocity 7 [m/s] ** are shown.

##### Inflow velocity 6 [m/s]

! img (./img/result_6.png "Inflow Velocity 6 m/s Result")

##### Inflow velocity 7 [m/s]

! img (./img/result_7.png "Inflow Velocity 7 m/s Result")


That's all for an example of a parametric study analysis workflow using OpenFOAM.

--------
Return to Practical Tutorial ({{site.baseurl}}/tutorial/3_application_tutorial /)