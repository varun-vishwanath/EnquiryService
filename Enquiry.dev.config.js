module.exports = {
    apps: [
        // First application
        {
            name: "Enquiry",
            script: "server/server.js",
            watch: false,
            env: {
                NODE_ENV: "dev"
            }
        }
    ]
}

