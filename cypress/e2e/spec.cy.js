describe('wheel test', () => {
  const testProject = 'test'
  const password = 'passw0rd'
  before(() => {
    cy.visit('/')
    cy.projectMake(testProject)
  })

  beforeEach(() => {
    cy.visit('/')
    cy.projectOpen(testProject).wait(500)
  })

  afterEach(() => {
  })

  after(() => {
    cy.projectRemove(testProject)
    cy.assertAll()
  })

  it.only('test1', () => {
    cy.taskMake('task0')
    cy.clickFilesTab()

    cy.contains('button', 'Files').then($el => {
      cy.softAssert($el.attr('aria-expanded'), 'true', "FilesTab is aria-expanded")
    })

    cy.removeTask('task0')
  })

  it('test3', () => {
    cy.taskMake('task0')
    cy.clickFilesTab()

    cy.folderMake('folder1')
    cy.fileMake('file1')

    cy.contains('button', 'Files').next().find('[role="listbox"]').eq(0).children().then($el => {
      cy.softAssert($el.eq(0).text(), 'folder1', "Folder is exist")
      cy.softAssert($el.eq(1).text(), 'file1', "File is exist")
    })

    cy.removeTask('task0')
  })

  it('test4', () => {
    cy.taskMake('task0')
    cy.clickFilesTab()

    cy.folderMake('folder1')
    cy.clickFileFolder('folder1')
    cy.folderMake('folder2')
    cy.fileMake('file1').wait(100)

    cy.contains('button', 'Files').next().contains('folder1').parent().next().find('[role="listbox"]').eq(0).children().then($el => {
      cy.softAssert($el.eq(0).text(), 'folder2', 'folder2 is exist in folder1')
      cy.softAssert($el.eq(1).text(), 'file1', 'file1 is exist in folder1')
    })

    cy.removeTask('task0')
  })

  it('test5', () => {
    cy.taskMake('task0')
    cy.clickFilesTab()

    cy.folderMake('folder1')
    cy.fileMake('file1')
    cy.fileFolderRename('folder1', 'folder2')
    cy.fileFolderRename('file1', 'file2').wait(300)

    cy.contains('button', 'Files').next().find('[role="listbox"]').eq(0).children().then($el => {
      cy.softAssert($el.eq(0).text(), 'folder2', 'folder1 is renamed to folder2')
      cy.softAssert($el.eq(1).text(), 'file2', 'file1 is renamed to file2')
    })

    cy.removeTask('task0')
  })

  it('test6', () => {
    cy.taskMake('task0')
    cy.clickFilesTab()

    cy.folderMake('folder1')
    cy.fileFolderDelete('folder1')

    cy.contains('button', 'Files').next().find('[role="listbox"]').then($el => {
      cy.softAssert($el.children().length == 0, true, 'folder1 is not exsit')
    })

    cy.removeTask('task0')
  })

  it('test9', () => {
    const path = require('path')
    const downloadsFolder = Cypress.config('downloadsFolder')
    const filepath = path.join(downloadsFolder, 'a.txt')
    cy.taskMake('task0')
    cy.scriptMake('a.txt', 'aaa')
    cy.clickFilesTab()
    cy.clickFileFolder('a.txt')

    cy.clickFilesTab(5)
    cy.contains('a', 'download').click()

    cy.readFile(filepath).then($el => {
      cy.softAssert($el, 'aaa', '"a.txt" is writed "aaa" at download file')
    })

    cy.contains('button', 'close').click()
    // cy.deleteDownloadsFolder();
    cy.removeTask('task0')
  })

  it('test10', () => {
    cy.taskMake('task0')
    cy.scriptMake('a.txt', 'aaa')
    cy.clickFilesTab()
    cy.clickFileFolder('a.txt')

    cy.clickFilesTab(6)
    cy.setClipboardPermission()
    cy.contains('copy file path').next().find('button').click()

    cy.window().its('navigator.clipboard').then((clip) => clip.readText()).then($el => {
      cy.softAssert($el, '/root/test.wheel/task0/a.txt', 'script path is copied at clipboard')
    })

    cy.contains('[type="button"]', 'ok').click()
    cy.removeTask('task0')
  })

  it('test11', () => {
    cy.taskMake('task0')
    cy.clickFilesTab()

    cy.folderMake('folder1')
    cy.clickFileFolder('folder1')
    cy.fileMake('file1')
    cy.clickFileFolder('folder1')
    cy.clickFileFolder('folder1')

    cy.contains('button', 'Files').next().find('[role="group"]').then($el => {
      cy.softAssert($el.css('display'), 'block', 'file1 is displaied')
    })

    cy.removeTask('task0')
  })

  it('test12', () => {
    cy.taskMake('task0')
    cy.clickFilesTab()

    cy.fileMake('file1')
    cy.fileMake('file2')
    cy.fileMake('file3')

    // NG: FilesTabのリロードが必要
    cy.clickFilesTab().wait(300)
    cy.clickFilesTab()

    cy.contains('button', 'Files').next().find('.v-list-item__content').then($el => {
      cy.softAssert($el.text(), 'file*', 'file* is exist')
    })

    cy.removeTask('task0')
  })

  it('test13', () => {
    cy.taskMake('task0')
    cy.clickFilesTab()

    cy.fileMake('file1')
    cy.fileMake('file2')
    cy.fileMake('file3')

    // NG: FilesTabのリロードが必要
    cy.clickFilesTab().wait(300)
    cy.clickFilesTab()

    cy.clickFileFolder('file*')

    cy.contains('button', 'Files').next().find('[role="group"]').children().children().then($el => {
      cy.softAssert($el.eq(0).text(), 'file1', 'file1 is exist in file*')
      cy.softAssert($el.eq(1).text(), 'file2', 'file2 is exist in file*')
      cy.softAssert($el.eq(2).text(), 'file3', 'file3 is exist in file*')
    })

    cy.removeTask('task0')
  })

  it('test14', () => {
    cy.taskMake('task0')
    cy.clickFilesTab()

    cy.folderMake('folder1')
    cy.folderMake('folder2')
    cy.folderMake('folder3')
    
    // NG: FilesTabのリロードが必要
    cy.clickFilesTab().wait(300)
    cy.clickFilesTab()

    cy.contains('button', 'Files').next().find('.v-list-item__content').then($el => {
      cy.softAssert($el.text(), 'folder*', 'folder* is exist')
    })

    cy.removeTask('task0')
  })

  it('test15', () => {
    cy.taskMake('task0')
    cy.clickFilesTab()

    cy.folderMake('folder1')
    cy.folderMake('folder2')
    cy.folderMake('folder3')
    
    // NG: FilesTabのリロードが必要
    cy.clickFilesTab().wait(300)
    cy.clickFilesTab()

    cy.clickFileFolder('folder*')

    cy.contains('button', 'Files').next().find('[role="group"]').children().children().then($el => {
      cy.softAssert($el.eq(0).text(), 'folder1', 'folder1 is exist in folder*')
      cy.softAssert($el.eq(1).text(), 'folder2', 'folder2 is exist in folder*')
      cy.softAssert($el.eq(2).text(), 'folder3', 'folder3 is exist in folder*')
    })

    cy.removeTask('task0')
  })

  it('test16', () => {
    cy.taskMake('task0')
    cy.clickInputOutputFilesTab()
    cy.addInputFiles('input')

    cy.contains('input/output files').next().contains('div', 'input files').find('button').then($el => {
      cy.softAssert($el.text(), 'input', '"input" is added in input file aria')
    })

    cy.get('svg').find('text').eq(1).then($el => {
      cy.softAssert($el.text(), 'input', '"input" is added in task0 compornent')
    })

    cy.removeTask('task0')
  })

  it('test17', () => {
    cy.taskMake('task0')
    cy.clickInputOutputFilesTab()
    cy.addInputFiles('input')
    cy.renameInputFiles('input', 'input1{enter}')
    
    cy.contains('input/output files').next().contains('div', 'input files').find('button').then($el => {
      cy.softAssert($el.text(), 'input1', '"input" is renamed to "input1" in input file aria')
    })

    cy.get('svg').find('text').eq(1).then($el => {
      cy.softAssert($el.text(), 'input1', '"input" is renamed to "input1" in task0 compornent')
    })

    cy.removeTask('task0')
  })

  it('test18', () => {
    cy.taskMake('task0')
    cy.clickInputOutputFilesTab()
    cy.addInputFiles('input')
    cy.deleteInputFiles('input')
    
    cy.contains('thead', 'input files').next().then($el => {
      cy.softAssert($el.text(), 'No data available', '"input" is deleted in input file aria')
    })

    cy.removeTask('task0')
  })

  it('test19', () => {
    cy.taskMake('task0')
    cy.clickInputOutputFilesTab()
    cy.addOutputFiles('output')

    cy.contains('input/output files').next().contains('div', 'output files').find('button').then($el => {
      cy.softAssert($el.text(), 'output', '"output" is added in output file aria')
    })

    cy.get('svg').find('text').eq(1).then($el => {
      cy.softAssert($el.text(), 'output', '"output" is added in task0 compornent')
    })

    cy.removeTask('task0')
  })

  it('test20', () => {
    cy.taskMake('task0')
    cy.clickInputOutputFilesTab()
    cy.addOutputFiles('output')
    cy.renameOutputFiles('output', 'output1{enter}')

    cy.contains('input/output files').next().contains('div', 'output files').find('button').then($el => {
      cy.softAssert($el.text(), 'output1', '"output" is renamed to "output1" in output file aria')
    })

    cy.get('svg').find('text').eq(1).then($el => {
      cy.softAssert($el.text(), 'output1', '"output" is renamed to "output1" in task0 compornent')
    })

    cy.removeTask('task0')
  })

  it('test21', () => {
    cy.taskMake('task0')
    cy.clickInputOutputFilesTab()
    cy.addOutputFiles('output')
    cy.deleteOutputFiles('output')
    
    cy.contains('thead', 'output files').next().then($el => {
      cy.softAssert($el.text(), 'No data available', '"output" is deleted in output file aria')
    })

    cy.removeTask('task0')
  })

  it('test22', () => {
    cy.taskMake('task0')
    cy.clickInputOutputFilesTab()
    cy.addOutputFiles('output')
    cy.dragAndDropTask(300, 600).wait(200)
    cy.closeTask()
    cy.get('svg').find('polygon').eq(0)
      .trigger("mousedown", { screenX: 272, screenY: 272 })
    cy.get('svg').contains('task1')
      .trigger('mouseup', { screenX: 300, screenY: 600 }).wait(1000)

    cy.get('svg').find('path').parent().children().then($el => {
      cy.softAssert($el.eq(1).find('image').next().text(), 'task0', 'path is started from "task0"')
      cy.softAssert($el.eq(2).find('image').next().text(), 'task1', 'path is ended to "task1"')
      cy.softAssert($el.eq(2).children().eq(1).text(), 'output', '"output" is added to input aria in task1 compornent')
    })

    cy.clickTask('task1')
    cy.clickInputOutputFilesTab()

    cy.contains('input/output files').next().contains('div', 'input files').find('button').then($el => {
      cy.softAssert($el.text(), 'output', '"output" is added in task1 input file aria')
    })

    cy.removeTask('task1')
    cy.clickTask('task0')
    cy.removeTask('task0')
  })

  it('test23', () => {
    cy.taskMake('task0')
    cy.clickInputOutputFilesTab()
    cy.addOutputFiles('output')
    cy.closeTask()

    cy.dragAndDropTask(300, 600).wait(200)
    cy.clickTask('task1')
    cy.clickInputOutputFilesTab()
    cy.addInputFiles('output')
    cy.closeTask()

    cy.get('svg').find('polygon').eq(0)
      .trigger("mousedown", { screenX: 272, screenY: 272 })
    cy.get('svg').contains('task1')
      .trigger('mouseup', { screenX: 300, screenY: 600 }).wait(1000)

    cy.get('svg').find('path').parent().children().then($el => {
      cy.softAssert($el.eq(1).find('image').next().text(), 'task0', 'path is started from "task0"')
      cy.softAssert($el.eq(2).find('image').next().text(), 'task1', 'path is ended to "task1"')
    })

    cy.clickTask('task0')
    cy.removeTask('task0')
    cy.clickTask('task1')
    cy.removeTask('task1')
  })

  it('test24', () => {
    cy.taskMake('task0')
    cy.clickInputOutputFilesTab()
    cy.addOutputFiles('result_*.dat')
    cy.closeTask()

    cy.dragAndDropTask(300, 600).wait(200)
    cy.clickTask('task1')
    cy.clickInputOutputFilesTab()
    cy.addInputFiles('results')
    cy.closeTask()

    cy.get('svg').find('polygon').eq(0)
      .trigger("mousedown", { screenX: 272, screenY: 272 })
    cy.get('svg').contains('results').siblings()
      .trigger('mouseup', { screenX: 300, screenY: 600 }).wait(1000)

    cy.get('svg').find('path').parent().children().then($el => {
      cy.softAssert($el.eq(1).find('image').next().text(), 'task0', 'path is started from "task0"')
      cy.softAssert($el.eq(2).find('image').next().text(), 'task1', 'path is ended to "task1"')
    })

    cy.clickTask('task0')
    cy.removeTask('task0')
    cy.clickTask('task1')
    cy.removeTask('task1')
  })

  it('test25', () => {
    cy.taskMake('task0')
    cy.clickInputOutputFilesTab()
    cy.addOutputFiles('result_1.dat')
    cy.closeTask()

    cy.dragAndDropTask(300, 600).wait(200)
    cy.clickTask('task1')
    cy.clickInputOutputFilesTab()
    cy.addInputFiles('results/')
    cy.closeTask()

    cy.get('svg').find('polygon').eq(0)
      .trigger("mousedown", { screenX: 272, screenY: 272 })
    cy.get('svg').contains('results').siblings()
      .trigger('mouseup', { screenX: 300, screenY: 600 }).wait(1000)

    cy.get('svg').find('path').parent().children().then($el => {
      cy.softAssert($el.eq(1).find('image').next().text(), 'task0', 'path is started from "task0"')
      cy.softAssert($el.eq(2).find('image').next().text(), 'task1', 'path is ended to "task1"')
    })

    cy.clickTask('task0')
    cy.removeTask('task0')
    cy.clickTask('task1')
    cy.removeTask('task1')
  })

  it('test26', () => {
    cy.taskMake('task0')
    cy.scriptMake('run.sh', 'echo test')
    
    Cypress._.times(2, (k) => {
      cy.openScriptSelectBox()
      cy.get('.v-overlay-container').find('.v-list-item-title').then($el => {
        cy.softAssert($el.text(), 'run.sh', "script is exist in listbox")
      })

      cy.selectListBox('run.sh')
      cy.contains('label', /^script$/).siblings().then($el => {
        cy.softAssert($el.text(), 'run.sh', "script is exist in select box")
      })

      cy.projectReload(k, testProject, 'task0')
    })

    cy.execProject()
    cy.stdoutOpen(2000)

    cy.get('.v-window-item.v-window-item--active').find('.xterm-rows').then($el => {
      cy.softAssert($el.text().match(/test/).length > 0, true, "script exec result is displaied at Console(Stdout)")
    })

    cy.clickConsole()
    cy.resetProject()
    cy.clickTask('task0')
    cy.removeTask('task0')
  })

  it('test27', () => {
    cy.taskMake('task0')
    cy.scriptMake('run.sh', 'echo test')
    cy.openScriptSelectBox()
    cy.selectListBox('run.sh')
    
    Cypress._.times(2, (k) => {
      cy.openHostListBox()
      cy.get('[role="listbox"]').find('.v-list-item-title').then($el => {
        cy.softAssert($el.length > 0, true, "host is exist in listbox")
      })
  
      cy.selectHost('testServer')
      cy.contains('label', 'host').siblings().then($el => {
        cy.softAssert($el.text(), 'testServer', "host is exist in select box")
      })

      cy.projectReload(k, testProject, 'task0')
    })

    cy.execProject()
    cy.passwordType(password)
    cy.outputSshOpen(2000)

    cy.get('.v-window-item.v-window-item--active').find('.xterm-rows').then($el => {
      cy.softAssert($el.text().match(/test/).length > 0, true, "script exec result is displaied at Console(Stdout)")
    })

    cy.clickConsole()
    cy.resetProject()
    cy.clickTask('task0')
    cy.removeTask('task0')
  })
  
  it('test28', () => {
    cy.taskMake('task0')
    cy.switchUseJobScheduler('on')
    
    Cypress._.times(2, (k) => {
      cy.contains('button', 'basic').next().children().children().then($el => {
        cy.softAssert(!$el.eq(4).find('input').prop('disabled'), true, "queue is not disabled")
        cy.softAssert(!$el.eq(5).find('input').prop('disabled'), true, "submit command is not disabled")
        cy.softAssert($el.eq(5).find('input').prop('readonly'), true, "submit command is readonly")
        cy.softAssert(!$el.eq(6).find('input').prop('disabled'), true, "submit option is not disabled")
        cy.softAssert($el.eq(6).find('input').prop('readonly'), true, "submit option is readonly")
      })

      cy.projectReload(k, testProject, 'task0')
    })

    cy.removeTask('task0')
  })

  it('test29', () => {
    cy.taskMake('task0')
    cy.switchUseJobScheduler('on')
    cy.openHostListBox('testServer')
    cy.selectHost('testServer')
    cy.scriptMake('run.sh', 'cd ${{}PBS_O_WORKDIR-"."} \necho test > stdout.txt')
    cy.scriptSelect('run.sh')
    cy.openRemoteFileSettingTab()
    cy.addIncludeFile('stdout.txt')
    
    Cypress._.times(2, (k) => {
      cy.contains('label', 'queue').parent().click()
      cy.get('.v-list-item-title').then($el => {
        cy.softAssert($el.text(), 'workq', 'remotehost queue is displaied in listbox')
      })
      cy.get('.v-list-item-title').click()
      cy.contains('label', 'queue').siblings().then($el => {
        cy.softAssert($el.text(), 'workq', 'remotehost queue is displaied in select box')
      })
      cy.projectReload(k, testProject, 'task0')
    })

    cy.execProject()
    cy.passwordType(password)
    cy.outputSshOpen(5000)

    cy.clickTask('task0')
    cy.clickFilesTab()
    cy.contains('stdout.txt').click()
    cy.get('[href="/editor"]').click().wait(100)
    cy.get('#editor').then($el => {
      cy.softAssert($el.text().match(/test/).length > 0, true, 'stdout.txt is writed "test"')
    })
    cy.get('[href="/graph"]').click().wait(100)
    

    cy.clickConsole()
    cy.resetProject()
    cy.clickTask('task0')
    cy.removeTask('task0')
  })

  it('test30', () => {
    cy.taskMake('task0')
    cy.switchUseJobScheduler('on')
    cy.scriptMake('run.sh', 'echo test')
    cy.scriptSelect('run.sh')
    cy.hostSelect('testServer')
    
    Cypress._.times(2, (k) => {
      cy.contains('button', 'basic').next().children().children().eq(5).find('input').then($el => {
        cy.softAssert($el.val(), 'qsub', '"qsub" is displaied in submit command display aria')
      })
      cy.projectReload(k, testProject, 'task0')
    })

    cy.removeTask('task0')
  })

  it('test31', () => {
    cy.taskMake('task0')
    cy.switchUseJobScheduler('on')
    cy.hostSelect('testServer')
    cy.scriptMake('run.sh', 'cd ${{}PBS_O_WORKDIR-"."} \necho test > stdout.txt')
    cy.scriptSelect('run.sh')
    cy.typeSubmitOption('-N myjob')
    cy.openRemoteFileSettingTab()
    cy.addIncludeFile('stdout.txt')
    
    Cypress._.times(2, (k) => {
      cy.contains('label', 'submit option').siblings().find('input').then($el => {
        cy.softAssert($el.val(), '-N myjob', 'submit option is setting "-N myjob"')
      })
      cy.projectReload(k, testProject, 'task0')
    })

    cy.execProject()
    cy.passwordType(password)
    cy.infoOpen(6000)

    cy.get('.v-window-item.v-window-item--active').find('.xterm-rows').then($el => {
      cy.softAssert($el.text().match(/-N myjob/).length > 0, true, '"-N myjob" is displaied at Console(Stdout)')
    })
    
    cy.clickConsole()
    cy.resetProject()
    cy.clickTask('task0')
    cy.removeTask('task0')
  })
  
  it('test32', () => {
    cy.taskMake('task0')
    cy.hostSelect('testServer')
    cy.scriptMake('run.sh', 'echo test \nexit 1')
    cy.scriptSelect('run.sh')
    cy.retryNumberType('2')
    
    Cypress._.times(2, (k) => {
      cy.get('input').eq(8).then($el => {
        cy.softAssert($el.val(), '2', "retryNumber is setting 2")
      })
      cy.projectReload(k, testProject, 'task0')
      cy.openRetrySettingTab()
    })

    cy.execProject()
    cy.passwordType(password)
    cy.outputSshOpen(6000)

    Cypress._.times(3, (i) => {
      cy.get('.v-window-item.v-window-item--active').find('.xterm-rows').children().eq(i).then($el => {
        cy.softAssert($el.text().match(/test/).length > 0, true, 'script repeat 3 times at Console(Stdout)')
      })
    })
    
    cy.clickConsole()
    cy.resetProject()
    cy.clickTask('task0')
    cy.removeTask('task0')
  })
  
  it('test33', () => {
    cy.taskMake('task0')
    cy.openRetrySettingTab()
    cy.swicthUseJavascriptExpressionForConditionCheck('off')
    
    Cypress._.times(2, (k) => {
      cy.contains('div', 'use javascript expression for condition check').parent().parent().next().then($el => {
        cy.softAssert($el.find('input').length > 0, true, "javascript is not disabled")
        cy.softAssert($el.find('textarea').length == 0, true, "javascript is disabled")
      })

      cy.projectReload(k, testProject, 'task0')
      cy.openRetrySettingTab()
    })

    cy.removeTask('task0')
  })
  
  it('test34', () => {
    cy.taskMake('task0')
    cy.scriptMake('run.sh', 'echo test \nexit 1')
    cy.scriptSelect('run.sh')
    cy.openRetrySettingTab()
    cy.swicthUseJavascriptExpressionForConditionCheck('on')
    cy.typeScriptconditionCheck('return 1;')
    
    Cypress._.times(2, (k) => {
      cy.contains('button', 'retry setting').siblings().children().children().last().then($el => {
        cy.softAssert($el.find('textarea').val(), "return 1;", 'script aria  is displaied "return 1;"')
      })

      cy.projectReload(k, testProject, 'task0')
      cy.openRetrySettingTab()
    })
    
    cy.execProject().wait(2000)
    cy.get('[type="button"]').eq(0).then($el => {
      cy.softAssert($el.text(), ' status: failed', 'script status is failed at Console(Stdout)')
    })
    
    cy.clickConsole()
    cy.resetProject()
    cy.clickTask('task0')
    cy.removeTask('task0')
  })
  
  it('test35', () => {
    cy.taskMake('task0')
    cy.openRetrySettingTab()
    cy.swicthUseJavascriptExpressionForConditionCheck('on')
    
    Cypress._.times(2, (k) => {
      cy.contains('div', 'use javascript expression for condition check').parent().parent().next().then($el => {
        cy.softAssert($el.find('input').length == 0, true, "javascript is not disabled")
        cy.softAssert($el.find('textarea').length > 0, true, "javascript is disabled")
      })

      cy.projectReload(k, testProject, 'task0')
      cy.openRetrySettingTab()
    })
    
    cy.removeTask('task0')
  })
  
  it('test36', () => {
    cy.taskMake('task0')
    cy.scriptMake('run.sh', 'echo test \nexit 1')
    cy.scriptSelect('run.sh')
    cy.retryNumberType('2')
    cy.swicthUseJavascriptExpressionForConditionCheck('off')
    cy.scriptMake('return1.sh', 'exit 1')
    cy.openRetrySettingTab()
    cy.scriptNameForConditionCheckSelect('return1.sh')
    
    Cypress._.times(2, (k) => {
      cy.contains('label', 'script name for condition check').siblings().then($el => {
        cy.softAssert($el.text(), 'return1.sh')
      })

      cy.projectReload(k, testProject, 'task0')
      cy.openRetrySettingTab()
    })
    
    cy.execProject().wait(2000)
    cy.get('[type="button"]').eq(0).then($el => {
      cy.softAssert($el.text(), ' status: failed')
    })
    
    cy.resetProject()
    cy.clickTask('task0')
    cy.removeTask('task0')
  })
  
  it('test37', () => {
    cy.taskMake('task0')
    cy.hostSelect('testServer')
    cy.scriptMake('run.sh', 'echo test1 > 111.txt\necho test2 > 222.txt\necho test3 > 333.txt')
    cy.scriptSelect('run.sh')
    cy.openRemoteFileSettingTab()
    cy.addIncludeFile('*.txt')
    
    Cypress._.times(2, (k) => {
      cy.contains('thead', 'include').next().then($el=>{
          cy.softAssert($el.text(), '*.txt')
        })

      cy.projectReload(k, testProject, 'task0')
      cy.openRemoteFileSettingTab()
    })

    cy.execProject()
    cy.passwordType(password).wait(1000)

    cy.clickTask('task0')
    cy.clickFilesTab()
    cy.contains('*.txt').click()
    cy.get('[role="group"]').children().children().then($el => {
      cy.softAssert($el.eq(0).text(), '111.txt')
      cy.softAssert($el.eq(1).text(), '222.txt')
      cy.softAssert($el.eq(2).text(), '333.txt')
    })
    
    cy.resetProject()
    cy.removeTask('task0')
  })
  
  it('test38', () => {
    cy.taskMake('task0')
    cy.hostSelect('testServer')
    cy.scriptMake('run.sh', 'echo test1 > 111.txt\necho test2 > 222.txt\necho test3 > 333.txt')
    cy.scriptSelect('run.sh')
    cy.openRemoteFileSettingTab()
    cy.addIncludeFile('*.txt')
    cy.deleteIncludeFile('*.txt')

    
    Cypress._.times(2, (k) => {
      cy.contains('thead', 'include').next().then($el=>{
          cy.softAssert($el.text(), 'No data available')
        })

      cy.projectReload(k, testProject, 'task0')
      cy.openRemoteFileSettingTab()
    })

    cy.execProject()
    cy.passwordType(password).wait(1000)

    cy.clickTask('task0')
    cy.clickFilesTab()
    cy.contains('button', 'Files').siblings().find('[role="listbox"]').then($el => {
      cy.softAssert($el.find('[role="group"]').length == 0, true)
    })
    
    cy.clickConsole()
    cy.resetProject()
    cy.clickTask('task0')
    cy.removeTask('task0')
  })
  
  it('test39', () => {
    cy.taskMake('task0')
    cy.hostSelect('testServer')
    cy.scriptMake('run.sh', 'echo test1 > 111.txt\necho test2 > 222.txt\necho test3 > 333.txt')
    cy.scriptSelect('run.sh')
    cy.openRemoteFileSettingTab()
    cy.addIncludeFile('*.txt')
    cy.addExcludeFile('222.txt')

    
    Cypress._.times(2, (k) => {
      cy.contains('thead', 'exclude').next().then($el=>{
          cy.softAssert($el.text(), '222.txt')
        })

      cy.projectReload(k, testProject, 'task0')
      cy.openRemoteFileSettingTab()
    })

    cy.execProject()
    cy.passwordType(password).wait(1000)

    cy.clickTask('task0')
    cy.clickFilesTab()
    cy.contains('*.txt').click()
    cy.get('[role="group"]').children().children().then($el => {
      cy.softAssert($el.eq(0).text(), '111.txt')
      cy.softAssert($el.eq(1).text(), '333.txt')
    })
    
    cy.closeTask()
    cy.resetProject()
    cy.clickTask('task0')
    cy.removeTask('task0')
    cy.removeTask('task0')
  })
  
  it('test40', () => {
    cy.taskMake('task0')
    cy.hostSelect('testServer')
    cy.scriptMake('run.sh', 'echo test1 > 111.txt\necho test2 > 222.txt\necho test3 > 333.txt')
    cy.scriptSelect('run.sh')
    cy.openRemoteFileSettingTab()
    cy.addIncludeFile('*.txt')
    cy.addExcludeFile('222.txt')
    cy.deleteExcludeFile('222.txt')

    
    Cypress._.times(2, (k) => {
      cy.contains('thead', 'exclude').next().then($el=>{
          cy.softAssert($el.text(), 'No data available')
        })

      cy.projectReload(k, testProject, 'task0')
      cy.openRemoteFileSettingTab()
    })

    cy.execProject()
    cy.passwordType(password).wait(1000)

    cy.clickTask('task0')
    cy.clickFilesTab()
    cy.contains('*.txt').click()
    cy.get('[role="group"]').children().children().then($el => {
      cy.softAssert($el.eq(0).text(), '111.txt')
      cy.softAssert($el.eq(1).text(), '222.txt')
      cy.softAssert($el.eq(2).text(), '333.txt')
    })
    
    cy.clickConsole()
    cy.resetProject()
    cy.clickTask('task0')
    cy.removeTask('task0')
    cy.removeTask('task0')
  })
  
  it('test41', () => {
    cy.taskMake('task0')
    cy.hostSelect('testServer')
    cy.scriptMake('run.sh', 'echo test')
    cy.scriptSelect('run.sh')
    cy.openRemoteFileSettingTab()
    cy.setCleanUpFlg('remove files')

    
    Cypress._.times(2, (k) => {
      cy.contains('label', 'remove files').siblings().find('input').then($el=>{
          cy.softAssert($el.prop('checked'), true)
        })

      cy.projectReload(k, testProject, 'task0')
      cy.openRemoteFileSettingTab()
    })

    cy.execProject()
    cy.passwordType(password).wait(1000)

    cy.sendCommand().then(stdout => {
      cy.softAssert(stdout, '0\n')
    })
    
    cy.clickConsole()
    cy.resetProject()
    cy.clickTask('task0')
    cy.removeTask('task0')
  })
  
  it('test42', () => {
    cy.taskMake('task0')
    cy.hostSelect('testServer')
    cy.scriptMake('run.sh', 'echo test')
    cy.scriptSelect('run.sh')
    cy.openRemoteFileSettingTab()
    cy.setCleanUpFlg('keep files')

    
    Cypress._.times(2, (k) => {
      cy.contains('label', 'keep files').siblings().find('input').then($el=>{
          cy.softAssert($el.prop('checked'), true)
        })

      cy.projectReload(k, testProject, 'task0')
      cy.openRemoteFileSettingTab()
    })

    cy.execProject()
    cy.passwordType(password).wait(1000)

    cy.sendCommand().then(stdout => {
      cy.softAssert(stdout, '1\n')
    })
    
    cy.clickConsole()
    cy.resetProject()
    cy.clickTask('task0')
    cy.removeTask('task0')
  })
  
  it('test43', () => {
    cy.taskMake('task0')
    cy.hostSelect('testServer')
    cy.scriptMake('run.sh', 'echo test')
    cy.scriptSelect('run.sh')
    cy.openRemoteFileSettingTab()
    cy.setCleanUpFlg('same as parent')

    
    Cypress._.times(2, (k) => {
      cy.contains('label', 'same as parent').siblings().find('input').then($el=>{
          cy.softAssert($el.prop('checked'), true)
        })

      cy.projectReload(k, testProject, 'task0')
      cy.openRemoteFileSettingTab()
    })

    cy.execProject()
    cy.passwordType(password).wait(1000)

    cy.sendCommand().then(stdout => {
      cy.softAssert(stdout, '1\n')
    })
    
    cy.clickConsole()
    cy.resetProject()
    cy.clickTask('task0')
    cy.removeTask('task0')
  })
})
