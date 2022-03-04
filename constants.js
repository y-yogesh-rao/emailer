module.exports = {
    STATUS: {
        INACTIVE: 0,
        ACTIVE: 1
    },
    PAGINATION_LIMIT: 20,
    SMTP: {
        ssl:'ssl',
        port:'465',
        host:'smtp.gmail.com',
        password:'smtp@illuminz',
        username:'smtp@illuminz.com',
    },
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
        {
            name: 'fiveMinuteCron',
            time: '*/1 * * * *',
            timezone: 'Asia/Calcutta',
            request: {
            method: 'GET',
                url: '/cron/fiveMinuteCron'
            },
            onComplete: (res) => {
                console.log('------------Cron Job Executed ( Every 5 minutes ) -----------');
            }
        }
    ]
}