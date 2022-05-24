module.exports = {
    STATUS: {
        INACTIVE: 0,
        ACTIVE: 1
    },
    PAGINATION_LIMIT: 20,
    USER_EMAIL_LIMIT: 50,
    ROLE: {
        ADMIN: 1,
        USER: 2
    },
    CRON: [
        {
            name: 'dailyCron',
            time: '0 0 * * *',
            timezone: 'Asia/Calcutta',
            request: {
            method: 'GET',
                url: '/cron/dailyCron'
            },
            onComplete: (res) => {
                console.log('------------Cron Job Executed ( Every Day ) -----------');
            }
        },
        // {
        //     name: 'oneMinuteCron',
        //     time: '*/1 * * * *',
        //     timezone: 'Asia/Calcutta',
        //     request: {
        //     method: 'GET',
        //         url: '/cron/oneMinuteCron'
        //     },
        //     onComplete: (res) => {
        //         console.log('------------Cron Job Executed ( Every 1 minutes ) -----------');
        //     }
        // }
    ]
}