// Copyright (c) Wictor Wilén. All rights reserved. 
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import { GeneratorTeamsAppOptions } from "../../GeneratorTeamsAppOptions";
import { BaseCoreFilesUpdater } from "../BaseCoreFilesUpdater";
import { Editor } from 'mem-fs-editor';
import * as Generator from 'yeoman-generator';
import { Project, PropertyAssignment, SyntaxKind } from 'ts-morph';

export class CoreFilesUpdater_2_11 extends BaseCoreFilesUpdater {
    public updateCoreFiles(options: GeneratorTeamsAppOptions, fs: Editor): boolean {
        // Update gulp.config.js, so manifests include json files for localization
        const project = new Project();
        project.createSourceFile("temp.ts", fs.read("gulp.config.js"));
        const src = project.getSourceFileOrThrow("temp.ts");
        const config = src.getVariableDeclarationOrThrow("config");

        const arr = config.getFirstChildByKind(SyntaxKind.ObjectLiteralExpression);
        if (arr) {
            const manifests = arr.getProperties().find(p => {
                if (p.getKind() == SyntaxKind.PropertyAssignment) {
                    const pa: PropertyAssignment = <any>p;
                    return pa.getName() == "manifests";
                } else {
                    return false;
                }
            });
            if (manifests) {
                const manifestDecl = manifests.getFirstChildByKind(SyntaxKind.ArrayLiteralExpression);
                if (manifestDecl) {
                    manifestDecl.replaceWithText('["./src/manifest/**/*.*", "!**/manifest.json"]');
                    fs.write("gulp.config.js", src.getFullText());
                    return true;
                }
            }
        }
        return false;
    }
}