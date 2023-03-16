# Project Proposal

For the final project of Team 6 (Aoyan, Andrew, Gabriel), we plan on creating an application that allows us to programmatically generate potential course sets that an RPI student can take for the next semester.

The course sets will be sorted by an algorithm that will prioritize (ranked from most important to least important):

1.	Classes that the student has unlocked for next semester by taking the required prerequisite this semester that are part of the student's intended major(s).
2.	Classes that the student has unlocked for next semester by taking the required prerequisite this semester that are not part of the student's intended major(s).
3.	Classes that the student has unlocked for next semester by taking the required prerequisite in previous semesters that are part of the student's intended major(s).
4.	Classes that the student has unlocked for next semester by taking the required prerequisite in previous semesters that are not part of the student's intended major(s).
5.	Classes that are part of the student's intended major(s) that have no prerequisites.
6.	All other classes.

The website will be smart enough to only select potential courses and sections that do not have any time conflicts. To make the website simpler, we will not consider the possibility where a class can be taken provided you are taking the class's prerequisites during the same semester. The website will only suggest a class if you have already completed all prerequisites the previous semester. The website will attempt to select classes that have more advanced prerequisite considerations (such as courses where only one course is needed out of a list of courses). The website will attempt to follow other requirements if they are not already fulfilled, such as the "one required HASS course per semester" requirement.

For the user's side, we will provide them with four ways to filter the course list:

1.	The number of credits/courses. This can be blank for all combinations that will still have the student be considered a full-time student (12 credits per semester) but also fall under the limit of free RPI credits (21 credits). If a student desires to, they can set up a filter by the number of credits they want, either as a range or a constant number of credits. The student could also filter by the number of courses they want, also as a range or as a constant.
2.	Courses that the student will take. The student can choose one or more courses that need to be present in all returned matches. Any courses added to this list will override any other filters.
3.	Courses that the student will not take. All matches will not contain any of the courses in this list.
4.	Courses by subject. The student can choose to include or exclude certain subjects. When a subject is included, only courses from this subject will be included. When a subject is excluded, all courses from this major will be excluded.

Our primary area of focus would be working with data that we pull from another website (likely QUACS). Creating some sort of algorithm would be our main focus and likely require us to verse ourselves in JavaScript to do so. We’d use HTML and CSS for preparing the lists in a nice, presentable way. Our second focus would be on presenting the data in a clear and very easy-to-understand way. Perhaps this would mean utilizing a “progression grid” (like from a video game) or perhaps just a nicely formatted list or grid. The course list and requirements list will likely be stored on the server in a static JSON data file and downloaded by the client.

For the student's major(s) and existing courses, the student will have to manually enter them.

This project takes inspiration from other projects such as QUACS, which also attempts to assist RPI students in course planning.

In summary, we are trying to create something similar to QUACS that shows students what paths they can take in the future, which differs from QUACS because QUACS just tries to come up with a possible schedule off of the classes you tell it you will be taking. This would help students better understand what steps need to be taken for them to achieve their goals and allow them to explore all their options.
