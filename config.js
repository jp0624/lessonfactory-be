var config = {
    // dev: {
    //     mysql: {
    //         host: 'sql.fleetdefense.com',
    //         port: 3306,
    //         user: 'dams',
    //         password: 'sonic_root',
    //         database: 'dams_schema'
    //     },
    //     server: {
    //         host: 'localhost',
    //         port: 3002
    //     }
    // },
    // int: {
    //     mysql: {
    //         host: 'sql.int.fleetdefense.com',
    //         port: 3306,
    //         user: 'admin',
    //         password: 'sonic_root',
    //         database: 'dams_schema'
    //     },
    //     server: {
    //         host: '127.0.0.1',
    //         port: 3002
    //     }
    // },
    dev: {
        mysql: {
            host: 'localhost',
            port: 3306,
            user: 'dams',
            password: 'Password#1',
            database: 'dams_schema'
            // database: 'dams_schema_v3'
        },
        server: {
            host: 'localhost',
            port: 3002
        }
    },
    int: {
        mysql: {
            host: '192.168.4.46',
            port: 3306,
            user: 'admin',
            password: 'sonic_root',
            database: 'dams_schema'
        },
        server: {
            host: '127.0.0.1',
            port: 3002
        }
    },
    default: {
        mysql: {
            host: 'sql.fleetdefense.com',
            port: 3306,
            user: 'dams',
            password: 'sonic_root',
            database: 'dams_schema'
        },
        server: {
            host: '127.0.0.1',
            port: 3002
        }
    }
};
module.exports = config;



