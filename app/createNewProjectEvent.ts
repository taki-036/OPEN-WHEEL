import fs = require('fs');
import path = require('path');
import logger = require('./logger');
import serverConfig = require('./serverConfig');
import serverUtility = require('./serverUtility');

/**
 *
 */
class CreateNewProjectEvent implements SocketListener {

    /**
     * event name
     */
    private static eventName = 'onCreateNewProject';

    /**
     *
     */
    private config = serverConfig.getConfig();

    /**
     *
     * @param socket
     */
    public onEvent(socket: SocketIO.Socket): void {
        socket.on(CreateNewProjectEvent.eventName, (directoryPath: string) => {
            const projectFileName: string = this.config.system_name;
            const workflowFileName: string = this.config.default_filename;

            const projectJson = serverUtility.readTemplateProjectJson();
            const workflowJson = serverUtility.readTemplateWorkflowJson();

            projectJson.path = `./${projectFileName}${this.config.extension.project}`;
            projectJson.path_workflow = `./${workflowFileName}${this.config.extension.workflow}`;
            projectJson.log.path = path.dirname(projectJson.path_workflow);

            projectJson.log.name = workflowJson.name;
            projectJson.log.description = workflowJson.description;

            workflowJson.path = path.basename(directoryPath);

            const projectFilePath = `${directoryPath}/${projectJson.path}`;
            const workflowFilePath = `${directoryPath}/${projectJson.path_workflow}`;

            fs.mkdir(directoryPath, (mkdirErr) => {
                if (mkdirErr) {
                    logger.error(mkdirErr);
                    socket.emit(CreateNewProjectEvent.eventName);
                    return;
                }
                serverUtility.writeJson(projectFilePath, projectJson,
                    () => {
                        serverUtility.writeJson(workflowFilePath, workflowJson,
                            () => {
                                socket.emit(CreateNewProjectEvent.eventName, projectFilePath);
                            },
                            () => {
                                socket.emit(CreateNewProjectEvent.eventName);
                            });
                    },
                    () => {
                        socket.emit(CreateNewProjectEvent.eventName);
                    });
            });
        });
    }
}

export = CreateNewProjectEvent;