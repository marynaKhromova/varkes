#!/usr/bin/env node
'use strict'

import * as path from "path"
import * as fs from "fs"
import { logger as LOGGER } from "./logger"

const OAUTH = "/authorizationserver/oauth/token";
const METADATA = "/metadata";

function configure(varkesConfigPath: string, currentDirectory: string) {
    var varkesConfig
    if (varkesConfigPath) {
        var endpointConfig = path.resolve(currentDirectory, varkesConfigPath)
        LOGGER.info("Using configuration %s", endpointConfig)
        varkesConfig = JSON.parse(fs.readFileSync(endpointConfig, "utf-8"))
        varkesConfig.apis.map((api: any) => {
            api.specification = path.resolve(path.dirname(endpointConfig), api.specification)
            if (api.added_endpoints) {
                api.added_endpoints.map((ae: any) => {
                    ae.filePath = path.resolve(path.dirname(endpointConfig), ae.filePath)
                })
            }
        })

        configValidation(varkesConfig)
    } else {
        LOGGER.info("Using default configuration")
        varkesConfig = JSON.parse(fs.readFileSync(__dirname + "/resources/varkes_config_default.json", "utf-8"))
    }
    return varkesConfig
}

function configValidation(configJson: any) {
    var error_message = "";
    if (configJson.hasOwnProperty("apis")) {
        for (var i = 1; i <= configJson.apis.length; i++) {
            var api = configJson.apis[i - 1];
            if (!api.name) {
                error_message += "\napi number " + i + ": missing attribute 'name', a name is mandatory";
            }
            if (!api.type) {
                api.type = "openapi"
            }
            if (!api.oauth) {
                api.oauth = OAUTH
            }
            if (!api.metadata) {
                api.metadata = METADATA
            }
            if (!api.type.match(/^(openapi|odata)$/)) {
                error_message += "\napi '" + api.name + "': type '" + api.type + "' is not matching the pattern '^(openapi|odata)$'";
            }
            if (api.metadata && !api.metadata.match(/^\/[/\\\w]+$/)) {
                error_message += "\napi '" + api.name + "': metadata '" + api.metadata + "' is not matching the pattern '^\\/[/\\\\\w]+$+'";
            }
            if (api.oauth && !api.oauth.match(/^\/[/\\\w]+$/)) {
                error_message += "\napi '" + api.name + "': oauth '" + api.oauth + "' is not matching the pattern '^\\/[/\\\\\w]+$'";
            }
            if (api.type == "openapi" && !api.specification.match(/^.+\.(json|yaml|yml)$/)) {
                error_message += "\napi '" + api.name + "': specification '" + api.specification + "' does not match pattern '^.+\\.(json|yaml|yml)$'";
            }
            if (api.type == "openapi" && !api.basepath) {
                error_message += "\napi '" + api.name + "': missing attribute 'basepath', a basepath is mandatory";
            }
            else if (api.type == "openapi" && !api.basepath.match(/^\/[/\\\w]+$/)) {
                error_message += "\napi '" + api.name + "': basepath '" + api.basepath + "' is not matching the pattern '^\\/[/\\\\\w]+$'";
            }
        }
    }

    if (error_message != "") {
        throw new Error("Validation of configuration failed: " + error_message);
    }
}

export { configure }