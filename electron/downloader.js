import fs from 'fs';

export async function onDownloadSubmit(downloadType,targetDirectory,comicName,comicIssueLinks) {
    const TD_FULLPATH = makeTargetDirectory(targetDirectory,comicName);
}


export function makeTargetDirectory(targetDirectory,comicName) {
    let fullPath = `${targetDirectory}${comicName}`;
    console.log(fullPath);
}