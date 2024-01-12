describe('wheel test', () => {
  const testProject = 'test'
  const password = 'passw0rd'
  const screenShotFlg = false
  before(() => {
    cy.visit('/')
    cy.projectMake(testProject)
    // cy.projectOpen(testProject)
    // cy.viewport('macbook-16')
  })

  beforeEach(() => {
    cy.projectOpen(testProject)
    cy.viewport('macbook-16')
  })

  afterEach(() => {
    cy.get('[href="./home"]').click()
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

    cy.contains('button', 'Files').focus().scrollIntoView({easing: 'linear', duration: 100})
    if (screenShotFlg) {
      cy.screenshot('test1', {overwrite: true, capture: 'runner'})
    }

    cy.removeTask('task0')
  })

  it.only('test3', () => {
    cy.taskMake('task0')
    cy.clickFilesTab()

    cy.fileFolderMake('folder', 'folder1')
    cy.fileFolderMake('file', 'file1')

    cy.contains('button', 'Files').next().find('[role="listbox"]').eq(0).children().then($el => {
      cy.softAssert($el.eq(0).text(), 'folder1', "Folder is exist")
      cy.softAssert($el.eq(1).text(), 'file1', "File is exist")
    })

    cy.contains('button', 'Files').focus().scrollIntoView({easing: 'linear', duration: 100})
    if (screenShotFlg) {
      cy.screenshot('test3', {overwrite: true, capture: 'runner'})
    }

    cy.removeTask('task0')
  })
})
