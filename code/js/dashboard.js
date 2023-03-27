const dashboard = {
    /**
     * Defines some enum types for the config.
     * @typedef {"date" | "time" | "weather" | "bookmarks" | "searchBar" | "nextCourse" | "weeklySchedule"} Component
     * @typedef {"light" | "dark" | "system" | "timeOfDay"} ThemeMode
     */
    /**
     * @typedef {Object} Theme
     * @property {ThemeMode} mode The theme mode to use.
     * @property {boolean} useGradientColors Whether to use gradient colors for the theme if set to "timeOfDay".
     */
    /**
     * @typedef {Object} Config
     * @property {Component[]} componentsToShow The components to show in the dashboard.
     * @property {Theme} theme The theme to use.
     **/
    /**
     * The default config.
     * @type {Config}
     * @readonly
     **/
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
    /**
     * The current config.
     * @type {Config | null}
     **/
    currentConfig: null,
    init: function() {
      if (currentConfig === null) {
        currentConfig = this.loadConfig();
      }
      this.generateDashboard();
    },
    loadConfig: function() {
      // Load the config from the local storage.
      let configStr = localStorage.getItem("dashboardConfig");
      /** @type {Config} */
      let config;
      if (configStr === null) {
        // If the config is not found, use the default config.
        config = this.defaultConfig;
      } else {
        // If the config is found, parse it as JSON.
        config = JSON.parse(configStr);
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
        if (configValue === undefined) {
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
      this.lastDownloadURL = URL.createObjectURL(new Blob([JSON.stringify(this.currentConfig)], {
        type: "application/json"
      }));
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
        function(data) {
          // Update the weather.
          // Todo: Implement this.
          // This can be rain, clear, clouds, etc.
          const typeOfWeather = data.weather[0].main;
        }
      ).catch(
        function(error) {
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

  const DateTimeUtils = {
    /**
     * @typedef {"Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday "} DayOfWeekLong
     * @typedef {"January" | "February" | "March" | "April" | "May" | "June" | "July" | "August" | "September" | "October" | "November" | "December"} MonthLong
     */
    /**
     * @typedef {Object} DateTime
     * @property {MonthLong} monthName The name of the month.
     * @property {number} month The month number, starting at 1 for January.
     * @property {number} day The day of the month, starting at 1.
     * @property {DayOfWeekLong} weekdayName
     * @property {number} weekdayNum 0 is Sunday, 1 is Monday, etc.
     * @property {number} year
     * @property {number} hour 24 hour time.
     * @property {number} minute
     * @property {number} second
     * @property {number} hour12
     * @property {bool} isPm Whether or not it is PM (hour >= 12).
     */
    /**
     * @returns {DateTime}
     */
    getCurrentDateTimeInNewYork: function() {
      const formattedString = Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false}).formatToParts(new Date());
      let monthNum;
      switch (formattedString[2].value) {
        case "January":
          monthNum = 1;
          break;
        case "February":
          monthNum = 2;
          break;
        case "March":
          monthNum = 3;
          break;
        case "April":
          monthNum = 4;
          break;
        case "May":
          monthNum = 5;
          break;
        case "June":
          monthNum = 6;
          break;
        case "July":
          monthNum = 7;
          break;
        case "August":
          monthNum = 8;
          break;
        case "September":
          monthNum = 9;
          break;
        case "October":
          monthNum = 10;
          break;
        case "November":
          monthNum = 11;
          break;
        case "December":
          monthNum = 12;
          break;
      }
      let weekNum;
      switch (formattedString[0].value) {
        case "Monday":
          weekNum = 1;
          break;
        case "Tuesday":
          weekNum = 2;
          break;
        case "Wednesday":
          weekNum = 3;
          break;
        case "Thursday":
          weekNum = 4;
          break;
        case "Friday":
          weekNum = 5;
          break;
        case "Saturday":
          weekNum = 6;
          break;
        case "Sunday":
          weekNum = 0;
          break;
      }
      const day = parseInt(formattedString[4].value);
      const year = parseInt(formattedString[6].value);
      const hour = parseInt(formattedString[8].value);
      const minute = parseInt(formattedString[10].value);
      const second = parseInt(formattedString[12].value);
      return {
        monthName: formattedString[0].value,
        month: parseInt(formattedString[2].value),
        day: day,
        weekdayName: formattedString[0].value,
        weekdayNum: weekNum,
        year: year,
        hour: hour,
        minute: minute,
        second: second,
        hour12: hour % 12,
        isPm: hour >= 12
      }
    }
  }
  
  const courses = {
    /**
     * An array of user CRNs
     * @type {number[]}
     */
    userCourses: [],
    /**
     * @typedef {Object} SingleCourseSchedule
     * @property {string} name The name of the course.
     * @property {[string, number]} code The code of the course in the ["DEPARTMENTNO", NUMBER] form.
     * @property {number} start The start time of the course in military time.
     * @property {number} end The end time of the course in military time.
     */
    /**
     * @typedef {"mon" | "tue" | "wed" | "thu" | "fri"} DayOfWeek
     * @typedef {Record<DayOfWeek, SingleCourseSchedule[] | undefined>} CourseSchedules
     */
    /**
     * An object of course schedules.
     * Has 5 keys: "mon", "tue", "wed", "thu", "fri".
     * Each key has an array of course schedules. A course schedule has a `name`, `code`, `start` and `end` time.
     * @type {CourseSchedules}
     */
    courseSchedules: {},
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
      let date = DateTimeUtils.getCurrentDateTimeInNewYork();
      if (date.month < 5) {
        // If the month is before May, it is the spring semester.
        return date.getFullYear() + "01";
      } else if (date.month < 9) {
        // If the month is in May or after May but before September, it is the summer semester.
        return date.getFullYear() + "05";
      } else {
        // If the month is after September, it is the fall semester.
        return date.getFullYear() + "09";
      }
    },
    getCourseData: function(semesterNo) {
      return new Promise((resolve, reject) => {
        if (sessionStorage.getItem(`courseData-${semesterNo}`) !== null) {
          // If the course data is already in the session storage, use that.
          resolve(JSON.parse(sessionStorage.getItem(`courseData-${semesterNo}`)));
          return;
        }
        $.ajax(`https://raw.githubusercontent.com/quacs/quacs-data/master/semester_data/${semesterNo}/courses.json`, {
          dataType: "json",
          success: function(data) {
            // Save the course data to the session storage.
            sessionStorage.setItem(`courseData-${semesterNo}`, JSON.stringify(data));
            resolve(data);
          },
          error: reject
        })
      })
    },
    loadUserCourses: function() {
      // Get the user's courses from the local storage.
      let userCourses = localStorage.getItem("userCourses");
      if (userCourses !== null) {
        this.userCourses = JSON.parse(userCourses);
      }
      let courseSchedulesStr = localStorage.getItem("courseSchedules");
      if (courseSchedulesStr !== null) {
        this.courseSchedules = JSON.parse(courseSchedulesStr);
      }
    },
    saveUserCourses: function() {
      // Save the user's courses to the local storage.
      localStorage.setItem("userCourses", JSON.stringify(this.userCourses));
      localStorage.setItem("courseSchedules", JSON.stringify(this.courseSchedules));
    },
    determineCourseSchedule: function() {
      let semesterNo = this.getCurrentSemesterNumber();
      this.getCourseData(semesterNo).then(
        function(data) {
          let coursesList = [];
          // We need to flatten the data. The data is an array of objects, one for each department.
          // We only care about the courses in that department, not the department itself.
          // Extract the courses array from each department.
          for (let department of data) {
            coursesList.push(...department.coursesList);
          }
          /**
           * @typedef {"M" | "T" | "W" | "R" | "F"} DayOfWeekQUACS
           */
          /**
           * @typedef {Object} Timeslot
           * There are other attributes but we do not use them.
           * @property {number} timeStart The start time of the timeslot in military time.
           * @property {number} timeEnd The end time of the timeslot in military time.
           * @property {DayOfWeekQUACS[]} days The days that the schedule applies for.
           */
          /**
           * @typedef {Object} Section
           * There are other attributes but we do not use them.
           * @property {number} crn The CRN of the section.
           * @property {Timeslot[]} timeslots The timeslots of the section.
           * @property {string} subj The department code of the section.
           * @property {number} crse The course number of the section.
           * @property {string} title The title of the section's course.
           */
          /** @type {Section[]} */
          let sections = [];
          // We really care about the sections, since those are tracked by the CRNs we have.
          // Extract the sections array from each course.
          for (let course of coursesList) {
            sections.push(...course.sections);
          }
          // Filter the sections to only include the ones the user is taking.
          const userSections = sections.filter(section => courses.userCourses.includes(section.crn));
          /** @type {CourseSchedules} */
          let newCourseSchedules = {};
          // Now, we build the course schedules.
          for (let section of userSections) {
            for (let timeslot of section.timeslots) {
              for (let day of timeslot.days) {
                // We need to convert the days from QUACS format to our format.
                let dayOfWeek;
                switch (day) {
                  case "M":
                    dayOfWeek = "mon";
                    break;
                  case "T":
                    dayOfWeek = "tue";
                    break;
                  case "W":
                    dayOfWeek = "wed";
                    break;
                  case "R":
                    dayOfWeek = "thu";
                    break;
                  case "F":
                    dayOfWeek = "fri";
                    break;
                }
                // If the day of week does not exist, create it.
                if (newCourseSchedules[dayOfWeek] === undefined) {
                  newCourseSchedules[dayOfWeek] = [];
                }
                // Add the course schedule to the day of week.
                newCourseSchedules[dayOfWeek].push({
                  name: section.title,
                  code: [section.subj, section.crse],
                  start: timeslot.timeStart,
                  end: timeslot.timeEnd
                });
              }
            }
          }
          // Save the course schedules.
          courses.courseSchedules = newCourseSchedules;
          courses.saveUserCourses();
        });
    },
    /**
     * Get the user's courses for a specific day.
     * @param {DayOfWeek} day 
     * @returns {CourseSchedule[]}
     */
    getUserCourses: function (day){
      return this.courseSchedules[day] || [];
    },
    getRemainingUserCoursesForToday: function() {
      // Get the current day of the week.
      const currentDateTime = DateTimeUtils.getCurrentDateTimeInNewYork();
      let dayOfWeek = currentDateTime.weekdayNum;
      // Convert the day of week to our format.
      /** @type {DayOfWeek} */
      let dayOfWeekStr;
      switch (dayOfWeek) {
        case 1:
          dayOfWeekStr = "mon";
          break;
        case 2:
          dayOfWeekStr = "tue";
          break;
        case 3:
          dayOfWeekStr = "wed";
          break;
        case 4:
          dayOfWeekStr = "thu";
          break;
        case 5:
          dayOfWeekStr = "fri";
          break;
        default:
          return [];
      }
      // Get the current time.
      let currentTime = currentDateTime.hour * 100 + currentDateTime.minute;
      // Filter the courses to only include the ones that have not started yet.
      return (this.courseSchedules[dayOfWeekStr] || []).filter(course => course.start > currentTime);
    },
    getNextUpcomingCourse: function() {
      return this.getRemainingUserCoursesForToday()[0] || null;
    }
  }