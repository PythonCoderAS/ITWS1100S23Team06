"use strict";

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
   * @typedef {Object} Courses
   * @property {number[]} userCourses
   * @property {CourseSchedules} courseSchedules
   */
  /**
   * @typedef {Object} Bookmark
   * @property {string} text The text to show on the bookmark.
   * @property {string} url The URL to open when the bookmark is clicked.
   */
  /**
   * @typedef {Object} Config
   * @property {Component[]} componentsToShow The components to show in the dashboard.
   * @property {Theme} theme The theme to use.
   * @property {Courses} courses Course data
   * @property {Bookmark[]} bookmarks The bookmarks to show in the dashboard.
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
    },
    courses: {
      /**
       * An array of user CRNs
       */
      userCourses: [],
      /**
       * An object of course schedules.
       * Has 5 keys: "mon", "tue", "wed", "thu", "fri".
       * Each key has an array of course schedules. A course schedule has a `name`, `code`, `start` and `end` time.
       */
      courseSchedules: {},
    },
    bookmarks: [{
        text: "Homepage",
        url: "https://www.rpi.edu/"
      },
      {
        text: "SIS",
        url: "https://sis.rpi.edu/"
      },
      {
        text: "LMS",
        url: "https://lms.rpi.edu/"
      },
      {
        text: "Submitty",
        url: "https://submitty.cs.rpi.edu/"
      }
    ]
  },
  /**
   * The current config.
   * @type {Config | null}
   **/
  currentConfig: null,
  setDashboardInitialClickHandlers: false,
  setSettingsInitialClickHandlers: false,
  /** @type {number[]} */
  dashboardIntervals: [],
  init: function() {
    if (dashboard.currentConfig === null) {
      dashboard.currentConfig = dashboard.loadConfig();
      dashboard.mergeWithDefaultConfig(dashboard.currentConfig, this.defaultConfig);
    }
    dashboard.showDashboard();
  },
  loadConfig: function() {
    // Load the config from the local storage.
    let configStr = localStorage.getItem("dashboardConfig");
    /** @type {Config} */
    let config;
    if (configStr === null) {
      // If the config is not found, use the default config.
      config = dashboard.defaultConfig;
    } else {
      // If the config is found, parse it as JSON.
      config = JSON.parse(configStr);
    }
    return config;
  },
  mergeWithDefaultConfig: function(root, defaultConfigRoot) {
    // Merges the stored config with the default config.
    if (root === undefined) {
      root = dashboard.currentConfig;
    }
    if (defaultConfigRoot === undefined) {
      defaultConfigRoot = dashboard.defaultConfig;
    }
    for (const key of Object.keys(defaultConfigRoot)) {
      if (typeof defaultConfigRoot[key] === "object" && Object.keys(defaultConfigRoot[key]).length > 0 && !Array.isArray(defaultConfigRoot[key]) && defaultConfigRoot[key] !== null) {
        root[key] = root[key] || {};
        dashboard.mergeWithDefaultConfig(root[key], defaultConfigRoot[key]);
      } else {
        if (!Object.keys(root).includes(key)) {
          root[key] = defaultConfigRoot[key];
        }
      }
    }
  },
  saveConfig: function() {
    // Save the config to the local storage as JSON.
    localStorage.setItem("dashboardConfig", JSON.stringify(dashboard.currentConfig));
  },
  lastDownloadURL: null,
  generateConfigDownloadLink: function() {
    if (dashboard.lastDownloadURL !== null) {
      // Revoke the old download URL.
      URL.revokeObjectURL(dashboard.lastDownloadURL);
    }
    // Create a new download URL.
    dashboard.lastDownloadURL = URL.createObjectURL(new Blob([JSON.stringify(dashboard.currentConfig, undefined, 4)], {
      type: "application/json"
    }));
    $("#exportButton").off();
    $("#exportButton").on("click", function() {
      $(document.body).append(`<a style="display: none;" id="downloadLink" href="${dashboard.lastDownloadURL}" download="dashboardConfig.json"></a>`);
      $("#downloadLink")[0].click();
      $("#downloadLink").remove();
    });
    return dashboard.lastDownloadURL;
  },
  setupImport: function() {
    $("#importButtonFileInput").on("change", function() {
      // When the file is selected, read it.
      let file = this.files[0];
      if (!file) {
        return;
      }
      let reader = new FileReader();
      reader.onload = function() {
        // When the file is read, parse it as JSON.
        let config = JSON.parse(this.result);
        // Save the config.
        dashboard.currentConfig = config;
        dashboard.saveConfig();
        // Reload the page.
        dashboard.showSettingsPage();
      };
      reader.readAsText(file);
    });
    if (!dashboard.setSettingsInitialClickHandlers) {
      $("#importButton").on("click", function() {
        // When the import button is clicked, trigger the file input.
        $("#importButtonFileInput").trigger("click");
      });
    }
  },
  showSettingsPage: function() {
    $("#settings").show(0)
    $("#dashboard").hide(0)
    dashboard.drawBookmarksInSettings();
    dashboard.drawCoursesInSettings();
    dashboard.drawComponentsToShowSettings();
    dashboard.drawThemeSettings();
    dashboard.generateConfigDownloadLink();
    dashboard.setupImport();
    dashboard.dashboardIntervals.forEach(function(interval) {
      clearInterval(interval);
    });
    dashboard.dashboardIntervals = [];
    // NOTE - This block has to come last.
    if (!dashboard.setSettingsInitialClickHandlers){
      $("#componentsToShowSettings").on("click", function() {
        dashboard.processComponentsToShowClick();
      });
      $("#themeSettings").on("click", function() {
        dashboard.processThemeSettingsClick();
      });
      $("#closeSettingsButton").on("click", function() {
        dashboard.showDashboard();
      });
      dashboard.setSettingsInitialClickHandlers = true;
    }
  },
  setBookmarksInSettings: function() {
    $("#settingsBookmarkList").html(""); // Clear the bookmarks.
    for (let num = 0; num < dashboard.currentConfig.bookmarks.length; num++) {
      const bookmark = dashboard.currentConfig.bookmarks[num];
      // Add a bookmark.
      $("#settingsBookmarkList").append(`
          <div class="settingsBookmark" id="bookmark-idx-${num}">
            <a href="${bookmark.url}" target="_blank">${bookmark.text}</a>
            <div class="actions">
              <img src="images/icons/copy-solid.svg" class="copyBookmark clickable">
              <img src="images/icons/trash-can-solid.svg" class="deleteBookmark clickable">
            </div>
          </div>
        `);
      $(".deleteBookmark").last().on("click", function() {
        // Delete the bookmark.
        dashboard.currentConfig.bookmarks.splice(num, 1);
        dashboard.saveConfig();
        dashboard.setBookmarksInSettings();
      });
      $(".copyBookmark").last().on("click", function() {
        // Copy the bookmark.
        $("#bookmarkName").val(bookmark.text);
        $("#bookmarkURL").val(bookmark.url);
      });
    }
  },
  drawBookmarksInSettings: function() {
    dashboard.setBookmarksInSettings();
    if (!dashboard.setSettingsInitialClickHandlers){
      $("#addBookmarkButton").on("click", function() {
        // Add a bookmark.
        if ($("#bookmarkName").val() === "" || $("#bookmarkURL").val() === "") {
          alert("Please fill out both the bookmark name and bookmark URL.");
          return;
        }
        dashboard.currentConfig.bookmarks.push({
          text: $("#bookmarkName").val(),
          url: $("#bookmarkURL").val()
        });
        dashboard.saveConfig();
        dashboard.setBookmarksInSettings();
        $("#bookmarkName").val("");
        $("#bookmarkURL").val("");
      });
    }
  },
  setCoursesInSettings: function() {
    $("#settingsCourseList").html(""); // Clear the courses.
    for (let num = 0; num < dashboard.currentConfig.courses.userCourses.length; num++) {
      const course = dashboard.currentConfig.courses.userCourses[num];
      // Add a course.
      $("#settingsCourseList").append(`
          <div class="settingsCourse" id="course-idx-${num}">
            <span>CRN ${course}</span>
            <div class="actions">
              <img src="images/icons/trash-can-solid.svg" class="deleteCourse clickable">
            </div>
          </div>
        `);
      $(".deleteCourse").last().on("click", function() {
        // Delete the course.
        dashboard.currentConfig.courses.userCourses.splice(num, 1);
        courses.determineCourseSchedule();
        dashboard.setCoursesInSettings();
      });
    }
  },
  drawCoursesInSettings: function() {
    dashboard.setCoursesInSettings();
    if (!dashboard.setSettingsInitialClickHandlers){
      $("#addCourseButton").on("click", function() {
        // Add a course.
        if ($("#courseCRN").val() === "") {
          alert("Please fill out the course CRN.");
          return;
        }
        const newCRN = Number($("#courseCRN").val());
        if (!Number.isInteger(newCRN)) {
          alert("Please enter a valid CRN.");
          return;
        }
        if (!dashboard.currentConfig.courses.userCourses.includes(newCRN)) {
          dashboard.currentConfig.courses.userCourses.push(newCRN);
        } else {
          alert("You already have that course added.");
          $("#courseCRN").val("");
          return;
        }
        courses.determineCourseSchedule();
        dashboard.setCoursesInSettings();
        $("#courseCRN").val("");
      });
    }
  },
  drawComponentsToShowSettings: function() {
    // Draw the components to show.
    $("#showDate").prop("checked", dashboard.currentConfig.componentsToShow.includes("date"));
    $("#showTime").prop("checked", dashboard.currentConfig.componentsToShow.includes("time"));
    $("#showWeather").prop("checked", dashboard.currentConfig.componentsToShow.includes("weather"));
    $("#showBookmarks").prop("checked", dashboard.currentConfig.componentsToShow.includes("bookmarks"));
    $("#showSearchBar").prop("checked", dashboard.currentConfig.componentsToShow.includes("searchBar"));
    $("#showNextCourse").prop("checked", dashboard.currentConfig.componentsToShow.includes("nextCourse"));
    $("#showWeeklySchedule").prop("checked", dashboard.currentConfig.componentsToShow.includes("weeklySchedule"));
  },
  processComponentsToShowClick: function() {
    // Process the components to show.
    dashboard.currentConfig.componentsToShow = [];
    if ($("#showDate").prop("checked")) {
      dashboard.currentConfig.componentsToShow.push("date");
    }
    if ($("#showTime").prop("checked")) {
      dashboard.currentConfig.componentsToShow.push("time");
    }
    if ($("#showWeather").prop("checked")) {
      dashboard.currentConfig.componentsToShow.push("weather");
    }
    if ($("#showBookmarks").prop("checked")) {
      dashboard.currentConfig.componentsToShow.push("bookmarks");
    }
    if ($("#showSearchBar").prop("checked")) {
      dashboard.currentConfig.componentsToShow.push("searchBar");
    }
    if ($("#showNextCourse").prop("checked")) {
      dashboard.currentConfig.componentsToShow.push("nextCourse");
    }
    if ($("#showWeeklySchedule").prop("checked")) {
      dashboard.currentConfig.componentsToShow.push("weeklySchedule");
    }
    dashboard.saveConfig();
    dashboard.drawComponentsToShowSettings();
  },
  drawThemeSettings: function() {
    // Draw the theme settings.
    $('input[name="theme"]').prop("checked", false);
    switch(dashboard.currentConfig.theme.mode) {
      case "light":
        $("#themeLight").prop("checked", true);
        break;
      case "dark":
        $("#themeDark").prop("checked", true);
        break;
      case "system":
        $("#themeSystem").prop("checked", true);
        break;
      case "timeOfDay":
        $("#themeTimeOfDay").prop("checked", true);
        break;
    }
    $("#themeUseGradient").prop("checked", dashboard.currentConfig.theme.useGradientColors);
  },
  processThemeSettingsClick: function() {
    // Process the theme settings.
    switch($('input[name="theme"]:checked').prop("id")) {
      case "themeLight":
        dashboard.currentConfig.theme.mode = "light";
        break;
      case "themeDark":
        dashboard.currentConfig.theme.mode = "dark";
        break;
      case "themeSystem":
        dashboard.currentConfig.theme.mode = "system";
        break;
      case "themeTimeOfDay":
        dashboard.currentConfig.theme.mode = "timeOfDay";
        break;
    }
    dashboard.currentConfig.theme.useGradientColors = $("#themeUseGradient").prop("checked");
    dashboard.saveConfig();
    dashboard.drawThemeSettings();
  },
  showDashboard: function() {
    $("#dashboard").show(0)
    $("#settings").hide(0)
    if (!dashboard.setDashboardInitialClickHandlers){
      $("#settingsGear").on("click", function() {
        dashboard.showSettingsPage();
      });
      dashboard.setDashboardInitialClickHandlers = true;
    }
    if (dashboard.currentConfig.componentsToShow.includes("date") || dashboard.currentConfig.componentsToShow.includes("time")) {
      dashboard.dashboardIntervals.push(setInterval(dashboard.updateDateAndTime, 500));
      dashboard.updateDateAndTime();
    }
    if (dashboard.currentConfig.componentsToShow.includes("nextCourse") || dashboard.currentConfig.componentsToShow.includes("weeklySchedule")) {
      dashboard.dashboardIntervals.push(setInterval(dashboard.updateCourseSchedule, 10000));
      dashboard.updateCourseSchedule();
    }
    if (dashboard.currentConfig.componentsToShow.includes("weather")) {
      dashboard.dashboardIntervals.push(setInterval(dashboard.updateWeather, 600000));
      dashboard.updateWeather();
    }
    if (!dashboard.currentConfig.componentsToShow.includes("date")) {
      $("#date").hide(0);
    } else {
      $("#date").show(0);
    }
    if (!dashboard.currentConfig.componentsToShow.includes("time")) {
      $("#time").hide(0);
    } else {
      $("#time").show(0);
    }
    if (!dashboard.currentConfig.componentsToShow.includes("weather")) {
      $("#weather").hide(0);
    } else {
      $("#weather").show(0);
    }
    if (!dashboard.currentConfig.componentsToShow.includes("bookmarks")) {
      $("#bookmarks").hide(0);
    } else {
      $("#bookmarks").show(0);
      dashboard.updateBookmarks();
    }
    if (!dashboard.currentConfig.componentsToShow.includes("searchBar")) {
      $("#searchBar").hide(0);
    } else {
      $("#searchBar").show(0);
    }
    if (!dashboard.currentConfig.componentsToShow.includes("nextCourse")) {
      $("#nextCourse").hide(0);
    } else {
      $("#nextCourse").show(0);
    }
    if (!dashboard.currentConfig.componentsToShow.includes("weeklySchedule")) {
      $("#weeklySchedule").hide(0);
    } else {
      $("#weeklySchedule").show(0);
    }
    dashboard.updateDateAndTime();
  },
  updateDateAndTime: function() {
    // Display the current time in HH:MM:SS and the current date in Weekday, Month Day, Year.
    const date = DateTimeUtils.getCurrentDateTimeInNewYork();
    const time = `${String(date.hour).padStart(2, '0')}:${String(date.minute).padStart(2, '0')}:${String(date.second).padStart(2, '0')}`;
    const calendarDate = `${date.weekdayName}, ${date.monthName} ${date.day}, ${date.year}`;
    $('#date').text(calendarDate);
    $('#time').text(time);
  },
  updateCourseSchedule: function() {
    if (dashboard.currentConfig.courses.userCourses.length === 0){
      return;
    }
    const todayCourse = courses.getUserCoursesForToday();
    const nextCourse = courses.getNextUpcomingCourse();
    let text = "";
    if (todayCourse.length === 0) {
      text = "No courses for today, enjoy your day!";
    }
    if (todayCourse.length > 0 && nextCourse === null) {
      text = "No more courses for today, enjoy the rest of your day!";
    } 
    if (todayCourse.length > 0 && nextCourse !== null) {
      const currentDateTime = DateTimeUtils.getCurrentDateTimeInNewYork();
      const deltaFromNextCourse = nextCourse.start - (currentDateTime.hour * 100 + currentDateTime.minute);
      const deltaHours = Math.floor(deltaFromNextCourse / 100);
      const deltaMinutes = (deltaFromNextCourse % 100) - 40; // 100 - 0 = 100, but the difference between an hour is 60 minutes. Subtract 40 to calibrate.
      text = `${nextCourse.name} starts in`;
      if (deltaHours > 0) {
        text += ` ${deltaHours} hr`;
      }
      if (deltaMinutes > 0) {
        text += ` ${deltaMinutes} min`;
      }
    }
    $("#nextCourse").text(text);
    const mondayCourses = courses.getUserCourses("mon");
    const tuesdayCourses = courses.getUserCourses("tue");
    const wednesdayCourses = courses.getUserCourses("wed");
    const thursdayCourses = courses.getUserCourses("thu");
    const fridayCourses = courses.getUserCourses("fri");
    const maxCourseCount = Math.max(mondayCourses.length, tuesdayCourses.length, wednesdayCourses.length, thursdayCourses.length, fridayCourses.length);
    const cols = [mondayCourses, tuesdayCourses, wednesdayCourses, thursdayCourses, fridayCourses];
    $("#weeklySchedule").empty();
    let tableBodyHTML = "";
    for (let i = 0; i < maxCourseCount; i++) {
      let rowHTML = "<tr>";
      for (let j = 0; j < 5; j++) {
        let colHTML = "<td>";
        if (cols[j][i] !== undefined) {
          const course = cols[j][i];
          if (course === nextCourse) {
            colHTML = '<td class="nextCourse">';
          }
          colHTML += `<span class="courseName">${course.name}</span><br>`;
          const courseStartHr = Math.floor(course.start / 100);
          const courseStartMin = course.start % 100;
          const courseEndHr = Math.floor(course.end / 100);
          const courseEndMin = course.end % 100;
          colHTML += `<span class="courseTime">${String(courseStartHr).padStart(2, '0')}:${String(courseStartMin).padStart(2, '0')} - ${String(courseEndHr).padStart(2, '0')}:${String(courseEndMin).padStart(2, '0')}</span>`;
        }
        colHTML += "</td>";
        rowHTML += colHTML;
      }
      rowHTML += "</tr>";
      tableBodyHTML += rowHTML;
    }
    $("#weeklySchedule").html(tableBodyHTML);
  },
  updateWeather: function() {
    // Get the weather.
    weather.getWeather().then(
      function(data) {
        // Update the weather.
        // Todo: Implement this.
        // This can be rain, clear, clouds, etc.
        const weatherIcon = data.weather[0].icon;
        const curTemp = data.main.temp;
        $("#weatherSymbol").prop("src", `https://openweathermap.org/img/wn/${weatherIcon}.png`);
        console.log(curTemp);
        $("#weatherTempNum").text(Math.round(curTemp));
      }
    ).catch(
      function(error) {
        alert("Error getting weather: " + error)
      }
    )
  },
  updateBookmarks: function() {
    $("#bookmarks ul").empty();
    for (let i = 0; i < dashboard.currentConfig.bookmarks.length; i++) {
      const bookmark = dashboard.currentConfig.bookmarks[i];
      const bookmarkHTML = `<li><a class="bookmark" href="${bookmark.url}">${bookmark.text}</a></li>`;
      $("#bookmarks ul").append(bookmarkHTML);
    }
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
      hour12: false
    }).formatToParts(new Date());
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
      monthName: formattedString[2].value,
      month: monthNum,
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
      return date.year + "01";
    } else if (date.month < 9) {
      // If the month is in May or after May but before September, it is the summer semester.
      return date.year + "05";
    } else {
      // If the month is after September, it is the fall semester.
      return date.year + "09";
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
  determineCourseSchedule: function() {
    let semesterNo = this.getCurrentSemesterNumber();
    this.getCourseData(semesterNo).then(
      function(data) {
        let coursesList = [];
        // We need to flatten the data. The data is an array of objects, one for each department.
        // We only care about the courses in that department, not the department itself.
        // Extract the courses array from each department.
        for (let department of data) {
          coursesList.push(...department.courses);
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
        const userSections = sections.filter(section => dashboard.currentConfig.courses.userCourses.includes(section.crn));
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
        dashboard.currentConfig.courses.courseSchedules = newCourseSchedules;
        dashboard.saveConfig();
      });
  },
  /**
   * Get the user's courses for a specific day.
   * @param {DayOfWeek} day 
   * @returns {SingleCourseSchedule[]}
   */
  getUserCourses: function(day) {
    return dashboard.currentConfig.courses.courseSchedules[day] || [];
  },
  getUserCoursesForToday: function() {
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
    return (dashboard.currentConfig.courses.courseSchedules[dayOfWeekStr] || []).sort((a, b) => a.start - b.start);;
  },
  getNextUpcomingCourse: function() {
    const todayCourses = courses.getUserCoursesForToday();
    const currentDateTime = DateTimeUtils.getCurrentDateTimeInNewYork();
    /** @type {SingleCourseSchedule | null} */
    let nextCourse = null;
    for (let course of todayCourses) {
      if (course.start > (currentDateTime.hour * 100 + currentDateTime.minute)) {
        nextCourse = course;
        break;
      }
    }
    return nextCourse;
  }
}

$(document).ready(function() {
  dashboard.init();
})