module.exports = {
    channels: {
        APP_INFO: 'app_info',
    },
    DOWNLOAD_TYPE:{
        ISSUE:"issue",
        SERIES:"series"
    },
    DOWNLOAD_ENDPOINT:"https://readcomiconline.to",
    DOWNLOAD_ARGS:"&readType=1",
    DOWNLOAD_STATUS: {
        INPROGRESS:"in-progress",
        DONE:"done",
        QUEUED:"queued"
    },
    PAGE_SIZE: [650,1004],
    FETCHING_RESULTS_MESSAGE: "Fetching results...",
    CHECKING_FOR_DOWNLOADS_MSG: "Checking for existing downloads in target directory..."
};