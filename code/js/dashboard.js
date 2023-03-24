const dashboard = {
    defaultConfig: {
        /**
         * The components to show in the dashboard.
         * 
         * List of components:
         * - date: This is the date showon on the top left.
         * - time: This is the time shown on the top left.
         * - weather: This is the weather shown on the top left.
         * - bookmarks: This is the bookmarks shown on the top right.
         * - searchBar: This is the search bar on the middle.
         * - nextCourse: This is the time until the next course, shown on the middle.
         * - weeklySchedule: This is the weekly schedule, shown on the bottom.
         */
        componentsToShow: [
            "date",
            "time",
            "weather",
            "bookmarks",
            "searchBar",
            "nextCourse",
            "weeklySchedule"
        ],
        theme: {
            /**
             * The theme to use. Valid values are:
             * 
             * - light: The light theme.
             * - dark: The dark theme.
             * - system: Follows the system configuration.
             * - timeOfDay: Follows the time of day at RPI.
             */
            mode: "timeOfDay",
            /**
             * Whether to use gradient colors for the theme if set to "timeOfDay".
             * 
             * If disabled, it will use the light theme before sunset and the dark theme
             * after sunset.
             * 
             * Has no effect if the mode is any other values.
             */
            useGradientColors: true
        }
    },
    currentConfig: null,
    init: function() {
        if (currentConfig === null){
            currentConfig = this.loadConfig();
        }
        this.generateDashboard();
    },
    loadConfig: function() {
        // Load the config from the local storage.
        let config = localStorage.getItem("dashboardConfig");
        if (config === null) {
            // If the config is not found, use the default config.
            config = this.defaultConfig;
        } else {
            // If the config is found, parse it as JSON.
            config = JSON.parse(config);
        }
        return config;
    },
    getConfig: function(path) {
        // Get the value of "path" from the config.
        // In order to access nested values in the config, use dot notation.
        // For example, to get the current theme mode, we would supply
        // path as "theme.mode".
        let configValue = this.currentConfig;
        let defaultConfigValue = this.defaultConfig;
        let pathParts = path.split(".");
        for (const part of pathParts) {
            configValue = configValue[part];
            defaultConfigValue = defaultConfigValue[part];
            if (configValue === undefined){
                // If the config value is not found, we start using the default config value.
                configValue = defaultConfigValue;
            }
        }
        return configValue;
        
    },
    saveConfig: function() {
        // Save the config to the local storage as JSON.
        localStorage.setItem("dashboardConfig", JSON.stringify(this.currentConfig));
    },
    lastDownloadURL: null,
    generateConfigDownloadLink: function() {
        if (this.lastDownloadURL !== null) {
            // Revoke the old download URL.
            URL.revokeObjectURL(this.lastDownloadURL);
        }
        // Create a new download URL.
        this.lastDownloadURL = URL.createObjectURL(new Blob([JSON.stringify(this.currentConfig)], {type: "application/json"}));
        $("#exportButton").attr("href", this.lastDownloadURL);
        $("#exportButton").attr("download", "dashboardConfig.json");
        return this.lastDownloadURL;
    },
    setupImport: function() {
        $("#importButton").on("change", function() {
            // When the file is selected, read it.
            let file = this.files[0];
            let reader = new FileReader();
            reader.onload = function() {
                // When the file is read, parse it as JSON.
                let config = JSON.parse(this.result);
                // Save the config.
                dashboard.currentConfig = config;
                dashboard.saveConfig();
                // Reload the page.
                location.reload();
            };
            reader.readAsText(file);
        });
    },
    showSettingsPage: function() {
        // Todo: Generate the settings page.
    },
    showDashboard: function() {
        // Todo: Generate the dashboard.
    },
    updateWeather: function() {
        // Get the weather.
        weather.getWeather().then(
            function (data) {
                // Update the weather.
                // Todo: Implement this.
                // This can be rain, clear, clouds, etc.
                const typeOfWeather = data.weather[0].main;
            }
        ).catch(
            function (error) {
                alert("Error getting weather: " + error)
            }
        )
    }
}

const weather = {
    apiKey: "06620284fbc3c236120f41a84c7eb316",
    zipCode: "12180",
    country: "US",
    units: "imperial",
    getWeather: function() {
        return new Promise((resolve, reject) => {
            $.ajax(`https://api.openweathermap.org/data/2.5/weather?zip=${this.zipCode},${this.country}&appid=${this.apiKey}&units=${this.units}`, {
                dataType: "json",
                success: resolve,
                error: reject
            })
        })
    },
}

const courses = {
    courseData: {},
    userCourses: [],
    getCurrentSemesterNumber: function() {
        /**
         * QUACS stores semester data in this format:
         * YYYYMM
         * 
         * YYYY is the year of the semester.
         * MM is one of the following:
         * 
         * - 01: Spring Semester
         * - 05: Summer Semester
         * - 09: Fall Semester
         */
        let date = new Date();
        if (date.getMonth() < 4) {
            // If the month is before May (0-index), it is the spring semester.
            return date.getFullYear() + "01";
        } else if (date.getMonth() < 8) {
            // If the month is before September (0-index), it is the summer semester.
            return date.getFullYear() + "05";
        } else {
            // If the month is after September (0-index), it is the fall semester.
            return date.getFullYear() + "09";
        }
    },
    getCourses: function(semesterNo) {
        $.ajax(`https://raw.githubusercontent.com/quacs/quacs-data/master/semester_data/${semesterNo}/courses.json`, {
            dataType: "json",
            success: function(data) {
                // Todo: Implement
            }
        })
    }
}